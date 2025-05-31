// RichFramework - State Management Module
// Simple reactive state for our framework

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Simple State class
class State {
    constructor(initialValue) {
        this._value = initialValue;
        this._listeners = []; // List of functions to call when state changes
        console.log('🎯 Created state with value:', initialValue);
    }
    
    // we use setter/getters and proxies like vue js (m9awdin 7na hihi)
    // Get current value
    get value() {
        return this._value;
    }
    
    // Set new value and automatically notify everyone!
    set value(newValue) {
        console.log('📊 State changing from:', this._value, 'to:', newValue);
        this._value = newValue;
        this._tellEveryone(); // This is the magic! ✨
    }
    
    // Observer pattern (Gang of four 1994 -_-)
    // Subscribe = "Tell me when state changes"
    subscribe(listenerFunction) {
        this._listeners.push(listenerFunction);
        console.log('👂 Added state listener, total:', this._listeners.length);
    }
    
    // Tell everyone that state changed
    _tellEveryone() {
        console.log('📢 Telling', this._listeners.length, 'listeners about state change');
        this._listeners.forEach(listener => listener(this._value));
    }
    

    // Helper for arrays - add item
    push(item) {
        if (Array.isArray(this._value)) {
            this._value.push(item);
            this._tellEveryone();
        }
    }
    
    // Helper for arrays - remove item
    remove(index) {
        if (Array.isArray(this._value)) {
            this._value.splice(index, 1);
            this._tellEveryone();
        }
    }
}

// Easy way to create state
function createState(initialValue) {
    return new State(initialValue);
}

// Add to our framework
window.RichFramework.State = State;
window.RichFramework.createState = createState;

console.log('✅ State Management module loaded!');