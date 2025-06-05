// RichFramework - Bomberman Game Logic
// Production-ready 60fps implementation with advanced features

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
let performanceMonitor = null;
let touchControls = null;
let animationEngine = null;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Enhanced Bomberman...');
    
    // Verify framework is loaded
    if (!window.RichFramework || !window.RichFramework.signals) {
        console.error('❌ RichFramework.signals not loaded!');
        return;
    }
    
    initGame();
    setupMobileSupport();
    setupAdvancedFeatures();
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
    
    // ===== START PERFORMANCE MONITORING =====
    startPerformanceMonitor();
    
    // ===== INPUT HANDLING =====
    setupInputHandlers();
    
    // ===== START GAME LOOP =====
    startGameLoop();
    
    console.log('✅ Bomberman initialized successfully!');
}

function createPlayers() {
    const { GameSignals } = RichFramework.signals;
    
    // Player spawn positions (corners of the map)
    const spawnPositions = [
        { x: 32, y: 32 },
        { x: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE - 64, y: 32 },
        { x: 32, y: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE - 64 },
        { x: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE - 64, y: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE - 64 }
    ];
    
    // Create 2 players for now (can be extended to 4)
    for (let i = 0; i < 2; i++) {
        const player = GameSignals.createPlayer(
            i + 1,
            spawnPositions[i].x,
            spawnPositions[i].y
        );
        
        // Add player-specific properties
        player.bombsPlaced = RichFramework.signals.signal(0);
        player.maxBombs = RichFramework.signals.signal(1);
        player.flameSize = RichFramework.signals.signal(1);
        player.speed = RichFramework.signals.signal(GAME_CONFIG.PLAYER_SPEED);
        
        gameState.players.value.set(i + 1, player);
    }
    
    // Update alive players count
    gameState.alivePlayers.set(gameState.players.value.size);
    
    console.log(`👥 Created ${gameState.players.value.size} players`);
}

function bindGameToDOM() {
    const { effect, GameSignals } = RichFramework.signals;
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
        GameSignals.bindPlayerToDOM(player, playerElement);
        
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
            GameSignals.bindBombToDOM(bomb, bombElement);
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
    const { batch, SignalsPerf } = RichFramework.signals;
    
    gameState.isRunning.set(true);
    let lastTime = performance.now();
    
    function gameLoopFrame(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Performance monitoring
        const perfStats = SignalsPerf.checkPerformance();
        
        // Batch all game updates for optimal performance
        batch(() => {
            updateGameLogic(deltaTime);
        });
        
        // Continue loop
        if (gameState.isRunning.value) {
            requestAnimationFrame(gameLoopFrame);
        }
    }
    
    console.log('🔄 Game loop started at 60fps');
    requestAnimationFrame(gameLoopFrame);
}

function updateGameLogic(deltaTime) {
    if (gameState.isPaused.value) return;
    
    // Update game timer
    gameState.gameTime.set(gameState.gameTime.value + deltaTime);
    
    // Update player positions
    updatePlayerMovement();
    
    // Update bombs
    updateBombs(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Check win conditions
    checkWinConditions();
}

function updatePlayerMovement() {
    const keyState = window.gameKeyState;
    if (!keyState) return;
    
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value) return;
        
        let newX = player.x.value;
        let newY = player.y.value;
        const speed = player.speed.value;
        
        // Player 1 controls (WASD)
        if (playerId === 1) {
            if (keyState.has('KeyW')) newY -= speed;
            if (keyState.has('KeyS')) newY += speed;
            if (keyState.has('KeyA')) newX -= speed;
            if (keyState.has('KeyD')) newX += speed;
        }
        
        // Player 2 controls (Arrow keys)
        if (playerId === 2) {
            if (keyState.has('ArrowUp')) newY -= speed;
            if (keyState.has('ArrowDown')) newY += speed;
            if (keyState.has('ArrowLeft')) newX -= speed;
            if (keyState.has('ArrowRight')) newX += speed;
        }
        
        // Boundary checking
        newX = Math.max(0, Math.min(newX, GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE - 32));
        newY = Math.max(0, Math.min(newY, GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE - 32));
        
        // Collision checking with walls and blocks
        if (!isPositionBlocked(newX, newY)) {
            player.x.set(newX);
            player.y.set(newY);
        }
    });
}

