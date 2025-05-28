// RichFramework - Simple Event System
// Easy event handling without addEventListener

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Simple Event Manager
class SimpleEventBus {
    constructor() {
        this.elementHandlers = new Map(); // element handlers
        this.globalHandlers = new Map();  // global handlers
        this.nextId = 1;
        this.setupEventCatching();
        console.log('🎮 Event system ready');
    }
    
    // Setup one handler per event type on document
    setupEventCatching() {
        // Events that bubble normally and can be caught at document level
        const bubblingEvents = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove',
            'keydown', 'keyup', 'keypress', 'input', 'change', 'submit',
            'scroll', 'wheel', 'contextmenu', 'dragstart', 'drag', 'dragend', 'drop'
        ];
        
        // Events that don't bubble and need special handling
        const nonBubblingEvents = ['focus', 'blur'];
        
        // Set up bubbling events at document level
        bubblingEvents.forEach(eventType => {
            this.globalHandlers.set(eventType, new Map());
            document['on' + eventType] = (e) => this.handleEvent(eventType, e);
        });
        
        // Set up non-bubbling events (focus/blur need special handling)
        nonBubblingEvents.forEach(eventType => {
            this.globalHandlers.set(eventType, new Map());
        });
    }
    
    // Main event handler - processes both global and element events
    handleEvent(eventType, event) {
        // Run global handlers first
        this.runGlobalHandlers(eventType, event);
        
        // Then bubble through elements
        this.bubbleEvent(eventType, event);
    }
    
    // Run global handlers (like keyboard shortcuts)
    runGlobalHandlers(eventType, event) {
        const handlers = this.globalHandlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => {
                handler(this.createCustomEvent(event, event.target));
            });
        }
    }
    
    // Bubble event through DOM tree
    bubbleEvent(eventType, event) {
        let element = event.target;
        
        while (element && element !== document && element.nodeType === 1) {
            const elementId = element.getAttribute('data-rf-id');
            
            if (elementId && this.elementHandlers.has(elementId)) {
                const handlers = this.elementHandlers.get(elementId);
                if (handlers[eventType]) {
                    const customEvent = this.createCustomEvent(event, element);
                    handlers[eventType](customEvent);
                    
                    // Stop if event was stopped
                    if (customEvent._stopped) break;
                }
            }
            
            element = element.parentNode;
        }
    }
    
    // Create consistent event object
    createCustomEvent(originalEvent, currentTarget) {
        return {
            type: originalEvent.type,
            target: originalEvent.target,
            currentTarget: currentTarget,
            originalEvent: originalEvent,
            _stopped: false,
            preventDefault: () => originalEvent.preventDefault(),
            stopPropagation: () => {
                originalEvent.stopPropagation();
                this._stopped = true;
            }
        };
    }
    
    // Add handler to specific element
    addElementHandler(element, eventType, handler) {
        // Give element an ID if it doesn't have one
        let id = element.getAttribute('data-rf-id');
        if (!id) {
            id = `rf-${this.nextId++}`;
            element.setAttribute('data-rf-id', id);
        }
        
        // Store handler
        if (!this.elementHandlers.has(id)) {
            this.elementHandlers.set(id, {});
        }
        this.elementHandlers.get(id)[eventType] = handler;
        
        // Special handling for focus/blur events - attach directly to element
        if (eventType === 'focus' || eventType === 'blur') {
            element['on' + eventType] = (e) => {
                const customEvent = this.createCustomEvent(e, element);
                handler(customEvent);
            };
            console.log(`✅ Added ${eventType} directly to element ${id} (non-bubbling)`);
        } else {
            console.log(`✅ Added ${eventType} to element ${id}`);
        }
        
        // Return cleanup function
        return () => this.removeElementHandler(element, eventType);
    }
    
    // Remove handler from element
    removeElementHandler(element, eventType) {
        const id = element.getAttribute('data-rf-id');
        if (id && this.elementHandlers.has(id)) {
            const handlers = this.elementHandlers.get(id);
            delete handlers[eventType];
            
            // Special cleanup for focus/blur events
            if (eventType === 'focus' || eventType === 'blur') {
                element['on' + eventType] = null;
            }
            
            // Clean up if no handlers left
            if (Object.keys(handlers).length === 0) {
                this.elementHandlers.delete(id);
                element.removeAttribute('data-rf-id');
            }
        }
    }
    
    // Remove all handlers from element
    removeAllElementHandlers(element) {
        const id = element.getAttribute('data-rf-id');
        if (id) {
            this.elementHandlers.delete(id);
            element.removeAttribute('data-rf-id');
            console.log(`🧹 Removed all handlers from element ${id}`);
        }
    }
    
    // Add global handler (like keyboard shortcuts)
    addGlobalHandler(eventType, handler) {
        const id = `global-${this.nextId++}`;
        const handlers = this.globalHandlers.get(eventType);
        if (handlers) {
            handlers.set(id, handler);
            console.log(`🌐 Added global ${eventType} handler`);
        }
        
        // Return cleanup function
        return () => {
            const handlers = this.globalHandlers.get(eventType);
            if (handlers) handlers.delete(id);
        };
    }
}

// Create the event system
const eventBus = new SimpleEventBus();

// Simple API
window.RichFramework.events = {
    // Add event to specific element
    on: (element, eventType, handler) => eventBus.addElementHandler(element, eventType, handler),
    
    // Remove all events from element  
    off: (element) => eventBus.removeAllElementHandlers(element),
    
    // Add global event (like keyboard shortcuts)
    global: (eventType, handler) => eventBus.addGlobalHandler(eventType, handler)
};

// Easy keyboard shortcuts
window.RichFramework.events.keys = function(shortcuts) {
    return eventBus.addGlobalHandler('keydown', (event) => {
        const e = event.originalEvent;
        
        // Build key combination string
        let combo = '';
        if (e.ctrlKey) combo += 'ctrl+';
        if (e.altKey) combo += 'alt+';
        if (e.shiftKey) combo += 'shift+';
        combo += e.key.toLowerCase();
        
        // Run handler if we have one
        if (shortcuts[combo]) {
            shortcuts[combo](event);
        }
    });
};

console.log('✅ Simple Event System loaded!');