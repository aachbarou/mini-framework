# 🎮 Event System - Pure ES6 Module

> Clean event handling without direct `addEventListener` calls

## 📖 Overview

The Event System module provides a clean way to handle user interactions like clicks, input changes, keyboard presses, and more. Instead of manually calling `addEventListener`, you use props like `onClick`, `onInput`, etc. The framework automatically handles event binding, delegation, and cleanup.

**Key Benefits:**
- ✅ **Clean Syntax** - Use `onClick` instead of `addEventListener('click')`
- ✅ **Automatic Binding** - Framework handles event attachment
- ✅ **Event Delegation** - Efficient event handling for dynamic content
- ✅ **Proper Cleanup** - No memory leaks or orphaned listeners
- ✅ **All DOM Events** - Support for every browser event

## 🚀 Import and Basic Usage

```javascript
import { createElement } from './Core/virtual-dom.js';

// Event handlers are just props!
const button = createElement('button', {
    onClick: (event) => {
        console.log('Button clicked!', event);
    }
}, 'Click Me');
```

## 🎯 Creating Events

### Click Events
```javascript
import { createElement } from './Core/virtual-dom.js';

// Simple click handler
createElement('button', {
    onClick: () => {
        alert('Hello World!');
    }
}, 'Say Hello');

// Click handler with event object
createElement('button', {
    onClick: (event) => {
        console.log('Button clicked:', event.target);
        event.preventDefault(); // Prevent default behavior
    }
}, 'Log Click');

// Click handler with data
createElement('button', {
    onClick: () => handleItemClick(item.id)
}, 'Delete Item');

function handleItemClick(itemId) {
    console.log('Clicked item:', itemId);
    // Delete item logic here
}
```

### Input Events
```javascript
// Text input changes
createElement('input', {
    type: 'text',
    placeholder: 'Enter your name',
    onInput: (event) => {
        console.log('Input value:', event.target.value);
        // Update state or validate input
    }
});

// Input change (when focus is lost)
createElement('input', {
    type: 'text',
    onChange: (event) => {
        console.log('Input changed:', event.target.value);
        // Final value when user finishes typing
    }
});

// Multiple input events
createElement('input', {
    type: 'email',
    onInput: (event) => {
        // Real-time validation
        validateEmail(event.target.value);
    },
    onFocus: (event) => {
        console.log('Input focused');
    },
    onBlur: (event) => {
        console.log('Input lost focus');
        // Final validation
    }
});
```

### Keyboard Events
```javascript
// Key press detection
createElement('input', {
    type: 'text',
    onKeyDown: (event) => {
        if (event.key === 'Enter') {
            console.log('Enter pressed!');
            submitForm();
        }
        if (event.key === 'Escape') {
            console.log('Escape pressed!');
            cancelAction();
        }
    }
});

// Key combinations
createElement('input', {
    onKeyDown: (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            console.log('Ctrl+S pressed - Save!');
            saveDocument();
        }
        if (event.shiftKey && event.key === 'Enter') {
            console.log('Shift+Enter - New line');
        }
    }
});

// Keyup events
createElement('input', {
    onKeyUp: (event) => {
        console.log('Key released:', event.key);
    }
});
```

### Mouse Events
```javascript
// Mouse interactions
createElement('div', {
    className: 'interactive-box',
    onMouseOver: () => {
        console.log('Mouse entered');
    },
    onMouseOut: () => {
        console.log('Mouse left');
    },
    onMouseDown: () => {
        console.log('Mouse button pressed');
    },
    onMouseUp: () => {
        console.log('Mouse button released');
    }
}, 'Hover over me');

// Double-click events
createElement('div', {
    onDoubleClick: () => {
        console.log('Double-clicked!');
        editItem();
    }
}, 'Double-click to edit');

// Context menu (right-click)
createElement('div', {
    onContextMenu: (event) => {
        event.preventDefault();
        console.log('Right-clicked!');
        showContextMenu(event.clientX, event.clientY);
    }
}, 'Right-click me');
```

### Form Events
```javascript
// Form submission
createElement('form', {
    onSubmit: (event) => {
        event.preventDefault(); // Prevent page reload
        console.log('Form submitted');
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        console.log('Form data:', data);
        
        submitFormData(data);
    }
},
    createElement('input', { name: 'username', type: 'text' }),
    createElement('input', { name: 'password', type: 'password' }),
    createElement('button', { type: 'submit' }, 'Login')
);

// Checkbox change
createElement('input', {
    type: 'checkbox',
    onChange: (event) => {
        console.log('Checkbox checked:', event.target.checked);
        updateSettings(event.target.checked);
    }
});

// Select dropdown change
createElement('select', {
    onChange: (event) => {
        console.log('Selected:', event.target.value);
        filterItems(event.target.value);
    }
},
    createElement('option', { value: 'all' }, 'All Items'),
    createElement('option', { value: 'active' }, 'Active'),
    createElement('option', { value: 'completed' }, 'Completed')
);
```

## 🏗️ Real-World Examples

