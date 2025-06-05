// RichFramework - Bomberman Game Logic using Signals
// Simplified version using only the core signals concept

// ===== GAME CONSTANTS =====
const GAME_CONFIG = {
    BOARD_WIDTH: 24,
    BOARD_HEIGHT: 18,
    CELL_SIZE: 32,
    PLAYER_SPEED: 2, // pixels per frame
    BOMB_TIMER: 180, // 3 seconds at 60fps
    MAX_PLAYERS: 4,
    POWER_UP_SPAWN_CHANCE: 0.3,
    GAME_DURATION: 180000, // 3 minutes
    MOBILE_BREAKPOINT: 768
};

// ===== GAME STATE USING SIGNALS =====
let gameState = null;
let gameLoop = null;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Bomberman with Signals...');
    
    // Verify framework is loaded
    if (!window.RichFramework || !window.RichFramework.signals) {
        console.error('❌ RichFramework.signals not loaded!');
        return;
    }
    
    initGame();
});

function initGame() {
    const { signal, effect, batch, SignalsPerf } = RichFramework.signals;
    
    // ===== GAME STATE SIGNALS =====
    gameState = {
        // Core game state
        isRunning: signal(false),
        isPaused: signal(false),
        gameTime: signal(0),
        
        // Players (up to 4)
        players: signal(new Map()),
        alivePlayers: signal(0),
        
        // Game objects
        bombs: signal(new Map()),
        explosions: signal(new Map()),
        powerups: signal(new Map()),
        
        // Map data (walls, destructible blocks)
        walls: signal(generateWalls()),
        blocks: signal(generateBlocks()),
        
        // Game statistics
        gameTimer: signal(180), // 3 minutes
        winner: signal(null)
    };
    
    // ===== CREATE INITIAL PLAYERS =====
    createPlayers();
    
    // ===== BIND DOM ELEMENTS =====
    bindGameToDOM();
    
    // ===== INPUT HANDLING =====
    setupInputHandlers();
    
    // ===== START GAME LOOP =====
    startGameLoop();
    
    console.log('✅ Bomberman initialized successfully!');
}

function createPlayers() {
    const { signal } = RichFramework.signals;
    
    // Player spawn positions (corners of the map)
    const spawnPositions = [
        { x: 32, y: 32 },
        { x: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE - 64, y: 32 },
        { x: 32, y: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE - 64 },
        { x: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE - 64, y: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE - 64 }
    ];
    
    // Create 2 players for now (can be extended to 4)
    for (let i = 0; i < 2; i++) {
        const player = {
            id: signal(i + 1),
            x: signal(spawnPositions[i].x),
            y: signal(spawnPositions[i].y),
            alive: signal(true),
            lives: signal(3),
            bombsPlaced: signal(0),
            maxBombs: signal(1),
            flameSize: signal(1),
            speed: signal(GAME_CONFIG.PLAYER_SPEED)
        };
        
        gameState.players.value.set(i + 1, player);
    }
    
    // Update alive players count
    gameState.alivePlayers.set(gameState.players.value.size);
    
    console.log(`👥 Created ${gameState.players.value.size} players`);
}

