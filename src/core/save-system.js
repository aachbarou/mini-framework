// Game Save/Load System for High-Performance Gaming Framework
// Supports compression, validation, versioning, and cloud sync

class GameSaveSystem {
    constructor(gameId = 'RichFramework', version = '1.0.0') {
        this.gameId = gameId;
        this.version = version;
        this.storageKey = `${gameId}_save`;
        this.maxSaves = 10;
        this.compressionEnabled = true;
        
        // Save validation schema
        this.schema = {
            version: 'string',
            timestamp: 'number',
            gameState: 'object',
            metadata: 'object'
        };
        
        // Cloud sync configuration
        this.cloudSync = {
            enabled: false,
            endpoint: null,
            apiKey: null,
            autoSync: true,
            syncInterval: 30000 // 30 seconds
        };
        
        console.log(`💾 Game Save System initialized for ${gameId}`);
        this.initializeStorage();
    }
    
    initializeStorage() {
        // Check storage availability
        this.storageAvailable = this.checkStorageSupport();
        
        // Initialize IndexedDB for large saves
        this.initIndexedDB();
        
        // Setup auto-save if configured
        this.setupAutoSave();
    }
    
    checkStorageSupport() {
        try {
            const test = 'storage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ Local storage not available');
            return false;
        }
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB not available');
                resolve(false);
                return;
            }
            
            const request = indexedDB.open(`${this.gameId}_saves`, 1);
            
            request.onerror = () => {
                console.warn('⚠️ IndexedDB initialization failed');
                resolve(false);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB initialized');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store for saves
                if (!db.objectStoreNames.contains('saves')) {
                    const saveStore = db.createObjectStore('saves', { keyPath: 'id' });
                    saveStore.createIndex('timestamp', 'timestamp', { unique: false });
                    saveStore.createIndex('name', 'name', { unique: false });
                }
                
                // Create object store for settings
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
    
    setupAutoSave() {
        this.autoSaveInterval = null;
        this.autoSaveEnabled = false;
    }
    
    // Save game state
    async saveGame(gameState, metadata = {}, name = null) {
        const startTime = performance.now();
        
        try {
            const saveData = this.createSaveData(gameState, metadata, name);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Save data validation failed');
            }
            
            // Compress if enabled
            let processedData = saveData;
            if (this.compressionEnabled) {
                processedData = await this.compressData(saveData);
            }
            
            // Choose storage method based on size
            const dataSize = this.getDataSize(processedData);
            let saveResult;
            
            if (dataSize > 5 * 1024 * 1024) { // > 5MB, use IndexedDB
                saveResult = await this.saveToIndexedDB(processedData);
            } else {
                saveResult = await this.saveToLocalStorage(processedData);
            }
            
            // Cloud sync if enabled
            if (this.cloudSync.enabled) {
                await this.syncToCloud(saveData);
            }
            
            const saveTime = performance.now() - startTime;
            console.log(`💾 Game saved successfully in ${saveTime.toFixed(2)}ms (${this.formatBytes(dataSize)})`);
            
            return {
                success: true,
                saveId: saveData.id,
                size: dataSize,
                saveTime,
                compressed: this.compressionEnabled
            };
            
        } catch (error) {
            console.error('❌ Save failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    createSaveData(gameState, metadata, name) {
        const timestamp = Date.now();
        const saveId = `save_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            id: saveId,
            version: this.version,
            timestamp,
            name: name || `Save ${new Date(timestamp).toLocaleString()}`,
            gameState: this.serializeGameState(gameState),
            metadata: {
                ...metadata,
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                gameVersion: this.version,
                frameCount: window.performance ? performance.now() : 0
            },
            checksum: null // Will be calculated after serialization
        };
    }
    
    serializeGameState(gameState) {
        // Handle RichFramework signals
        if (gameState && typeof gameState === 'object') {
            const serialized = {};
            
            for (const [key, value] of Object.entries(gameState)) {
                if (value && typeof value === 'object' && value.value !== undefined) {
                    // This is likely a signal
                    serialized[key] = {
                        __type: 'signal',
                        value: this.serializeValue(value.value)
                    };
                } else if (value instanceof Map) {
                    serialized[key] = {
                        __type: 'map',
                        entries: Array.from(value.entries()).map(([k, v]) => [k, this.serializeValue(v)])
                    };
                } else if (value instanceof Set) {
                    serialized[key] = {
                        __type: 'set',
                        values: Array.from(value).map(v => this.serializeValue(v))
                    };
                } else {
                    serialized[key] = this.serializeValue(value);
                }
            }
            
            return serialized;
        }
        
        return this.serializeValue(gameState);
    }
    
    serializeValue(value) {
        if (value === null || value === undefined) {
            return value;
        }
        
        if (typeof value === 'function') {
            return { __type: 'function', name: value.name || 'anonymous' };
        }
        
        if (value instanceof Date) {
            return { __type: 'date', value: value.toISOString() };
        }
        
        if (value instanceof RegExp) {
            return { __type: 'regexp', source: value.source, flags: value.flags };
        }
        
        if (Array.isArray(value)) {
            return value.map(v => this.serializeValue(v));
        }
        
        if (typeof value === 'object') {
            const serialized = {};
            for (const [k, v] of Object.entries(value)) {
                serialized[k] = this.serializeValue(v);
            }
            return serialized;
        }
        
        return value;
    }
    
    validateSaveData(saveData) {
        // Check required fields
        const requiredFields = ['id', 'version', 'timestamp', 'gameState'];
        for (const field of requiredFields) {
            if (!(field in saveData)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Check data types
        if (typeof saveData.version !== 'string') return false;
        if (typeof saveData.timestamp !== 'number') return false;
        if (typeof saveData.gameState !== 'object') return false;
        
        // Check timestamp validity
        const now = Date.now();
        if (saveData.timestamp > now || saveData.timestamp < now - (365 * 24 * 60 * 60 * 1000)) {
            console.error('Invalid timestamp');
            return false;
        }
        
        return true;
    }
    
    async compressData(data) {
        if (!window.CompressionStream) {
            // Fallback to JSON string compression
            const jsonString = JSON.stringify(data);
            return {
                __compressed: true,
                __method: 'json',
                data: jsonString,
                originalSize: jsonString.length
            };
        }
        
        try {
            const jsonString = JSON.stringify(data);
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new TextEncoder().encode(jsonString));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return {
                __compressed: true,
                __method: 'gzip',
                data: Array.from(compressed),
                originalSize: jsonString.length,
                compressedSize: compressed.length
            };
            
        } catch (error) {
            console.warn('Compression failed, using uncompressed data:', error);
            return data;
        }
    }
    
    async decompressData(compressedData) {
        if (!compressedData.__compressed) {
            return compressedData;
        }
        
        if (compressedData.__method === 'json') {
            return JSON.parse(compressedData.data);
        }
        
        if (compressedData.__method === 'gzip' && window.DecompressionStream) {
            try {
                const compressed = new Uint8Array(compressedData.data);
                const stream = new DecompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                
                writer.write(compressed);
                writer.close();
                
                const chunks = [];
                let done = false;
                
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) chunks.push(value);
                }
                
                const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    decompressed.set(chunk, offset);
                    offset += chunk.length;
                }
                
                const jsonString = new TextDecoder().decode(decompressed);
                return JSON.parse(jsonString);
                
            } catch (error) {
                console.error('Decompression failed:', error);
                throw new Error('Failed to decompress save data');
            }
        }
        
        throw new Error('Unsupported compression method');
    }
    
    async saveToLocalStorage(saveData) {
        if (!this.storageAvailable) {
            throw new Error('Local storage not available');
        }
        
        try {
            const saves = this.getSaveList();
            saves[saveData.id] = saveData;
            
            // Limit number of saves
            const saveIds = Object.keys(saves).sort((a, b) => saves[b].timestamp - saves[a].timestamp);
            if (saveIds.length > this.maxSaves) {
                const toDelete = saveIds.slice(this.maxSaves);
                toDelete.forEach(id => delete saves[id]);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                // Try to free up space
                await this.cleanupOldSaves();
                localStorage.setItem(this.storageKey, JSON.stringify({ [saveData.id]: saveData }));
                return true;
            }
            throw error;
        }
    }
    
    async saveToIndexedDB(saveData) {
        if (!this.db) {
            throw new Error('IndexedDB not available');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');
            
            const request = store.put(saveData);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
            
            transaction.oncomplete = () => {
                // Cleanup old saves
                this.cleanupIndexedDBSaves();
            };
        });
    }
    
    // Load game state
    async loadGame(saveId = null) {
        const startTime = performance.now();
        
        try {
            let saveData;
            
            // If no saveId provided, load the most recent save
            if (!saveId) {
                const saves = await this.getAllSaves();
                if (saves.length === 0) {
                    throw new Error('No saves found');
                }
                saveData = saves[0]; // Most recent
            } else {
                saveData = await this.getSaveById(saveId);
            }
            
            if (!saveData) {
                throw new Error('Save not found');
            }
            
            // Decompress if needed
            const decompressedData = await this.decompressData(saveData);
            
            // Validate loaded data
            if (!this.validateSaveData(decompressedData)) {
                throw new Error('Loaded save data is invalid');
            }
            
            // Deserialize game state
            const gameState = this.deserializeGameState(decompressedData.gameState);
            
            const loadTime = performance.now() - startTime;
            console.log(`📂 Game loaded successfully in ${loadTime.toFixed(2)}ms`);
            
            return {
                success: true,
                gameState,
                metadata: decompressedData.metadata,
                saveInfo: {
                    id: decompressedData.id,
                    name: decompressedData.name,
                    timestamp: decompressedData.timestamp,
                    version: decompressedData.version
                },
                loadTime
            };
            
        } catch (error) {
            console.error('❌ Load failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    deserializeGameState(serializedState) {
        if (!serializedState || typeof serializedState !== 'object') {
            return serializedState;
        }
        
        const gameState = {};
        
        for (const [key, value] of Object.entries(serializedState)) {
            if (value && typeof value === 'object' && value.__type) {
                switch (value.__type) {
                    case 'signal':
                        // Recreate signal with RichFramework
                        if (window.RichFramework && window.RichFramework.signals) {
                            gameState[key] = window.RichFramework.signals.signal(this.deserializeValue(value.value));
                        } else {
                            gameState[key] = { value: this.deserializeValue(value.value) };
                        }
                        break;
                    case 'map':
                        gameState[key] = new Map(value.entries.map(([k, v]) => [k, this.deserializeValue(v)]));
                        break;
                    case 'set':
                        gameState[key] = new Set(value.values.map(v => this.deserializeValue(v)));
                        break;
                    default:
                        gameState[key] = this.deserializeValue(value);
                }
            } else {
                gameState[key] = this.deserializeValue(value);
            }
        }
        
        return gameState;
    }
    
    deserializeValue(value) {
        if (value === null || value === undefined) {
            return value;
        }
        
        if (typeof value === 'object' && value.__type) {
            switch (value.__type) {
                case 'date':
                    return new Date(value.value);
                case 'regexp':
                    return new RegExp(value.source, value.flags);
                case 'function':
                    console.warn(`Cannot deserialize function: ${value.name}`);
                    return null;
                default:
                    return value;
            }
        }
        
        if (Array.isArray(value)) {
            return value.map(v => this.deserializeValue(v));
        }
        
        if (typeof value === 'object') {
            const deserialized = {};
            for (const [k, v] of Object.entries(value)) {
                deserialized[k] = this.deserializeValue(v);
            }
            return deserialized;
        }
        
        return value;
    }
    
    // Get all saves
    async getAllSaves() {
        const saves = [];
        
        // Get from localStorage
        if (this.storageAvailable) {
            const localSaves = this.getSaveList();
            saves.push(...Object.values(localSaves));
        }
        
        // Get from IndexedDB
        if (this.db) {
            const indexedSaves = await this.getIndexedDBSaves();
            saves.push(...indexedSaves);
        }
        
        // Remove duplicates and sort by timestamp
        const uniqueSaves = saves.reduce((acc, save) => {
            acc[save.id] = save;
            return acc;
        }, {});
        
        return Object.values(uniqueSaves).sort((a, b) => b.timestamp - a.timestamp);
    }
    
    async getSaveById(saveId) {
        // Try localStorage first
        if (this.storageAvailable) {
            const saves = this.getSaveList();
            if (saves[saveId]) {
                return saves[saveId];
            }
        }
        
        // Try IndexedDB
        if (this.db) {
            return await this.getIndexedDBSave(saveId);
        }
        
        return null;
    }
    
    getSaveList() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to parse save data:', error);
            return {};
        }
    }
    
    async getIndexedDBSaves() {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    async getIndexedDBSave(saveId) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');
            const request = store.get(saveId);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    // Delete save
    async deleteSave(saveId) {
        let deleted = false;
        
        // Delete from localStorage
        if (this.storageAvailable) {
            const saves = this.getSaveList();
            if (saves[saveId]) {
                delete saves[saveId];
                localStorage.setItem(this.storageKey, JSON.stringify(saves));
                deleted = true;
            }
        }
        
        // Delete from IndexedDB
        if (this.db) {
            const result = await this.deleteIndexedDBSave(saveId);
            deleted = deleted || result;
        }
        
        return deleted;
    }
    
    async deleteIndexedDBSave(saveId) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');
            const request = store.delete(saveId);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }
    
    // Auto-save functionality
    enableAutoSave(interval = 60000, gameStateProvider) { // Default 1 minute
        this.disableAutoSave();
        
        this.autoSaveEnabled = true;
        this.gameStateProvider = gameStateProvider;
        
        this.autoSaveInterval = setInterval(async () => {
            if (this.gameStateProvider) {
                const gameState = this.gameStateProvider();
                await this.saveGame(gameState, { autoSave: true }, 'Auto Save');
            }
        }, interval);
        
        console.log(`🔄 Auto-save enabled (${interval / 1000}s interval)`);
    }
    
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        this.autoSaveEnabled = false;
        console.log('⏹️ Auto-save disabled');
    }
    
    // Cloud sync functionality
    enableCloudSync(endpoint, apiKey) {
        this.cloudSync.enabled = true;
        this.cloudSync.endpoint = endpoint;
        this.cloudSync.apiKey = apiKey;
        
        if (this.cloudSync.autoSync) {
            this.startCloudSyncInterval();
        }
        
        console.log('☁️ Cloud sync enabled');
    }
    
    disableCloudSync() {
        this.cloudSync.enabled = false;
        if (this.cloudSyncInterval) {
            clearInterval(this.cloudSyncInterval);
            this.cloudSyncInterval = null;
        }
        console.log('☁️ Cloud sync disabled');
    }
    
    async syncToCloud(saveData) {
        if (!this.cloudSync.enabled) return false;
        
        try {
            const response = await fetch(this.cloudSync.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.cloudSync.apiKey}`
                },
                body: JSON.stringify(saveData)
            });
            
            if (response.ok) {
                console.log('☁️ Save synced to cloud');
                return true;
            } else {
                console.warn('☁️ Cloud sync failed:', response.statusText);
                return false;
            }
        } catch (error) {
            console.warn('☁️ Cloud sync error:', error);
            return false;
        }
    }
    
    // Utility functions
    getDataSize(data) {
        return new Blob([JSON.stringify(data)]).size;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async cleanupOldSaves() {
        const saves = await this.getAllSaves();
        const toDelete = saves.slice(this.maxSaves);
        
        for (const save of toDelete) {
            await this.deleteSave(save.id);
        }
        
        console.log(`🧹 Cleaned up ${toDelete.length} old saves`);
    }
    
    async cleanupIndexedDBSaves() {
        if (!this.db) return;
        
        const saves = await this.getIndexedDBSaves();
        if (saves.length <= this.maxSaves) return;
        
        // Sort by timestamp and delete oldest
        saves.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = saves.slice(0, saves.length - this.maxSaves);
        
        for (const save of toDelete) {
            await this.deleteIndexedDBSave(save.id);
        }
    }
    
    // Export/Import saves
    async exportSave(saveId) {
        const saveData = await this.getSaveById(saveId);
        if (!saveData) {
            throw new Error('Save not found');
        }
        
        const exportData = {
            ...saveData,
            exportedAt: Date.now(),
            exportedFrom: this.gameId
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    async importSave(exportedData) {
        try {
            const saveData = JSON.parse(exportedData);
            
            // Validate imported data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data');
            }
            
            // Generate new ID to avoid conflicts
            const originalId = saveData.id;
            saveData.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            saveData.metadata.imported = true;
            saveData.metadata.originalId = originalId;
            
            return await this.saveGame(saveData.gameState, saveData.metadata, `${saveData.name} (Imported)`);
            
        } catch (error) {
            console.error('Import failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Get storage information
    getStorageInfo() {
        const info = {
            localStorage: {
                available: this.storageAvailable,
                quota: null,
                usage: null
            },
            indexedDB: {
                available: !!this.db,
                quota: null,
                usage: null
            },
            compression: {
                enabled: this.compressionEnabled,
                method: window.CompressionStream ? 'gzip' : 'json'
            }
        };
        
        // Get storage quota if available
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                info.localStorage.quota = estimate.quota;
                info.localStorage.usage = estimate.usage;
                info.indexedDB.quota = estimate.quota;
                info.indexedDB.usage = estimate.usage;
            });
        }
        
        return info;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.GameSaveSystem = GameSaveSystem;
} else if (typeof module !== 'undefined') {
    module.exports = GameSaveSystem;
}

console.log('💾 Game Save System loaded');
