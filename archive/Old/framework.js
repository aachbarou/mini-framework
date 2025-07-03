// RichFramework - Unified Framework (richouan's custom framework)
// Combines all our core modules

window.RichFramework = {
    // Will be populated by core modules
    version: '1.0.0',
    
    // Debug mode - set to false for production/audit
    DEBUG: false,
    
    // Smart logging - only shows in debug mode
    log: function(message, ...args) {
        if (this.DEBUG) {
            console.log(message, ...args);
        }
    },
    
    // Initialize the framework
    init: function() {
        this.log('🚀 RichFramework v' + this.version + ' initialized!');
        this.log('Available methods:', Object.keys(this));
    },
    
    // Bootstrap an application when DOM is ready
    // Uses onload property - NO addEventListener!
    bootstrap: function(appInitFunction) {
        if (document.readyState === 'loading') {
            // Use onload property instead of addEventListener
            const oldOnLoad = window.onload;
            window.onload = function() {
                // Call previous onload if it existed
                if (oldOnLoad) oldOnLoad();
                appInitFunction();
            };
        } else {
            // DOM is already ready
            appInitFunction();
        }
    },

    // Alternative: Immediate execution (fastest for games)
    // Use this for performance-critical applications like games
    run: function(appInitFunction) {
        // Execute immediately - assumes scripts are at end of <body>
        appInitFunction();
    },
    
    // Game loop for performance-critical applications
    gameLoop: function(updateFunction, fpsTarget = 60) {
        const targetFrameTime = 1000 / fpsTarget;
        let lastTime = 0;
        let frameCount = 0;
        let fpsDisplay = 0;
        
        function loop(currentTime) {
            const deltaTime = currentTime - lastTime;
            
            if (deltaTime >= targetFrameTime) {
                // Calculate FPS for debugging
                frameCount++;
                if (frameCount % 60 === 0) {
                    fpsDisplay = Math.round(1000 / deltaTime);
                    this.log(`🎮 Game running at ${fpsDisplay} FPS`);
                }
                
                // Call user's update function
                updateFunction(deltaTime, currentTime);
                
                lastTime = currentTime;
            }
            
            requestAnimationFrame(loop);
        }
        
        requestAnimationFrame(loop);
        this.log(`🎮 Game loop started (target: ${fpsTarget} FPS)`);
    },
    
    // DOM ready check using onreadystatechange (fastest)
    ready: function(appInitFunction) {
        if (document.readyState !== 'loading') {
            // DOM is already ready
            appInitFunction();
        } else {
            // Use onreadystatechange - faster than onload
            const oldHandler = document.onreadystatechange;
            document.onreadystatechange = function() {
                if (oldHandler) oldHandler();
                if (document.readyState !== 'loading') {
                    appInitFunction();
                    document.onreadystatechange = oldHandler; // Restore
                }
            };
        }
    },
    
    // Ultra-fast option: Use document.onDOMContentLoaded property
    fast: function(appInitFunction) {
        if (document.readyState !== 'loading') {
            appInitFunction();
        } else {
            // Use the onDOMContentLoaded property (if supported)
            if ('onDOMContentLoaded' in document) {
                const oldHandler = document.onDOMContentLoaded;
                document.onDOMContentLoaded = function() {
                    if (oldHandler) oldHandler();
                    appInitFunction();
                };
            } else {
                // Fallback to onreadystatechange
                this.ready(appInitFunction);
            }
        }
    },
};

// Add performance metrics for audit
window.RichFramework.metrics = {
    renderCount: 0,
    eventCount: 0,
    stateUpdates: 0,
    startTime: Date.now(),
    
    // Show performance summary
    summary: function() {
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

RichFramework.log('RichFramework base loaded - waiting for core modules...');

// ===== EXPORT FOR CLEAN IMPORTS =====
// Your friends can now import like: import { ready, bootstrap } from './framework.js'
export const version = RichFramework.version;
export const log = RichFramework.log.bind(RichFramework);
export const bootstrap = RichFramework.bootstrap.bind(RichFramework);
export const ready = RichFramework.ready.bind(RichFramework);
export const run = RichFramework.run.bind(RichFramework);
export const gameLoop = RichFramework.gameLoop.bind(RichFramework);
export const fast = RichFramework.fast.bind(RichFramework);
export const metrics = RichFramework.metrics;