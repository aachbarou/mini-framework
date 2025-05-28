// RichFramework Performance Monitoring System
// For 60fps gaming applications like Bomberman

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// 🎯 Performance Monitor Class - Track 60fps requirement
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.renderTimes = [];
        this.maxRenderTimes = 100; // Keep last 100 render times
        this.targetFPS = 60;
        this.isMonitoring = false;
        
        // Performance warnings
        this.warningThreshold = 16.67; // 60fps = 16.67ms per frame
        this.criticalThreshold = 33.33; // 30fps = 33.33ms per frame
    }
    
    startMonitoring() {
        this.isMonitoring = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        console.log('🎮 Performance monitoring started - Target: 60fps');
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('⏹️ Performance monitoring stopped');
    }
    
    // Call this at the start of each render
    startRender() {
        if (!this.isMonitoring) return;
        this.renderStartTime = performance.now();
    }
    
    // Call this at the end of each render
    endRender() {
        if (!this.isMonitoring || !this.renderStartTime) return;
        
        const renderTime = performance.now() - this.renderStartTime;
        this.renderTimes.push(renderTime);
        
        // Keep only last N render times
        if (this.renderTimes.length > this.maxRenderTimes) {
            this.renderTimes.shift();
        }
        
        // Update FPS
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= 1000) { // Update FPS every second
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Check performance warnings
            this.checkPerformance(renderTime);
        }
    }
    
    checkPerformance(renderTime) {
        if (renderTime > this.criticalThreshold) {
            console.warn(`🔥 CRITICAL: Render took ${renderTime.toFixed(2)}ms (>33ms = <30fps)`);
        } else if (renderTime > this.warningThreshold) {
            console.warn(`⚠️ WARNING: Render took ${renderTime.toFixed(2)}ms (>16.67ms = <60fps)`);
        }
        
        if (this.fps < 50) {
            console.warn(`🐌 LOW FPS: ${this.fps}fps (Target: 60fps)`);
        }
    }
    
    getStats() {
        const avgRenderTime = this.renderTimes.length > 0 
            ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length 
            : 0;
            
        const maxRenderTime = this.renderTimes.length > 0 
            ? Math.max(...this.renderTimes) 
            : 0;
            
        return {
            fps: this.fps,
            avgRenderTime: avgRenderTime.toFixed(2),
            maxRenderTime: maxRenderTime.toFixed(2),
            totalFrames: this.frameCount,
            isOptimal: this.fps >= 55 && avgRenderTime <= this.warningThreshold
        };
    }
    
    // Game loop optimized for 60fps
    createGameLoop(updateCallback, renderCallback) {
        let lastFrameTime = 0;
        const targetFrameTime = 1000 / 60; // 16.67ms for 60fps
        
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - lastFrameTime;
            
            if (deltaTime >= targetFrameTime) {
                this.startRender();
                
                // Update game state
                if (updateCallback) {
                    updateCallback(deltaTime);
                }
                
                // Render frame
                if (renderCallback) {
                    renderCallback();
                }
                
                this.endRender();
                lastFrameTime = currentTime;
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        return gameLoop;
    }
}

// 🎮 Game Loop Class - For Bomberman and other games
class GameLoop {
    constructor(updateFunction, renderFunction) {
        this.update = updateFunction;
        this.render = renderFunction;
        this.isRunning = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.accumulator = 0;
        this.performanceMonitor = new PerformanceMonitor();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.performanceMonitor.startMonitoring();
        this.lastTime = performance.now();
        this.loop();
        console.log('🎮 Game loop started at 60fps');
    }
    
    stop() {
        this.isRunning = false;
        this.performanceMonitor.stopMonitoring();
        console.log('⏹️ Game loop stopped');
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        // Fixed timestep updates
        while (this.accumulator >= this.frameTime) {
            if (this.update) {
                this.update(this.frameTime);
            }
            this.accumulator -= this.frameTime;
        }
        
        // Render with interpolation
        this.performanceMonitor.startRender();
        if (this.render) {
            const alpha = this.accumulator / this.frameTime;
            this.render(alpha);
        }
        this.performanceMonitor.endRender();
        
        requestAnimationFrame(() => this.loop());
    }
    
    getPerformanceStats() {
        return this.performanceMonitor.getStats();
    }
}

// 📊 Benchmark Suite - Test framework performance
class BenchmarkSuite {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runBenchmarks() {
        console.log('🏁 Starting benchmark suite...');
        this.results = [];
        
        for (const test of this.tests) {
            console.log(`⏱️ Running: ${test.name}`);
            
            const startTime = performance.now();
            
            // Run test multiple times for accuracy
            const iterations = 1000;
            for (let i = 0; i < iterations; i++) {
                await test.testFunction();
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / iterations;
            
            const result = {
                name: test.name,
                totalTime: totalTime.toFixed(2),
                avgTime: avgTime.toFixed(4),
                opsPerSecond: Math.round(1000 / avgTime)
            };
            
            this.results.push(result);
            console.log(`✅ ${test.name}: ${avgTime.toFixed(4)}ms avg (${result.opsPerSecond} ops/sec)`);
        }
        
        this.printResults();
        return this.results;
    }
    
    printResults() {
        console.log('\n📊 BENCHMARK RESULTS:');
        console.table(this.results);
        
        // Check if framework meets 60fps requirement
        const criticalTests = this.results.filter(r => r.name.includes('render') || r.name.includes('diff'));
        const meetsRequirement = criticalTests.every(test => parseFloat(test.avgTime) < 16.67);
        
        if (meetsRequirement) {
            console.log('✅ Framework meets 60fps requirement for gaming!');
        } else {
            console.warn('⚠️ Framework may not maintain 60fps under load');
        }
    }
}

// Global performance monitor instance
const globalPerformanceMonitor = new PerformanceMonitor();

// Add to RichFramework namespace
Object.assign(window.RichFramework, {
    PerformanceMonitor,
    GameLoop,
    BenchmarkSuite,
    
    // Convenience methods
    startPerformanceMonitoring: () => globalPerformanceMonitor.startMonitoring(),
    stopPerformanceMonitoring: () => globalPerformanceMonitor.stopMonitoring(),
    getPerformanceStats: () => globalPerformanceMonitor.getStats(),
    
    // Create game loop for Bomberman
    createGameLoop: (updateFn, renderFn) => new GameLoop(updateFn, renderFn),
    
    // Wrap render functions with performance monitoring
    wrapRender: (renderFunction) => {
        return function(...args) {
            globalPerformanceMonitor.startRender();
            const result = renderFunction.apply(this, args);
            globalPerformanceMonitor.endRender();
            return result;
        };
    }
});

console.log('🎯 Performance monitoring system loaded - Ready for 60fps gaming!');