### Interactive Button with State
```javascript
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';

const isLoading = createState(false);
const message = createState('');

function handleAsyncAction() {
    isLoading.value = true;
    message.value = 'Loading...';
    
    // Simulate API call
    setTimeout(() => {
        isLoading.value = false;
        message.value = 'Action completed!';
    }, 2000);
}

function renderApp() {
    const app = createElement('div', {},
        createElement('button', {
            onClick: handleAsyncAction,
            disabled: isLoading.value,
            className: isLoading.value ? 'loading' : ''
        }, isLoading.value ? 'Loading...' : 'Click Me'),
        
        createElement('p', {}, message.value)
    );
    
    render(app, document.getElementById('app'));
}

isLoading.subscribe(renderApp);
message.subscribe(renderApp);
renderApp();
```

### Form with Validation
```javascript
const formData = createState({
    email: '',
    password: '',
    confirmPassword: ''
});

const errors = createState({
    email: '',
    password: '',
    confirmPassword: ''
});

function validateEmail(email) {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    return '';
}

function validatePassword(password) {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
}

function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
}

function renderForm() {
    const app = createElement('form', {
        onSubmit: (event) => {
            event.preventDefault();
            
            // Validate all fields
            const emailError = validateEmail(formData.value.email);
            const passwordError = validatePassword(formData.value.password);
            const confirmError = validateConfirmPassword(
                formData.value.password, 
                formData.value.confirmPassword
            );
            
            errors.value = {
                email: emailError,
                password: passwordError,
                confirmPassword: confirmError
            };
            
            // Submit if no errors
            if (!emailError && !passwordError && !confirmError) {
                console.log('Form is valid!', formData.value);
                alert('Registration successful!');
            }
        }
    },
        createElement('div', { className: 'field' },
            createElement('label', {}, 'Email:'),
            createElement('input', {
                type: 'email',
                value: formData.value.email,
                onInput: (event) => {
                    formData.value = {
                        ...formData.value,
                        email: event.target.value
                    };
                    
                    // Real-time validation
                    errors.value = {
                        ...errors.value,
                        email: validateEmail(event.target.value)
                    };
                }
            }),
            errors.value.email ? 
                createElement('span', { className: 'error' }, errors.value.email) : 
                null
        ),
        
        createElement('div', { className: 'field' },
            createElement('label', {}, 'Password:'),
            createElement('input', {
                type: 'password',
                value: formData.value.password,
                onInput: (event) => {
                    formData.value = {
                        ...formData.value,
                        password: event.target.value
                    };
                    
                    errors.value = {
                        ...errors.value,
                        password: validatePassword(event.target.value)
                    };
                }
            }),
            errors.value.password ? 
                createElement('span', { className: 'error' }, errors.value.password) : 
                null
        ),
        
        createElement('div', { className: 'field' },
            createElement('label', {}, 'Confirm Password:'),
            createElement('input', {
                type: 'password',
                value: formData.value.confirmPassword,
                onInput: (event) => {
                    formData.value = {
                        ...formData.value,
                        confirmPassword: event.target.value
                    };
                    
                    errors.value = {
                        ...errors.value,
                        confirmPassword: validateConfirmPassword(
                            formData.value.password,
                            event.target.value
                        )
                    };
                }
            }),
            errors.value.confirmPassword ? 
                createElement('span', { className: 'error' }, errors.value.confirmPassword) : 
                null
        ),
        
        createElement('button', { type: 'submit' }, 'Register')
    );
    
    render(app, document.getElementById('app'));
}

formData.subscribe(renderForm);
errors.subscribe(renderForm);
renderForm();
```

### Dynamic List with Event Delegation
```javascript
const items = createState([
    { id: 1, name: 'Item 1', selected: false },
    { id: 2, name: 'Item 2', selected: false },
    { id: 3, name: 'Item 3', selected: false }
]);

function toggleItem(id) {
    items.value = items.value.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
    );
}

function deleteItem(id) {
    items.value = items.value.filter(item => item.id !== id);
}

function addItem() {
    const newId = Math.max(...items.value.map(i => i.id)) + 1;
    items.value = [...items.value, {
        id: newId,
        name: `Item ${newId}`,
        selected: false
    }];
}

function renderList() {
    const app = createElement('div', {},
        createElement('button', {
            onClick: addItem
        }, 'Add Item'),
        
        createElement('ul', { className: 'item-list' },
            ...items.value.map(item =>
                createElement('li', {
                    key: item.id,
                    className: item.selected ? 'selected' : ''
                },
                    createElement('span', {
                        onClick: () => toggleItem(item.id),
                        className: 'item-name'
                    }, item.name),
                    
                    createElement('button', {
                        onClick: () => deleteItem(item.id),
                        className: 'delete-btn'
                    }, 'Delete')
                )
            )
        ),
        
        createElement('p', {}, 
            `Selected: ${items.value.filter(i => i.selected).length} of ${items.value.length}`
        )
    );
    
    render(app, document.getElementById('app'));
}

items.subscribe(renderList);
renderList();
```

