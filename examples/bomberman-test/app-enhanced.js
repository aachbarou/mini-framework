// RichFramework - Enhanced Bomberman Game with AI, Performance Profiler, Spatial Grid, and Save System
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

// ===== GLOBAL GAME OBJECTS =====
let gameState = null;
let gameLoop = null;
let performanceProfiler = null;
let spatialGrid = null;
let saveSystem = null;
let aiSystem = null;
let touchControls = null;
let animationEngine = null;
let gameMode = 'menu'; // 'menu', 'singleplayer', 'multiplayer'
let collisionDebugEnabled = false;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Enhanced Bomberman with AI, Performance Profiler, Spatial Grid, and Save System...');
    
    // Verify all required systems are loaded
    if (!window.RichFramework || 
        !window.RichFramework.signals ||
        !window.PerformanceProfiler ||
        !window.SpatialGrid ||
        !window.SaveSystem ||
        !window.AISystem) {
        console.error('❌ Required systems not loaded!');
        return;
    }
    
    initializeSystems();
    setupGameMenu();
});

function initializeSystems() {
    console.log('🔧 Initializing core systems...');
    
    // Initialize Performance Profiler
    performanceProfiler = new PerformanceProfiler({
        targetFPS: 60,
        showOverlay: true,
        autoOptimize: true,
        memoryTracking: true
    });
    
    // Initialize Spatial Grid for collision detection
    spatialGrid = new SpatialGrid({
        worldWidth: GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE,
        worldHeight: GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE,
        cellSize: GAME_CONFIG.CELL_SIZE
    });
    
    // Initialize Save System
    saveSystem = new SaveSystem({
        gameName: 'enhanced-bomberman',
        version: '1.0.0',
        compression: true,
        autoSave: true,
        maxSaves: 5
    });
    
    // Initialize AI System
    aiSystem = new AISystem({
        gridWidth: GAME_CONFIG.BOARD_WIDTH,
        gridHeight: GAME_CONFIG.BOARD_HEIGHT,
        cellSize: GAME_CONFIG.CELL_SIZE
    });
    
    console.log('✅ All systems initialized successfully!');
}

