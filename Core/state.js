// Pure State Management - No window.RichFramework at all!
// Just like your friends use

export class State {
    constructor(initialValue) {
        this._value = initialValue;
        this._listeners = [];
    }
    
    get value() {
        return this._value;
    }
    
    set value(newValue) {
        this._value = newValue;
        this._listeners.forEach(callback => callback(this._value));
    }
    
    subscribe(callback) {
        this._listeners.push(callback);
    }
    
    // Array helpers
    push(item) {
        if (Array.isArray(this._value)) {
            this._value.push(item);
            this._listeners.forEach(callback => callback(this._value));
        }
    }
    
    unshift(item) {
        if (Array.isArray(this._value)) {
            this._value.unshift(item);
            this._listeners.forEach(callback => callback(this._value));
        }
    }
    
    remove(index) {
        if (Array.isArray(this._value)) {
            this._value.splice(index, 1);
            this._listeners.forEach(callback => callback(this._value));
        }
    }
}

export function createState(initialValue) {
    return new State(initialValue);
}
