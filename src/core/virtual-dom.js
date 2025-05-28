// RichFramework - Virtual DOM Module with Custom Events
// Extends the main framework with Virtual DOM capabilities

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
        
        console.log('Created VNode:', { tag, props, children });
    }
}

// Helper functions
function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

function createRealElement(vnode) {
    console.log('Converting to real DOM:', vnode);
    
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    if (vnode instanceof VNode) {
        const element = document.createElement(vnode.tag);
        
        // Handle properties and events
        for (const [key, value] of Object.entries(vnode.props)) {
            if (key === 'className') {
                element.className = value;
                console.log(`✅ Set className: ${value}`);
            } else if (key.startsWith('on') && typeof value === 'function') {
                // CHANGE: Use our custom event system
                const eventName = key.slice(2).toLowerCase();
                
                // Store cleanup function for later
                const cleanup = RichFramework.events.on(element, eventName, value);
                vnode.eventHandlers.push(cleanup);
                
                console.log(`✅ Added ${eventName} event to ${vnode.tag} using custom event system`);
            } else if (key === 'value') {
                // CRITICAL FIX: Handle value as PROPERTY not attribute!
                element.value = value;
                console.log(`✅ Set value PROPERTY: ${value}`);
            } else if (key === 'checked') {
                // CRITICAL FIX: Handle checked as PROPERTY not attribute!
                element.checked = value;
                console.log(`✅ Set checked PROPERTY: ${value}`);
            } else if (key === 'htmlFor') {
                // Handle htmlFor -> for attribute mapping
                element.setAttribute('for', value);
                console.log(`✅ Set for attribute: ${value}`);
            } else if (key === 'autofocus') {
                // Handle autofocus as boolean attribute
                if (value) {
                    element.setAttribute('autofocus', '');
                }
                console.log(`✅ Set autofocus attribute: ${value}`);
            } else {
                // Handle normal attributes
                element.setAttribute(key, value);
                console.log(`✅ Set attribute ${key}: ${value}`);
            }
        }
        
        // Add children
        for (const child of vnode.children) {
            const childElement = createRealElement(child);
            element.appendChild(childElement);
        }
        
        // Store reference to event handlers for cleanup
        if (vnode.eventHandlers.length > 0) {
            element._eventCleanup = () => {
                vnode.eventHandlers.forEach(cleanup => cleanup());
            };
        }
        
        console.log('Created real element:', element);
        return element;
    }
    
    return document.createTextNode('');
}

// Clean up event handlers when removing elements
function cleanupElement(element) {
    if (element._eventCleanup) {
        element._eventCleanup();
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

// Render function
function render(vnode, container) {
    console.log('Rendering to container:', container);
    
    // Clean up existing elements first
    Array.from(container.childNodes).forEach(child => {
        if (child.nodeType === 1) { // Element node
            cleanupElement(child);
        }
    });
    
    container.innerHTML = '';
    const realElement = createRealElement(vnode);
    container.appendChild(realElement);
    
    console.log('Render complete! 🎯');
}

// Add to framework
window.RichFramework.VNode = VNode;
window.RichFramework.createElement = createElement;
window.RichFramework.createRealElement = createRealElement;
window.RichFramework.render = render;

console.log('✅ Virtual DOM with CUSTOM EVENTS loaded!');

// Initialize framework
if (window.RichFramework.init) {
    window.RichFramework.init();
}