### Keyboard Navigation
```javascript
const currentIndex = createState(0);
const menuItems = createState([
    'Home',
    'About',
    'Services',
    'Contact'
]);

function renderMenu() {
    const app = createElement('div', {
        className: 'menu-container',
        tabIndex: 0, // Make focusable
        onKeyDown: (event) => {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    currentIndex.value = Math.min(
                        currentIndex.value + 1,
                        menuItems.value.length - 1
                    );
                    break;
                    
                case 'ArrowUp':
                    event.preventDefault();
                    currentIndex.value = Math.max(currentIndex.value - 1, 0);
                    break;
                    
                case 'Enter':
                    event.preventDefault();
                    console.log('Selected:', menuItems.value[currentIndex.value]);
                    alert(`You selected: ${menuItems.value[currentIndex.value]}`);
                    break;
                    
                case 'Escape':
                    currentIndex.value = 0;
                    break;
            }
        }
    },
        createElement('h2', {}, 'Use arrow keys to navigate, Enter to select'),
        
        createElement('ul', { className: 'menu' },
            ...menuItems.value.map((item, index) =>
                createElement('li', {
                    key: index,
                    className: index === currentIndex.value ? 'active' : '',
                    onClick: () => {
                        currentIndex.value = index;
                        console.log('Clicked:', item);
                    }
                }, item)
            )
        )
    );
    
    render(app, document.getElementById('app'));
    
    // Auto-focus for keyboard navigation
    setTimeout(() => {
        document.querySelector('.menu-container').focus();
    }, 100);
}

currentIndex.subscribe(renderMenu);
renderMenu();
```

## 🎯 Event System Features

### Event Object Properties
```javascript
createElement('button', {
    onClick: (event) => {
        console.log('Event type:', event.type); // 'click'
        console.log('Target element:', event.target);
        console.log('Current target:', event.currentTarget);
        console.log('Mouse position:', event.clientX, event.clientY);
        console.log('Keyboard modifiers:', {
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey
        });
        
        // Prevent default browser behavior
        event.preventDefault();
        
        // Stop event from bubbling up
        event.stopPropagation();
    }
}, 'Analyze Event');
```

### All Supported Events
```javascript
// Mouse Events
onClick, onDoubleClick, onMouseDown, onMouseUp, onMouseOver, onMouseOut,
onMouseMove, onMouseEnter, onMouseLeave, onContextMenu

// Keyboard Events  
onKeyDown, onKeyUp, onKeyPress

// Form Events
onSubmit, onChange, onInput, onFocus, onBlur, onSelect, onReset

// Touch Events (mobile)
onTouchStart, onTouchMove, onTouchEnd, onTouchCancel

// Drag Events
onDrag, onDragStart, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop

// Window Events
onLoad, onUnload, onResize, onScroll

// Media Events
onPlay, onPause, onEnded, onLoadStart, onLoadEnd
```

### Event Delegation
The framework automatically uses event delegation, which means:
- ✅ **Efficient** - One listener per event type, not per element
- ✅ **Dynamic** - Works with elements added/removed dynamically  
- ✅ **Memory-safe** - No orphaned event listeners

## 🎯 Best Practices

### 1. **Use Descriptive Handler Names**
```javascript
// ✅ Good - Clear function names
function handleLoginSubmit(event) { /* ... */ }
function handlePasswordToggle() { /* ... */ }
function handleItemDelete(itemId) { /* ... */ }

// ❌ Avoid - Generic names
function handleClick() { /* ... */ }
function handleEvent() { /* ... */ }
```

### 2. **Prevent Default When Needed**
```javascript
// Forms - prevent page reload
createElement('form', {
    onSubmit: (event) => {
        event.preventDefault();
        // Handle form data
    }
});

// Links - prevent navigation
createElement('a', {
    href: '#',
    onClick: (event) => {
        event.preventDefault();
        // Custom navigation logic
    }
});
```

### 3. **Separate Event Logic**
```javascript
// ✅ Good - Separate functions
function handleUserLogin(userData) {
    // Login logic here
}

createElement('button', {
    onClick: () => handleUserLogin(currentUser)
}, 'Login');

// ❌ Avoid - Inline complex logic
createElement('button', {
    onClick: (event) => {
        // 50 lines of logic here...
    }
}, 'Login');
```

### 4. **Use State for Dynamic Behavior**
```javascript
const isDisabled = createState(false);

createElement('button', {
    onClick: isDisabled.value ? null : handleClick,
    disabled: isDisabled.value,
    className: isDisabled.value ? 'disabled' : 'enabled'
}, 'Click Me');
```

## 🔧 Internal Architecture

### How Events Work
1. **createElement()** detects event props (starting with 'on')
2. **Event mapping** converts camelCase to DOM events (onClick → click)
3. **Event delegation** attaches listeners to document root
4. **Event routing** calls your handlers when events bubble up

### Why Event Props?
- **Declarative** - Events are part of element definition
- **Automatic cleanup** - Framework manages listener lifecycle
- **Type safety** - IDE can autocomplete event names
- **Consistent API** - Same pattern for all event types

### Performance Benefits
- **Event delegation** - Only one listener per event type
- **Automatic cleanup** - No memory leaks
- **Efficient updates** - Re-uses existing listeners

---

**Master the event system to build truly interactive applications that respond naturally to user input!** 🎮
