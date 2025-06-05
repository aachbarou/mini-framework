// Advanced Performance Profiler for High-Performance Gaming Framework
// Comprehensive 60fps monitoring with detailed metrics and optimization suggestions

class PerformanceProfiler {
    constructor(framework) {
        this.framework = framework;
        this.isEnabled = true;
        this.samplingRate = 60; // Sample every frame
        
        // Performance metrics
        this.metrics = {
            fps: {
                current: 60,
                average: 60,
                min: 60,
                max: 60,
                history: [],
                target: 60
            },
            frameTime: {
                current: 16.67,
                average: 16.67,
                min: 16.67,
                max: 16.67,
                history: [],
                budget: 16.67 // 60fps budget
            },
            memory: {
                used: 0,
                total: 0,
                allocated: 0,
                gc: 0,
                history: []
            },
            cpu: {
                gameLogic: 0,
                rendering: 0,
                signals: 0,
                ai: 0,
                physics: 0,
                total: 0
            },
            gpu: {
                layerCount: 0,
                repaints: 0,
                composites: 0,
                textureMemory: 0
            },
            network: {
                latency: 0,
                bandwidth: 0,
                packetLoss: 0
            },
            warnings: [],
            bottlenecks: []
        };
        
        // Sampling data
        this.samples = [];
        this.maxSamples = 1000; // Keep last 1000 samples
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        // Performance thresholds
        this.thresholds = {
            fps: { critical: 30, warning: 45, good: 55 },
            frameTime: { critical: 33.33, warning: 22.22, good: 18 },
            memory: { critical: 500, warning: 300, good: 200 }, // MB
            cpu: { critical: 80, warning: 60, good: 40 } // % of frame budget
        };
        
        // Auto-optimization flags
        this.autoOptimize = true;
        this.optimizationCooldown = 5000; // 5 seconds between optimizations
        this.lastOptimization = 0;
        
        this.initializeProfiler();
    }
    
    initializeProfiler() {
        // Set up frame timing
        this.setupFrameTiming();
        
        // Set up memory monitoring
        this.setupMemoryMonitoring();
        
        // Set up GPU monitoring
        this.setupGPUMonitoring();
        
        // Set up network monitoring
        this.setupNetworkMonitoring();
        
        // Start profiling loop
        this.startProfiling();
        
        console.log('📊 Advanced Performance Profiler initialized');
    }
    
    setupFrameTiming() {
        let frameStart = performance.now();
        let frames = 0;
        let lastSecond = Math.floor(frameStart / 1000);
        
        const measureFrame = () => {
            const now = performance.now();
            const frameTime = now - frameStart;
            frameStart = now;
            frames++;
            
            // Update metrics
            this.updateFrameTimeMetrics(frameTime);
            
            // Calculate FPS every second
            const currentSecond = Math.floor(now / 1000);
            if (currentSecond > lastSecond) {
                this.updateFPSMetrics(frames);
                frames = 0;
                lastSecond = currentSecond;
            }
            
            // Continue profiling
            if (this.isEnabled) {
                requestAnimationFrame(measureFrame);
            }
        };
        
        requestAnimationFrame(measureFrame);
    }
    
    updateFrameTimeMetrics(frameTime) {
        const metrics = this.metrics.frameTime;
        
        metrics.current = frameTime;
        metrics.history.push(frameTime);
        
        if (metrics.history.length > 100) {
            metrics.history.shift();
        }
        
        // Calculate average
        metrics.average = metrics.history.reduce((sum, val) => sum + val, 0) / metrics.history.length;
        
        // Update min/max
        metrics.min = Math.min(metrics.min, frameTime);
        metrics.max = Math.max(metrics.max, frameTime);
        
        // Check for performance issues
        this.checkFrameTimeThresholds(frameTime);
    }
    
    updateFPSMetrics(fps) {
        const metrics = this.metrics.fps;
        
        metrics.current = fps;
        metrics.history.push(fps);
        
        if (metrics.history.length > 60) { // Keep 1 minute of FPS history
            metrics.history.shift();
        }
        
        // Calculate average
        metrics.average = metrics.history.reduce((sum, val) => sum + val, 0) / metrics.history.length;
        
        // Update min/max
        metrics.min = Math.min(metrics.min, fps);
        metrics.max = Math.max(metrics.max, fps);
        
        // Check for performance issues
        this.checkFPSThresholds(fps);
    }
    
