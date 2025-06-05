// AI System for High-Performance Gaming Framework
// Advanced AI opponents with pathfinding and decision-making

class GameAI {
    constructor(framework) {
        this.framework = framework;
        this.signal = framework.signals.signal;
        this.effect = framework.signals.effect;
        
        // AI performance tracking
        this.aiStats = {
            computeTime: 0,
            decisionsPerSecond: 0,
            pathfindingCalls: 0
        };
        
        console.log('🤖 Advanced AI System initialized');
    }
    
    // Create AI player with different difficulty levels
    createAIPlayer(playerId, difficulty = 'medium', spawnX, spawnY) {
        const aiPlayer = {
            id: playerId,
            x: this.signal(spawnX),
            y: this.signal(spawnY),
            alive: this.signal(true),
            lives: this.signal(3),
            bombsPlaced: this.signal(0),
            maxBombs: this.signal(1),
            flameSize: this.signal(1),
            speed: this.signal(2),
            
            // AI-specific properties
            difficulty,
            lastDecision: 0,
            decisionInterval: this.getDifficultySettings(difficulty).decisionInterval,
            currentPath: [],
            target: null,
            state: 'exploring', // exploring, hunting, escaping, collecting
            awareness: this.getDifficultySettings(difficulty).awareness,
            reactionTime: this.getDifficultySettings(difficulty).reactionTime,
            
            // Memory system for advanced AI
            memory: {
                seenPowerups: new Map(),
                dangerousAreas: new Map(),
                playerPositions: new Map(),
                bombPositions: new Map()
            }
        };
        
        return aiPlayer;
    }
    
    // Difficulty settings
    getDifficultySettings(difficulty) {
        const settings = {
            easy: {
                decisionInterval: 1000, // 1 second between decisions
                awareness: 5, // 5 tile radius
                reactionTime: 800, // 800ms reaction time
                aggression: 0.3,
                powerupPriority: 0.7,
                pathfindingAccuracy: 0.6
            },
            medium: {
                decisionInterval: 500,
                awareness: 7,
                reactionTime: 400,
                aggression: 0.6,
                powerupPriority: 0.8,
                pathfindingAccuracy: 0.8
            },
            hard: {
                decisionInterval: 200,
                awareness: 10,
                reactionTime: 150,
                aggression: 0.9,
                powerupPriority: 0.5,
                pathfindingAccuracy: 0.95
            },
            nightmare: {
                decisionInterval: 100,
                awareness: 15,
                reactionTime: 50,
                aggression: 1.0,
                powerupPriority: 0.3,
                pathfindingAccuracy: 1.0
            }
        };
        
        return settings[difficulty] || settings.medium;
    }
    
    // Main AI update loop - called every frame
    updateAI(aiPlayer, gameState, deltaTime) {
        const startTime = performance.now();
        
        if (!aiPlayer.alive.value) return;
        
        // Update AI memory
        this.updateMemory(aiPlayer, gameState);
        
        // Make decisions at intervals
        const now = performance.now();
        if (now - aiPlayer.lastDecision >= aiPlayer.decisionInterval) {
            this.makeDecision(aiPlayer, gameState);
            aiPlayer.lastDecision = now;
            this.aiStats.decisionsPerSecond++;
        }
        
        // Execute current action
        this.executeAction(aiPlayer, gameState, deltaTime);
        
        // Track performance
        this.aiStats.computeTime += performance.now() - startTime;
    }
    
    // Update AI memory system
    updateMemory(aiPlayer, gameState) {
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        const awareness = aiPlayer.awareness;
        
        // Clear old memory
        const now = performance.now();
        const memoryTimeout = 5000; // 5 seconds
        
        ['seenPowerups', 'dangerousAreas', 'playerPositions', 'bombPositions'].forEach(key => {
            aiPlayer.memory[key].forEach((value, mapKey) => {
                if (now - value.timestamp > memoryTimeout) {
                    aiPlayer.memory[key].delete(mapKey);
                }
            });
        });
        
        // Update powerup memory
        gameState.powerups.value.forEach((powerup, key) => {
            const distance = this.getDistance(playerX, playerY, powerup.x, powerup.y);
            if (distance <= awareness * 32) { // 32px per tile
                aiPlayer.memory.seenPowerups.set(key, {
                    ...powerup,
                    timestamp: now,
                    distance
                });
            }
        });
        
        // Update bomb memory
        gameState.bombs.value.forEach((bomb, key) => {
            const distance = this.getDistance(playerX, playerY, bomb.x.value, bomb.y.value);
            if (distance <= awareness * 32) {
                aiPlayer.memory.bombPositions.set(key, {
                    x: bomb.x.value,
                    y: bomb.y.value,
                    timer: bomb.timer.value,
                    flameSize: bomb.flameSize || 1,
                    timestamp: now,
                    distance
                });
            }
        });
        
        // Update player memory
        gameState.players.value.forEach((player, playerId) => {
            if (playerId === aiPlayer.id || !player.alive.value) return;
            
            const distance = this.getDistance(playerX, playerY, player.x.value, player.y.value);
            if (distance <= awareness * 32) {
                aiPlayer.memory.playerPositions.set(playerId, {
                    x: player.x.value,
                    y: player.y.value,
                    lives: player.lives.value,
                    timestamp: now,
                    distance
                });
            }
        });
    }
    