function bindGameToDOM() {
    const { effect } = RichFramework.signals;
    const gameBoard = document.getElementById('gameBoard');
    
    // ===== BIND PLAYERS TO DOM =====
    gameState.players.value.forEach((player, playerId) => {
        // Create player DOM element
        const playerElement = document.createElement('div');
        playerElement.className = `player player-${playerId}`;
        playerElement.textContent = `P${playerId}`;
        playerElement.id = `player-${playerId}`;
        gameBoard.appendChild(playerElement);
        
        // Bind signals to DOM with GPU optimization
        bindPlayerToDOM(player, playerElement);
        
        // Update UI overlay
        createPlayerUI(player, playerId);
    });
    
    // ===== BIND WALLS TO DOM =====
    gameState.walls.value.forEach((wall, key) => {
        const wallElement = document.createElement('div');
        wallElement.className = 'wall';
        wallElement.style.left = wall.x + 'px';
        wallElement.style.top = wall.y + 'px';
        gameBoard.appendChild(wallElement);
    });
    
    // ===== BIND BLOCKS TO DOM =====
    gameState.blocks.value.forEach((block, key) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.id = `block-${key}`;
        blockElement.style.left = block.x + 'px';
        blockElement.style.top = block.y + 'px';
        gameBoard.appendChild(blockElement);
    });
    
    // ===== REACTIVE BOMB RENDERING =====
    effect(() => {
        // Remove old bomb elements
        document.querySelectorAll('.bomb').forEach(el => el.remove());
        
        // Add current bombs
        gameState.bombs.value.forEach((bomb, bombId) => {
            const bombElement = document.createElement('div');
            bombElement.className = 'bomb';
            bombElement.id = `bomb-${bombId}`;
            gameBoard.appendChild(bombElement);
            
            // Bind bomb signals to DOM
            bindBombToDOM(bomb, bombElement);
        });
    });
    
    // ===== REACTIVE EXPLOSION RENDERING =====
    effect(() => {
        // Remove old explosion elements
        document.querySelectorAll('.explosion').forEach(el => el.remove());
        
        // Add current explosions
        gameState.explosions.value.forEach((explosion, key) => {
            const explosionElement = document.createElement('div');
            explosionElement.className = 'explosion';
            explosionElement.style.left = explosion.x + 'px';
            explosionElement.style.top = explosion.y + 'px';
            gameBoard.appendChild(explosionElement);
            
            // Auto-remove after animation
            setTimeout(() => {
                explosionElement.remove();
            }, 500);
        });
    });
    
    // ===== REACTIVE POWERUP RENDERING =====
    effect(() => {
        // Remove old powerup elements
        document.querySelectorAll('.powerup').forEach(el => el.remove());
        
        // Add current powerups
        gameState.powerups.value.forEach((powerup, key) => {
            const powerupElement = document.createElement('div');
            powerupElement.className = `powerup powerup-${powerup.type}`;
            powerupElement.style.left = powerup.x + 'px';
            powerupElement.style.top = powerup.y + 'px';
            powerupElement.textContent = powerup.symbol;
            gameBoard.appendChild(powerupElement);
        });
    });
}

