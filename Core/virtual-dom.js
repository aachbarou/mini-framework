// Pure Virtual DOM - No window.RichFramework at all!
// Just like your friends use

export class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;
        this.props = props;
        this.children = children;
    }
}

export function createElement(tag, props = {}, ...children) {
    return new VNode(tag, props, children.flat());
}

export function createRealElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    if (vnode instanceof VNode) {
        const element = document.createElement(vnode.tag);
        
        // Handle props
        // Event name mapping for camelCase to DOM event names
        const eventNameMap = {
            doubleclick: 'dblclick',
            // Add more mappings if needed
        };
        
        for (const [key, value] of Object.entries(vnode.props)) {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                let eventName = key.slice(2).toLowerCase();
                if (eventNameMap[eventName]) {
                    eventName = eventNameMap[eventName];
                }
                element.addEventListener(eventName, value);
            } else if (key === 'value') {
                element.value = value;
            } else if (key === 'checked') {
                element.checked = value;
            } else if (key === 'htmlFor') {
                element.setAttribute('for', value);
            } else if (key === 'autofocus') {
                if (value) {
                    element.setAttribute('autofocus', '');
                }
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // Add children
        for (const child of vnode.children) {
            if (child != null) {
                element.appendChild(createRealElement(child));
            }
        }
        
        return element;
    }
    return document.createTextNode('');
}

export function render(vnode, container) {
    container.innerHTML = '';
    container.appendChild(createRealElement(vnode));
}
