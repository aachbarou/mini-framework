# 🏗️ Virtual DOM - Pure ES6 Module

> Efficient DOM manipulation through JavaScript objects with pure ES6 imports

## 📖 Overview

The Virtual DOM module creates JavaScript objects that represent your HTML structure. Instead of directly manipulating the DOM (which is slow), you describe what you want using JavaScript, and the framework efficiently creates the real DOM elements.

**Key Benefits:**
- ✅ **Pure ES6 Module** - No global objects, clean imports
- ✅ **Faster than direct DOM** - Efficient element creation
- ✅ **Declarative** - Describe what you want, not how to build it
- ✅ **Automatic event handling** - Built-in event delegation
- ✅ **Modern syntax** - Clean, readable code structure

## 🚀 Import and Basic Usage

```javascript
import { createElement, render } from './Core/virtual-dom.js';

// Simple usage
const app = createElement('h1', {}, 'Hello World');
render(app, document.getElementById('root'));
```

## 🏗️ How It Works

```javascript
// ❌ Traditional DOM manipulation (slow and complex)
const div = document.createElement('div');
div.className = 'container';
const h1 = document.createElement('h1');
h1.textContent = 'Hello World';
div.appendChild(h1);
document.body.appendChild(div);

// ✅ Virtual DOM approach (fast and simple)
import { createElement, render } from './Core/virtual-dom.js';

const vdom = createElement('div', { className: 'container' },
    createElement('h1', {}, 'Hello World')
);
render(vdom, document.body);
```

## 🎯 Creating Elements

### Simple Elements
```javascript
import { createElement } from './Core/virtual-dom.js';

// Text element
createElement('h1', {}, 'Hello World')

// Element with attributes
createElement('div', {
    className: 'container',
    id: 'main-content'
}, 'Content here')

// Self-closing elements
createElement('img', {
    src: 'image.jpg',
    alt: 'Description'
})

createElement('input', {
    type: 'text',
    placeholder: 'Enter your name'
})
```

### Elements with Children
```javascript
// Single child
createElement('div', {},
    createElement('p', {}, 'Paragraph text')
)

// Multiple children
createElement('ul', {},
    createElement('li', {}, 'Item 1'),
    createElement('li', {}, 'Item 2'),
    createElement('li', {}, 'Item 3')
)

// Mixed content
createElement('div', {},
    createElement('h2', {}, 'Title'),
    'Some text content',
    createElement('p', {}, 'A paragraph'),
    createElement('button', {}, 'Click me')
)
```

## 🎨 Adding Attributes

### CSS Classes and IDs
```javascript
createElement('div', {
    className: 'card highlight',  // CSS classes
    id: 'user-card'              // Element ID
})
```

### Data Attributes
```javascript
createElement('li', {
    'data-id': '123',
    'data-category': 'electronics',
    'data-price': '99.99'
}, 'Product item')
```

### Form Attributes
```javascript
createElement('input', {
    type: 'email',
    placeholder: 'Enter email',
    value: 'john@example.com',
    required: true,
    disabled: false
})
```

## 🎪 Event Handling

### Click Events
```javascript
createElement('button', {
    onClick: (event) => {
        console.log('Button clicked!', event.target);
        alert('Hello!');
    }
}, 'Click Me')
```

### Input Events
```javascript
createElement('input', {
    type: 'text',
    onInput: (event) => {
        console.log('Input value:', event.target.value);
    },
    onBlur: (event) => {
        console.log('Input lost focus');
    }
})
```

### Double-click Events
```javascript
createElement('label', {
    onDoubleClick: () => {
        console.log('Double-clicked!');
    }
}, 'Double-click to edit')
```

## 🔧 Rendering

### Basic Rendering
```javascript
import { createElement, render } from './Core/virtual-dom.js';

const app = createElement('div', { className: 'app' },
    createElement('h1', {}, 'My Application'),
    createElement('p', {}, 'Welcome to the app!')
);

render(app, document.getElementById('root'));
```

## 🔍 Integration with State