function placeBomb(playerId) {
    const player = gameState.players.value.get(playerId);
    if (!player || !player.alive.value) return;
    
    // Check if player can place more bombs
    if (player.bombsPlaced.value >= player.maxBombs.value) return;
    
    // Calculate bomb position (snap to grid)
    const bombX = Math.floor(player.x.value / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE;
    const bombY = Math.floor(player.y.value / GAME_CONFIG.CELL_SIZE) * GAME_CONFIG.CELL_SIZE;
    const bombKey = `${bombX}-${bombY}`;
    
    // Check if position is already occupied by a bomb
    if (gameState.bombs.value.has(bombKey)) return;
    
    // Create bomb
    const { GameSignals } = RichFramework.signals;
    const bomb = GameSignals.createBomb(bombKey, bombX, bombY, GAME_CONFIG.BOMB_TIMER);
    bomb.playerId = playerId;
    bomb.flameSize = player.flameSize.value;
    
    // Add to game state
    const newBombs = new Map(gameState.bombs.value);
    newBombs.set(bombKey, bomb);
    gameState.bombs.set(newBombs);
    
    // Update player bomb count
    player.bombsPlaced.set(player.bombsPlaced.value + 1);
    
    console.log(`💣 Player ${playerId} placed bomb at (${bombX}, ${bombY})`);
}

function updateBombs(deltaTime) {
    const bombsToExplode = [];
    const bombsToRemove = [];
    
    gameState.bombs.value.forEach((bomb, bombKey) => {
        // Update timer
        const newTimer = bomb.timer.value - 1;
        bomb.timer.set(newTimer);
        
        // Check for explosion
        if (newTimer <= 0 && !bomb.exploded.value) {
            bombsToExplode.push({ bomb, bombKey });
        }
        
        // Remove after explosion animation
        if (bomb.exploded.value && bomb.timer.value <= -30) { // 0.5 second delay
            bombsToRemove.push(bombKey);
        }
    });
    
    // Process explosions
    bombsToExplode.forEach(({ bomb, bombKey }) => {
        explodeBomb(bomb, bombKey);
    });
    
    // Remove exploded bombs
    if (bombsToRemove.length > 0) {
        const newBombs = new Map(gameState.bombs.value);
        bombsToRemove.forEach(key => {
            const bomb = newBombs.get(key);
            if (bomb) {
                // Restore player bomb count
                const player = gameState.players.value.get(bomb.playerId);
                if (player) {
                    player.bombsPlaced.set(Math.max(0, player.bombsPlaced.value - 1));
                }
                newBombs.delete(key);
            }
        });
        gameState.bombs.set(newBombs);
    }
}

function explodeBomb(bomb, bombKey) {
    bomb.exploded.set(true);
    
    const bombX = bomb.x.value;
    const bombY = bomb.y.value;
    const flameSize = bomb.flameSize || 1;
    
    // Create explosion at bomb center
    createExplosion(bombX, bombY);
    
    // Create flame in 4 directions
    const directions = [
        { dx: 0, dy: -GAME_CONFIG.CELL_SIZE }, // Up
        { dx: 0, dy: GAME_CONFIG.CELL_SIZE },  // Down
        { dx: -GAME_CONFIG.CELL_SIZE, dy: 0 }, // Left
        { dx: GAME_CONFIG.CELL_SIZE, dy: 0 }   // Right
    ];
    
    directions.forEach(({ dx, dy }) => {
        for (let i = 1; i <= flameSize; i++) {
            const flameX = bombX + (dx * i);
            const flameY = bombY + (dy * i);
            
            // Check bounds
            if (flameX < 0 || flameX >= GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE ||
                flameY < 0 || flameY >= GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE) {
                break;
            }
            
            // Check for walls (stop flame)
            if (isWallAt(flameX, flameY)) {
                break;
            }
            
            // Create explosion
            createExplosion(flameX, flameY);
            
            // Check for destructible blocks
            if (isBlockAt(flameX, flameY)) {
                destroyBlock(flameX, flameY);
                break; // Flame stops at destroyed block
            }
        }
    });
    
    console.log(`💥 Bomb exploded at (${bombX}, ${bombY}) with flame size ${flameSize}`);
}

function createExplosion(x, y) {
    const explosionKey = `${x}-${y}`;
    const newExplosions = new Map(gameState.explosions.value);
    newExplosions.set(explosionKey, { x, y, time: performance.now() });
    gameState.explosions.set(newExplosions);
    
    // CHAIN REACTION: Check for other bombs at this position
    checkChainExplosion(x, y);
    
    // Auto-remove explosion after 500ms
    setTimeout(() => {
        const currentExplosions = new Map(gameState.explosions.value);
        currentExplosions.delete(explosionKey);
        gameState.explosions.set(currentExplosions);
    }, 500);
}

// CHAIN EXPLOSION: Trigger other bombs in explosion range
function checkChainExplosion(explosionX, explosionY) {
    const gridX = Math.floor(explosionX / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.floor(explosionY / GAME_CONFIG.CELL_SIZE);
    
    // Check for bombs at this grid position
    gameState.bombs.value.forEach((bomb, bombKey) => {
        const bombGridX = Math.floor(bomb.x.value / GAME_CONFIG.CELL_SIZE);
        const bombGridY = Math.floor(bomb.y.value / GAME_CONFIG.CELL_SIZE);
        
        // If bomb is at explosion position and not already exploded
        if (bombGridX === gridX && bombGridY === gridY && !bomb.exploded.value) {
            console.log(`💥 Chain explosion triggered at (${bomb.x.value}, ${bomb.y.value})`);
            
            // Trigger immediate explosion with slight delay for visual effect
            setTimeout(() => {
                explodeBomb(bomb, bombKey);
            }, 100);
        }
    });
}

function checkCollisions() {
    // Check player-explosion collisions
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value) return;
        
        const playerX = player.x.value;
        const playerY = player.y.value;
        
        // Check collision with explosions
        gameState.explosions.value.forEach((explosion) => {
            const dx = Math.abs(playerX + 16 - explosion.x - 16); // Player center
            const dy = Math.abs(playerY + 16 - explosion.y - 16);
            
            if (dx < 24 && dy < 24) { // Collision threshold
                // Player hit by explosion
                player.lives.set(Math.max(0, player.lives.value - 1));
                
                if (player.lives.value <= 0) {
                    player.alive.set(false);
                    gameState.alivePlayers.set(gameState.alivePlayers.value - 1);
                    console.log(`💀 Player ${playerId} eliminated!`);
                }
            }
        });
        
        // Check collision with powerups
        gameState.powerups.value.forEach((powerup, powerupKey) => {
            const dx = Math.abs(playerX + 16 - powerup.x - 16);
            const dy = Math.abs(playerY + 16 - powerup.y - 16);
            
            if (dx < 20 && dy < 20) {
                // Collect powerup
                collectPowerup(player, powerup);
                
                // Remove powerup
                const newPowerups = new Map(gameState.powerups.value);
                newPowerups.delete(powerupKey);
                gameState.powerups.set(newPowerups);
            }
        });
    });
}