    // AI decision making
    makeDecision(aiPlayer, gameState) {
        const settings = this.getDifficultySettings(aiPlayer.difficulty);
        
        // Check for immediate danger
        if (this.isInDanger(aiPlayer, gameState)) {
            aiPlayer.state = 'escaping';
            aiPlayer.target = this.findSafePosition(aiPlayer, gameState);
            return;
        }
        
        // Priority-based decision making
        const priorities = this.calculatePriorities(aiPlayer, gameState, settings);
        
        // Choose action based on highest priority
        const action = this.selectAction(priorities);
        
        switch (action) {
            case 'hunt_player':
                aiPlayer.state = 'hunting';
                aiPlayer.target = this.findNearestPlayer(aiPlayer, gameState);
                break;
            case 'collect_powerup':
                aiPlayer.state = 'collecting';
                aiPlayer.target = this.findBestPowerup(aiPlayer, gameState);
                break;
            case 'explore':
                aiPlayer.state = 'exploring';
                aiPlayer.target = this.findExplorationTarget(aiPlayer, gameState);
                break;
            case 'place_bomb':
                this.placeBomb(aiPlayer, gameState);
                break;
        }
        
        // Calculate path to target
        if (aiPlayer.target) {
            aiPlayer.currentPath = this.findPath(
                aiPlayer.x.value, aiPlayer.y.value,
                aiPlayer.target.x, aiPlayer.target.y,
                gameState
            );
        }
    }
    
    // Calculate action priorities
    calculatePriorities(aiPlayer, gameState, settings) {
        const priorities = {
            hunt_player: 0,
            collect_powerup: 0,
            explore: 0,
            place_bomb: 0
        };
        
        // Hunting priority
        const nearestPlayer = this.findNearestPlayer(aiPlayer, gameState);
        if (nearestPlayer) {
            const distance = nearestPlayer.distance;
            priorities.hunt_player = settings.aggression * (1 - distance / (10 * 32));
        }
        
        // Powerup collection priority
        const bestPowerup = this.findBestPowerup(aiPlayer, gameState);
        if (bestPowerup) {
            priorities.collect_powerup = settings.powerupPriority * bestPowerup.priority;
        }
        
        // Exploration priority (default behavior)
        priorities.explore = 0.3;
        
        // Bomb placement priority
        if (this.shouldPlaceBomb(aiPlayer, gameState)) {
            priorities.place_bomb = 0.8;
        }
        
        return priorities;
    }
    
    // Select action based on priorities
    selectAction(priorities) {
        let maxPriority = 0;
        let selectedAction = 'explore';
        
        for (const [action, priority] of Object.entries(priorities)) {
            if (priority > maxPriority) {
                maxPriority = priority;
                selectedAction = action;
            }
        }
        
        return selectedAction;
    }
    
    // A* pathfinding algorithm
    findPath(startX, startY, targetX, targetY, gameState) {
        this.aiStats.pathfindingCalls++;
        
        const gridWidth = 24;
        const gridHeight = 18;
        const cellSize = 32;
        
        // Convert to grid coordinates
        const start = {
            x: Math.floor(startX / cellSize),
            y: Math.floor(startY / cellSize)
        };
        const target = {
            x: Math.floor(targetX / cellSize),
            y: Math.floor(targetY / cellSize)
        };
        
        // Boundary check
        if (target.x < 0 || target.x >= gridWidth || target.y < 0 || target.y >= gridHeight) {
            return [];
        }
        
        const openSet = [start];
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const cameFrom = new Map();
        
        const getKey = (pos) => `${pos.x},${pos.y}`;
        
        gScore.set(getKey(start), 0);
        fScore.set(getKey(start), this.heuristic(start, target));
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(getKey(openSet[i])) < fScore.get(getKey(current))) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            closedSet.add(getKey(current));
            
            // Check if we reached the target
            if (current.x === target.x && current.y === target.y) {
                return this.reconstructPath(cameFrom, current, cellSize);
            }
            