    setupMemoryMonitoring() {
        if (!performance.memory) {
            console.warn('Memory monitoring not available in this browser');
            return;
        }
        
        const monitorMemory = () => {
            const memory = performance.memory;
            const memoryMB = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                allocated: Math.round(memory.usedJSHeapSize / 1024 / 1024)
            };
            
            // Detect garbage collection
            if (memoryMB.used < this.metrics.memory.used - 5) {
                this.metrics.memory.gc++;
            }
            
            Object.assign(this.metrics.memory, memoryMB);
            this.metrics.memory.history.push(memoryMB.used);
            
            if (this.metrics.memory.history.length > 60) {
                this.metrics.memory.history.shift();
            }
            
            // Check memory thresholds
            this.checkMemoryThresholds(memoryMB.used);
        };
        
        setInterval(monitorMemory, 1000); // Every second
    }
    
    setupGPUMonitoring() {
        // Monitor GPU layer count
        const originalCreateElement = document.createElement;
        let layerCount = 0;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            const originalSetStyle = element.style.setProperty;
            element.style.setProperty = function(property, value) {
                if (property === 'transform' && value.includes('translateZ')) {
                    layerCount++;
                    this.metrics.gpu.layerCount = layerCount;
                }
                return originalSetStyle.call(this, property, value);
            }.bind(this);
            
            return element;
        }.bind(this);
        
        // Monitor repaints (simplified)
        let paintCount = 0;
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function(callback) {
            return originalRequestAnimationFrame.call(this, function(time) {
                paintCount++;
                this.metrics.gpu.repaints = paintCount;
                return callback(time);
            }.bind(this));
        }.bind(this);
    }
    
    setupNetworkMonitoring() {
        // Monitor network performance for multiplayer
        if (navigator.connection) {
            const updateConnection = () => {
                const connection = navigator.connection;
                this.metrics.network.bandwidth = connection.downlink || 0;
                this.metrics.network.latency = connection.rtt || 0;
            };
            
            updateConnection();
            navigator.connection.addEventListener('change', updateConnection);
        }
    }
    
    // Profile specific game components
    profileGameLogic(fn, label = 'gameLogic') {
        if (!this.isEnabled) return fn();
        
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        this.metrics.cpu[label] = duration;
        this.recordSample(label, duration);
        
        return result;
    }
    
    profileAsync(asyncFn, label = 'async') {
        if (!this.isEnabled) return asyncFn();
        
        const start = performance.now();
        return asyncFn().then(result => {
            const duration = performance.now() - start;
            this.metrics.cpu[label] = duration;
            this.recordSample(label, duration);
            return result;
        });
    }
    
    recordSample(label, value, timestamp = performance.now()) {
        this.samples.push({
            label,
            value,
            timestamp,
            frame: this.frameCount++
        });
        
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
    }
    
    // Threshold checking
    checkFrameTimeThresholds(frameTime) {
        const thresholds = this.thresholds.frameTime;
        
        if (frameTime > thresholds.critical) {
            this.addWarning('critical', `Frame time ${frameTime.toFixed(2)}ms exceeds critical threshold (${thresholds.critical}ms)`);
            this.triggerOptimization('frameTime');
        } else if (frameTime > thresholds.warning) {
            this.addWarning('warning', `Frame time ${frameTime.toFixed(2)}ms exceeds warning threshold (${thresholds.warning}ms)`);
        }
    }
    
    checkFPSThresholds(fps) {
        const thresholds = this.thresholds.fps;
        
        if (fps < thresholds.critical) {
            this.addWarning('critical', `FPS ${fps} below critical threshold (${thresholds.critical})`);
            this.triggerOptimization('fps');
        } else if (fps < thresholds.warning) {
            this.addWarning('warning', `FPS ${fps} below warning threshold (${thresholds.warning})`);
        }
    }
    
    checkMemoryThresholds(memoryMB) {
        const thresholds = this.thresholds.memory;
        
        if (memoryMB > thresholds.critical) {
            this.addWarning('critical', `Memory usage ${memoryMB}MB exceeds critical threshold (${thresholds.critical}MB)`);
            this.triggerOptimization('memory');
        } else if (memoryMB > thresholds.warning) {
            this.addWarning('warning', `Memory usage ${memoryMB}MB exceeds warning threshold (${thresholds.warning}MB)`);
        }
    }
    
    addWarning(level, message) {
        const warning = {
            level,
            message,
            timestamp: performance.now(),
            count: 1
        };
        
        // Check if we already have this warning
        const existing = this.metrics.warnings.find(w => w.message === message);
        if (existing) {
            existing.count++;
            existing.timestamp = warning.timestamp;
        } else {
            this.metrics.warnings.push(warning);
        }
        
        // Keep only recent warnings
        if (this.metrics.warnings.length > 50) {
            this.metrics.warnings.shift();
        }
        
        // Log critical warnings
        if (level === 'critical') {
            console.warn('🚨 Performance Warning:', message);
        }
    }
    
    triggerOptimization(type) {
        if (!this.autoOptimize) return;
        
        const now = performance.now();
        if (now - this.lastOptimization < this.optimizationCooldown) return;
        
        console.log(`🔧 Auto-optimization triggered for: ${type}`);
        this.lastOptimization = now;
        
        switch (type) {
            case 'frameTime':
            case 'fps':
                this.optimizeRendering();
                break;
            case 'memory':
                this.optimizeMemory();
                break;
        }
    }
    
    optimizeRendering() {
        // Reduce visual effects
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            // Simplify animations
            document.querySelectorAll('.bomb').forEach(bomb => {
                bomb.style.animation = 'none';
            });
            
            // Reduce particle effects
            document.querySelectorAll('.explosion').forEach(explosion => {
                explosion.style.animation = 'explosion-simple 0.3s ease-out';
            });
        }
        
        console.log('🎮 Rendering optimizations applied');
    }
    
    optimizeMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear old samples
        this.samples = this.samples.slice(-500);
        
        // Clear old metrics history
        Object.values(this.metrics).forEach(metric => {
            if (metric.history) {
                metric.history = metric.history.slice(-30);
            }
        });
        
        console.log('🧹 Memory optimizations applied');
    }
    
    // Generate performance report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                fps: {
                    current: this.metrics.fps.current,
                    average: this.metrics.fps.average,
                    status: this.getFPSStatus()
                },
                frameTime: {
                    current: this.metrics.frameTime.current,
                    average: this.metrics.frameTime.average,
                    status: this.getFrameTimeStatus()
                },
                memory: {
                    used: this.metrics.memory.used,
                    status: this.getMemoryStatus()
                }
            },
            bottlenecks: this.identifyBottlenecks(),
            recommendations: this.generateRecommendations(),
            warnings: this.metrics.warnings.filter(w => 
                performance.now() - w.timestamp < 30000 // Last 30 seconds
            )
        };
        
        return report;
    }
    
    getFPSStatus() {
        const fps = this.metrics.fps.current;
        const thresholds = this.thresholds.fps;
        
        if (fps >= thresholds.good) return 'excellent';
        if (fps >= thresholds.warning) return 'good';
        if (fps >= thresholds.critical) return 'warning';
        return 'critical';
    }
    
    getFrameTimeStatus() {
        const frameTime = this.metrics.frameTime.current;
        const thresholds = this.thresholds.frameTime;
        
        if (frameTime <= thresholds.good) return 'excellent';
        if (frameTime <= thresholds.warning) return 'good';
        if (frameTime <= thresholds.critical) return 'warning';
        return 'critical';
    }
    
    getMemoryStatus() {
        const memory = this.metrics.memory.used;
        const thresholds = this.thresholds.memory;
        
        if (memory <= thresholds.good) return 'excellent';
        if (memory <= thresholds.warning) return 'good';
        if (memory <= thresholds.critical) return 'warning';
        return 'critical';
    }
    
    identifyBottlenecks() {
        const bottlenecks = [];
        const cpuBudget = this.metrics.frameTime.budget;
        
        // Check CPU usage
        Object.entries(this.metrics.cpu).forEach(([component, time]) => {
            if (component === 'total') return;
            
            const percentage = (time / cpuBudget) * 100;
            if (percentage > 20) { // Using more than 20% of frame budget
                bottlenecks.push({
                    type: 'cpu',
                    component,
                    usage: percentage,
                    severity: percentage > 50 ? 'high' : 'medium'
                });
            }
        });
        
        // Check memory growth
        const memoryHistory = this.metrics.memory.history;
        if (memoryHistory.length > 10) {
            const recent = memoryHistory.slice(-10);
            const growth = recent[recent.length - 1] - recent[0];
            if (growth > 50) { // 50MB growth in 10 seconds
                bottlenecks.push({
                    type: 'memory',
                    component: 'heap',
                    growth: `${growth}MB`,
                    severity: 'medium'
                });
            }
        }
        
        // Check GPU layers
        if (this.metrics.gpu.layerCount > 100) {
            bottlenecks.push({
                type: 'gpu',
                component: 'layers',
                count: this.metrics.gpu.layerCount,
                severity: 'medium'
            });
        }
        
        return bottlenecks;
    }
    
    generateRecommendations() {
        const recommendations = [];
        const fps = this.metrics.fps.average;
        const frameTime = this.metrics.frameTime.average;
        const memory = this.metrics.memory.used;
        
        // FPS recommendations
        if (fps < 45) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Low FPS Detected',
                description: 'Reduce visual effects, optimize animations, or lower game complexity',
                actions: [
                    'Disable particle effects',
                    'Reduce animation frequency',
                    'Use CSS transforms instead of changing layout properties',
                    'Implement object pooling for game entities'
                ]
            });
        }
        
        // Frame time recommendations
        if (frameTime > 20) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'High Frame Time',
                description: 'Optimize game loop and rendering pipeline',
                actions: [
                    'Profile and optimize hot code paths',
                    'Use requestAnimationFrame for all animations',
                    'Batch DOM updates',
                    'Minimize layout thrashing'
                ]
            });
        }
        
        // Memory recommendations
        if (memory > 200) {
            recommendations.push({
                category: 'memory',
                priority: 'medium',
                title: 'High Memory Usage',
                description: 'Optimize memory allocation and garbage collection',
                actions: [
                    'Implement object pooling',
                    'Remove unused event listeners',
                    'Clear unused references',
                    'Use WeakMap for temporary associations'
                ]
            });
        }
        
        // GPU recommendations
        if (this.metrics.gpu.layerCount > 50) {
            recommendations.push({
                category: 'gpu',
                priority: 'medium',
                title: 'High GPU Layer Count',
                description: 'Reduce composite layers to improve GPU performance',
                actions: [
                    'Minimize use of translateZ(0)',
                    'Use will-change property sparingly',
                    'Combine similar elements into single layers',
                    'Remove unnecessary 3D transforms'
                ]
            });
        }
        
        return recommendations;
    }
    
    // Export data for analysis
    exportData(format = 'json') {
        const data = {
            metrics: this.metrics,
            samples: this.samples,
            report: this.generateReport()
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.exportCSV();
            default:
                return data;
        }
    }
    
    exportCSV() {
        const headers = ['timestamp', 'fps', 'frameTime', 'memory', 'gameLogic', 'rendering'];
        const rows = [headers.join(',')];
        
        this.samples.forEach(sample => {
            const row = [
                sample.timestamp,
                this.metrics.fps.current,
                this.metrics.frameTime.current,
                this.metrics.memory.used,
                this.metrics.cpu.gameLogic,
                this.metrics.cpu.rendering
            ];
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    }
    
    // Start/stop profiling
    startProfiling() {
        this.isEnabled = true;
        console.log('📊 Performance profiling started');
    }
    
    stopProfiling() {
        this.isEnabled = false;
        console.log('📊 Performance profiling stopped');
    }
    
    // Reset all metrics
    reset() {
        Object.keys(this.metrics).forEach(key => {
            if (this.metrics[key].history) {
                this.metrics[key].history = [];
            }
            if (typeof this.metrics[key].current !== 'undefined') {
                this.metrics[key].current = 0;
                this.metrics[key].average = 0;
                this.metrics[key].min = Infinity;
                this.metrics[key].max = 0;
            }
        });
        
        this.metrics.warnings = [];
        this.metrics.bottlenecks = [];
        this.samples = [];
        this.frameCount = 0;
        
        console.log('📊 Performance metrics reset');
    }
    
    // Get current metrics
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: performance.now()
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.PerformanceProfiler = PerformanceProfiler;
} else if (typeof module !== 'undefined') {
    module.exports = PerformanceProfiler;
}

console.log('📊 Advanced Performance Profiler loaded');
