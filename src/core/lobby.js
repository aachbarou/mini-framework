// RichFramework - Game Lobby System
// Real-time lobby with player management and game countdown

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

class GameLobby {
    constructor(maxPlayers = 4) {
        this.maxPlayers = maxPlayers;
        this.players = new Map();
        this.isGameStarting = false;
        this.countdownTimer = null;
        this.countdownSeconds = 5;
        this.roomId = null;
        
        // Signals for reactive UI
        if (window.RichFramework.signals) {
            const { signal } = window.RichFramework.signals;
            this.playerCount = signal(0);
            this.playerList = signal([]);
            this.gameStatus = signal('waiting'); // 'waiting', 'countdown', 'starting', 'playing'
            this.countdown = signal(0);
        }
        
        console.log('🏟️ Game lobby initialized');
    }
    
    // Add player to lobby
    addPlayer(playerId, playerName, isHost = false) {
        if (this.players.size >= this.maxPlayers) {
            console.log('❌ Lobby is full');
            return false;
        }
        
        const player = {
            id: playerId,
            name: playerName,
            isHost,
            isReady: false,
            joinTime: Date.now()
        };
        
        this.players.set(playerId, player);
        this.updateSignals();
        
        console.log(`👥 Player ${playerName} joined lobby (${this.players.size}/${this.maxPlayers})`);
        
        // Notify all players
        this.broadcastLobbyUpdate();
        
        return true;
    }
    
    // Remove player from lobby
    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            
            // If host left, assign new host
            if (player.isHost && this.players.size > 0) {
                const newHost = Array.from(this.players.values())[0];
                newHost.isHost = true;
                console.log(`👑 ${newHost.name} is now the host`);
            }
            
            this.updateSignals();
            this.broadcastLobbyUpdate();
            
            // Cancel countdown if in progress
            if (this.isGameStarting) {
                this.cancelCountdown();
            }
            
            console.log(`👋 Player ${player.name} left lobby`);
        }
    }
    
    // Toggle player ready status
    togglePlayerReady(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = !player.isReady;
            this.updateSignals();
            this.broadcastLobbyUpdate();
            
            console.log(`✅ Player ${player.name} is ${player.isReady ? 'ready' : 'not ready'}`);
            
            // Check if all players are ready
            this.checkStartConditions();
        }
    }
    
    // Check if game can start
    checkStartConditions() {
        const allReady = Array.from(this.players.values()).every(p => p.isReady);
        const minPlayers = this.players.size >= 2;
        
        if (allReady && minPlayers && !this.isGameStarting) {
            this.startCountdown();
        } else if (this.isGameStarting && (!allReady || !minPlayers)) {
            this.cancelCountdown();
        }
    }
    
    // Start game countdown
    startCountdown() {
        this.isGameStarting = true;
        this.gameStatus.set('countdown');
        this.countdown.set(this.countdownSeconds);
        
        console.log('⏱️ Starting game countdown');
        
        this.countdownTimer = setInterval(() => {
            this.countdown.set(this.countdown.value - 1);
            
            if (this.countdown.value <= 0) {
                this.startGame();
            }
        }, 1000);
        
        this.broadcastCountdownStart();
    }
    
    // Cancel countdown
    cancelCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        
        this.isGameStarting = false;
        this.gameStatus.set('waiting');
        this.countdown.set(0);
        
        console.log('❌ Game countdown cancelled');
        this.broadcastCountdownCancel();
    }
    
    // Start the actual game
    startGame() {
        this.cancelCountdown();
        this.gameStatus.set('starting');
        
        console.log('🎮 Starting game with players:', Array.from(this.players.keys()));
        
        // Create player spawn data
        const spawnPositions = [
            { x: 32, y: 32 },
            { x: 704, y: 32 },
            { x: 32, y: 544 },
            { x: 704, y: 544 }
        ];
        
        const gameData = {
            players: Array.from(this.players.values()).map((player, index) => ({
                ...player,
                spawnX: spawnPositions[index].x,
                spawnY: spawnPositions[index].y
            })),
            roomId: this.roomId,
            gameSettings: {
                boardWidth: 24,
                boardHeight: 18,
                bombTimer: 180
            }
        };
        
        // Broadcast game start
        this.broadcastGameStart(gameData);
        
        this.gameStatus.set('playing');
    }
    
    // Update reactive signals
    updateSignals() {
        if (this.playerCount) {
            this.playerCount.set(this.players.size);
            this.playerList.set(Array.from(this.players.values()));
        }
    }
    
    // Broadcast lobby update to all players
    broadcastLobbyUpdate() {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('lobbyUpdate', {
                players: Array.from(this.players.values()),
                maxPlayers: this.maxPlayers,
                canStart: this.canStartGame()
            });
        }
    }
    
    // Broadcast countdown start
    broadcastCountdownStart() {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('countdownStart', { seconds: this.countdownSeconds });
        }
    }
    
    // Broadcast countdown cancel
    broadcastCountdownCancel() {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('countdownCancel', {});
        }
    }
    
    // Broadcast game start
    broadcastGameStart(gameData) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('gameStart', gameData);
        }
    }
    
    // Check if game can start
    canStartGame() {
        const allReady = Array.from(this.players.values()).every(p => p.isReady);
        const minPlayers = this.players.size >= 2;
        return allReady && minPlayers;
    }
    
    // Get lobby state
    getLobbyState() {
        return {
            players: Array.from(this.players.values()),
            playerCount: this.players.size,
            maxPlayers: this.maxPlayers,
            gameStatus: this.gameStatus ? this.gameStatus.value : 'waiting',
            countdown: this.countdown ? this.countdown.value : 0,
            canStart: this.canStartGame()
        };
    }
}