// Simple DOM binding functions to replace GameSignals methods
function bindPlayerToDOM(playerSignals, element) {
    const { effect } = RichFramework.signals;
    
    // Position binding (using transform for performance)
    effect(() => {
        const x = playerSignals.x.value;
        const y = playerSignals.y.value;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    
    // Visibility binding
    effect(() => {
        element.style.visibility = playerSignals.alive.value ? 'visible' : 'hidden';
    });
}

function bindBombToDOM(bombSignals, element) {
    const { effect } = RichFramework.signals;
    
    // Position binding
    effect(() => {
        element.style.left = bombSignals.x.value + 'px';
        element.style.top = bombSignals.y.value + 'px';
    });
    
    // Timer visualization (optional)
    effect(() => {
        const timerPercent = (bombSignals.timer.value / GAME_CONFIG.BOMB_TIMER) * 100;
        element.style.opacity = Math.max(0.5, timerPercent / 100);
    });
}

function createPlayerUI(player, playerId) {
    const { effect } = RichFramework.signals;
    const uiOverlay = document.getElementById('uiOverlay');
    
    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';
    playerInfo.id = `player-info-${playerId}`;
    
    const playerName = document.createElement('div');
    playerName.textContent = `Player ${playerId}`;
    playerName.style.color = getPlayerColor(playerId);
    
    const playerLives = document.createElement('div');
    playerLives.className = 'player-lives';
    
    const playerStats = document.createElement('div');
    playerStats.style.fontSize = '12px';
    
    playerInfo.appendChild(playerName);
    playerInfo.appendChild(playerLives);
    playerInfo.appendChild(playerStats);
    uiOverlay.appendChild(playerInfo);
    
    // Reactive UI updates
    effect(() => {
        const lives = player.lives.value;
        playerLives.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const life = document.createElement('div');
            life.className = 'life';
            playerLives.appendChild(life);
        }
    });
    
    effect(() => {
        const stats = [
            `Bombs: ${player.maxBombs.value}`,
            `Flame: ${player.flameSize.value}`,
            `Speed: ${player.speed.value}`
        ].join(' | ');
        playerStats.textContent = stats;
    });
    
    effect(() => {
        playerInfo.style.opacity = player.alive.value ? '1' : '0.5';
    });
}

function setupInputHandlers() {
    const keyState = new Set();
    
    document.addEventListener('keydown', (e) => {
        keyState.add(e.code);
        
        // Handle bomb placement immediately
        if (e.code === 'Space' || e.code === 'Enter') {
            placeBomb(1); // Player 1
        }
        if (e.code === 'ShiftRight' || e.code === 'ControlRight') {
            placeBomb(2); // Player 2
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keyState.delete(e.code);
    });
    
    // Store key state for game loop access
    window.gameKeyState = keyState;
}

function startGameLoop() {
    const { batch } = RichFramework.signals;
    
    gameState.isRunning.set(true);
    let lastTime = performance.now();
    
    function gameLoopFrame(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Batch all game updates for optimal performance
        batch(() => {
            updateGameLogic(deltaTime);
        });
        
        // Continue loop
        if (gameState.isRunning.value) {
            gameLoop = requestAnimationFrame(gameLoopFrame);
        }
    }
    
    gameLoop = requestAnimationFrame(gameLoopFrame);
}

function updateGameLogic(deltaTime) {
    // Update game timer
    if (gameState.gameTimer.value > 0) {
        gameState.gameTimer.set(gameState.gameTimer.value - deltaTime / 1000);
    }
    
    // Update player positions
    updatePlayerMovement();
    
    // Update bombs
    updateBombs(deltaTime);
    
    // Update explosions
    updateExplosions(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Check win conditions
    checkWinConditions();
    
    // Update game time
    gameState.gameTime.set(gameState.gameTime.value + deltaTime);
}

function updatePlayerMovement() {
    const keyState = window.gameKeyState;
    
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value) return;
        
        let deltaX = 0, deltaY = 0;
        
        // Player 1 controls (WASD)
        if (playerId === 1) {
            if (keyState.has('KeyW')) deltaY = -player.speed.value;
            if (keyState.has('KeyS')) deltaY = player.speed.value;
            if (keyState.has('KeyA')) deltaX = -player.speed.value;
            if (keyState.has('KeyD')) deltaX = player.speed.value;
        }
        // Player 2 controls (Arrow keys)
        else if (playerId === 2) {
            if (keyState.has('ArrowUp')) deltaY = -player.speed.value;
            if (keyState.has('ArrowDown')) deltaY = player.speed.value;
            if (keyState.has('ArrowLeft')) deltaX = -player.speed.value;
            if (keyState.has('ArrowRight')) deltaX = player.speed.value;
        }
        
        // Apply movement with collision detection
        if (deltaX !== 0 || deltaY !== 0) {
            const newX = player.x.value + deltaX;
            const newY = player.y.value + deltaY;
            
            if (!checkCollisionAt(newX, newY, playerId)) {
                player.x.set(newX);
                player.y.set(newY);
            }
        }
    });
}

