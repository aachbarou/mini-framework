// Spatial Partitioning System for High-Performance Collision Detection
// Optimized for 60fps real-time gaming with minimal overhead

class SpatialGrid {
    constructor(worldWidth, worldHeight, cellSize = 64) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.cellSize = cellSize;
        
        // Grid dimensions
        this.gridWidth = Math.ceil(worldWidth / cellSize);
        this.gridHeight = Math.ceil(worldHeight / cellSize);
        
        // Grid storage - using Map for better performance with sparse data
        this.grid = new Map();
        
        // Object tracking
        this.objects = new Map(); // objectId -> object data
        this.objectCells = new Map(); // objectId -> Set of cell keys
        
        // Performance metrics
        this.stats = {
            totalObjects: 0,
            activeCells: 0,
            queriesPerFrame: 0,
            collisionChecks: 0,
            avgObjectsPerCell: 0,
            updateTime: 0,
            queryTime: 0
        };
        
        console.log(`🗂️ Spatial Grid initialized: ${this.gridWidth}x${this.gridHeight} cells (${cellSize}px each)`);
    }
    
    // Get grid cell key from world coordinates
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }
    
    // Get cell coordinates from world position
    getCellCoords(x, y) {
        return {
            x: Math.floor(x / this.cellSize),
            y: Math.floor(y / this.cellSize)
        };
    }
    
    // Get all cells that an object occupies
    getObjectCells(x, y, width, height) {
        const cells = new Set();
        
        const startX = Math.floor(x / this.cellSize);
        const endX = Math.floor((x + width - 1) / this.cellSize);
        const startY = Math.floor(y / this.cellSize);
        const endY = Math.floor((y + height - 1) / this.cellSize);
        
        for (let cellX = startX; cellX <= endX; cellX++) {
            for (let cellY = startY; cellY <= endY; cellY++) {
                // Bounds check
                if (cellX >= 0 && cellX < this.gridWidth && 
                    cellY >= 0 && cellY < this.gridHeight) {
                    cells.add(`${cellX},${cellY}`);
                }
            }
        }
        
        return cells;
    }
    
    // Add object to spatial grid
    addObject(objectId, x, y, width, height, type = 'default', data = {}) {
        const startTime = performance.now();
        
        const object = {
            id: objectId,
            x, y, width, height,
            type,
            data,
            lastUpdate: performance.now()
        };
        
        // Store object
        this.objects.set(objectId, object);
        
        // Get cells this object occupies
        const cells = this.getObjectCells(x, y, width, height);
        this.objectCells.set(objectId, cells);
        
        // Add to grid cells
        cells.forEach(cellKey => {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey).add(objectId);
        });
        
        // Update stats
        this.stats.totalObjects = this.objects.size;
        this.stats.activeCells = this.grid.size;
        this.stats.updateTime += performance.now() - startTime;
        
        return object;
    }
    
    // Remove object from spatial grid
    removeObject(objectId) {
        const startTime = performance.now();
        
        const cells = this.objectCells.get(objectId);
        if (!cells) return false;
        
        // Remove from grid cells
        cells.forEach(cellKey => {
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.delete(objectId);
                // Clean up empty cells
                if (cell.size === 0) {
                    this.grid.delete(cellKey);
                }
            }
        });
        
        // Remove from tracking
        this.objects.delete(objectId);
        this.objectCells.delete(objectId);
        
        // Update stats
        this.stats.totalObjects = this.objects.size;
        this.stats.activeCells = this.grid.size;
        this.stats.updateTime += performance.now() - startTime;
        
        return true;
    }
    
    // Update object position
    updateObject(objectId, newX, newY, newWidth = null, newHeight = null) {
        const startTime = performance.now();
        
        const object = this.objects.get(objectId);
        if (!object) return false;
        
        const oldCells = this.objectCells.get(objectId);
        
        // Update object data
        object.x = newX;
        object.y = newY;
        if (newWidth !== null) object.width = newWidth;
        if (newHeight !== null) object.height = newHeight;
        object.lastUpdate = performance.now();
        
        // Get new cells
        const newCells = this.getObjectCells(newX, newY, object.width, object.height);
        
        // Check if cells changed
        if (this.setsEqual(oldCells, newCells)) {
            this.stats.updateTime += performance.now() - startTime;
            return true; // No grid update needed
        }
        
        // Remove from old cells
        oldCells.forEach(cellKey => {
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.delete(objectId);
                if (cell.size === 0) {
                    this.grid.delete(cellKey);
                }
            }
        });
        
        // Add to new cells
        newCells.forEach(cellKey => {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey).add(objectId);
        });
        
        // Update cell tracking
        this.objectCells.set(objectId, newCells);
        
        // Update stats
        this.stats.activeCells = this.grid.size;
        this.stats.updateTime += performance.now() - startTime;
        
        return true;
    }
    
    // Helper function to compare sets
    setsEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (let item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }
    
    // Query objects in a rectangular area
    queryArea(x, y, width, height, typeFilter = null) {
        const startTime = performance.now();
        this.stats.queriesPerFrame++;
        
        const results = new Set();
        const cells = this.getObjectCells(x, y, width, height);
        
        cells.forEach(cellKey => {
            const cell = this.grid.get(cellKey);
            if (!cell) return;
            
            cell.forEach(objectId => {
                const object = this.objects.get(objectId);
                if (!object) return;
                
                // Type filter
                if (typeFilter && object.type !== typeFilter) return;
                
                // Bounds check
                if (this.rectanglesIntersect(
                    x, y, width, height,
                    object.x, object.y, object.width, object.height
                )) {
                    results.add(object);
                }
            });
        });
        
        this.stats.queryTime += performance.now() - startTime;
        return Array.from(results);
    }
    
    // Query objects near a point
    queryPoint(x, y, radius, typeFilter = null) {
        return this.queryArea(x - radius, y - radius, radius * 2, radius * 2, typeFilter)
            .filter(object => {
                const centerX = object.x + object.width / 2;
                const centerY = object.y + object.height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                return distance <= radius;
            });
    }
    
    // Get nearest object to a point
    queryNearest(x, y, maxDistance = Infinity, typeFilter = null) {
        const searchRadius = Math.min(maxDistance, this.cellSize * 2);
        const candidates = this.queryPoint(x, y, searchRadius, typeFilter);
        
        let nearest = null;
        let nearestDistance = maxDistance;
        
        candidates.forEach(object => {
            const centerX = object.x + object.width / 2;
            const centerY = object.y + object.height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = object;
            }
        });
        
        return nearest ? { object: nearest, distance: nearestDistance } : null;
    }
    
    // Rectangle intersection test
    rectanglesIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }
    
    // Get all potential collision pairs
    getBroadPhaseCollisions(typeA = null, typeB = null) {
        const startTime = performance.now();
        const pairs = new Set();
        
        // Iterate through all cells
        this.grid.forEach(cell => {
            const objects = Array.from(cell);
            
            // Check all pairs within this cell
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    const objA = this.objects.get(objects[i]);
                    const objB = this.objects.get(objects[j]);
                    
                    if (!objA || !objB) continue;
                    
                    // Type filtering
                    if (typeA && objA.type !== typeA && objB.type !== typeA) continue;
                    if (typeB && objA.type !== typeB && objB.type !== typeB) continue;
                    if (typeA && typeB && !((objA.type === typeA && objB.type === typeB) || 
                                           (objA.type === typeB && objB.type === typeA))) continue;
                    
                    // Create pair key (always smaller ID first for consistency)
                    const pairKey = objA.id < objB.id ? `${objA.id}-${objB.id}` : `${objB.id}-${objA.id}`;
                    pairs.add(pairKey);
                }
            }
        });
        
        this.stats.collisionChecks += pairs.size;
        this.stats.queryTime += performance.now() - startTime;
        
        return Array.from(pairs).map(pairKey => {
            const [idA, idB] = pairKey.split('-');
            return {
                objectA: this.objects.get(idA),
                objectB: this.objects.get(idB)
            };
        });
    }
    
    // Optimized collision detection for specific types
    getCollisions(objectId, typeFilter = null) {
        const object = this.objects.get(objectId);
        if (!object) return [];
        
        const candidates = this.queryArea(
            object.x, object.y, 
            object.width, object.height, 
            typeFilter
        );
        
        return candidates.filter(candidate => 
            candidate.id !== objectId && 
            this.rectanglesIntersect(
                object.x, object.y, object.width, object.height,
                candidate.x, candidate.y, candidate.width, candidate.height
            )
        );
    }
    
    // Ray casting for line-of-sight checks
    raycast(startX, startY, endX, endY, typeFilter = null) {
        const hits = [];
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return hits;
        
        const stepX = dx / distance;
        const stepY = dy / distance;
        const steps = Math.ceil(distance);
        
        const checkedCells = new Set();
        
        for (let i = 0; i <= steps; i++) {
            const x = startX + stepX * i;
            const y = startY + stepY * i;
            const cellKey = this.getCellKey(x, y);
            
            if (checkedCells.has(cellKey)) continue;
            checkedCells.add(cellKey);
            
            const cell = this.grid.get(cellKey);
            if (!cell) continue;
            
            cell.forEach(objectId => {
                const object = this.objects.get(objectId);
                if (!object) return;
                if (typeFilter && object.type !== typeFilter) return;
                
                // Check if ray intersects object
                if (this.lineIntersectsRect(startX, startY, endX, endY, object)) {
                    hits.push({
                        object,
                        distance: Math.sqrt((x - startX) ** 2 + (y - startY) ** 2)
                    });
                }
            });
        }
        
        // Sort by distance
        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    }
    
    // Line-rectangle intersection
    lineIntersectsRect(x1, y1, x2, y2, rect) {
        const left = rect.x;
        const right = rect.x + rect.width;
        const top = rect.y;
        const bottom = rect.y + rect.height;
        
        // Check if line endpoints are inside rectangle
        if ((x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) ||
            (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom)) {
            return true;
        }
        
        // Check line-edge intersections
        return this.lineSegmentsIntersect(x1, y1, x2, y2, left, top, right, top) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, right, top, right, bottom) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, right, bottom, left, bottom) ||
               this.lineSegmentsIntersect(x1, y1, x2, y2, left, bottom, left, top);
    }
    
    // Line segment intersection
    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    
    // Clear all objects
    clear() {
        this.grid.clear();
        this.objects.clear();
        this.objectCells.clear();
        this.stats.totalObjects = 0;
        this.stats.activeCells = 0;
    }
    
    // Get performance statistics
    getStats() {
        this.stats.avgObjectsPerCell = this.stats.activeCells > 0 ? 
            this.stats.totalObjects / this.stats.activeCells : 0;
        
        return { ...this.stats };
    }
    
    // Reset performance counters
    resetStats() {
        this.stats.queriesPerFrame = 0;
        this.stats.collisionChecks = 0;
        this.stats.updateTime = 0;
        this.stats.queryTime = 0;
    }
    
    // Debug visualization
    debugDraw(canvas, context) {
        context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        context.lineWidth = 1;
        
        // Draw grid
        for (let x = 0; x <= this.gridWidth; x++) {
            context.beginPath();
            context.moveTo(x * this.cellSize, 0);
            context.lineTo(x * this.cellSize, this.worldHeight);
            context.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            context.beginPath();
            context.moveTo(0, y * this.cellSize);
            context.lineTo(this.worldWidth, y * this.cellSize);
            context.stroke();
        }
        
        // Draw active cells
        context.fillStyle = 'rgba(255, 255, 0, 0.1)';
        this.grid.forEach((cell, cellKey) => {
            const [cellX, cellY] = cellKey.split(',').map(Number);
            context.fillRect(
                cellX * this.cellSize, 
                cellY * this.cellSize,
                this.cellSize, 
                this.cellSize
            );
        });
        
        // Draw objects
        context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.objects.forEach(object => {
            context.strokeRect(object.x, object.y, object.width, object.height);
        });
    }
    
    // Get detailed grid information
    getGridInfo() {
        const cellInfo = new Map();
        
        this.grid.forEach((cell, cellKey) => {
            const [cellX, cellY] = cellKey.split(',').map(Number);
            const objects = Array.from(cell).map(id => this.objects.get(id));
            
            cellInfo.set(cellKey, {
                x: cellX,
                y: cellY,
                objectCount: cell.size,
                objects: objects
            });
        });
        
        return {
            dimensions: {
                width: this.gridWidth,
                height: this.gridHeight,
                cellSize: this.cellSize
            },
            stats: this.getStats(),
            cells: cellInfo
        };
    }
}