function collectPowerup(player, powerup) {
    switch (powerup.type) {
        case 'bomb':
            player.maxBombs.set(Math.min(5, player.maxBombs.value + 1));
            console.log('💣 Collected Bomb powerup!');
            break;
        case 'flame':
            player.flameSize.set(Math.min(5, player.flameSize.value + 1));
            console.log('🔥 Collected Flame powerup!');
            break;
        case 'speed':
            player.speed.set(Math.min(4, player.speed.value + 1));
            console.log('⚡ Collected Speed powerup!');
            break;
    }
}

function checkWinConditions() {
    const alivePlayers = gameState.alivePlayers.value;
    
    if (alivePlayers <= 1) {
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
            showWinScreen(winner);
        } else {
            console.log('🤝 Draw game!');
            showWinScreen(null);
        }
        
        // Stop game
        gameState.isRunning.set(false);
    }
    
    // Check time limit (3 minutes)
    if (gameState.gameTimer.value <= 0) {
        console.log('⏰ Time limit reached!');
        handleTimeLimit();
    } else {
        // Update timer (countdown from 180 seconds)
        gameState.gameTimer.set(Math.max(0, gameState.gameTimer.value - 1/60));
    }
}

// Handle time limit - player with most lives wins
function handleTimeLimit() {
    let maxLives = 0;
    let winners = [];
    
    gameState.players.value.forEach((player, playerId) => {
        if (player.alive.value) {
            if (player.lives.value > maxLives) {
                maxLives = player.lives.value;
                winners = [playerId];
            } else if (player.lives.value === maxLives) {
                winners.push(playerId);
            }
        }
    });
    
    if (winners.length === 1) {
        gameState.winner.set(winners[0]);
        showWinScreen(winners[0]);
    } else {
        showWinScreen(null); // Draw
    }
    
    gameState.isRunning.set(false);
}

