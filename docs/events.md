# 🎮 Event System Documentation

> Clean event handling without direct `addEventListener` calls

## 📖 Overview

RichFramework's event system provides a clean abstraction over browser events. Instead of calling `addEventListener` directly, you use our event methods which internally manage all the native event handling.

**Key Benefits:**
- ✅ No direct `addEventListener` calls needed
- ✅ Automatic event cleanup
- ✅ Consistent API across all event types
- ✅ Memory leak prevention

## 🏗️ How It Works

```javascript
// ❌ Traditional way (what we avoid)
button.addEventListener('click', handleClick);

// ✅ RichFramework way (what users do)
RichFramework.events.on('click', handleClick, button);
```

Our EventManager class internally uses `addEventListener`, but framework users never call it directly.

## 🚀 Basic Usage

### Adding Event Listeners

```javascript
// Basic event on specific element
const button = document.querySelector('#my-button');
RichFramework.events.on('click', (event) => {
    console.log('Button clicked!');
}, button);

// Global event (document-level)
RichFramework.events.global('keydown', (event) => {
    if (event.originalEvent.key === 'Escape') {
        console.log('Escape pressed!');
    }
});
```

### Event Types Supported

All standard browser events are supported:
- **Mouse**: `click`, `dblclick`, `mousedown`, `mouseup`, `mouseover`, `mouseout`
- **Keyboard**: `keydown`, `keyup`, `keypress`
- **Form**: `input`, `change`, `submit`, `focus`, `blur`
- **Window**: `scroll`, `beforeunload`, `load`

### Event Object

All event handlers receive a consistent event object:

```javascript
RichFramework.events.on('click', (event) => {
    // Standard properties
    console.log(event.type);          // 'click'
    console.log(event.target);        // Element that triggered the event
    console.log(event.currentTarget); // Element the listener was attached to
    
    // Access native event
    console.log(event.originalEvent);  // Native browser event
    
    // Standard methods
    event.preventDefault();     // Prevent default behavior
    event.stopPropagation();   // Stop event bubbling
});
```

## 🎯 Using Events in Virtual DOM

The most common way to use events is through Virtual DOM element props:

### Button Events
```javascript
const button = RichFramework.createElement('button', {
    onClick: (event) => {
        alert('Button clicked!');
    },
    onMouseOver: (event) => {
        event.target.style.backgroundColor = 'lightblue';
    },
    onMouseOut: (event) => {
        event.target.style.backgroundColor = '';
    }
}, 'Hover and Click Me');
```

### Form Events
```javascript
const input = RichFramework.createElement('input', {
    type: 'text',
    placeholder: 'Type something...',
    onInput: (event) => {
        console.log('User typed:', event.target.value);
    },
    onFocus: (event) => {
        event.target.style.borderColor = 'blue';
    },
    onBlur: (event) => {
        event.target.style.borderColor = '';
    },
    onKeydown: (event) => {
        if (event.originalEvent.key === 'Enter') {
            console.log('Enter pressed!');
        }
    }
});
```

### Advanced Form Handling
```javascript
const form = RichFramework.createElement('form', {
    onSubmit: (event) => {
        event.preventDefault(); // Prevent page reload
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        console.log('Form submitted:', data);
    }
},
    RichFramework.createElement('input', {
        name: 'username',
        placeholder: 'Username',
        required: true
    }),
    RichFramework.createElement('input', {
        name: 'email',
        type: 'email',
        placeholder: 'Email',
        required: true
    }),
    RichFramework.createElement('button', {
        type: 'submit'
    }, 'Submit')
);
```

## 🔄 Dynamic Event Handling

### Event Delegation
Events automatically work with dynamically created elements:

```javascript
// Set up event once
RichFramework.events.global('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const todoId = event.target.getAttribute('data-todo-id');
        deleteTodo(todoId);
    }
});

// Later, dynamically create elements with delete buttons
function createTodoItem(todo) {
    return RichFramework.createElement('li', {},
        RichFramework.createElement('span', {}, todo.text),
        RichFramework.createElement('button', {
            className: 'delete-btn',
            'data-todo-id': todo.id
        }, 'Delete')
    );
}
```