```javascript
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';

const count = createState(0);

function renderApp() {
    const app = createElement('div', {},
        createElement('span', {}, `Count: ${count.value}`),
        createElement('button', {
            onClick: () => count.value++
        }, '+1')
    );
    render(app, document.getElementById('root'));
}

count.subscribe(renderApp);
renderApp();
```

---

**The Virtual DOM module provides the foundation for building dynamic, interactive user interfaces with pure ES6 modules and modern JavaScript patterns.**

#### Form Attributes
```javascript
RichFramework.createElement('input', {
    type: 'email',
    name: 'email',
    placeholder: 'Enter your email',
    required: true,
    value: 'user@example.com'
})

RichFramework.createElement('textarea', {
    name: 'message',
    rows: '4',
    cols: '50',
    placeholder: 'Enter your message...'
})
```

#### Special Attributes
```javascript
// HTML for attribute (use htmlFor)
RichFramework.createElement('label', {
    htmlFor: 'username'
}, 'Username:')

// Boolean attributes
RichFramework.createElement('input', {
    type: 'checkbox',
    checked: true,
    disabled: false,
    autofocus: true
})
```

## 🎮 Adding Events

Events are added as props starting with "on":

### Basic Events
```javascript
RichFramework.createElement('button', {
    onClick: (event) => {
        alert('Button clicked!');
    }
}, 'Click Me')

RichFramework.createElement('input', {
    onInput: (event) => {
        console.log('User typed:', event.target.value);
    }
})
```

### Event Object
All event handlers receive a consistent event object:

```javascript
RichFramework.createElement('button', {
    onClick: (event) => {
        console.log('Event type:', event.type);                    // 'click'
        console.log('Target element:', event.target);              // The button
        console.log('Current target:', event.currentTarget);       // Also the button
        console.log('Native event:', event.originalEvent);         // Original browser event
        
        // Standard event methods
        event.preventDefault();     // Prevent default behavior
        event.stopPropagation();   // Stop event bubbling
    }
}, 'Event Example')
```

### Form Events
```javascript
RichFramework.createElement('form', {
    onSubmit: (event) => {
        event.preventDefault(); // Prevent page reload
        
        const formData = new FormData(event.target);
        console.log('Form data:', Object.fromEntries(formData));
    }
},
    RichFramework.createElement('input', {
        name: 'username',
        type: 'text',
        onFocus: (event) => {
            event.target.style.borderColor = 'blue';
        },
        onBlur: (event) => {
            event.target.style.borderColor = '';
        }
    }),
    RichFramework.createElement('button', { type: 'submit' }, 'Submit')
)
```

### Keyboard Events
```javascript
RichFramework.createElement('input', {
    onKeydown: (event) => {
        const key = event.originalEvent.key;
        
        if (key === 'Enter') {
            console.log('Enter pressed!');
        } else if (key === 'Escape') {
            event.target.value = '';
        } else if (event.originalEvent.ctrlKey && key === 's') {
            event.preventDefault();
            console.log('Ctrl+S pressed!');
        }
    }
})
```

## 🔄 Nesting Elements

### Simple Nesting
```javascript
const header = RichFramework.createElement('header', {},
    RichFramework.createElement('nav', {},
        RichFramework.createElement('ul', {},
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', { href: '#home' }, 'Home')
            ),
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', { href: '#about' }, 'About')
            ),
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', { href: '#contact' }, 'Contact')
            )
        )
    )
);
```