// Show win screen with restart option
function showWinScreen(winnerId) {
    const winScreen = document.createElement('div');
    winScreen.className = 'win-screen';
    winScreen.innerHTML = `
        <div class="win-content">
            <h1>${winnerId ? `Player ${winnerId} Wins!` : 'Draw Game!'}</h1>
            <div class="win-stats">
                ${generateGameStats()}
            </div>
            <div class="win-controls">
                <button onclick="restartGame()" class="btn-restart">Play Again</button>
                <button onclick="returnToLobby()" class="btn-lobby">Return to Lobby</button>
            </div>
        </div>
    `;
    
    // Add CSS for win screen
    if (!document.getElementById('win-screen-styles')) {
        const style = document.createElement('style');
        style.id = 'win-screen-styles';
        style.textContent = `
            .win-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: white;
                font-family: 'Segoe UI', sans-serif;
            }
            
            .win-content {
                text-align: center;
                background: rgba(0,0,0,0.8);
                padding: 40px;
                border-radius: 20px;
                border: 3px solid #f39c12;
            }
            
            .win-content h1 {
                font-size: 48px;
                margin-bottom: 20px;
                color: #f39c12;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .win-stats {
                margin: 20px 0;
                font-size: 18px;
                line-height: 1.6;
            }
            
            .win-controls {
                margin-top: 30px;
            }
            
            .btn-restart, .btn-lobby {
                padding: 15px 30px;
                font-size: 18px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                margin: 0 10px;
                transition: transform 0.2s;
            }
            
            .btn-restart {
                background: #2ecc71;
                color: white;
            }
            
            .btn-lobby {
                background: #3498db;
                color: white;
            }
            
            .btn-restart:hover, .btn-lobby:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(winScreen);
}

// Generate game statistics
function generateGameStats() {
    let stats = '<div class="game-stats">';
    
    gameState.players.value.forEach((player, playerId) => {
        const playerColor = getPlayerColor(playerId);
        stats += `
            <div style="color: ${playerColor}; margin: 10px 0;">
                Player ${playerId}: ${player.lives.value} lives
                ${player.alive.value ? '(Alive)' : '(Eliminated)'}
            </div>
        `;
    });
    
    const gameTime = Math.floor((180 - gameState.gameTimer.value) * 1000) / 1000;
    stats += `<div style="margin-top: 20px;">Game Duration: ${gameTime.toFixed(1)}s</div>`;
    stats += '</div>';
    
    return stats;
}

// Restart game function
window.restartGame = function() {
    // Remove win screen
    const winScreen = document.querySelector('.win-screen');
    if (winScreen) {
        winScreen.remove();
    }
    
    // Reset game state
    resetGameState();
    
    // Restart game
    startGameLoop();
    
    console.log('🔄 Game restarted');
};

// Return to lobby function
window.returnToLobby = function() {
    // Remove win screen
    const winScreen = document.querySelector('.win-screen');
    if (winScreen) {
        winScreen.remove();
    }
    
    // Stop game
    gameState.isRunning.set(false);
    
    // Show lobby (this would integrate with the lobby system)
    console.log('🏟️ Returning to lobby...');
    
    // For now, just restart the game
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// ===== UTILITY FUNCTIONS =====
function generateWalls() {
    const walls = new Map();
    
    // Generate border walls and internal structure
    for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            // Border walls
            if (x === 0 || x === GAME_CONFIG.BOARD_WIDTH - 1 || 
                y === 0 || y === GAME_CONFIG.BOARD_HEIGHT - 1) {
                const key = `${x}-${y}`;
                walls.set(key, { 
                    x: x * GAME_CONFIG.CELL_SIZE, 
                    y: y * GAME_CONFIG.CELL_SIZE 
                });
            }
            
            // Internal walls (every other cell)
            if (x % 2 === 0 && y % 2 === 0 && x > 0 && y > 0 && 
                x < GAME_CONFIG.BOARD_WIDTH - 1 && y < GAME_CONFIG.BOARD_HEIGHT - 1) {
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
    
    // Generate destructible blocks (skip player spawn areas)
    for (let x = 1; x < GAME_CONFIG.BOARD_WIDTH - 1; x++) {
        for (let y = 1; y < GAME_CONFIG.BOARD_HEIGHT - 1; y++) {
            // Skip walls and player spawn areas
            if (isWallAt(x * GAME_CONFIG.CELL_SIZE, y * GAME_CONFIG.CELL_SIZE)) continue;
            if (isPlayerSpawnArea(x, y)) continue;
            
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

function isPlayerSpawnArea(gridX, gridY) {
    // Keep spawn areas clear (3x3 around each corner)
    const spawnAreas = [
        { x: 1, y: 1 }, // Top-left
        { x: GAME_CONFIG.BOARD_WIDTH - 2, y: 1 }, // Top-right
        { x: 1, y: GAME_CONFIG.BOARD_HEIGHT - 2 }, // Bottom-left
        { x: GAME_CONFIG.BOARD_WIDTH - 2, y: GAME_CONFIG.BOARD_HEIGHT - 2 } // Bottom-right
    ];
    
    return spawnAreas.some(spawn => {
        return Math.abs(gridX - spawn.x) <= 1 && Math.abs(gridY - spawn.y) <= 1;
    });
}

function isPositionBlocked(x, y) {
    const gridX = Math.floor(x / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_SIZE);
    
    return isWallAt(gridX * GAME_CONFIG.CELL_SIZE, gridY * GAME_CONFIG.CELL_SIZE) ||
           isBlockAt(gridX * GAME_CONFIG.CELL_SIZE, gridY * GAME_CONFIG.CELL_SIZE);
}

function isWallAt(x, y) {
    const gridX = Math.floor(x / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_SIZE);
    const key = `${gridX}-${gridY}`;
    return gameState.walls.value.has(key);
}

function isBlockAt(x, y) {
    const gridX = Math.floor(x / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_SIZE);
    const key = `${gridX}-${gridY}`;
    return gameState.blocks.value.has(key);
}

function destroyBlock(x, y) {
    const gridX = Math.floor(x / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_SIZE);
    const key = `${gridX}-${gridY}`;
    
    // Remove block
    const newBlocks = new Map(gameState.blocks.value);
    newBlocks.delete(key);
    gameState.blocks.set(newBlocks);
    
    // Remove DOM element
    const blockElement = document.getElementById(`block-${key}`);
    if (blockElement) {
        blockElement.remove();
    }
    
    // Chance to spawn powerup
    if (Math.random() < GAME_CONFIG.POWER_UP_SPAWN_CHANCE) {
        spawnPowerup(x, y);
    }
    
    console.log(`🧱 Block destroyed at (${x}, ${y})`);
}

function spawnPowerup(x, y) {
    const powerupTypes = [
        { type: 'bomb', symbol: 'B' },
        { type: 'flame', symbol: 'F' },
        { type: 'speed', symbol: 'S' }
    ];
    
    const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    const key = `${x}-${y}`;
    
    const newPowerups = new Map(gameState.powerups.value);
    newPowerups.set(key, { ...powerup, x, y });
    gameState.powerups.set(newPowerups);
    
    console.log(`⭐ Powerup ${powerup.type} spawned at (${x}, ${y})`);
}

function getPlayerColor(playerId) {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
    return colors[playerId - 1] || '#95a5a6';
}

function startPerformanceMonitor() {
    const { SignalsPerf } = RichFramework.signals;
    
    setInterval(() => {
        const stats = SignalsPerf.getStats();
        
        // Update performance overlay
        const fpsElement = document.getElementById('fps');
        const frametimeElement = document.getElementById('frametime');
        const signalsElement = document.getElementById('signals');
        const memoryElement = document.getElementById('memory');
        
        if (fpsElement) {
            fpsElement.textContent = stats.fps;
            fpsElement.className = stats.fps >= 55 ? 'fps-good' : 
                                  stats.fps >= 45 ? 'fps-warning' : 'fps-bad';
        }
        
        if (frametimeElement) frametimeElement.textContent = stats.frameTime;
        if (signalsElement) signalsElement.textContent = stats.signals;
        if (memoryElement) memoryElement.textContent = stats.memory.used || 'N/A';
        
    }, 1000); // Update every second
}

// ===== MOBILE SUPPORT =====
function setupMobileSupport() {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile || window.innerWidth <= GAME_CONFIG.MOBILE_BREAKPOINT) {
        console.log('📱 Mobile device detected, enabling touch controls...');
        
        // Initialize touch controls
        touchControls = new TouchControls(document.getElementById('gameBoard'));
        
        // Setup touch callbacks
        touchControls
            .onMove(handleTouchMove)
            .onAction(handleTouchAction)
            .onHold(handleTouchHold);
        
        // Show touch controls
        touchControls.show();
        
        // Adjust game board for mobile
        adjustForMobile();
    }
}

function handleTouchMove(direction) {
    if (!gameState || !gameState.isRunning()) return;
    
    const player = gameState.players().get(1); // Player 1 for mobile
    if (!player || !player.alive()) return;
    
    switch(direction) {
        case 'up':
            movePlayer(1, 0, -GAME_CONFIG.PLAYER_SPEED);
            break;
        case 'down':
            movePlayer(1, 0, GAME_CONFIG.PLAYER_SPEED);
            break;
        case 'left':
            movePlayer(1, -GAME_CONFIG.PLAYER_SPEED, 0);
            break;
        case 'right':
            movePlayer(1, GAME_CONFIG.PLAYER_SPEED, 0);
            break;
        case 'stop':
            // Stop movement
            break;
    }
}

function handleTouchAction(action) {
    if (!gameState || !gameState.isRunning()) return;
    
    switch(action) {
        case 'bomb':
            placeBomb(1); // Player 1
            break;
        case 'menu':
            togglePause();
            break;
    }
}

function handleTouchHold(touchInfo) {
    // Handle special actions on hold
    console.log('Touch hold detected');
}

function adjustForMobile() {
    const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
        // Reduce game board size for mobile
        const scale = Math.min(window.innerWidth / (GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE), 0.8);
        gameBoard.style.transform = `scale(${scale})`;
        gameBoard.style.transformOrigin = 'top left';
        
        // Adjust container
        const container = gameBoard.parentElement;
        if (container) {
            container.style.paddingBottom = '220px'; // Make room for touch controls
        }
    }
}

// ===== ADVANCED FEATURES =====
function setupAdvancedFeatures() {
    // Initialize animation engine
    if (window.AnimationEngine) {
        animationEngine = window.AnimationEngine;
        console.log('✨ Animation engine initialized');
    }
    
    // Setup enhanced sound effects
    setupSoundEffects();
    
    // Setup game modes
    setupGameModes();
    
    // Setup achievement system
    setupAchievements();
}

function setupSoundEffects() {
    // Simple sound effects using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    window.GameSounds = {
        playBombPlace: () => playTone(audioContext, 440, 0.1, 0.05),
        playExplosion: () => playNoise(audioContext, 0.3, 0.1),
        playPowerUp: () => playTone(audioContext, 880, 0.2, 0.05),
        playWin: () => playMelody(audioContext, [523, 659, 784], 0.5),
        playLose: () => playTone(audioContext, 220, 0.8, 0.1)
    };
}

function playTone(context, frequency, duration, volume = 0.1) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
}

function playNoise(context, duration, volume = 0.1) {
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    source.start();
}

function playMelody(context, frequencies, noteDuration) {
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            playTone(context, freq, noteDuration / frequencies.length);
        }, index * (noteDuration / frequencies.length) * 1000);
    });
}

function setupGameModes() {
    window.GameModes = {
        classic: { name: 'Classic', players: 2, timeLimit: 180 },
        team: { name: 'Team Battle', players: 4, timeLimit: 300 },
        survival: { name: 'Survival', players: 1, timeLimit: 600 },
        tournament: { name: 'Tournament', players: 4, timeLimit: 120 }
    };
}

function setupAchievements() {
    const achievements = {
        firstBomb: { name: 'First Bomb', description: 'Place your first bomb', unlocked: false },
        firstKill: { name: 'First Victory', description: 'Win your first game', unlocked: false },
        speedDemon: { name: 'Speed Demon', description: 'Collect 5 speed powerups in one game', unlocked: false },
        bombMaster: { name: 'Bomb Master', description: 'Have 10 bombs active at once', unlocked: false },
        survivor: { name: 'Survivor', description: 'Win without taking damage', unlocked: false }
    };
    
    window.GameAchievements = achievements;
}

// Enhanced explosion with particle effects
function createEnhancedExplosion(x, y, playerId) {
    if (animationEngine) {
        // Create explosion element
        const explosion = document.createElement('div');
        explosion.className = 'explosion-enhanced';
        explosion.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${GAME_CONFIG.CELL_SIZE}px;
            height: ${GAME_CONFIG.CELL_SIZE}px;
            background: radial-gradient(circle, #ff6b00 0%, #ff0000 50%, transparent 100%);
            border-radius: 50%;
            z-index: 10;
            pointer-events: none;
        `;
        
        document.getElementById('gameBoard').appendChild(explosion);
        
        // Animate explosion
        animationEngine.explode(explosion, 1.5);
        
        // Play sound
        if (window.GameSounds) {
            window.GameSounds.playExplosion();
        }
        
        // Clean up after animation
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 800);
    }
}