function setupGameMenu() {
    const gameMenu = document.getElementById('gameMenu');
    const singlePlayerBtn = document.getElementById('singlePlayerBtn');
    const multiPlayerBtn = document.getElementById('multiPlayerBtn');
    const aiSettings = document.getElementById('aiSettings');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const togglePerformanceBtn = document.getElementById('togglePerformanceBtn');
    const toggleCollisionDebugBtn = document.getElementById('toggleCollisionDebugBtn');
    
    // Single Player vs AI
    singlePlayerBtn.addEventListener('click', () => {
        gameMode = 'singleplayer';
        aiSettings.style.display = 'block';
    });
    
    // Two Player Local
    multiPlayerBtn.addEventListener('click', () => {
        gameMode = 'multiplayer';
        aiSettings.style.display = 'none';
    });
    
    // Start New Game
    newGameBtn.addEventListener('click', () => {
        const aiDifficulty = document.getElementById('aiDifficulty').value;
        startNewGame(aiDifficulty);
        gameMenu.style.display = 'none';
        document.getElementById('controlsInfo').style.display = 'block';
    });
    
    // Load Saved Game
    loadGameBtn.addEventListener('click', async () => {
        try {
            const saves = await saveSystem.listSaves();
            if (saves.length > 0) {
                const latestSave = saves[0];
                await loadGame(latestSave.id);
                gameMenu.style.display = 'none';
                document.getElementById('controlsInfo').style.display = 'block';
            } else {
                alert('No saved games found!');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            alert('Failed to load saved game!');
        }
    });
    
    // Toggle Performance Monitor
    togglePerformanceBtn.addEventListener('click', () => {
        const overlay = document.getElementById('performance');
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    });
    
    // Toggle Collision Debug
    toggleCollisionDebugBtn.addEventListener('click', () => {
        collisionDebugEnabled = !collisionDebugEnabled;
        updateCollisionDebugVisualization();
    });
}

function startNewGame(aiDifficulty = 'medium') {
    console.log(`🎮 Starting new game - Mode: ${gameMode}, AI Difficulty: ${aiDifficulty}`);
    
    initGame(aiDifficulty);
    setupMobileSupport();
    setupAdvancedFeatures();
}

function initGame(aiDifficulty = 'medium') {
    const { signal, effect, batch, GameSignals, SignalsPerf } = RichFramework.signals;
    
    // ===== GAME STATE SIGNALS =====
    gameState = {
        // Core game state
        isRunning: signal(false),
        isPaused: signal(false),
        gameTime: signal(0),
        gameMode: signal(gameMode),
        
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
        winner: signal(null),
        
        // AI state
        aiPlayers: signal(new Map()),
        aiDifficulty: signal(aiDifficulty)
    };
    
    // ===== CREATE INITIAL PLAYERS =====
    createPlayers();
    
    // ===== SETUP SPATIAL GRID =====
    setupSpatialGrid();
    
    // ===== BIND DOM ELEMENTS =====
    bindGameToDOM();
    
    // ===== START PERFORMANCE MONITORING =====
    startPerformanceMonitor();
    
    // ===== INPUT HANDLING =====
    setupInputHandlers();
    
    // ===== START GAME LOOP =====
    startGameLoop();
    
    console.log('✅ Enhanced Bomberman initialized successfully!');
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
    
    // Create players based on game mode
    const numPlayers = gameMode === 'singleplayer' ? 2 : 2; // Can extend to 4
    
    for (let i = 0; i < numPlayers; i++) {
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
        player.isAI = RichFramework.signals.signal(false);
        
        gameState.players.value.set(i + 1, player);
    }
    
    // Setup AI player for single player mode
    if (gameMode === 'singleplayer') {
        const aiPlayer = gameState.players.value.get(2);
        aiPlayer.isAI.set(true);
        
        // Create AI controller
        const aiController = aiSystem.createAIPlayer(2, gameState.aiDifficulty.value);
        gameState.aiPlayers.value.set(2, aiController);
        
        console.log(`🤖 AI Player created with difficulty: ${gameState.aiDifficulty.value}`);
    }
    
    // Update alive players count
    gameState.alivePlayers.set(gameState.players.value.size);
    
    console.log(`👥 Created ${gameState.players.value.size} players (${gameMode} mode)`);
}

function setupSpatialGrid() {
    console.log('🔗 Setting up spatial grid...');
    
    // Clear spatial grid
    spatialGrid.clear();
    
    // Add walls to spatial grid
    gameState.walls.value.forEach((wall, key) => {
        spatialGrid.insert({
            id: `wall-${key}`,
            x: wall.x,
            y: wall.y,
            width: GAME_CONFIG.CELL_SIZE,
            height: GAME_CONFIG.CELL_SIZE,
            type: 'wall'
        });
    });
    
    // Add blocks to spatial grid
    gameState.blocks.value.forEach((block, key) => {
        spatialGrid.insert({
            id: `block-${key}`,
            x: block.x,
            y: block.y,
            width: GAME_CONFIG.CELL_SIZE,
            height: GAME_CONFIG.CELL_SIZE,
            type: 'block'
        });
    });
    
    console.log('✅ Spatial grid setup complete');
}

function bindGameToDOM() {
    const { effect, GameSignals } = RichFramework.signals;
    const gameBoard = document.getElementById('gameBoard');
    
    // ===== BIND PLAYERS TO DOM =====
    gameState.players.value.forEach((player, playerId) => {
        // Create player DOM element
        const playerElement = document.createElement('div');
        playerElement.className = `player player-${playerId}`;
        playerElement.textContent = player.isAI.value ? `AI${playerId}` : `P${playerId}`;
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
    playerName.textContent = player.isAI.value ? `AI Player ${playerId}` : `Player ${playerId}`;
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
        
        // Handle immediate actions
        switch(e.code) {
            case 'Space':
            case 'Enter':
                placeBomb(1); // Player 1
                break;
            case 'ShiftRight':
            case 'ControlRight':
                if (gameMode === 'multiplayer') {
                    placeBomb(2); // Player 2 (only in multiplayer)
                }
                break;
            case 'Escape':
                togglePause();
                break;
            case 'F1':
                saveGame();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keyState.delete(e.code);
    });
    
    // Store key state for game loop access
    window.gameKeyState = keyState;
}

function startPerformanceMonitor() {
    console.log('📊 Starting performance monitor...');
    
    performanceProfiler.start();
    
    // Update performance overlay
    setInterval(() => {
        const stats = performanceProfiler.getStats();
        
        // Update FPS display
        const fpsElement = document.getElementById('fps');
        fpsElement.textContent = Math.round(stats.fps);
        fpsElement.className = stats.fps >= 55 ? 'fps-good' : 
                              stats.fps >= 45 ? 'fps-warning' : 'fps-bad';
        
        // Update other stats
        document.getElementById('frametime').textContent = `${stats.averageFrameTime.toFixed(2)}ms`;
        document.getElementById('signals').textContent = RichFramework.signals.SignalsPerf?.getStats()?.totalSignals || 0;
        document.getElementById('memory').textContent = `${stats.memoryUsage.toFixed(1)}MB`;
        document.getElementById('gpuLayers').textContent = stats.gpuLayers;
        document.getElementById('collisions').textContent = spatialGrid.getQueryCount();
    }, 100);
}

function startGameLoop() {
    const { batch, SignalsPerf } = RichFramework.signals;
    
    gameState.isRunning.set(true);
    let lastTime = performance.now();
    
    function gameLoopFrame(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Performance monitoring
        performanceProfiler.beginFrame();
        
        // Skip frame if paused
        if (gameState.isPaused.value) {
            requestAnimationFrame(gameLoopFrame);
            return;
        }
        
        // Batch all game updates for optimal performance
        batch(() => {
            updateGameLogic(deltaTime);
            updateAI(deltaTime);
            updateSpatialGrid();
        });
        
        // End performance monitoring
        performanceProfiler.endFrame();
        
        // Continue loop
        if (gameState.isRunning.value) {
            requestAnimationFrame(gameLoopFrame);
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
    
    // Check collisions using spatial grid
    checkCollisions();
    
    // Check win conditions
    checkWinConditions();
    
    // Auto-save every 30 seconds
    if (Math.floor(gameState.gameTime.value / 30000) > Math.floor((gameState.gameTime.value - deltaTime) / 30000)) {
        autoSave();
    }
    
    gameState.gameTime.set(gameState.gameTime.value + deltaTime);
}

function updateAI(deltaTime) {
    if (gameMode !== 'singleplayer') return;
    
    // Update AI players
    gameState.aiPlayers.value.forEach((aiController, playerId) => {
        const player = gameState.players.value.get(playerId);
        if (!player || !player.alive.value) return;
        
        // Get current game state for AI
        const gameInfo = {
            players: Array.from(gameState.players.value.values()).map(p => ({
                id: p.id.value,
                x: p.x.value,
                y: p.y.value,
                alive: p.alive.value
            })),
            bombs: Array.from(gameState.bombs.value.values()).map(b => ({
                x: b.x.value,
                y: b.y.value,
                timer: b.timer.value,
                flameSize: b.flameSize.value
            })),
            walls: Array.from(gameState.walls.value.values()),
            blocks: Array.from(gameState.blocks.value.values()),
            powerups: Array.from(gameState.powerups.value.values())
        };
        
        // Get AI decision
        const decision = aiController.update(gameInfo, deltaTime);
        
        // Execute AI actions
        if (decision.move) {
            const newX = player.x.value + decision.move.x * player.speed.value;
            const newY = player.y.value + decision.move.y * player.speed.value;
            
            // Check collision before moving
            if (!checkCollisionAt(newX, newY, playerId)) {
                player.x.set(newX);
                player.y.set(newY);
            }
        }
        
        if (decision.placeBomb) {
            placeBomb(playerId);
        }
    });
}

function updateSpatialGrid() {
    // Update player positions in spatial grid
    gameState.players.value.forEach((player, playerId) => {
        if (player.alive.value) {
            spatialGrid.update(`player-${playerId}`, {
                id: `player-${playerId}`,
                x: player.x.value,
                y: player.y.value,
                width: 28,
                height: 28,
                type: 'player'
            });
        }
    });
    
    // Update bomb positions in spatial grid
    gameState.bombs.value.forEach((bomb, bombId) => {
        spatialGrid.update(`bomb-${bombId}`, {
            id: `bomb-${bombId}`,
            x: bomb.x.value,
            y: bomb.y.value,
            width: 24,
            height: 24,
            type: 'bomb'
        });
    });
}

function updatePlayerMovement() {
    const keyState = window.gameKeyState;
    
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value || player.isAI.value) return;
        
        let deltaX = 0, deltaY = 0;
        
        // Player 1 controls (WASD)
        if (playerId === 1) {
            if (keyState.has('KeyW')) deltaY = -player.speed.value;
            if (keyState.has('KeyS')) deltaY = player.speed.value;
            if (keyState.has('KeyA')) deltaX = -player.speed.value;
            if (keyState.has('KeyD')) deltaX = player.speed.value;
        }
        // Player 2 controls (Arrow keys) - only in multiplayer
        else if (playerId === 2 && gameMode === 'multiplayer') {
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

function checkCollisionAt(x, y, playerId) {
    // Query spatial grid for nearby objects
    const nearby = spatialGrid.query({
        x: x,
        y: y,
        width: 28,
        height: 28
    });
    
    // Check collisions with walls, blocks, and other solid objects
    for (const obj of nearby) {
        if (obj.type === 'wall' || obj.type === 'block') {
            // Simple AABB collision detection
            if (x < obj.x + obj.width &&
                x + 28 > obj.x &&
                y < obj.y + obj.height &&
                y + 28 > obj.y) {
                return true; // Collision detected
            }
        }
    }
    
    return false; // No collision
}

function checkCollisions() {
    // Check player-powerup collisions
    gameState.players.value.forEach((player, playerId) => {
        if (!player.alive.value) return;
        
        const nearby = spatialGrid.query({
            x: player.x.value,
            y: player.y.value,
            width: 28,
            height: 28
        });
        
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

function placeBomb(playerId) {
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
    const bombId = Date.now() + Math.random();
    const bomb = {
        id: RichFramework.signals.signal(bombId),
        x: RichFramework.signals.signal(bombX),
        y: RichFramework.signals.signal(bombY),
        timer: RichFramework.signals.signal(GAME_CONFIG.BOMB_TIMER),
        playerId: RichFramework.signals.signal(playerId),
        flameSize: RichFramework.signals.signal(player.flameSize.value)
    };
    
    // Add bomb to game state
    const newBombs = new Map(gameState.bombs.value);
    newBombs.set(bombId, bomb);
    gameState.bombs.set(newBombs);
    
    // Update player bomb count
    player.bombsPlaced.set(player.bombsPlaced.value + 1);
    
    console.log(`💣 Player ${playerId} placed bomb at (${bombX}, ${bombY})`);
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
            
            // Remove block from spatial grid
            spatialGrid.remove(`block-${blockKey}`);
            
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
    
    // Remove from spatial grid
    spatialGrid.remove(`player-${playerId}`);
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
        const message = winner ? 
            `🏆 ${gameState.players.value.get(winner).isAI.value ? 'AI' : 'Player'} ${winner} Wins!` : 
            '🤝 Draw Game!';
        
        if (confirm(`${message}\n\nPlay again?`)) {
            // Reset to menu
            document.getElementById('gameMenu').style.display = 'block';
            document.getElementById('controlsInfo').style.display = 'none';
            
            // Clear game board
            const gameBoard = document.getElementById('gameBoard');
            gameBoard.innerHTML = '';
            
            // Reset spatial grid
            spatialGrid.clear();
        }
    }, 1000);
}

function togglePause() {
    if (gameState) {
        gameState.isPaused.set(!gameState.isPaused.value);
        console.log(gameState.isPaused.value ? '⏸️ Game paused' : '▶️ Game resumed');
    }
}

async function saveGame() {
    if (!gameState) return;
    
    try {
        const gameData = {
            players: Array.from(gameState.players.value.entries()).map(([id, player]) => ({
                id,
                x: player.x.value,
                y: player.y.value,
                alive: player.alive.value,
                lives: player.lives.value,
                maxBombs: player.maxBombs.value,
                flameSize: player.flameSize.value,
                speed: player.speed.value,
                isAI: player.isAI.value
            })),
            bombs: Array.from(gameState.bombs.value.entries()).map(([id, bomb]) => ({
                id,
                x: bomb.x.value,
                y: bomb.y.value,
                timer: bomb.timer.value,
                playerId: bomb.playerId.value,
                flameSize: bomb.flameSize.value
            })),
            blocks: Array.from(gameState.blocks.value.entries()),
            powerups: Array.from(gameState.powerups.value.entries()),
            gameTimer: gameState.gameTimer.value,
            gameTime: gameState.gameTime.value,
            gameMode: gameState.gameMode.value,
            aiDifficulty: gameState.aiDifficulty.value
        };
        
        const saveId = await saveSystem.save(gameData, `Game ${new Date().toLocaleDateString()}`);
        console.log(`💾 Game saved with ID: ${saveId}`);
        alert('Game saved successfully!');
    } catch (error) {
        console.error('Failed to save game:', error);
        alert('Failed to save game!');
    }
}

async function autoSave() {
    if (!gameState || gameState.isPaused.value) return;
    
    try {
        const gameData = {
            players: Array.from(gameState.players.value.entries()).map(([id, player]) => ({
                id,
                x: player.x.value,
                y: player.y.value,
                alive: player.alive.value,
                lives: player.lives.value,
                maxBombs: player.maxBombs.value,
                flameSize: player.flameSize.value,
                speed: player.speed.value,
                isAI: player.isAI.value
            })),
            // ... (same as saveGame but without user notification)
        };
        
        await saveSystem.autoSave(gameData);
        console.log('🔄 Auto-save completed');
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

async function loadGame(saveId) {
    try {
        const gameData = await saveSystem.load(saveId);
        
        // Initialize game systems
        initializeSystems();
        
        // Restore game state
        gameMode = gameData.gameMode || 'singleplayer';
        initGame(gameData.aiDifficulty || 'medium');
        
        // Restore players
        gameData.players.forEach(playerData => {
            const player = gameState.players.value.get(playerData.id);
            if (player) {
                player.x.set(playerData.x);
                player.y.set(playerData.y);
                player.alive.set(playerData.alive);
                player.lives.set(playerData.lives);
                player.maxBombs.set(playerData.maxBombs);
                player.flameSize.set(playerData.flameSize);
                player.speed.set(playerData.speed);
                player.isAI.set(playerData.isAI);
            }
        });
        
        // Restore game timer and time
        gameState.gameTimer.set(gameData.gameTimer);
        gameState.gameTime.set(gameData.gameTime);
        
        console.log(`📂 Game loaded from save: ${saveId}`);
        alert('Game loaded successfully!');
    } catch (error) {
        console.error('Failed to load game:', error);
        alert('Failed to load game!');
    }
}

function updateCollisionDebugVisualization() {
    const gameBoard = document.getElementById('gameBoard');
    
    // Remove existing debug cells
    document.querySelectorAll('.collision-cell').forEach(el => el.remove());
    
    if (!collisionDebugEnabled) return;
    
    // Add debug visualization for spatial grid
    const gridInfo = spatialGrid.getDebugInfo();
    
    gridInfo.cells.forEach(cell => {
        const debugElement = document.createElement('div');
        debugElement.className = `collision-cell ${cell.objects.length > 0 ? 'occupied' : ''}`;
        debugElement.style.left = cell.x + 'px';
        debugElement.style.top = cell.y + 'px';
        debugElement.style.width = cell.width + 'px';
        debugElement.style.height = cell.height + 'px';
        debugElement.textContent = cell.objects.length;
        gameBoard.appendChild(debugElement);
    });
}

function setupMobileSupport() {
    // Mobile support implementation (existing code)
    if (window.innerWidth <= GAME_CONFIG.MOBILE_BREAKPOINT) {
        console.log('📱 Mobile device detected, setting up touch controls...');
        
        if (window.TouchControls) {
            touchControls = new TouchControls({
                container: document.getElementById('gameContainer'),
                onMove: (direction) => {
                    // Handle touch movement for player 1
                    const player = gameState?.players?.value?.get(1);
                    if (player && player.alive.value) {
                        let deltaX = 0, deltaY = 0;
                        
                        switch(direction) {
                            case 'up': deltaY = -player.speed.value; break;
                            case 'down': deltaY = player.speed.value; break;
                            case 'left': deltaX = -player.speed.value; break;
                            case 'right': deltaX = player.speed.value; break;
                        }
                        
                        const newX = player.x.value + deltaX;
                        const newY = player.y.value + deltaY;
                        
                        if (!checkCollisionAt(newX, newY, 1)) {
                            player.x.set(newX);
                            player.y.set(newY);
                        }
                    }
                },
                onAction: () => {
                    placeBomb(1);
                }
            });
        }
    }
}

function setupAdvancedFeatures() {
    // Animation engine setup (existing code)
    if (window.AnimationEngine) {
        animationEngine = new AnimationEngine();
        console.log('🎬 Animation engine initialized');
    }
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

// Make functions available globally for debugging
window.BombermanGame = {
    saveGame,
    loadGame,
    togglePause,
    gameState: () => gameState,
    performanceProfiler: () => performanceProfiler,
    spatialGrid: () => spatialGrid,
    saveSystem: () => saveSystem,
    aiSystem: () => aiSystem
};

console.log('🎮 Enhanced Bomberman game script loaded with all advanced features!');
