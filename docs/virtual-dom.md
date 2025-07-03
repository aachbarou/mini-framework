# Virtual DOM Module

The Virtual DOM module provides efficient DOM manipulation through virtual representation of elements. Instead of directly manipulating the DOM, you create virtual elements that the framework converts to real DOM elements.

## Overview

The Virtual DOM system in RichFramework:
- Creates virtual representations of DOM elements
- Efficiently converts virtual elements to real DOM
- Handles event binding automatically
- Supports all HTML attributes and properties
- Provides a clean API for element creation

## Key Functions

### `createElement(tag, attributes, ...children)`

Creates a virtual DOM element that can be rendered to the real DOM.

**Parameters:**
- `tag` (string): HTML tag name (e.g., 'div', 'button', 'input')
- `attributes` (object): Element attributes and properties
- `children` (...any): Child elements or text content

**Returns:** Virtual DOM element object

## Basic Usage

### Creating Simple Elements

```javascript
import { createElement, render } from '../Core/virtual-dom.js';

// Simple text element
const heading = createElement('h1', {}, 'Hello World');

// Element with attributes
const button = createElement('button', {
    className: 'btn primary',
    id: 'submit-btn'
}, 'Click Me');

// Self-closing element
const input = createElement('input', {
    type: 'text',
    placeholder: 'Enter text here'
});
```

### Adding Attributes

```javascript
// CSS classes
createElement('div', {
    className: 'container fluid'
});

// IDs and data attributes
createElement('article', {
    id: 'main-article',
    'data-id': '123',
    'data-category': 'technology'
});

// Form attributes
createElement('input', {
    type: 'email',
    required: true,
    placeholder: 'user@example.com',
    value: 'john@example.com'
});

// Style attribute
createElement('div', {
    style: 'color: red; font-size: 16px;'
});
```

### Nested Elements

```javascript
// Container with multiple children
const app = createElement('div', { className: 'app' },
    createElement('header', {},
        createElement('h1', {}, 'My Application'),
        createElement('nav', {},
            createElement('a', { href: '#home' }, 'Home'),
            createElement('a', { href: '#about' }, 'About')
        )
    ),
    createElement('main', {},
        createElement('p', {}, 'Welcome to my app!'),
        createElement('button', {}, 'Get Started')
    )
);
```

### Lists and Dynamic Content

```javascript
// Creating lists
const items = ['Apple', 'Banana', 'Cherry'];

const list = createElement('ul', { className: 'fruit-list' },
    ...items.map(item => 
        createElement('li', { key: item }, item)
    )
);

// Dynamic content based on data
const todos = [
    { id: 1, text: 'Learn JavaScript', completed: false },
    { id: 2, text: 'Build an app', completed: true }
];

const todoList = createElement('div', {},
    ...todos.map(todo =>
        createElement('div', {
            className: todo.completed ? 'todo completed' : 'todo',
            'data-id': todo.id
        },
            createElement('span', {}, todo.text)
        )
    )
);
```

## Event Handling

### Basic Event Handlers

```javascript
// Click events
createElement('button', {
    onClick: (event) => {
        console.log('Button clicked!');
        console.log('Event:', event);
    }
}, 'Click Me');

// Input events
createElement('input', {
    onInput: (event) => {
        console.log('Input value:', event.target.value);
    },
    onChange: (event) => {
        console.log('Input changed:', event.target.value);
    }
});
```

### Supported Event Types

```javascript
// Mouse events
createElement('div', {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onMouseOver: handleMouseOver,
    onMouseOut: handleMouseOut
});

// Form events
createElement('form', {
    onSubmit: handleSubmit
},
    createElement('input', {
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp
    })
);

// Custom events
createElement('div', {
    onCustomEvent: handleCustomEvent
});
```

### Event Handler Patterns