// Enhanced powerup collection with effects
function collectPowerUpEnhanced(playerId, powerupType) {
    const player = gameState.players().get(playerId);
    if (!player) return;
    
    // Apply powerup effect
    switch(powerupType) {
        case 'bomb':
            player.maxBombs(player.maxBombs() + 1);
            break;
        case 'flame':
            player.bombPower(player.bombPower() + 1);
            break;
        case 'speed':
            player.speed(Math.min(player.speed() + 0.5, 4));
            break;
    }
    
    // Visual effect
    const playerElement = document.getElementById(`player${playerId}`);
    if (playerElement && animationEngine) {
        animationEngine.powerUpEffect(playerElement);
    }
    
    // Play sound
    if (window.GameSounds) {
        window.GameSounds.playPowerUp();
    }
    
    // Check achievements
    checkAchievements(playerId, 'powerup', powerupType);
}

function checkAchievements(playerId, action, data) {
    const achievements = window.GameAchievements;
    if (!achievements) return;
    
    // Check specific achievements based on action
    switch(action) {
        case 'bomb_placed':
            if (!achievements.firstBomb.unlocked) {
                achievements.firstBomb.unlocked = true;
                showAchievement('First Bomb');
            }
            break;
        case 'game_won':
            if (!achievements.firstKill.unlocked) {
                achievements.firstKill.unlocked = true;
                showAchievement('First Victory');
            }
            break;
        case 'powerup':
            if (data === 'speed') {
                const player = gameState.players().get(playerId);
                if (player && player.speed() >= 3.5 && !achievements.speedDemon.unlocked) {
                    achievements.speedDemon.unlocked = true;
                    showAchievement('Speed Demon');
                }
            }
            break;
    }
}