function placeBomb(playerId) {
    const { signal } = RichFramework.signals;
    const player = gameState.players.value.get(playerId);
    if (!player || !player.alive.value) return;
    
    // Check if player can place more bombs
    if (player.bombsPlaced.value >= player.maxBombs.value) return;
    
    // Snap bomb position to grid
    const bombX = Math.floor(player.x.value / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE + 4;
    const bombY = Math.floor(player.y.value / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE + 4;
    
    // Check if position is already occupied by a bomb
    const existingBomb = Array.from(gameState.bombs.value.values()).find(bomb => 
        Math.abs(bomb.x.value - bombX) < 10 && Math.abs(bomb.y.value - bombY) < 10
    );
    
    if (existingBomb) return;
    
    // Create bomb
    const bombKey = Date.now() + Math.random();
    const bomb = {
        id: signal(bombKey),
        x: signal(bombX),
        y: signal(bombY),
        timer: signal(GAME_CONFIG.BOMB_TIMER),
        playerId: signal(playerId),
        flameSize: signal(player.flameSize.value)
    };
    
    // Add bomb to game state
    const newBombs = new Map(gameState.bombs.value);
    newBombs.set(bombKey, bomb);
    gameState.bombs.set(newBombs);
    
    // Update player bomb count
    player.bombsPlaced.set(player.bombsPlaced.value + 1);
    
    console.log(`💣 Player ${playerId} placed bomb at (${bombX}, ${bombY})`);
}

function updateBombs(deltaTime) {
    const bombsToExplode = [];
    
    gameState.bombs.value.forEach((bomb, bombId) => {
        bomb.timer.set(bomb.timer.value - 1);
        
        if (bomb.timer.value <= 0) {
            bombsToExplode.push(bombId);
        }
    });
    
    // Explode bombs that are ready
    bombsToExplode.forEach(bombId => {
        explodeBomb(bombId);
    });
}

function explodeBomb(bombId) {
    const bomb = gameState.bombs.value.get(bombId);
    if (!bomb) return;
    
    console.log(`💥 Exploding bomb ${bombId}`);
    
    // Get explosion positions
    const explosionPositions = calculateExplosion(bomb.x.value, bomb.y.value, bomb.flameSize.value);
    
    // Create explosions
    const newExplosions = new Map(gameState.explosions.value);
    explosionPositions.forEach((pos, index) => {
        const explosionId = `${bombId}-${index}`;
        newExplosions.set(explosionId, {
            x: pos.x,
            y: pos.y,
            timer: 500 // 500ms explosion duration
        });
    });
    gameState.explosions.set(newExplosions);
    
    // Remove bomb
    const newBombs = new Map(gameState.bombs.value);
    newBombs.delete(bombId);
    gameState.bombs.set(newBombs);
    
    // Update player bomb count
    const playerId = bomb.playerId.value;
    const player = gameState.players.value.get(playerId);
    if (player) {
        player.bombsPlaced.set(Math.max(0, player.bombsPlaced.value - 1));
    }
    
    // Destroy blocks and potentially spawn powerups
    destroyBlocks(explosionPositions);
}

function calculateExplosion(centerX, centerY, flameSize) {
    const positions = [{ x: centerX, y: centerY }]; // Center explosion
    
    // Flame in four directions
    const directions = [
        { dx: 0, dy: -GAME_CONFIG.CELL_SIZE }, // Up
        { dx: 0, dy: GAME_CONFIG.CELL_SIZE },  // Down
        { dx: -GAME_CONFIG.CELL_SIZE, dy: 0 }, // Left
        { dx: GAME_CONFIG.CELL_SIZE, dy: 0 }   // Right
    ];
    
    directions.forEach(dir => {
        for (let i = 1; i <= flameSize; i++) {
            const x = centerX + dir.dx * i;
            const y = centerY + dir.dy * i;
            
            // Check if position is within bounds
            if (x < 0 || x >= GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE ||
                y < 0 || y >= GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE) {
                break;
            }
            
            // Check if there's a wall blocking the flame
            const wallKey = `${Math.floor(x / GAME_CONFIG.CELL_SIZE)}-${Math.floor(y / GAME_CONFIG.CELL_SIZE)}`;
            if (gameState.walls.value.has(wallKey)) {
                break; // Wall blocks flame
            }
            
            positions.push({ x, y });
            
            // Check if there's a block that stops the flame
            const blockKey = `${Math.floor(x / GAME_CONFIG.CELL_SIZE)}-${Math.floor(y / GAME_CONFIG.CELL_SIZE)}`;
            if (gameState.blocks.value.has(blockKey)) {
                break; // Block stops flame (but gets destroyed)
            }
        }
    });
    
    return positions;
}

function destroyBlocks(explosionPositions) {
    const newBlocks = new Map(gameState.blocks.value);
    const newPowerups = new Map(gameState.powerups.value);
    
    explosionPositions.forEach(pos => {
        const blockKey = `${Math.floor(pos.x / GAME_CONFIG.CELL_SIZE)}-${Math.floor(pos.y / GAME_CONFIG.CELL_SIZE)}`;
        
        if (newBlocks.has(blockKey)) {
            // Remove block
            newBlocks.delete(blockKey);
            
            // Remove block DOM element
            const blockElement = document.getElementById(`block-${blockKey}`);
            if (blockElement) {
                blockElement.remove();
            }
            
            // Chance to spawn powerup
            if (Math.random() < GAME_CONFIG.POWER_UP_SPAWN_CHANCE) {
                const powerupTypes = ['bomb', 'flame', 'speed'];
                const powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                const powerupSymbols = { bomb: '💣', flame: '🔥', speed: '⚡' };
                
                const powerupId = Date.now() + Math.random();
                newPowerups.set(powerupId, {
                    x: Math.floor(pos.x / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE + 8,
                    y: Math.floor(pos.y / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE + 8,
                    type: powerupType,
                    symbol: powerupSymbols[powerupType]
                });
            }
        }
    });
    
    gameState.blocks.set(newBlocks);
    gameState.powerups.set(newPowerups);
}

function checkCollisions() {
    // Check player-powerup collisions
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value) return;
        
        // Check powerup collisions
        gameState.powerups.value.forEach((powerup, key) => {
            if (Math.abs(player.x.value - powerup.x) < 20 &&
                Math.abs(player.y.value - powerup.y) < 20) {
                collectPowerup(playerId, powerup, key);
            }
        });
        
        // Check explosion collisions
        gameState.explosions.value.forEach((explosion) => {
            if (Math.abs(player.x.value - explosion.x) < 20 &&
                Math.abs(player.y.value - explosion.y) < 20) {
                killPlayer(playerId);
            }
        });
    });
}

function collectPowerup(playerId, powerup, powerupKey) {
    const player = gameState.players.value.get(playerId);
    if (!player) return;
    
    console.log(`⭐ Player ${playerId} collected ${powerup.type} powerup`);
    
    // Apply powerup effect
    switch (powerup.type) {
        case 'bomb':
            player.maxBombs.set(Math.min(5, player.maxBombs.value + 1));
            break;
        case 'flame':
            player.flameSize.set(Math.min(5, player.flameSize.value + 1));
            break;
        case 'speed':
            player.speed.set(Math.min(4, player.speed.value + 0.5));
            break;
    }
    
    // Remove powerup
    const newPowerups = new Map(gameState.powerups.value);
    newPowerups.delete(powerupKey);
    gameState.powerups.set(newPowerups);
}

function killPlayer(playerId) {
    const player = gameState.players.value.get(playerId);
    if (!player || !player.alive.value) return;
    
    console.log(`💀 Player ${playerId} killed`);
    
    player.alive.set(false);
    gameState.alivePlayers.set(gameState.alivePlayers.value - 1);
}

function checkWinConditions() {
    if (gameState.alivePlayers.value <= 1) {
        // Find winner
        let winner = null;
        gameState.players.value.forEach((player, playerId) => {
            if (player.alive.value) {
                winner = playerId;
            }
        });
        
        if (winner) {
            gameState.winner.set(winner);
            console.log(`🏆 Player ${winner} wins!`);
        } else {
            console.log('🤝 Draw game!');
        }
        
        endGame();
    } else if (gameState.gameTimer.value <= 0) {
        console.log('⏰ Time up!');
        endGame();
    }
}

function endGame() {
    gameState.isRunning.set(false);
    
    // Show game over screen
    setTimeout(() => {
        const winner = gameState.winner.value;
        const message = winner ? `🏆 Player ${winner} Wins!` : '🤝 Draw Game!';
        
        if (confirm(`${message}\n\nPlay again?`)) {
            location.reload(); // Simple way to restart
        }
    }, 1000);
}

function updateExplosions(deltaTime) {
    const explosionsToRemove = [];
    
    gameState.explosions.value.forEach((explosion, key) => {
        explosion.timer -= deltaTime;
        
        if (explosion.timer <= 0) {
            explosionsToRemove.push(key);
        }
    });
    
    // Remove expired explosions
    explosionsToRemove.forEach(key => {
        const newExplosions = new Map(gameState.explosions.value);
        newExplosions.delete(key);
        gameState.explosions.set(newExplosions);
    });
}

function checkCollisionAt(x, y, playerId) {
    // Collision with walls
    for (const [key, wall] of gameState.walls.value.entries()) {
        if (x < wall.x + GAME_CONFIG.CELL_SIZE &&
            x + 28 > wall.x &&
            y < wall.y + GAME_CONFIG.CELL_SIZE &&
            y + 28 > wall.y) {
            return true; // Collision with wall
        }
    }
    
    // Collision with blocks
    for (const [key, block] of gameState.blocks.value.entries()) {
        if (x < block.x + GAME_CONFIG.CELL_SIZE &&
            x + 28 > block.x &&
            y < block.y + GAME_CONFIG.CELL_SIZE &&
            y + 28 > block.y) {
            return true; // Collision with block
        }
    }
    
    return false; // No collision
}

// ===== UTILITY FUNCTIONS =====
function generateWalls() {
    const walls = new Map();
    
    // Generate perimeter walls and internal walls
    for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            // Perimeter walls
            if (x === 0 || x === GAME_CONFIG.BOARD_WIDTH - 1 || 
                y === 0 || y === GAME_CONFIG.BOARD_HEIGHT - 1) {
                const key = `${x}-${y}`;
                walls.set(key, {
                    x: x * GAME_CONFIG.CELL_SIZE,
                    y: y * GAME_CONFIG.CELL_SIZE
                });
            }
            // Internal walls (every other cell in both directions)
            else if (x % 2 === 0 && y % 2 === 0) {
                const key = `${x}-${y}`;
                walls.set(key, {
                    x: x * GAME_CONFIG.CELL_SIZE,
                    y: y * GAME_CONFIG.CELL_SIZE
                });
            }
        }
    }
    
    return walls;
}

