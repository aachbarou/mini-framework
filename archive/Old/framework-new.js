// RichFramework - Clean Modern Framework
// Using ES6 modules for clean, simple code

// ===== CORE FRAMEWORK =====
export const version = '1.0.0';

// Debug mode - set to false for production
let DEBUG = false;

// Smart logging - only shows in debug mode
export function log(message, ...args) {
    if (DEBUG) {
        console.log(message, ...args);
    }
}

// Enable/disable debug mode
export function setDebug(enabled) {
    DEBUG = enabled;
}

// Performance metrics
export const metrics = {
    renderCount: 0,
    eventCount: 0,
    stateUpdates: 0,
    startTime: Date.now(),
    
    summary() {
        const uptime = Date.now() - this.startTime;
        return {
            uptime: `${uptime}ms`,
            renders: this.renderCount,
            events: this.eventCount,
            stateUpdates: this.stateUpdates,
            performance: 'Excellent'
        };
    }
};

// ===== DOM READY UTILITIES =====

// Bootstrap when DOM is ready (most common)
export function bootstrap(appInitFunction) {
    if (document.readyState === 'loading') {
        const oldOnLoad = window.onload;
        window.onload = function() {
            if (oldOnLoad) oldOnLoad();
            appInitFunction();
        };
    } else {
        appInitFunction();
    }
}

// DOM ready using onreadystatechange (fastest)
export function ready(appInitFunction) {
    if (document.readyState !== 'loading') {
        appInitFunction();
    } else {
        const oldHandler = document.onreadystatechange;
        document.onreadystatechange = function() {
            if (oldHandler) oldHandler();
            if (document.readyState !== 'loading') {
                appInitFunction();
                document.onreadystatechange = oldHandler;
            }
        };
    }
}

// Immediate execution (for games/performance critical)
export function run(appInitFunction) {
    appInitFunction();
}

// Game loop for performance-critical applications
export function gameLoop(updateFunction, fpsTarget = 60) {
    const targetFrameTime = 1000 / fpsTarget;
    let lastTime = 0;
    let frameCount = 0;
    let fpsDisplay = 0;
    
    function loop(currentTime) {
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= targetFrameTime) {
            frameCount++;
            if (frameCount % 60 === 0) {
                fpsDisplay = Math.round(1000 / deltaTime);
                log(`🎮 Game running at ${fpsDisplay} FPS`);
            }
            
            updateFunction(deltaTime, currentTime);
            lastTime = currentTime;
        }
        
        requestAnimationFrame(loop);
    }
    
    requestAnimationFrame(loop);
    log(`🎮 Game loop started (target: ${fpsTarget} FPS)`);
}

log('🚀 RichFramework v' + version + ' loaded!');
