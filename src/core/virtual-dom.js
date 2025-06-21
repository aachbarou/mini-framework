// ===== VIRTUAL DOM IMPLEMENTATION =====
// DOM abstraction layer - creates JavaScript objects representing HTML
// Only updates changed parts for better performance

// Make sure framework base exists
if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Virtual Node class
class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;           
        this.props = props;       
        this.children = children; 
        this.eventHandlers = []; // Track event handlers for cleanup
        
        RichFramework.log('Created VNode:', { tag, props, children });
    }
}

// Helper functions
function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

function createRealElement(vnode) {
    RichFramework.log('Converting to real DOM:', vnode);
    
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    if (vnode instanceof VNode) {
        const element = document.createElement(vnode.tag);
        
        // Handle properties and events
        for (const [key, value] of Object.entries(vnode.props)) {
            if (key === 'className') {
                element.className = value;
                RichFramework.log(`✅ Set className: ${value}`);
            } else if (key.startsWith('on') && typeof value === 'function') {
                // Use our simple event system
                const eventName = key.slice(2).toLowerCase(); // onClick -> click
                
                // Create a wrapper that checks if the event target matches this element
                const elementHandler = (nativeEvent) => {
                    if (nativeEvent.target === element || element.contains(nativeEvent.target)) {
                        const customEvent = {
                            type: nativeEvent.type,
                            target: nativeEvent.target,
                            currentTarget: element,
                            originalEvent: nativeEvent,
                            preventDefault: () => nativeEvent.preventDefault(),
                            stopPropagation: () => nativeEvent.stopPropagation()
                        };
                        value(customEvent);
                    }
                };
                
                // Add to our event system
                RichFramework.events.on(eventName, elementHandler);
                
                // Store for cleanup
                if (!element._eventCleanup) element._eventCleanup = [];
                element._eventCleanup.push(() => RichFramework.events.off(eventName, elementHandler));
                
                RichFramework.log(`✅ Added ${eventName} event to ${vnode.tag}`);
            } else if (key === 'value') {
                // CRITICAL FIX: Handle value as PROPERTY not attribute!
                element.value = value;
                RichFramework.log(`✅ Set value PROPERTY: ${value}`);
            } else if (key === 'checked') {
                // CRITICAL FIX: Handle checked as PROPERTY not attribute!
                element.checked = value;
                RichFramework.log(`✅ Set checked PROPERTY: ${value}`);
            } else if (key === 'htmlFor') {
                // Handle htmlFor -> for attribute mapping
                element.setAttribute('for', value);
                RichFramework.log(`✅ Set for attribute: ${value}`);
            } else if (key === 'autofocus') {
                // Handle autofocus as boolean attribute
                if (value) {
                    element.setAttribute('autofocus', '');
                }
                RichFramework.log(`✅ Set autofocus attribute: ${value}`);
            } else {
                // Handle normal attributes
                element.setAttribute(key, value);
                RichFramework.log(`✅ Set attribute ${key}: ${value}`);
            }
        }
        
        // Add children
        for (const child of vnode.children) {
            const childElement = createRealElement(child);
            element.appendChild(childElement);
        }
        
        // Store reference to event handlers for cleanup
        if (element._eventCleanup && element._eventCleanup.length > 0) {
            // Event cleanup is already handled above
        }
        
        RichFramework.log('Created real element:', element);
        return element;
    }
    
    return document.createTextNode('');
}

// Clean up event handlers when removing elements
function cleanupElement(element) {
    if (element._eventCleanup) {
        element._eventCleanup.forEach(cleanup => cleanup());
        element._eventCleanup = [];
    }
    
    // Recursively cleanup children
    if (element.childNodes) {
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) { // Element node
                cleanupElement(child);
            }
        });
    }
}

// Render function - converts Virtual DOM to real DOM
function render(vnode, container) {
    RichFramework.log('Rendering to container:', container);
    
    // Track render for performance metrics
    RichFramework.metrics.renderCount++;
    
    // Clean up existing elements first
    Array.from(container.childNodes).forEach(child => {
        if (child.nodeType === 1) { // Element node
            cleanupElement(child);
        }
    });
    
    container.innerHTML = '';
    const realElement = createRealElement(vnode);
    container.appendChild(realElement);
    
    RichFramework.log('Render complete! 🎯');
}

// Add to framework
window.RichFramework.VNode = VNode;
window.RichFramework.createElement = createElement;
window.RichFramework.createRealElement = createRealElement;
window.RichFramework.render = render;

RichFramework.log('✅ Virtual DOM with CUSTOM EVENTS loaded - DOM abstraction ready!');

// Initialize framework
if (window.RichFramework.init) {
    window.RichFramework.init();
}