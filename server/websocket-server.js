/**
 * WebSocket Server for Mini-Framework
 * Handles real-time multiplayer game sessions with lobby management
 */
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class GameServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.lobbies = new Map(); // lobbyId -> Lobby
        this.clients = new Map(); // ws -> ClientInfo
        this.playerCount = 0;
        
        // Performance monitoring
        this.stats = {
            totalConnections: 0,
            activeConnections: 0,
            messagesPerSecond: 0,
            messageCount: 0,
            startTime: Date.now()
        };
        
        this.setupStatsTracking();
    }

    start() {
        this.wss = new WebSocket.Server({ 
            port: this.port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    level: 1,
                    chunkSize: 4 * 1024
                }
            }
        });

        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });

        console.log(`🚀 Game Server started on port ${this.port}`);
        console.log(`📊 Stats available at ws://localhost:${this.port}/stats`);
    }

    handleConnection(ws) {
        const clientId = uuidv4();
        const clientInfo = {
            id: clientId,
            playerId: `Player${++this.playerCount}`,
            lobbyId: null,
            ready: false,
            lastPing: Date.now()
        };

        this.clients.set(ws, clientInfo);
        this.stats.totalConnections++;
        this.stats.activeConnections++;

        console.log(`✅ Client connected: ${clientInfo.playerId} (${clientId})`);

        // Send welcome message
        this.sendToClient(ws, {
            type: 'connected',
            data: {
                clientId,
                playerId: clientInfo.playerId,
                serverTime: Date.now()
            }
        });

        ws.on('message', (data) => {
            this.handleMessage(ws, data);
        });

        ws.on('close', () => {
            this.handleDisconnection(ws);
        });

        ws.on('pong', () => {
            if (this.clients.has(ws)) {
                this.clients.get(ws).lastPing = Date.now();
            }
        });

        // Start ping interval for this client
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            } else {
                clearInterval(pingInterval);
            }
        }, 30000);
    }

    handleMessage(ws, data) {
        try {
            const message = JSON.parse(data);
            this.stats.messageCount++;
            
            const client = this.clients.get(ws);
            if (!client) return;

            switch (message.type) {
                case 'create_lobby':
                    this.createLobby(ws, message.data);
                    break;
                case 'join_lobby':
                    this.joinLobby(ws, message.data);
                    break;
                case 'leave_lobby':
                    this.leaveLobby(ws);
                    break;
                case 'player_ready':
                    this.setPlayerReady(ws, message.data);
                    break;
                case 'game_action':
                    this.handleGameAction(ws, message.data);
                    break;
                case 'chat_message':
                    this.handleChatMessage(ws, message.data);
                    break;
                case 'ping':
                    this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
                    break;
                default:
                    console.warn(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            this.sendToClient(ws, {
                type: 'error',
                data: { message: 'Invalid message format' }
            });
        }
    }

    createLobby(ws, data) {
        const client = this.clients.get(ws);
        const lobbyId = uuidv4();
        
        const lobby = {
            id: lobbyId,
            name: data.name || `${client.playerId}'s Game`,
            host: client.id,
            players: new Map(),
            maxPlayers: data.maxPlayers || 4,
            gameState: 'waiting', // waiting, countdown, playing, finished
            countdownTimer: null,
            gameData: null,
            createdAt: Date.now()
        };

        this.lobbies.set(lobbyId, lobby);
        this.joinLobby(ws, { lobbyId });

        console.log(`🎮 Lobby created: ${lobby.name} (${lobbyId})`);
    }

    joinLobby(ws, data) {
        const client = this.clients.get(ws);
        const lobby = this.lobbies.get(data.lobbyId);

        if (!lobby) {
            this.sendToClient(ws, {
                type: 'error',
                data: { message: 'Lobby not found' }
            });
            return;
        }

        if (lobby.players.size >= lobby.maxPlayers) {
            this.sendToClient(ws, {
                type: 'error',
                data: { message: 'Lobby is full' }
            });
            return;
        }

        // Leave current lobby if in one
        if (client.lobbyId) {
            this.leaveLobby(ws);
        }

        // Join new lobby
        client.lobbyId = data.lobbyId;
        client.ready = false;
        
        lobby.players.set(client.id, {
            id: client.id,
            playerId: client.playerId,
            ready: false,
            ws: ws
        });

        this.broadcastToLobby(lobby.id, {
            type: 'player_joined',
            data: {
                playerId: client.playerId,
                playerCount: lobby.players.size
            }
        });

        this.sendLobbyUpdate(lobby.id);
        console.log(`👤 ${client.playerId} joined lobby: ${lobby.name}`);
    }

    leaveLobby(ws) {
        const client = this.clients.get(ws);
        if (!client.lobbyId) return;

        const lobby = this.lobbies.get(client.lobbyId);
        if (!lobby) return;

        lobby.players.delete(client.id);

        // Transfer host if necessary
        if (lobby.host === client.id && lobby.players.size > 0) {
            const newHost = lobby.players.values().next().value;
            lobby.host = newHost.id;
            console.log(`👑 Host transferred to: ${newHost.playerId}`);
        }

        this.broadcastToLobby(lobby.id, {
            type: 'player_left',
            data: {
                playerId: client.playerId,
                playerCount: lobby.players.size
            }
        });

        client.lobbyId = null;
        client.ready = false;

        // Delete empty lobby
        if (lobby.players.size === 0) {
            if (lobby.countdownTimer) {
                clearInterval(lobby.countdownTimer);
            }
            this.lobbies.delete(lobby.id);
            console.log(`🗑️ Empty lobby deleted: ${lobby.name}`);
        } else {
            this.sendLobbyUpdate(lobby.id);
        }
    }

    setPlayerReady(ws, data) {
        const client = this.clients.get(ws);
        const lobby = this.lobbies.get(client.lobbyId);
        
        if (!lobby) return;

        const player = lobby.players.get(client.id);
        if (player) {
            player.ready = data.ready;
            client.ready = data.ready;
        }

        this.broadcastToLobby(lobby.id, {
            type: 'player_ready_changed',
            data: {
                playerId: client.playerId,
                ready: data.ready
            }
        });

        this.sendLobbyUpdate(lobby.id);
        this.checkGameStart(lobby);
    }

    checkGameStart(lobby) {
        if (lobby.gameState !== 'waiting') return;
        if (lobby.players.size < 2) return;

        const allReady = Array.from(lobby.players.values()).every(p => p.ready);
        
        if (allReady) {
            this.startGameCountdown(lobby);
        }
    }

    startGameCountdown(lobby) {
        lobby.gameState = 'countdown';
        let countdown = 5;

        const countdownInterval = setInterval(() => {
            this.broadcastToLobby(lobby.id, {
                type: 'game_countdown',
                data: { countdown }
            });

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.startGame(lobby);
            }
            countdown--;
        }, 1000);

        lobby.countdownTimer = countdownInterval;
        console.log(`⏰ Game countdown started for lobby: ${lobby.name}`);
    }

    startGame(lobby) {
        lobby.gameState = 'playing';
        lobby.gameData = {
            startTime: Date.now(),
            duration: 180000, // 3 minutes
            players: Array.from(lobby.players.values()).map((p, index) => ({
                id: p.id,
                playerId: p.playerId,
                position: this.getStartPosition(index),
                lives: 1,
                powerups: { bombs: 1, flame: 1, speed: 1 }
            })),
            bombs: new Map(),
            explosions: new Map()
        };

        this.broadcastToLobby(lobby.id, {
            type: 'game_started',
            data: lobby.gameData
        });

        console.log(`🎮 Game started in lobby: ${lobby.name}`);
    }

    getStartPosition(playerIndex) {
        const positions = [
            { x: 1, y: 1 },   // Top-left
            { x: 13, y: 11 }, // Bottom-right
            { x: 13, y: 1 },  // Top-right
            { x: 1, y: 11 }   // Bottom-left
        ];
        return positions[playerIndex] || { x: 1, y: 1 };
    }

    handleGameAction(ws, data) {
        const client = this.clients.get(ws);
        const lobby = this.lobbies.get(client.lobbyId);
        
        if (!lobby || lobby.gameState !== 'playing') return;

        // Broadcast game action to all players in lobby
        this.broadcastToLobby(lobby.id, {
            type: 'game_action',
            data: {
                playerId: client.playerId,
                action: data.action,
                params: data.params,
                timestamp: Date.now()
            }
        }, ws);
    }

    handleChatMessage(ws, data) {
        const client = this.clients.get(ws);
        const lobby = this.lobbies.get(client.lobbyId);
        
        if (!lobby) return;

        this.broadcastToLobby(lobby.id, {
            type: 'chat_message',
            data: {
                playerId: client.playerId,
                message: data.message,
                timestamp: Date.now()
            }
        });
    }

    sendLobbyUpdate(lobbyId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;

        const lobbyData = {
            id: lobby.id,
            name: lobby.name,
            host: lobby.host,
            gameState: lobby.gameState,
            players: Array.from(lobby.players.values()).map(p => ({
                id: p.id,
                playerId: p.playerId,
                ready: p.ready
            })),
            maxPlayers: lobby.maxPlayers
        };

        this.broadcastToLobby(lobbyId, {
            type: 'lobby_update',
            data: lobbyData
        });
    }

    broadcastToLobby(lobbyId, message, excludeWs = null) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;

        lobby.players.forEach((player) => {
            if (player.ws !== excludeWs && player.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(player.ws, message);
            }
        });
    }

    sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    handleDisconnection(ws) {
        const client = this.clients.get(ws);
        if (!client) return;

        console.log(`❌ Client disconnected: ${client.playerId}`);
        
        this.leaveLobby(ws);
        this.clients.delete(ws);
        this.stats.activeConnections--;
    }

    setupStatsTracking() {
        setInterval(() => {
            this.stats.messagesPerSecond = this.stats.messageCount;
            this.stats.messageCount = 0;
            
            // Log stats every 30 seconds
            if (Date.now() % 30000 < 1000) {
                console.log(`📊 Server Stats:`, {
                    activeConnections: this.stats.activeConnections,
                    activeLobbies: this.lobbies.size,
                    messagesPerSecond: this.stats.messagesPerSecond,
                    uptime: Math.floor((Date.now() - this.stats.startTime) / 1000) + 's'
                });
            }
        }, 1000);
    }

    getStats() {
        return {
            ...this.stats,
            activeLobbies: this.lobbies.size,
            uptime: Date.now() - this.stats.startTime
        };
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new GameServer(process.env.PORT || 8080);
    server.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        if (server.wss) {
            server.wss.close(() => {
                console.log('✅ Server shutdown complete');
                process.exit(0);
            });
        }
    });
}

module.exports = GameServer;