            // Check neighbors
            const neighbors = [
                {x: current.x + 1, y: current.y},
                {x: current.x - 1, y: current.y},
                {x: current.x, y: current.y + 1},
                {x: current.x, y: current.y - 1}
            ];
            
            for (const neighbor of neighbors) {
                const neighborKey = getKey(neighbor);
                
                // Skip if out of bounds
                if (neighbor.x < 0 || neighbor.x >= gridWidth || 
                    neighbor.y < 0 || neighbor.y >= gridHeight) {
                    continue;
                }
                
                // Skip if blocked or already processed
                if (this.isGridPositionBlocked(neighbor.x, neighbor.y, gameState) || 
                    closedSet.has(neighborKey)) {
                    continue;
                }
                
                const tentativeGScore = gScore.get(getKey(current)) + 1;
                
                if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighborKey)) {
                    continue;
                }
                
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, target));
            }
        }
        
        return []; // No path found
    }
    
    // Reconstruct path from A* algorithm
    reconstructPath(cameFrom, current, cellSize) {
        const path = [];
        const getKey = (pos) => `${pos.x},${pos.y}`;
        
        while (cameFrom.has(getKey(current))) {
            path.unshift({
                x: current.x * cellSize,
                y: current.y * cellSize
            });
            current = cameFrom.get(getKey(current));
        }
        
        return path;
    }
    
    // Heuristic function for A*
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    // Check if grid position is blocked
    isGridPositionBlocked(gridX, gridY, gameState) {
        const key = `${gridX}-${gridY}`;
        return gameState.walls.value.has(key) || gameState.blocks.value.has(key);
    }
    
    // Execute AI action
    executeAction(aiPlayer, gameState, deltaTime) {
        if (aiPlayer.currentPath.length === 0) return;
        
        const target = aiPlayer.currentPath[0];
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        const speed = aiPlayer.speed.value;
        
        // Move towards target
        const dx = target.x - playerX;
        const dy = target.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < speed) {
            // Reached waypoint, remove it
            aiPlayer.currentPath.shift();
            return;
        }
        
        // Normalize and apply movement
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        
        const newX = Math.max(0, Math.min(playerX + moveX, 23 * 32));
        const newY = Math.max(0, Math.min(playerY + moveY, 17 * 32));
        
        // Check for collision
        if (!this.isPositionBlocked(newX, newY, gameState)) {
            aiPlayer.x.set(newX);
            aiPlayer.y.set(newY);
        }
    }
    
    // Utility functions
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isInDanger(aiPlayer, gameState) {
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        
        // Check for nearby bombs
        for (const [key, bomb] of aiPlayer.memory.bombPositions) {
            if (bomb.timer > 0 && bomb.timer < 60) { // About to explode
                const bombX = bomb.x;
                const bombY = bomb.y;
                const flameSize = bomb.flameSize;
                
                // Check if player is in blast radius
                if (this.isInBlastRadius(playerX, playerY, bombX, bombY, flameSize)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isInBlastRadius(playerX, playerY, bombX, bombY, flameSize) {
        const cellSize = 32;
        const playerGridX = Math.floor(playerX / cellSize);
        const playerGridY = Math.floor(playerY / cellSize);
        const bombGridX = Math.floor(bombX / cellSize);
        const bombGridY = Math.floor(bombY / cellSize);
        
        // Check if on same row or column within flame range
        if (playerGridX === bombGridX && Math.abs(playerGridY - bombGridY) <= flameSize) {
            return true;
        }
        if (playerGridY === bombGridY && Math.abs(playerGridX - bombGridX) <= flameSize) {
            return true;
        }
        
        return false;
    }
    
    findSafePosition(aiPlayer, gameState) {
        const cellSize = 32;
        const gridWidth = 24;
        const gridHeight = 18;
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        
        const safePositions = [];
        
        // Check all positions within reasonable distance
        for (let x = 1; x < gridWidth - 1; x++) {
            for (let y = 1; y < gridHeight - 1; y++) {
                const posX = x * cellSize;
                const posY = y * cellSize;
                
                // Skip if blocked
                if (this.isGridPositionBlocked(x, y, gameState)) continue;
                
                // Check if safe from all known bombs
                let isSafe = true;
                for (const [key, bomb] of aiPlayer.memory.bombPositions) {
                    if (this.isInBlastRadius(posX, posY, bomb.x, bomb.y, bomb.flameSize)) {
                        isSafe = false;
                        break;
                    }
                }
                
                if (isSafe) {
                    const distance = this.getDistance(playerX, playerY, posX, posY);
                    safePositions.push({ x: posX, y: posY, distance });
                }
            }
        }
        
        // Return nearest safe position
        if (safePositions.length > 0) {
            safePositions.sort((a, b) => a.distance - b.distance);
            return safePositions[0];
        }
        
        return null;
    }
    
    findNearestPlayer(aiPlayer, gameState) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const [playerId, playerData] of aiPlayer.memory.playerPositions) {
            if (playerData.distance < minDistance) {
                minDistance = playerData.distance;
                nearest = {
                    id: playerId,
                    x: playerData.x,
                    y: playerData.y,
                    distance: playerData.distance
                };
            }
        }
        
        return nearest;
    }
    
    findBestPowerup(aiPlayer, gameState) {
        let best = null;
        let maxPriority = 0;
        
        for (const [key, powerup] of aiPlayer.memory.seenPowerups) {
            let priority = 0;
            
            // Calculate priority based on type and current player stats
            switch (powerup.type) {
                case 'bomb':
                    priority = aiPlayer.maxBombs.value < 3 ? 0.9 : 0.3;
                    break;
                case 'flame':
                    priority = aiPlayer.flameSize.value < 3 ? 0.8 : 0.2;
                    break;
                case 'speed':
                    priority = aiPlayer.speed.value < 4 ? 0.7 : 0.1;
                    break;
            }
            
            // Adjust for distance
            priority *= (1 - powerup.distance / (10 * 32));
            
            if (priority > maxPriority) {
                maxPriority = priority;
                best = { ...powerup, priority };
            }
        }
        
        return best;
    }
    
    findExplorationTarget(aiPlayer, gameState) {
        // Simple exploration: random direction
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        const cellSize = 32;
        
        const directions = [
            { x: 0, y: -cellSize * 3 }, // Up
            { x: 0, y: cellSize * 3 },  // Down
            { x: -cellSize * 3, y: 0 }, // Left
            { x: cellSize * 3, y: 0 }   // Right
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const targetX = Math.max(32, Math.min(playerX + direction.x, 22 * 32));
        const targetY = Math.max(32, Math.min(playerY + direction.y, 16 * 32));
        
        return { x: targetX, y: targetY };
    }
    
    shouldPlaceBomb(aiPlayer, gameState) {
        if (aiPlayer.bombsPlaced.value >= aiPlayer.maxBombs.value) return false;
        
        const settings = this.getDifficultySettings(aiPlayer.difficulty);
        const playerX = aiPlayer.x.value;
        const playerY = aiPlayer.y.value;
        
        // Check if there's a player nearby to trap
        for (const [playerId, playerData] of aiPlayer.memory.playerPositions) {
            if (playerData.distance < 3 * 32) { // Within 3 tiles
                // Check if bomb would be effective
                const canEscape = this.canEscapeFromBomb(aiPlayer, gameState, playerX, playerY);
                if (canEscape && Math.random() < settings.aggression) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    canEscapeFromBomb(aiPlayer, gameState, bombX, bombY) {
        // Quick check: is there a path to safety?
        const flameSize = aiPlayer.flameSize.value;
        const safePosition = this.findSafePosition(aiPlayer, {
            ...gameState,
            bombs: {
                value: new Map([...gameState.bombs.value, [`${bombX}-${bombY}`, {
                    x: { value: bombX },
                    y: { value: bombY },
                    timer: { value: 180 },
                    flameSize
                }]])
            }
        });
        
        return safePosition !== null;
    }
    
    placeBomb(aiPlayer, gameState) {
        // This would integrate with the main game's bomb placement system
        console.log(`🤖 AI Player ${aiPlayer.id} placing bomb at (${aiPlayer.x.value}, ${aiPlayer.y.value})`);
        
        // Signal to main game to place bomb
        if (window.BombermanGame && window.BombermanGame.placeBomb) {
            window.BombermanGame.placeBomb(aiPlayer.id);
        }
    }
    
    isPositionBlocked(x, y, gameState) {
        const cellSize = 32;
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        return this.isGridPositionBlocked(gridX, gridY, gameState);
    }
    
    // Get AI performance stats
    getStats() {
        return {
            ...this.aiStats,
            avgComputeTime: this.aiStats.computeTime / Math.max(1, this.aiStats.decisionsPerSecond)
        };
    }
    
    // Reset stats
    resetStats() {
        this.aiStats = {
            computeTime: 0,
            decisionsPerSecond: 0,
            pathfindingCalls: 0
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.GameAI = GameAI;
} else if (typeof module !== 'undefined') {
    module.exports = GameAI;
}

console.log('🤖 Advanced AI System loaded');