### Dynamic Nesting with Arrays
```javascript
const menuItems = ['Home', 'About', 'Services', 'Contact'];

const navigation = RichFramework.createElement('nav', {},
    RichFramework.createElement('ul', {},
        ...menuItems.map(item =>
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', {
                    href: `#${item.toLowerCase()}`,
                    onClick: (event) => {
                        event.preventDefault();
                        navigateToSection(item.toLowerCase());
                    }
                }, item)
            )
        )
    )
);
```

### Conditional Nesting
```javascript
function createUserCard(user, isLoggedIn) {
    return RichFramework.createElement('div', { className: 'user-card' },
        RichFramework.createElement('h3', {}, user.name),
        RichFramework.createElement('p', {}, user.email),
        
        // Conditional elements
        isLoggedIn && RichFramework.createElement('button', {
            onClick: () => logout()
        }, 'Logout'),
        
        !isLoggedIn && RichFramework.createElement('button', {
            onClick: () => showLoginModal()
        }, 'Login')
    );
}
```

## 🎯 Practical Examples

### Card Component
```javascript
function createCard(title, content, actions = []) {
    return RichFramework.createElement('div', { className: 'card' },
        RichFramework.createElement('div', { className: 'card-header' },
            RichFramework.createElement('h3', {}, title)
        ),
        RichFramework.createElement('div', { className: 'card-body' },
            RichFramework.createElement('p', {}, content)
        ),
        actions.length > 0 && RichFramework.createElement('div', { className: 'card-footer' },
            ...actions.map(action =>
                RichFramework.createElement('button', {
                    onClick: action.handler,
                    className: action.className || ''
                }, action.text)
            )
        )
    );
}

// Usage
const userCard = createCard(
    'John Doe',
    'Software Developer with 5 years of experience.',
    [
        { text: 'Edit', handler: () => editUser(), className: 'btn-primary' },
        { text: 'Delete', handler: () => deleteUser(), className: 'btn-danger' }
    ]
);
```

### Dynamic List
```javascript
function createTodoList(todos) {
    return RichFramework.createElement('div', { className: 'todo-list' },
        RichFramework.createElement('h2', {}, `Todo List (${todos.length} items)`),
        
        todos.length === 0 
            ? RichFramework.createElement('p', { className: 'empty' }, 'No todos yet!')
            : RichFramework.createElement('ul', {},
                ...todos.map(todo =>
                    RichFramework.createElement('li', {
                        'data-id': todo.id,
                        className: `todo-item ${todo.done ? 'completed' : ''}`
                    },
                        RichFramework.createElement('input', {
                            type: 'checkbox',
                            checked: todo.done,
                            onChange: () => toggleTodo(todo.id)
                        }),
                        RichFramework.createElement('span', { 
                            className: 'todo-text',
                            onDblclick: () => editTodo(todo.id)
                        }, todo.text),
                        RichFramework.createElement('button', {
                            className: 'delete-btn',
                            onClick: () => deleteTodo(todo.id),
                            title: 'Delete todo'
                        }, '×')
                    )
                )
            )
    );
}
```

### Form Component
```javascript
function createSignupForm() {
    return RichFramework.createElement('form', {
        className: 'signup-form',
        onSubmit: (event) => {
            event.preventDefault();
            handleSignupSubmit(event);
        }
    },
        RichFramework.createElement('h2', {}, 'Sign Up'),
        
        RichFramework.createElement('div', { className: 'form-group' },
            RichFramework.createElement('label', { htmlFor: 'username' }, 'Username:'),
            RichFramework.createElement('input', {
                id: 'username',
                name: 'username',
                type: 'text',
                required: true,
                onInput: (event) => validateUsername(event.target.value)
            })
        ),
        
        RichFramework.createElement('div', { className: 'form-group' },
            RichFramework.createElement('label', { htmlFor: 'email' }, 'Email:'),
            RichFramework.createElement('input', {
                id: 'email',
                name: 'email',
                type: 'email',
                required: true,
                onInput: (event) => validateEmail(event.target.value)
            })
        ),
        
        RichFramework.createElement('div', { className: 'form-group' },
            RichFramework.createElement('label', { htmlFor: 'password' }, 'Password:'),
            RichFramework.createElement('input', {
                id: 'password',
                name: 'password',
                type: 'password',
                required: true,
                minlength: '6',
                onInput: (event) => validatePassword(event.target.value)
            })
        ),
        
        RichFramework.createElement('button', {
            type: 'submit',
            className: 'btn-primary'
        }, 'Sign Up')
    );
}
```

## 📱 Responsive Elements

### Conditional Styling
```javascript
function createResponsiveNav(isMobile) {
    return RichFramework.createElement('nav', {
        className: `navigation ${isMobile ? 'mobile' : 'desktop'}`
    },
        isMobile
            ? RichFramework.createElement('button', {
                className: 'menu-toggle',
                onClick: toggleMobileMenu
            }, '☰')
            : RichFramework.createElement('ul', { className: 'nav-links' },
                RichFramework.createElement('li', {},
                    RichFramework.createElement('a', { href: '#home' }, 'Home')
                ),
                RichFramework.createElement('li', {},
                    RichFramework.createElement('a', { href: '#about' }, 'About')
                )
            )
    );
}
```

## 🔄 Rendering Virtual DOM

### Basic Rendering
```javascript
// Create virtual DOM
const app = RichFramework.createElement('div', { id: 'app' },
    RichFramework.createElement('h1', {}, 'My App'),
    RichFramework.createElement('p', {}, 'Welcome to RichFramework!')
);

