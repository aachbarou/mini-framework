// Simple Event System - Clean Export Version  
import { log, metrics } from './framework-new.js';

// Event Manager class
class EventManager {
    constructor() {
        this.customEvents = {};
        this.nativeListeners = new Map();
        log('🎮 Event system ready');
    }

    isNativeEvent(eventName) {
        const nativeEvents = ['click', 'keydown', 'keyup', 'input', 'change', 'submit', 
                             'mousedown', 'mouseup', 'mouseover', 'mouseout', 'scroll',
                             'focus', 'blur', 'dblclick', 'beforeunload', 'load'];
        return nativeEvents.includes(eventName);
    }

    on(eventName, callback, element = document) {
        if (!this.customEvents[eventName]) {
            this.customEvents[eventName] = [];

            if (this.isNativeEvent(eventName)) {
                const handler = (e) => this.emit(eventName, e);
                element.addEventListener(eventName, handler);
                this.nativeListeners.set(eventName, { element, handler });
            }
        }

        this.customEvents[eventName].push(callback);
        metrics.eventCount++;
        log(`✅ Added ${eventName} event`);
    }

    off(eventName, callback) {
        if (!this.customEvents[eventName]) return;

        this.customEvents[eventName] = this.customEvents[eventName].filter(
            cb => cb !== callback
        );

        if (this.customEvents[eventName].length === 0) {
            const nativeListener = this.nativeListeners.get(eventName);
            if (nativeListener) {
                nativeListener.element.removeEventListener(eventName, nativeListener.handler);
                this.nativeListeners.delete(eventName);
            }
            delete this.customEvents[eventName];
        }
    }

    emit(eventName, data) {
        const listeners = this.customEvents[eventName];
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
}

// Create the event manager
const eventManager = new EventManager();

// Export simple API
export function on(eventName, callback, element) {
    return eventManager.on(eventName, callback, element);
}

export function off(eventName, callback) {
    return eventManager.off(eventName, callback);
}

export function emit(eventName, data) {
    return eventManager.emit(eventName, data);
}

// Global events
export function onGlobal(eventName, callback) {
    const targetElement = (eventName === 'beforeunload' || eventName === 'load') ? window : document;
    return eventManager.on(eventName, callback, targetElement);
}

log('✅ Event System loaded');