// Advanced collision manager using spatial grid
class CollisionManager {
    constructor(worldWidth, worldHeight, cellSize = 64) {
        this.spatialGrid = new SpatialGrid(worldWidth, worldHeight, cellSize);
        this.collisionCallbacks = new Map();
        this.collisionHistory = new Map();
        this.frameCollisions = [];
        
        console.log('💥 Advanced Collision Manager initialized');
    }
    
    // Register collision callback
    onCollision(typeA, typeB, callback) {
        const key = `${typeA}-${typeB}`;
        const reverseKey = `${typeB}-${typeA}`;
        
        this.collisionCallbacks.set(key, callback);
        this.collisionCallbacks.set(reverseKey, callback);
    }
    
    // Add object to collision system
    addObject(id, x, y, width, height, type, data = {}) {
        return this.spatialGrid.addObject(id, x, y, width, height, type, data);
    }
    
    // Remove object from collision system
    removeObject(id) {
        return this.spatialGrid.removeObject(id);
    }
    
    // Update object position
    updateObject(id, x, y, width = null, height = null) {
        return this.spatialGrid.updateObject(id, x, y, width, height);
    }
    
    // Process all collisions for current frame
    processCollisions() {
        const startTime = performance.now();
        this.frameCollisions = [];
        
        // Get all potential collision pairs
        const pairs = this.spatialGrid.getBroadPhaseCollisions();
        
        pairs.forEach(({ objectA, objectB }) => {
            if (!objectA || !objectB) return;
            
            // Check if collision already processed this frame
            const pairKey = objectA.id < objectB.id ? 
                `${objectA.id}-${objectB.id}` : `${objectB.id}-${objectA.id}`;
            
            if (this.frameCollisions.includes(pairKey)) return;
            
            // Precise collision detection
            if (this.spatialGrid.rectanglesIntersect(
                objectA.x, objectA.y, objectA.width, objectA.height,
                objectB.x, objectB.y, objectB.width, objectB.height
            )) {
                this.frameCollisions.push(pairKey);
                this.handleCollision(objectA, objectB);
            }
        });
        
        const processingTime = performance.now() - startTime;
        return {
            collisionCount: this.frameCollisions.length,
            processingTime,
            pairsChecked: pairs.length
        };
    }
    
