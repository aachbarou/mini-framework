// ===== SIMPLE STATE MANAGEMENT =====
// Easy reactive state - when state changes, UI updates automatically

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Simple State class - Easy to understand!
class State {
    constructor(initialValue) {
        this._value = initialValue;
        this._listeners = []; // Functions to call when state changes
        RichFramework.log('🎯 Created state:', initialValue);
    }
    
    // Get current value
    get value() {
        return this._value;
    }
    
    // Set new value and tell everyone!
    set value(newValue) {
        this._value = newValue;
        RichFramework.metrics.stateUpdates++;
        this._notifyAll(); // Tell all listeners
        RichFramework.log('📊 State updated to:', newValue);
    }
    
    // Subscribe to changes - "tell me when state changes"
    subscribe(callback) {
        this._listeners.push(callback);
        RichFramework.log('👂 Added listener, total:', this._listeners.length);
    }
    
    // Tell all listeners about the change
    _notifyAll() {
        this._listeners.forEach(callback => callback(this._value));
    }
    
    // Helper methods for arrays
    push(item) {
        if (Array.isArray(this._value)) {
            this._value.push(item);
            this._notifyAll();
        }
    }
    
    unshift(item) {
        if (Array.isArray(this._value)) {
            this._value.unshift(item);
            this._notifyAll();
        }
    }
    
    remove(index) {
        if (Array.isArray(this._value)) {
            this._value.splice(index, 1);
            this._notifyAll();
        }
    }
}

// Easy way to create state
function createState(initialValue) {
    return new State(initialValue);
}

// Add to framework
window.RichFramework.State = State;
window.RichFramework.createState = createState;

RichFramework.log('✅ Simple State Management loaded - Easy reactive updates!');