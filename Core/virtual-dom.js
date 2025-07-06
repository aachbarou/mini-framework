// Pure Virtual DOM - No window.RichFramework at all!
// Just like your friends use

export class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;
        this.props = props;
        this.children = children;
        this.key = props.key || null; // Support for keys
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

// Proper diffing implementation based on working algorithm
let currentVNode = null;

export function render(newVNode, container) {
    if (!currentVNode) {
        // First render - create everything
        container.innerHTML = '';
        const realElement = createRealElement(newVNode);
        container.appendChild(realElement);
        currentVNode = newVNode;
    } else {
        // Subsequent renders - diff and patch!
        const diffResult = diff(currentVNode, newVNode);
        
        if (diffResult) {
            patch(container.firstChild, diffResult);
        }
        
        currentVNode = newVNode;
    }
}

// DIFFING ALGORITHM: The heart of performance!
function diff(oldVNode, newVNode) {
    // Text node changes
    if (typeof newVNode === 'string' || typeof newVNode === 'number') {
        if (typeof oldVNode === 'string' || typeof oldVNode === 'number') {
            return oldVNode !== newVNode ? { type: 'TEXT', newVNode } : null;
        } else {
            return { type: 'REPLACE', newVNode };
        }
    }
    
    // New node where old was text
    if (typeof oldVNode === 'string' || typeof oldVNode === 'number') {
        return { type: 'REPLACE', newVNode };
    }
    
    // No old node
    if (!oldVNode) {
        return { type: 'CREATE', newVNode };
    }
    
    // No new node
    if (!newVNode) {
        return { type: 'REMOVE' };
    }
    
    // Different tag types
    if (oldVNode.tag !== newVNode.tag) {
        return { type: 'REPLACE', newVNode };
    }
    
    // Same tag, check props and children
    const propsDiff = diffProps(oldVNode.props, newVNode.props);
    const childrenDiff = diffChildren(oldVNode.children, newVNode.children);
    
    if (propsDiff || childrenDiff.length > 0) {
        return {
            type: 'UPDATE',
            propsDiff,
            childrenDiff
        };
    }
    
    return null; // No changes!
}

// Compare properties
function diffProps(oldProps = {}, newProps = {}) {
    const changes = {};
    let hasChanges = false;
    
    // Check for changed/new properties
    for (const key of Object.keys(newProps)) {
        if (oldProps[key] !== newProps[key]) {
            changes[key] = newProps[key];
            hasChanges = true;
        }
    }
    
    // Check for removed properties
    for (const key of Object.keys(oldProps)) {
        if (!(key in newProps)) {
            changes[key] = undefined;
            hasChanges = true;
        }
    }
    
    return hasChanges ? { oldProps, newProps, changes } : null;
}

// Improved diffChildren with key-based reconciliation
function diffChildren(oldChildren = [], newChildren = []) {
    const diffs = [];
    const oldKeyedMap = new Map();
    const newKeyedMap = new Map();
    
    // Build maps of keyed elements
    oldChildren.forEach((child, index) => {
        if (child && child.props && child.props.key != null) {
            oldKeyedMap.set(child.props.key, { child, index });
        }
    });
    
    newChildren.forEach((child, index) => {
        if (child && child.props && child.props.key != null) {
            newKeyedMap.set(child.props.key, { child, index });
        }
    });
    
    // Process all positions
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    const processed = new Set(); // Track which new indices we've handled
    
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[i];
        
        // If the old child had a key, try to find it in the new children
        if (oldChild && oldChild.props && oldChild.props.key != null) {
            const key = oldChild.props.key;
            const newPos = newKeyedMap.get(key);
            
            if (newPos) {
                // This keyed element still exists
                const actualNewChild = newPos.child;
                const actualNewIndex = newPos.index;
                
                // If it's in a different position, we need to handle the movement
                if (actualNewIndex !== i) {
                    // The element moved - we'll handle this when we get to its new position
                    if (!processed.has(actualNewIndex)) {
                        // Mark this position as needing to be handled later
                        continue;
                    }
                }
                
                // Diff the actual matched elements
                const childDiff = diff(oldChild, actualNewChild);
                if (childDiff) {
                    diffs.push({ index: i, ...childDiff });
                }
                processed.add(actualNewIndex);
            } else {
                // Keyed element was removed
                diffs.push({ index: i, type: 'REMOVE' });
            }
        } else if (newChild && newChild.props && newChild.props.key != null) {
            // New child has a key
            const key = newChild.props.key;
            const oldPos = oldKeyedMap.get(key);
            
            if (oldPos && !processed.has(i)) {
                // This is a keyed element that moved from elsewhere
                const actualOldChild = oldPos.child;
                const childDiff = diff(actualOldChild, newChild);
                if (childDiff) {
                    diffs.push({ index: i, ...childDiff });
                } else {
                    // Element moved but didn't change - we still need to record the move
                    diffs.push({ index: i, type: 'MOVE', newVNode: newChild });
                }
                processed.add(i);
            } else if (!oldPos) {
                // Completely new keyed element
                diffs.push({ index: i, type: 'CREATE', newVNode: newChild });
                processed.add(i);
            }
        } else {
            // Neither old nor new has keys - simple positional diff
            if (!processed.has(i)) {
                const childDiff = diff(oldChild, newChild);
                if (childDiff) {
                    diffs.push({ index: i, ...childDiff });
                }
                processed.add(i);
            }
        }
    }
    
    return diffs;
}

