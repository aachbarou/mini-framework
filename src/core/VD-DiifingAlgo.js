// RichFramework - PROPER Virtual DOM with Diffing Algorithm
// This is what REAL frameworks do for performance!

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found! Load framework.js first!');
}

// Virtual Node class
class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;           
        this.props = props;       
        this.children = children;
        this.key = props.key; // For efficient reconciliation
    }
}

// Helper functions
function createElement(tag, props = {}, ...children) {
    const flatChildren = children.flat();
    return new VNode(tag, props, flatChildren);
}

// Create real DOM element (only when needed!)
function createRealElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    if (vnode instanceof VNode) {
        const element = document.createElement(vnode.tag);
        
        // Set properties
        updateElement(element, {}, vnode.props);
        
        // Add children
        for (const child of vnode.children) {
            const childElement = createRealElement(child);
            element.appendChild(childElement);
        }
        
        return element;
    }
    
    return document.createTextNode('');
}

// 🔥 THE MAGIC: Update element properties efficiently
function updateElement(element, oldProps = {}, newProps = {}) {
    // Remove old properties that don't exist in new props
    for (const key of Object.keys(oldProps)) {
        if (!(key in newProps)) {
            if (key === 'className') {
                element.className = '';
            } else if (key.startsWith('on') && typeof oldProps[key] === 'function') {
                const eventName = key.slice(2).toLowerCase();
                element.removeEventListener(eventName, oldProps[key]);
            } else if (key === 'value') {
                element.value = '';
            } else if (key === 'checked') {
                element.checked = false;
            } else {
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
                const eventName = key.slice(2).toLowerCase();
                // Remove old listener if exists
                if (oldProps[key]) {
                    element.removeEventListener(eventName, oldProps[key]);
                }
                element.addEventListener(eventName, value);
            } else if (key === 'value') {
                // Only update value if it's different from current DOM value
                if (element.value !== value) {
                    element.value = value;
                }
            } else if (key === 'checked') {
                element.checked = value;
            } else if (key !== 'key') { // Skip the key prop
                element.setAttribute(key, value);
            }
        }
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
function diffProps(oldProps, newProps) {
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
function diffChildren(oldChildren, newChildren) {
    const diffs = [];
    const oldKeyed = {};
    const newKeyed = {};
    
    // First, collect all keyed children
    oldChildren.forEach((child, i) => {
        if (child && child.key) {
            oldKeyed[child.key] = {child, index: i};
        }
    });
    
    newChildren.forEach((child, i) => {
        if (child && child.key) {
            newKeyed[child.key] = {child, index: i};
        }
    });
    
    // Generate diffs with key matching
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    
    for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i];
        let newChild = newChildren[i];
        
        // Handle keyed elements
        if (oldChild && oldChild.key && newKeyed[oldChild.key]) {
            // This old keyed element moves to a different position
            const newPos = newKeyed[oldChild.key].index;
            if (i !== newPos) {
                diffs.push({
                    index: i,
                    type: 'MOVE',
                    from: i,
                    to: newPos,
                    newVNode: newChildren[newPos]
                });
                // Skip the new position when we reach it
                newChildren[newPos] = null;
                continue;
            }
        }
        
        // Regular diff for this position
        const childDiff = diff(oldChild, newChild);
        if (childDiff) {
            diffs.push({ index: i, ...childDiff });
        }
    }
    
    return diffs;
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
            if (diffResult.childrenDiff) {
                // Process removals first (to avoid index shifting problems)
                const removals = diffResult.childrenDiff.filter(diff => diff.type === 'REMOVE');
                removals.sort((a, b) => b.index - a.index); // Remove from end to start
                
                removals.forEach(childDiff => {
                    if (element.childNodes[childDiff.index]) {
                        element.removeChild(element.childNodes[childDiff.index]);
                    }
                });
                
                // Now process other changes
                diffResult.childrenDiff
                    .filter(diff => diff.type !== 'REMOVE')
                    .forEach(childDiff => {
                        // Get the real index of the child after removals
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

// RENDER FUNCTION: Efficient updates only!
let currentVNode = null;

function render(newVNode, container) {
    console.log('🎯 Efficient render starting...');
    
    if (!currentVNode) {
        // First render - create everything
        console.log('🔨 First render - creating DOM');
        container.innerHTML = '';
        const realElement = createRealElement(newVNode);
        container.appendChild(realElement);
        currentVNode = newVNode;
    } else {
        // Subsequent renders - diff and patch!
        console.log('⚡ Diffing and patching...');
        const diffResult = diff(currentVNode, newVNode);
        
        if (diffResult) {
            console.log('🔄 Changes detected, patching:', diffResult);
            patch(container.firstChild, diffResult);
        } else {
            console.log('✅ No changes detected - skipping render!');
        }
        
        currentVNode = newVNode;
    }
    
    console.log('🎯 Render complete!');
}

// Add to framework
window.RichFramework.VNode = VNode;
window.RichFramework.createElement = createElement;
window.RichFramework.createRealElement = createRealElement;
window.RichFramework.render = render;

console.log('🚀 PROPER Virtual DOM with Diffing loaded!');

// Initialize framework
if (window.RichFramework.init) {
    window.RichFramework.init();
}
