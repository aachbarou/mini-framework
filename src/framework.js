// RichFramework - Unified Framework (richouan's custom framework)
// Combines all our core modules

window.RichFramework = {
    // Will be populated by core modules
    version: '1.0.0',
    
    // Initialize the framework
    init: function() {
        console.log('🚀 RichFramework v' + this.version + ' initialized!');
        console.log('Available methods:', Object.keys(this));
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
                    console.log(`🎮 Game running at ${fpsDisplay} FPS`);
                }
                
                // Call user's update function
                updateFunction(deltaTime, currentTime);
                
                lastTime = currentTime;
            }
            
            requestAnimationFrame(loop);
        }
        
        requestAnimationFrame(loop);
        console.log(`🎮 Game loop started (target: ${fpsTarget} FPS)`);
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

console.log('RichFramework base loaded - waiting for core modules...');