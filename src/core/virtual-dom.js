// RichFramework - Virtual DOM Module with Events
// Extends the main framework with Virtual DOM capabilities

// Make sure framework base exists
if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Virtual Node class (KEEP THIS SAME)
class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;           
        this.props = props;       
        this.children = children; 
        
        console.log('Created VNode:', { tag, props, children });
    }
}

// Helper functions (KEEP THIS SAME)
function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

// UPDATED: createRealElement with EVENT SUPPORT!
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
            } else if (key.startsWith('on') && typeof value === 'function') {
                // NEW: Handle event listeners!
                const eventName = key.slice(2).toLowerCase(); // onClick -> click
                element.addEventListener(eventName, value);
                console.log(`✅ Added ${eventName} event listener to ${vnode.tag}`);
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // Add children (KEEP THIS SAME)
        for (const child of vnode.children) {
            const childElement = createRealElement(child);
            element.appendChild(childElement);
        }
        
        console.log('Created real element with events:', element);
        return element;
    }
    
    return document.createTextNode('');
}

// KEEP render function SAME
function render(vnode, container) {
    console.log('Rendering to container:', container);
    
    container.innerHTML = '';
    const realElement = createRealElement(vnode);
    container.appendChild(realElement);
    
    console.log('Render complete! 🎯');
}

// ADD TO FRAMEWORK (KEEP THIS SAME)
window.RichFramework.VNode = VNode;
window.RichFramework.createElement = createElement;
window.RichFramework.createRealElement = createRealElement;
window.RichFramework.render = render;

console.log('✅ Virtual DOM with EVENT SUPPORT loaded!');

// Initialize framework after all modules loaded
if (window.RichFramework.init) {
    window.RichFramework.init();
}