// Render to real DOM
RichFramework.render(app, document.getElementById('root'));
```

### Re-rendering
```javascript
function renderApp() {
    const app = RichFramework.createElement('div', {},
        RichFramework.createElement('h1', {}, `Counter: ${counter.value}`),
        RichFramework.createElement('button', {
            onClick: () => counter.value++
        }, 'Increment')
    );
    
    RichFramework.render(app, document.getElementById('app'));
}

// Re-render when state changes
counter.subscribe(renderApp);
```

## 💡 Best Practices

### 1. Keep Elements Simple
```javascript
// ✅ Simple, focused elements
RichFramework.createElement('button', {
    onClick: handleClick,
    className: 'primary-button'
}, 'Click Me')

// ❌ Avoid overly complex single elements
RichFramework.createElement('div', {
    className: 'complex-element',
    onClick: handleClick,
    onMouseOver: handleHover,
    onMouseOut: handleLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'data-complex': 'true'
    // ... too many props
})
```

### 2. Use Arrays for Dynamic Content
```javascript
// ✅ Use map for dynamic lists
const items = data.map(item =>
    RichFramework.createElement('li', { key: item.id }, item.name)
)

// ✅ Use spread operator to include arrays
RichFramework.createElement('ul', {}, ...items)
```

### 3. Extract Components
```javascript
// ✅ Create reusable component functions
function createButton(text, handler, className = '') {
    return RichFramework.createElement('button', {
        onClick: handler,
        className: `btn ${className}`
    }, text);
}

// ✅ Use components
const saveButton = createButton('Save', handleSave, 'btn-primary');
const cancelButton = createButton('Cancel', handleCancel, 'btn-secondary');
```

### 4. Handle Events Properly
```javascript
// ✅ Prevent default when needed
RichFramework.createElement('form', {
    onSubmit: (event) => {
        event.preventDefault(); // Always prevent default for forms
        handleSubmit(event);
    }
})

// ✅ Use event object properties
RichFramework.createElement('input', {
    onKeydown: (event) => {
        if (event.originalEvent.key === 'Enter') {
            handleEnter();
        }
    }
})
```

## 🎯 Why Virtual DOM?

### 1. **Performance**
Creating JavaScript objects is much faster than creating DOM elements. The framework only creates real DOM elements when needed.

### 2. **Declarative**
You describe what you want, not how to build it. The framework handles the implementation details.

### 3. **Consistency**
All elements are created the same way, whether they're simple text or complex nested structures.

### 4. **Event Integration**
Events are seamlessly integrated into the element creation process - no separate event binding needed.

## 🔧 Implementation Details

Virtual DOM elements are simple JavaScript objects:

```javascript
// This virtual element:
RichFramework.createElement('div', { className: 'container' }, 'Hello')

// Creates this object:
{
    tag: 'div',
    props: { className: 'container' },
    children: ['Hello']
}

// Which becomes this real DOM:
<div class="container">Hello</div>
```

The framework then converts these objects to real DOM elements when `render()` is called.

## 🎉 You're Ready!

With Virtual DOM, you can create complex UI structures declaratively and efficiently. The framework handles all the DOM manipulation for you!

**Next**: Learn about [Routing](routing.md) to add navigation to your single-page applications.