function generateBlocks() {
    const blocks = new Map();
    
    // Generate destructible blocks
    for (let x = 1; x < GAME_CONFIG.BOARD_WIDTH - 1; x++) {
        for (let y = 1; y < GAME_CONFIG.BOARD_HEIGHT - 1; y++) {
            // Skip internal walls
            if (x % 2 === 0 && y % 2 === 0) continue;
            
            // Skip player spawn areas (corners)
            if ((x <= 2 && y <= 2) || 
                (x >= GAME_CONFIG.BOARD_WIDTH - 3 && y <= 2) ||
                (x <= 2 && y >= GAME_CONFIG.BOARD_HEIGHT - 3) ||
                (x >= GAME_CONFIG.BOARD_WIDTH - 3 && y >= GAME_CONFIG.BOARD_HEIGHT - 3)) {
                continue;
            }
            
            // Random block placement (70% chance)
            if (Math.random() < 0.7) {
                const key = `${x}-${y}`;
                blocks.set(key, {
                    x: x * GAME_CONFIG.CELL_SIZE,
                    y: y * GAME_CONFIG.CELL_SIZE
                });
            }
        }
    }
    
    return blocks;
}

function getPlayerColor(playerId) {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
    return colors[playerId - 1] || '#95a5a6';
}

// Simple performance monitoring
const perfMonitor = {
    fps: 0,
    frameTime: 0,
    signalCount: 0,
    
    update(deltaTime) {
        this.frameTime = deltaTime;
        this.fps = Math.round(1000 / deltaTime);
        
        // Update UI
        document.getElementById('fps').textContent = this.fps;
        document.getElementById('fps').className = this.fps >= 55 ? 'fps-good' : 
                                                 this.fps >= 45 ? 'fps-warning' : 'fps-bad';
        document.getElementById('frametime').textContent = `${deltaTime.toFixed(2)}ms`;
        document.getElementById('signals').textContent = RichFramework.signals.SignalsPerf.getStats().totalSignals;
        document.getElementById('memory').textContent = `${Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024) || 0}MB`;
    }
};

console.log('🎮 Bomberman with Signals system loaded!');
