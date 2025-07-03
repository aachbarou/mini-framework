// Virtual DOM - Clean Export Version
import { log, metrics } from './framework-new.js';
import { on, off } from './events-new.js';

// Virtual Node class
export class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;           
        this.props = props;       
        this.children = children; 
        log('Created VNode:', { tag, props, children });
    }
}

// Create virtual element
export function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

// Convert virtual DOM to real DOM
export function createRealElement(vnode) {
    log('Converting to real DOM:', vnode);
    
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    if (vnode instanceof VNode) {
        const element = document.createElement(vnode.tag);
        
        // Handle properties and events
        for (const [key, value] of Object.entries(vnode.props)) {
            if (key === 'className') {
                element.className = value;
                log(`✅ Set className: ${value}`);
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.slice(2).toLowerCase();
                
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
                
                on(eventName, elementHandler);
                
                if (!element._eventCleanup) element._eventCleanup = [];
                element._eventCleanup.push(() => off(eventName, elementHandler));
                
                log(`✅ Added ${eventName} event to ${vnode.tag}`);
            } else if (key === 'value') {
                element.value = value;
                log(`✅ Set value PROPERTY: ${value}`);
            } else if (key === 'checked') {
                element.checked = value;
                log(`✅ Set checked PROPERTY: ${value}`);
            } else if (key === 'htmlFor') {
                element.setAttribute('for', value);
                log(`✅ Set for attribute: ${value}`);
            } else if (key === 'autofocus') {
                if (value) {
                    element.setAttribute('autofocus', '');
                }
                log(`✅ Set autofocus attribute: ${value}`);
            } else {
                element.setAttribute(key, value);
                log(`✅ Set attribute ${key}: ${value}`);
            }
        }
        
        // Add children
        for (const child of vnode.children) {
            const childElement = createRealElement(child);
            element.appendChild(childElement);
        }
        
        log('Created real element:', element);
        return element;
    }
    
    return document.createTextNode('');
}

// Clean up event handlers
function cleanupElement(element) {
    if (element._eventCleanup) {
        element._eventCleanup.forEach(cleanup => cleanup());
        element._eventCleanup = [];
    }
    
    if (element.childNodes) {
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) {
                cleanupElement(child);
            }
        });
    }
}

// Render virtual DOM to container
export function render(vnode, container) {
    log('Rendering to container:', container);
    
    metrics.renderCount++;
    
    // Clean up existing elements
    Array.from(container.childNodes).forEach(child => {
        if (child.nodeType === 1) {
            cleanupElement(child);
        }
    });
    
    container.innerHTML = '';
    const realElement = createRealElement(vnode);
    container.appendChild(realElement);
    
    log('Render complete! 🎯');
}

log('✅ Virtual DOM loaded');