```javascript
// Event handler with state update
import { createState } from '../Core/state.js';

const count = createState(0);

const counter = createElement('div', {},
    createElement('span', {}, `Count: ${count.value}`),
    createElement('button', {
        onClick: () => count.value++
    }, '+1'),
    createElement('button', {
        onClick: () => count.value--
    }, '-1')
);

// Event handler with form data
const form = createElement('form', {
    onSubmit: (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        console.log('Form submitted with name:', name);
    }
},
    createElement('input', {
        name: 'name',
        type: 'text',
        required: true
    }),
    createElement('button', { type: 'submit' }, 'Submit')
);
```

## Rendering to DOM

### `render(element, container)`

Renders a virtual DOM element to a real DOM container.

```javascript
// Render single element
const app = createElement('div', {}, 'Hello World');
render(app, document.getElementById('root'));

// Render complex structure
const todoApp = createElement('div', { className: 'todo-app' },
    createElement('h1', {}, 'Todo List'),
    createElement('input', { 
        type: 'text', 
        placeholder: 'Add new todo' 
    }),
    createElement('ul', { className: 'todo-list' })
);

render(todoApp, document.getElementById('app'));
```

## Advanced Patterns

### Conditional Rendering

```javascript
const isLoggedIn = true;
const user = { name: 'John Doe' };

const header = createElement('header', {},
    createElement('h1', {}, 'My App'),
    isLoggedIn 
        ? createElement('div', { className: 'user-info' },
            createElement('span', {}, `Welcome, ${user.name}`),
            createElement('button', {}, 'Logout')
          )
        : createElement('div', { className: 'auth-buttons' },
            createElement('button', {}, 'Login'),
            createElement('button', {}, 'Sign Up')
          )
);
```

### Component Pattern

```javascript
// Reusable component function
function createButton(text, onClick, className = 'btn') {
    return createElement('button', {
        className,
        onClick
    }, text);
}

// Usage
const saveButton = createButton('Save', () => console.log('Saved!'), 'btn primary');
const cancelButton = createButton('Cancel', () => console.log('Cancelled!'), 'btn secondary');

const buttonGroup = createElement('div', { className: 'button-group' },
    saveButton,
    cancelButton
);
```

### Data Binding with State

```javascript
import { createState } from '../Core/state.js';

const name = createState('John');
const email = createState('john@example.com');

function createUserForm() {
    return createElement('form', {},
        createElement('input', {
            type: 'text',
            value: name.value,
            onInput: (e) => name.value = e.target.value
        }),
        createElement('input', {
            type: 'email',
            value: email.value,
            onInput: (e) => email.value = e.target.value
        }),
        createElement('p', {}, `Hello ${name.value}, your email is ${email.value}`)
    );
}

// Re-render when state changes
name.subscribe(() => {
    render(createUserForm(), document.getElementById('app'));
});

email.subscribe(() => {
    render(createUserForm(), document.getElementById('app'));
});
```

## Best Practices

### 1. Use Semantic HTML

```javascript
// Good: Use appropriate HTML elements
createElement('article', {},
    createElement('header', {},
        createElement('h1', {}, 'Article Title')
    ),
    createElement('section', {},
        createElement('p', {}, 'Article content...')
    )
);

// Avoid: Generic divs everywhere
createElement('div', {},
    createElement('div', {},
        createElement('div', {}, 'Article Title')
    )
);
```

### 2. Group Related Attributes

```javascript
// Good: Logical attribute grouping
createElement('input', {
    // Identity
    id: 'email-input',
    name: 'email',
    
    // Type and validation
    type: 'email',
    required: true,
    
    // User experience
    placeholder: 'Enter your email',
    autoComplete: 'email',
    
    // Styling
    className: 'form-input',
    
    // Events
    onInput: handleEmailInput,
    onBlur: validateEmail
});
```

### 3. Extract Complex Elements