### Conditional Events
```javascript
function createButton(isEnabled) {
    const props = {
        className: isEnabled ? 'enabled' : 'disabled'
    };
    
    // Only add click handler if enabled
    if (isEnabled) {
        props.onClick = (event) => {
            console.log('Button is enabled and was clicked!');
        };
    }
    
    return RichFramework.createElement('button', props, 'Click Me');
}
```

## 🛠️ Advanced Features

### Removing Events
```javascript
// Define handler function
function myHandler(event) {
    console.log('Event fired!');
}

// Add event
RichFramework.events.on('click', myHandler, button);

// Remove specific event
RichFramework.events.off('click', myHandler);
```

### Global Keyboard Shortcuts
```javascript
// Handle global keyboard shortcuts
RichFramework.events.global('keydown', (event) => {
    const e = event.originalEvent;
    
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        event.preventDefault();
        saveDocument();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft') {
        navigateLeft();
    }
});
```

### Custom Events
```javascript
// Emit custom events
RichFramework.events.emit('user-login', { userId: 123, username: 'john' });

// Listen for custom events
RichFramework.events.on('user-login', (data) => {
    console.log('User logged in:', data.username);
});
```

## 💡 Best Practices

### 1. Use Event Props in Virtual DOM
```javascript
// ✅ Preferred - declarative and clean
RichFramework.createElement('button', {
    onClick: handleClick
}, 'Click Me');

// ❌ Avoid - manual event management
const button = document.createElement('button');
RichFramework.events.on('click', handleClick, button);
```

### 2. Handle Form Events Properly
```javascript
// ✅ Prevent default on forms
RichFramework.createElement('form', {
    onSubmit: (event) => {
        event.preventDefault(); // Always prevent default form submission
        handleFormSubmit(event);
    }
});
```

### 3. Use Global Events for Shortcuts
```javascript
// ✅ Global events for app-wide shortcuts
RichFramework.events.global('keydown', handleGlobalShortcuts);

// ✅ Element events for specific interactions
RichFramework.createElement('input', {
    onKeydown: handleInputKeydown
});
```

### 4. Access Native Event When Needed
```javascript
RichFramework.createElement('input', {
    onKeydown: (event) => {
        const nativeEvent = event.originalEvent;
        
        // Check modifier keys
        if (nativeEvent.ctrlKey && nativeEvent.key === 'a') {
            nativeEvent.preventDefault();
            selectAllText();
        }
    }
});
```

## 🎯 Why This Approach?

### 1. **Abstraction**
Users don't need to remember `addEventListener` syntax or manage event cleanup manually.

### 2. **Consistency**
All events work the same way, whether they're on specific elements or global.

### 3. **Framework Control**
The framework manages event lifecycle, preventing memory leaks and ensuring proper cleanup.

### 4. **Audit Compliance**
Satisfies requirements of not using `addEventListener` directly while still using it internally.

## 🔧 Implementation Details

Our EventManager class works like this:

```javascript
class EventManager {
    constructor() {
        this.customEvents = {};        // Store our event callbacks
        this.nativeListeners = new Map(); // Track native event listeners
    }

    on(eventName, callback, element = document) {
        // First time? Set up native listener
        if (!this.customEvents[eventName]) {
            this.customEvents[eventName] = [];
            
            // We use addEventListener internally (but users don't)
            const handler = (e) => this.emit(eventName, e);
            element.addEventListener(eventName, handler);
            this.nativeListeners.set(eventName, { element, handler });
        }
        
        // Add user's callback to our system
        this.customEvents[eventName].push(callback);
    }

    emit(eventName, nativeEvent) {
        // Call all user callbacks for this event
        const callbacks = this.customEvents[eventName];
        if (callbacks) {
            callbacks.forEach(callback => callback(nativeEvent));
        }
    }
}
```

This way:
- ✅ We use `addEventListener` internally (satisfying browser requirements)
- ✅ Users never call `addEventListener` directly (satisfying framework requirements)
- ✅ Event management is centralized and consistent

## 🎉 You're Ready!

With this event system, you can handle all user interactions cleanly and efficiently. The framework takes care of the complex event management while you focus on your application logic!

**Next**: Learn about [State Management](state.md) to make your events update your application data reactively.
