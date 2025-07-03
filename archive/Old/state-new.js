// Simple State Management - Clean Export Version
import { log, metrics } from './framework-new.js';

// Simple State class
export class State {
    constructor(initialValue) {
        this._value = initialValue;
        this._listeners = [];
        log('🎯 Created state:', initialValue);
    }
    
    get value() {
        return this._value;
    }
    
    set value(newValue) {
        this._value = newValue;
        metrics.stateUpdates++;
        this._notifyAll();
        log('📊 State updated to:', newValue);
    }
    
    subscribe(callback) {
        this._listeners.push(callback);
        log('👂 Added listener, total:', this._listeners.length);
    }
    
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
export function createState(initialValue) {
    return new State(initialValue);
}

log('✅ State Management loaded');