// Lobby UI helpers for DOM binding
const LobbyUI = {
    // Create lobby interface
    createLobbyInterface(containerId, lobby) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Lobby container not found:', containerId);
            return;
        }
        
        container.innerHTML = `
            <div class="lobby-container">
                <div class="lobby-header">
                    <h2>Game Lobby</h2>
                    <div class="player-count">
                        <span id="playerCount">0</span>/<span id="maxPlayers">${lobby.maxPlayers}</span> Players
                    </div>
                </div>
                
                <div class="player-list" id="playerList">
                    <!-- Players will be added here -->
                </div>
                
                <div class="lobby-controls" id="lobbyControls">
                    <button id="readyButton" class="btn-ready">Ready</button>
                    <button id="startButton" class="btn-start" style="display: none;">Start Game</button>
                </div>
                
                <div class="countdown-display" id="countdownDisplay" style="display: none;">
                    Game starting in <span id="countdownTimer">5</span>...
                </div>
                
                <div class="chat-container">
                    <div class="chat-messages" id="chatMessages"></div>
                    <div class="chat-input-container">
                        <input type="text" id="chatInput" placeholder="Type a message..." maxlength="100">
                        <button id="sendChat">Send</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS if not already added
        if (!document.getElementById('lobby-styles')) {
            const style = document.createElement('style');
            style.id = 'lobby-styles';
            style.textContent = `
                .lobby-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: rgba(0,0,0,0.8);
                    border-radius: 10px;
                    color: white;
                    font-family: 'Segoe UI', sans-serif;
                }
                
                .lobby-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                
                .player-count {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .player-list {
                    margin-bottom: 20px;
                }
                
                .player-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin: 5px 0;
                    background: rgba(255,255,255,0.1);
                    border-radius: 5px;
                }
                
                .player-name {
                    font-weight: bold;
                }
                
                .player-status {
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                }
                
                .status-ready { background: #2ecc71; }
                .status-waiting { background: #e74c3c; }
                .status-host { background: #f39c12; }
                
                .lobby-controls {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .btn-ready, .btn-start {
                    padding: 10px 30px;
                    font-size: 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 0 10px;
                }
                
                .btn-ready { background: #3498db; color: white; }
                .btn-ready.ready { background: #2ecc71; }
                .btn-start { background: #e74c3c; color: white; }
                
                .countdown-display {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: #f39c12;
                    margin-bottom: 20px;
                }
                
                .chat-container {
                    border-top: 2px solid #333;
                    padding-top: 20px;
                }
                
                .chat-messages {
                    height: 150px;
                    overflow-y: auto;
                    background: rgba(0,0,0,0.3);
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }
                
                .chat-input-container {
                    display: flex;
                    gap: 10px;
                }
                
                #chatInput {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    border-radius: 3px;
                }
                
                #sendChat {
                    padding: 8px 15px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Bind events and signals
        this.bindLobbyEvents(lobby);
    },
    
    // Bind lobby events and reactive updates
    bindLobbyEvents(lobby) {
        if (!window.RichFramework.signals) return;
        
        const { effect } = window.RichFramework.signals;
        
        // Update player count
        effect(() => {
            const countElement = document.getElementById('playerCount');
            if (countElement) {
                countElement.textContent = lobby.playerCount.value;
            }
        });
        
        // Update player list
        effect(() => {
            const playerListElement = document.getElementById('playerList');
            if (playerListElement) {
                playerListElement.innerHTML = '';
                
                lobby.playerList.value.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'player-item';
                    playerElement.innerHTML = `
                        <div class="player-name">${player.name}</div>
                        <div class="player-badges">
                            ${player.isHost ? '<span class="player-status status-host">HOST</span>' : ''}
                            <span class="player-status ${player.isReady ? 'status-ready' : 'status-waiting'}">
                                ${player.isReady ? 'READY' : 'WAITING'}
                            </span>
                        </div>
                    `;
                    playerListElement.appendChild(playerElement);
                });
            }
        });
        
        // Update countdown display
        effect(() => {
            const countdownDisplay = document.getElementById('countdownDisplay');
            const countdownTimer = document.getElementById('countdownTimer');
            
            if (countdownDisplay && countdownTimer) {
                if (lobby.gameStatus.value === 'countdown') {
                    countdownDisplay.style.display = 'block';
                    countdownTimer.textContent = lobby.countdown.value;
                } else {
                    countdownDisplay.style.display = 'none';
                }
            }
        });
        
        // Bind button events
        const readyButton = document.getElementById('readyButton');
        if (readyButton) {
            readyButton.onclick = () => {
                // This would be called by the client
                console.log('Ready button clicked');
            };
        }
        
        // Bind chat
        const chatInput = document.getElementById('chatInput');
        const sendChat = document.getElementById('sendChat');
        
        if (chatInput && sendChat) {
            const sendMessage = () => {
                const message = chatInput.value.trim();
                if (message) {
                    // Send chat message via WebSocket
                    window.RichFramework.GameNetwork.sendChat(message, 'currentPlayer');
                    chatInput.value = '';
                }
            };
            
            sendChat.onclick = sendMessage;
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            };
        }
    },
    
    // Add chat message to UI
    addChatMessage(playerName, message, timestamp) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <span style="color: #3498db; font-weight: bold;">${playerName}:</span>
                <span>${message}</span>
                <span style="opacity: 0.6; font-size: 11px; float: right;">
                    ${new Date(timestamp).toLocaleTimeString()}
                </span>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
};

// Add to framework
window.RichFramework.GameLobby = GameLobby;
window.RichFramework.LobbyUI = LobbyUI;

console.log('✅ Game Lobby system loaded with reactive UI!');
