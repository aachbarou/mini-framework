// RichFramework - WebSocket Module for Real-time Multiplayer
// High-performance networking with connection pooling and auto-reconnect

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

class GameWebSocket {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
        this.listeners = new Map();
        
        console.log('🌐 WebSocket client initialized');
    }
    
    // Connect to server with auto-retry
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.serverUrl);
                
                this.socket.onopen = () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    console.log('✅ Connected to game server');
                    
                    // Send queued messages
                    this.flushMessageQueue();
                    
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('❌ Invalid message format:', error);
                    }
                };
                
                this.socket.onclose = () => {
                    this.isConnected = false;
                    console.log('🔌 Disconnected from game server');
                    this.handleReconnect();
                };
                
                this.socket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Auto-reconnect with exponential backoff
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(() => {
                    console.log('❌ Reconnection failed');
                });
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.emit('maxReconnectReached');
        }
    }
    
    // Send message (with queueing if disconnected)
    send(type, data = {}) {
        const message = { type, data, timestamp: Date.now() };
        
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Queue message for when connection is restored
            this.messageQueue.push(message);
            console.log(`📤 Message queued: ${type}`);
        }
    }
    
    // Send queued messages
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.socket.send(JSON.stringify(message));
        }
        console.log('📤 Message queue flushed');
    }
    
    // Handle incoming messages
    handleMessage(data) {
        const { type, data: payload } = data;
        
        // Emit to listeners
        this.emit(type, payload);
        
        // Handle framework-level messages
        switch (type) {
            case 'ping':
                this.send('pong', { timestamp: Date.now() });
                break;
            case 'playerJoined':
                console.log(`👥 Player joined: ${payload.playerName}`);
                break;
            case 'playerLeft':
                console.log(`👋 Player left: ${payload.playerName}`);
                break;
        }
    }
    
    // Event listener system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in ${event} listener:`, error);
                }
            });
        }
    }
    
    // Disconnect
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.isConnected = false;
        console.log('🔌 Manually disconnected');
    }
}

// Game-specific WebSocket helpers
const GameNetwork = {
    // Create game room
    createRoom(roomName, maxPlayers = 4) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('createRoom', { roomName, maxPlayers });
        }
    },
    
    // Join game room
    joinRoom(roomId, playerName) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('joinRoom', { roomId, playerName });
        }
    },
    
    // Send player movement
    sendPlayerMove(playerId, x, y) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('playerMove', { playerId, x, y, timestamp: Date.now() });
        }
    },
    
    // Send bomb placement
    sendBombPlace(playerId, x, y) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('bombPlace', { playerId, x, y, timestamp: Date.now() });
        }
    },
    
    // Send chat message
    sendChat(message, playerId) {
        const ws = window.RichFramework.websocket;
        if (ws) {
            ws.send('chatMessage', { message, playerId, timestamp: Date.now() });
        }
    }
};

// Add to framework
window.RichFramework.GameWebSocket = GameWebSocket;
window.RichFramework.GameNetwork = GameNetwork;

// Simple API for creating connections
window.RichFramework.connectToServer = (serverUrl) => {
    const ws = new GameWebSocket(serverUrl);
    window.RichFramework.websocket = ws;
    return ws.connect().then(() => ws);
};

console.log('✅ WebSocket module loaded with auto-reconnect and message queueing!');
