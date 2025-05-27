// RichFramework - Virtual DOM Module with Events
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
        
        console.log('Created VNode:', { tag, props, children });
    }
}

// Helper functions
function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

// COMPLETELY FIXED: createRealElement with PROPER SUPPORT!
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
                // Handle event listeners!
                const eventName = key.slice(2).toLowerCase();
                element.addEventListener(eventName, value);
                console.log(`✅ Added ${eventName} event to ${vnode.tag}`);
            } else if (key === 'value') {
                // CRITICAL FIX: Handle value as PROPERTY not attribute!
                element.value = value;
                console.log(`✅ Set value PROPERTY: ${value}`);
            } else if (key === 'checked') {
                // CRITICAL FIX: Handle checked as PROPERTY not attribute!
                element.checked = value;
                console.log(`✅ Set checked PROPERTY: ${value}`);
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
        
        console.log('Created real element:', element);
        return element;
    }
    
    return document.createTextNode('');
}

// Render function
function render(vnode, container) {
    console.log('Rendering to container:', container);
    
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

console.log('✅ Virtual DOM FIXED VERSION loaded!');

// Initialize framework
if (window.RichFramework.init) {
    window.RichFramework.init();
}