```javascript
// Extract complex structures into functions
function createNavigation(links) {
    return createElement('nav', { className: 'main-nav' },
        createElement('ul', {},
            ...links.map(link =>
                createElement('li', {},
                    createElement('a', {
                        href: link.url,
                        className: link.active ? 'active' : ''
                    }, link.text)
                )
            )
        )
    );
}

// Usage
const nav = createNavigation([
    { url: '#home', text: 'Home', active: true },
    { url: '#about', text: 'About', active: false }
]);
```

### 4. Handle Events Properly

```javascript
// Good: Prevent default when needed
createElement('form', {
    onSubmit: (event) => {
        event.preventDefault();
        // Handle form submission
    }
});

// Good: Use event delegation for dynamic content
createElement('ul', {
    onClick: (event) => {
        if (event.target.matches('.delete-btn')) {
            // Handle delete
        }
    }
});
```

## Performance Tips

### 1. Minimize Re-renders

```javascript
// Cache elements that don't change
const staticHeader = createElement('header', {},
    createElement('h1', {}, 'My App')
);

// Only re-render dynamic parts
function renderApp(todos) {
    return createElement('div', {},
        staticHeader, // Reuse cached element
        createTodoList(todos) // Only this part changes
    );
}
```

### 2. Use Keys for Lists

```javascript
// Good: Use unique keys for list items
const todoItems = todos.map(todo =>
    createElement('li', {
        key: todo.id,  // Unique key
        'data-id': todo.id
    }, todo.text)
);
```

### 3. Avoid Inline Functions in Attributes

```javascript
// Avoid: Creates new function on every render
createElement('button', {
    onClick: () => console.log('clicked')
});

// Better: Use reference to stable function
const handleClick = () => console.log('clicked');
createElement('button', {
    onClick: handleClick
});
```

## Integration with Other Modules

### With State Management

```javascript
import { createState } from '../Core/state.js';
import { createElement, render } from '../Core/virtual-dom.js';

const todos = createState([]);

function renderTodos() {
    const app = createElement('div', {},
        ...todos.value.map(todo =>
            createElement('div', { key: todo.id }, todo.text)
        )
    );
    render(app, document.getElementById('app'));
}

// Re-render when state changes
todos.subscribe(renderTodos);
```

### With Event System

```javascript
import { EventBus } from '../Core/events.js';
import { createElement } from '../Core/virtual-dom.js';

const eventBus = new EventBus();

const button = createElement('button', {
    onClick: () => eventBus.emit('button-clicked', { timestamp: Date.now() })
}, 'Click Me');

// Listen for custom events
eventBus.on('button-clicked', (data) => {
    console.log('Button clicked at:', data.timestamp);
});
```

### With Router

```javascript
import { getCurrentRoute } from '../Core/router.js';
import { createElement } from '../Core/virtual-dom.js';

function renderPage() {
    const route = getCurrentRoute();
    
    if (route === '/home') {
        return createElement('div', {}, 'Home Page');
    } else if (route === '/about') {
        return createElement('div', {}, 'About Page');
    } else {
        return createElement('div', {}, '404 - Page Not Found');
    }
}
```

## Why Virtual DOM?

### Performance Benefits

1. **Batched Updates**: Multiple changes are batched together
2. **Efficient Diffing**: Only changed elements are updated
3. **Reduced Reflows**: Minimizes expensive DOM operations

### Developer Experience

1. **Declarative**: Describe what you want, not how to achieve it
2. **Composable**: Build complex UIs from simple components
3. **Predictable**: Same input always produces same output

### Example: Direct DOM vs Virtual DOM

```javascript
// Direct DOM manipulation (imperative)
const button = document.createElement('button');
button.textContent = 'Click Me';
button.className = 'btn primary';
button.addEventListener('click', handleClick);
document.getElementById('app').appendChild(button);

// Virtual DOM (declarative)
const button = createElement('button', {
    className: 'btn primary',
    onClick: handleClick
}, 'Click Me');
render(button, document.getElementById('app'));
```

The Virtual DOM approach is more declarative, easier to test, and provides better performance for complex applications.