function showAchievement(name) {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-popup';
    achievementElement.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${name}</div>
        </div>
    `;
    achievementElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffd700, #ffb347);
        color: #333;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        transform: translateX(100%);
        opacity: 0;
    `;
    
    document.body.appendChild(achievementElement);
    
    // Animate in
    if (animationEngine) {
        animationEngine.parallel([
            {
                element: achievementElement,
                properties: { translateX: 0, opacity: 1 },
                options: { duration: 500, easing: 'easeOut' }
            }
        ]);
        
        // Animate out after delay
        setTimeout(() => {
            animationEngine.parallel([
                {
                    element: achievementElement,
                    properties: { translateX: '100%', opacity: 0 },
                    options: { 
                        duration: 500, 
                        easing: 'easeIn',
                        onComplete: () => achievementElement.remove()
                    }
                }
            ]);
        }, 3000);
    }
}

// Enhanced game over screen
function showEnhancedWinScreen(winnerId, stats) {
    const winScreen = document.getElementById('winScreen');
    if (!winScreen) return;
    
    // Enhanced win screen content
    const winnerName = winnerId ? `Player ${winnerId}` : 'Draw';
    const winMessage = winnerId ? `🎉 ${winnerName} Wins! 🎉` : '🤝 It\'s a Draw! 🤝';
    
    winScreen.innerHTML = `
        <div class="win-content-enhanced">
            <h1 class="win-title">${winMessage}</h1>
            <div class="win-stats">
                <div class="stat-item">
                    <span class="stat-label">Game Duration:</span>
                    <span class="stat-value">${Math.floor(stats.duration / 1000)}s</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Bombs Placed:</span>
                    <span class="stat-value">${stats.bombsPlaced}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Powerups Collected:</span>
                    <span class="stat-value">${stats.powerupsCollected}</span>
                </div>
            </div>
            <div class="win-actions">
                <button id="playAgainBtn" class="action-btn primary">Play Again</button>
                <button id="mainMenuBtn" class="action-btn secondary">Main Menu</button>
            </div>
        </div>
    `;
    
    winScreen.style.display = 'flex';
    
    // Animate in
    const content = winScreen.querySelector('.win-content-enhanced');
    if (content && animationEngine) {
        content.style.transform = 'scale(0.8)';
        content.style.opacity = '0';
        
        animationEngine.parallel([
            {
                element: content,
                properties: { scale: 1, opacity: 1 },
                options: { duration: 600, easing: 'bounce' }
            }
        ]);
    }
    
    // Play sound
    if (window.GameSounds) {
        if (winnerId) {
            window.GameSounds.playWin();
        } else {
            window.GameSounds.playLose();
        }
    }
    
    // Setup button handlers
    document.getElementById('playAgainBtn')?.addEventListener('click', restartGame);
    document.getElementById('mainMenuBtn')?.addEventListener('click', () => {
        window.location.reload(); // Simple main menu
    });
}

// Export for debugging
window.BombermanGame = {
    gameState,
    placeBomb,
    touchControls,
    animationEngine,
    getStats: () => RichFramework.signals.SignalsPerf.getStats(),
    achievements: () => window.GameAchievements
};

console.log('🎮 Enhanced Bomberman game loaded successfully!');