// Update element properties efficiently
function updateElement(element, oldProps = {}, newProps = {}) {
    // Remove old properties that don't exist in new props
    for (const key of Object.keys(oldProps)) {
        if (!(key in newProps)) {
            if (key === 'className') {
                element.className = '';
            } else if (key.startsWith('on') && typeof oldProps[key] === 'function') {
                let eventName = key.slice(2).toLowerCase();
                if (eventName === 'doubleclick') eventName = 'dblclick';
                element.removeEventListener(eventName, oldProps[key]);
            } else if (key === 'value') {
                element.value = '';
            } else if (key === 'checked') {
                element.checked = false;
            } else if (key !== 'key') {
                element.removeAttribute(key);
            }
        }
    }
    
    // Add/update new properties
    for (const [key, value] of Object.entries(newProps)) {
        if (oldProps[key] !== value) { // Only update if changed!
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                let eventName = key.slice(2).toLowerCase();
                if (eventName === 'doubleclick') eventName = 'dblclick';
                // Remove old listener if exists
                if (oldProps[key]) {
                    element.removeEventListener(eventName, oldProps[key]);
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
                } else {
                    element.removeAttribute('autofocus');
                }
            } else if (key !== 'key') { // Skip the key prop
                element.setAttribute(key, value);
            }
        }
    }
}

// PATCHING: Apply only the changes!
function patch(element, diffResult) {
    if (!diffResult) return; // No changes needed!
    
    switch (diffResult.type) {
        case 'TEXT':
            element.textContent = diffResult.newVNode;
            break;
            
        case 'REPLACE':
            const newElement = createRealElement(diffResult.newVNode);
            element.parentNode.replaceChild(newElement, element);
            break;
            
        case 'REMOVE':
            element.parentNode.removeChild(element);
            break;
            
        case 'CREATE':
            const createdElement = createRealElement(diffResult.newVNode);
            element.appendChild(createdElement);
            break;
            
        case 'UPDATE':
            // Update properties
            if (diffResult.propsDiff) {
                updateElement(element, diffResult.propsDiff.oldProps, diffResult.propsDiff.newProps);
            }
            
            // Update children
            if (diffResult.childrenDiff && diffResult.childrenDiff.length > 0) {
                // Handle moves first by reordering DOM nodes
                const moves = diffResult.childrenDiff.filter(diff => diff.type === 'MOVE');
                moves.forEach(childDiff => {
                    const childElement = element.childNodes[childDiff.index];
                    if (childElement) {
                        // For now, just update in place - moves are complex to implement correctly
                        // The key matching should handle most of the heavy lifting
                        updateElement(childElement, {}, childDiff.newVNode.props || {});
                    }
                });
                
                // Process removals (from end to start to avoid index issues)
                const removals = diffResult.childrenDiff.filter(diff => diff.type === 'REMOVE');
                removals.sort((a, b) => b.index - a.index);
                
                removals.forEach(childDiff => {
                    if (element.childNodes[childDiff.index]) {
                        element.removeChild(element.childNodes[childDiff.index]);
                    }
                });
                
                // Process updates and creations
                diffResult.childrenDiff
                    .filter(diff => diff.type !== 'REMOVE' && diff.type !== 'MOVE')
                    .forEach(childDiff => {
                        const childIndex = childDiff.index;
                        
                        if (childDiff.type === 'CREATE') {
                            const newChild = createRealElement(childDiff.newVNode);
                            // Insert at correct position
                            if (childIndex >= element.childNodes.length) {
                                element.appendChild(newChild);
                            } else {
                                element.insertBefore(newChild, element.childNodes[childIndex]);
                            }
                        } else {
                            const childElement = element.childNodes[childIndex];
                            if (childElement) {
                                patch(childElement, childDiff);
                            }
                        }
                    });
            }
            break;
    }
}


