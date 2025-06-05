// RichSignals - Standalone Signals System for High-Performance Reactive Updates
// Alternative to Virtual DOM - Perfect for high-performance applications

// Global context for tracking current effect
let currentEffect = null;
const effectStack = [];

// Signal class - Core reactive primitive (OPTIMIZED FOR 60FPS)
class Signal {
    constructor(value) {
        this._value = value;
        this.subscribers = new Set();
        this.id = ++Signal._idCounter; // Faster than random
        
        // Only log in development
        if (Signal.DEBUG_MODE) {
            console.log(`📡 Created Signal[${this.id}]:`, value);
        }
    }
    
    get value() {
        // Auto-subscribe if we're inside an effect (FAST PATH)
        if (currentEffect) {
            this.subscribers.add(currentEffect);
            currentEffect.dependencies.add(this);
        }
        return this._value;
    }
    
    set(newValue) {
        // CRITICAL: Fast equality check for primitives
        if (this._value === newValue) return;
        
        this._value = newValue;
        
        // OPTIMIZED: Batch updates during performance-critical operations
        if (isBatching) {
            this.subscribers.forEach(effect => {
                if (effect.isActive) {
                    batchedEffects.add(effect);
                }
            });
        } else {
            // Immediate update (slower path)
            this.subscribers.forEach(effect => {
                if (effect.isActive) {
                    effect.run();
                }
            });
        }
    }
    
    // For debugging
    toString() {
        return `Signal[${this.id}](${this._value})`;
    }
}

// Static properties for optimization
Signal._idCounter = 0;
Signal.DEBUG_MODE = false; // Set to true for development

// Computed Signal - Derived from other signals
class ComputedSignal extends Signal {
    constructor(computeFn) {
        super(undefined);
        this.computeFn = computeFn;
        this.dependencies = new Set();
        this.isActive = true;
        
        // Compute initial value
        this._compute();
        
        console.log(`🧮 Created ComputedSignal[${this.id}]`);
    }
    
    _compute() {
        // Clear old dependencies
        this.dependencies.forEach(dep => {
            dep.subscribers.delete(this);
        });
        this.dependencies.clear();
        
        // Track new dependencies
        const prevEffect = currentEffect;
        currentEffect = this;
        
        try {
            const newValue = this.computeFn();
            if (this._value !== newValue) {
                this._value = newValue;
                console.log(`🧮 ComputedSignal[${this.id}] recomputed:`, newValue);
            }
        } finally {
            currentEffect = prevEffect;
        }
    }
    
    get value() {
        // Run computation if any dependency changed
        this._compute();
        return this._value;
    }
}

// Effect - Run function when dependencies change
class Effect {
    constructor(fn) {
        this.fn = fn;
        this.dependencies = new Set();
        this.isActive = true;
        this.id = ++Effect._idCounter;
        
        // Perform initial run
        this.run();
        
        if (Effect.DEBUG_MODE) {
            console.log(`🔄 Created Effect[${this.id}]`);
        }
    }
    
    run() {
        if (!this.isActive) return;
        
        // Unsubscribe from old dependencies
        this.dependencies.forEach(dep => {
            dep.subscribers.delete(this);
        });
        this.dependencies.clear();
        
        // Set as current effect to track new dependencies
        const prevEffect = currentEffect;
        effectStack.push(this);
        currentEffect = this;
        
        try {
            this.fn();
        } catch (error) {
            console.error(`❌ Error in Effect[${this.id}]:`, error);
        } finally {
            // Restore previous effect
            effectStack.pop();
            currentEffect = effectStack.length > 0 ? effectStack[effectStack.length - 1] : prevEffect;
        }
    }
    
    // Clean up effect (stop tracking)
    dispose() {
        this.isActive = false;
        this.dependencies.forEach(dep => {
            dep.subscribers.delete(this);
        });
        this.dependencies.clear();
        
        console.log(`🗑️ Disposed Effect[${this.id}]`);
    }
}

// Static properties
Effect._idCounter = 0;
Effect.DEBUG_MODE = false;

// Batching system for better performance
let isBatching = false;
let batchedEffects = new Set();

// Batch multiple signal updates for maximum performance
function batch(fn) {
    if (isBatching) {
        // Already batching, just run the function
        return fn();
    }
    
    isBatching = true;
    batchedEffects.clear();
    
    try {
        const result = fn();
        
        // Run all effects at once
        batchedEffects.forEach(effect => {
            effect.run();
        });
        
        return result;
    } finally {
        isBatching = false;
        batchedEffects.clear();
    }
}

// Public API for DOM element binding
function bindSignalToAttribute(element, attributeName, signal) {
    return effect(() => {
        element.setAttribute(attributeName, signal.value);
    });
}

function bindSignalToProperty(element, propertyName, signal) {
    return effect(() => {
        element[propertyName] = signal.value;
    });
}

function bindSignalToStyle(element, styleName, signal) {
    return effect(() => {
        element.style[styleName] = signal.value;
    });
}

function bindSignalToClass(element, className, signal) {
    return effect(() => {
        if (signal.value) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    });
}

function bindSignalToText(element, signal) {
    return effect(() => {
        element.textContent = signal.value;
    });
}

// Performance monitoring
const SignalsPerf = {
    _startTime: 0,
    _endTime: 0,
    _totalSignals: 0,
    _totalEffects: 0,
    
    reset() {
        this._startTime = 0;
        this._endTime = 0;
    },
    
    start() {
        this._startTime = performance.now();
    },
    
    end() {
        this._endTime = performance.now();
    },
    
    getStats() {
        return {
            duration: this._endTime - this._startTime,
            totalSignals: Signal._idCounter,
            totalEffects: Effect._idCounter
        };
    },
    
    checkPerformance() {
        return {
            signalCount: Signal._idCounter,
            effectCount: Effect._idCounter,
            timeSinceStart: performance.now() - this._startTime
        };
    }
};

// Public API factory functions
function signal(initialValue) {
    SignalsPerf._totalSignals++;
    return new Signal(initialValue);
}

function computed(computeFn) {
    SignalsPerf._totalSignals++;
    return new ComputedSignal(computeFn);
}

function effect(fn) {
    SignalsPerf._totalEffects++;
    return new Effect(fn);
}

// Export the API
const RichSignals = {
    signal,
    computed,
    effect,
    batch,
    SignalsPerf,
    bindSignalToAttribute,
    bindSignalToProperty,
    bindSignalToStyle,
    bindSignalToClass,
    bindSignalToText
};

// Make available globally
window.RichSignals = RichSignals;

console.log('📡 RichSignals system loaded - Ready for high-performance reactive updates!');
