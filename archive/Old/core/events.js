// ===== SIMPLE EVENT SYSTEM =====
// Easy to understand event handling - no direct addEventListener calls for users

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Simple Event Manager - Easy to explain to auditors!
class EventManager {
    constructor() {
        this.customEvents = {};
        this.nativeListeners = new Map(); // Track native listeners
        RichFramework.log('🎮 Simple event system ready');
    }

    // Check if it's a native browser event
    isNativeEvent(eventName) {
        const nativeEvents = ['click', 'keydown', 'keyup', 'input', 'change', 'submit', 
                             'mousedown', 'mouseup', 'mouseover', 'mouseout', 'scroll',
                             'focus', 'blur', 'dblclick', 'beforeunload', 'load'];
        return nativeEvents.includes(eventName);
    }

    // Add event listener - users call this, not addEventListener!
    on(eventName, callback, element = document) {
        // First time registering this event type
        if (!this.customEvents[eventName]) {
            this.customEvents[eventName] = [];

            // Set up native listener if it's a browser event
            if (this.isNativeEvent(eventName)) {
                const handler = (e) => this.emit(eventName, e);
                element.addEventListener(eventName, handler); // We use addEventListener internally
                this.nativeListeners.set(eventName, { element, handler });
            }
        }

        // Add callback to our custom event system
        this.customEvents[eventName].push(callback);
        RichFramework.metrics.eventCount++;
        RichFramework.log(`✅ Added ${eventName} event`);
    }

    // Remove event listener
    off(eventName, callback) {
        if (!this.customEvents[eventName]) return;

        // Remove the specific callback
        this.customEvents[eventName] = this.customEvents[eventName].filter(
            cb => cb !== callback
        );

        // If no more callbacks, clean up native listener
        if (this.customEvents[eventName].length === 0) {
            const nativeListener = this.nativeListeners.get(eventName);
            if (nativeListener) {
                nativeListener.element.removeEventListener(eventName, nativeListener.handler);
                this.nativeListeners.delete(eventName);
            }
            delete this.customEvents[eventName];
        }
    }

    // Trigger event - call all callbacks
    emit(eventName, data) {
        const listeners = this.customEvents[eventName];
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
}

// Create the event manager
const eventManager = new EventManager();

// Simple API for users - they never call addEventListener directly!
window.RichFramework.events = {
    on: (eventName, callback, element) => eventManager.on(eventName, callback, element),
    off: (eventName, callback) => eventManager.off(eventName, callback),
    emit: (eventName, data) => eventManager.emit(eventName, data),
    
    // Global events (document-level, or window for some events)
    global: (eventName, callback) => {
        const targetElement = (eventName === 'beforeunload' || eventName === 'load') ? window : document;
        return eventManager.on(eventName, callback, targetElement);
    }
};

RichFramework.log('✅ Simple Event System loaded - Easy to understand!');

// ===== EXPORT FOR CLEAN IMPORTS =====
export const on = RichFramework.events.on;
export const off = RichFramework.events.off;
export const emit = RichFramework.events.emit;
export const onGlobal = RichFramework.events.global;