    // Handle individual collision
    handleCollision(objectA, objectB) {
        const typeA = objectA.type;
        const typeB = objectB.type;
        
        // Check for registered callbacks
        const callbackKey = `${typeA}-${typeB}`;
        const callback = this.collisionCallbacks.get(callbackKey);
        
        if (callback) {
            callback(objectA, objectB);
        }
        
        // Store collision history
        const historyKey = `${objectA.id}-${objectB.id}`;
        this.collisionHistory.set(historyKey, {
            timestamp: performance.now(),
            objectA: objectA.id,
            objectB: objectB.id,
            typeA,
            typeB
        });
    }
    
    // Query system
    queryArea(x, y, width, height, typeFilter = null) {
        return this.spatialGrid.queryArea(x, y, width, height, typeFilter);
    }
    
    queryPoint(x, y, radius, typeFilter = null) {
        return this.spatialGrid.queryPoint(x, y, radius, typeFilter);
    }
    
    queryNearest(x, y, maxDistance = Infinity, typeFilter = null) {
        return this.spatialGrid.queryNearest(x, y, maxDistance, typeFilter);
    }
    
    raycast(startX, startY, endX, endY, typeFilter = null) {
        return this.spatialGrid.raycast(startX, startY, endX, endY, typeFilter);
    }
    
    // Get statistics
    getStats() {
        return {
            spatial: this.spatialGrid.getStats(),
            collisions: {
                thisFrame: this.frameCollisions.length,
                historySize: this.collisionHistory.size,
                callbacksRegistered: this.collisionCallbacks.size
            }
        };
    }
    
    // Clean up old collision history
    cleanupHistory(maxAge = 5000) {
        const now = performance.now();
        const toDelete = [];
        
        this.collisionHistory.forEach((collision, key) => {
            if (now - collision.timestamp > maxAge) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(key => this.collisionHistory.delete(key));
    }
    
    // Reset system
    reset() {
        this.spatialGrid.clear();
        this.collisionHistory.clear();
        this.frameCollisions = [];
    }
    
    // Debug visualization
    debugDraw(canvas, context) {
        this.spatialGrid.debugDraw(canvas, context);
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.SpatialGrid = SpatialGrid;
    window.CollisionManager = CollisionManager;
} else if (typeof module !== 'undefined') {
    module.exports = { SpatialGrid, CollisionManager };
}

console.log('🗂️ Spatial Partitioning System loaded');
