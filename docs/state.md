# 🔄 State Management Documentation

> Reactive data that automatically updates your UI

## 📖 Overview

RichFramework's state management system provides reactive data - when your data changes, your UI automatically updates. No manual DOM manipulation needed!

**Key Benefits:**
- ✅ Automatic UI updates when data changes
- ✅ Simple Observer pattern implementation
- ✅ No complex state mutations
- ✅ Easy to understand and debug

## 🏗️ How It Works

```javascript
// Create reactive state
const counter = RichFramework.createState(0);

// Subscribe to changes
counter.subscribe((newValue) => {
    console.log('Counter changed to:', newValue);
    updateUI(); // Automatically called when counter changes
});

// Change the state - UI updates automatically!
counter.value = 5; // Triggers all subscribers
```

## 🚀 Basic Usage

### Creating State
```javascript
// Simple values
const name = RichFramework.createState('John');
const age = RichFramework.createState(25);
const isLoggedIn = RichFramework.createState(false);

// Arrays
const todos = RichFramework.createState([]);
const users = RichFramework.createState([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
]);

// Objects
const user = RichFramework.createState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
});
```

### Reading State
```javascript
const counter = RichFramework.createState(10);

// Get current value
console.log(counter.value); // 10

// Use in functions
function getDoubledCounter() {
    return counter.value * 2;
}
```

### Updating State
```javascript
const counter = RichFramework.createState(0);

// Direct assignment
counter.value = 5;

// Based on previous value
counter.value = counter.value + 1;

// With arrays
const todos = RichFramework.createState([]);
todos.value = [...todos.value, { id: 1, text: 'New todo' }];

// With objects
const user = RichFramework.createState({ name: 'John', age: 25 });
user.value = { ...user.value, age: 26 };
```

## 🎯 Reactive UI Updates

### Basic Example
```javascript
RichFramework.ready(function() {
    // Create state
    const message = RichFramework.createState('Hello World!');
    
    // Render function
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, message.value),
            RichFramework.createElement('button', {
                onClick: () => {
                    message.value = 'Button clicked!'; // UI updates automatically
                }
            }, 'Change Message')
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // Subscribe to state changes
    message.subscribe(renderApp);
    
    // Initial render
    renderApp();
});
```

### Counter Example
```javascript
RichFramework.ready(function() {
    const counter = RichFramework.createState(0);
    
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h2', {}, `Count: ${counter.value}`),
            RichFramework.createElement('button', {
                onClick: () => counter.value++
            }, '+1'),
            RichFramework.createElement('button', {
                onClick: () => counter.value--
            }, '-1'),
            RichFramework.createElement('button', {
                onClick: () => counter.value = 0
            }, 'Reset')
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    counter.subscribe(renderApp);
    renderApp();
});
```

## 📋 Working with Arrays

### Array Helper Methods
```javascript
const todos = RichFramework.createState([]);

// Add to end
todos.push({ id: 1, text: 'Learn JavaScript', done: false });

// Add to beginning
todos.unshift({ id: 2, text: 'Review code', done: false });

// Remove by index
todos.remove(0); // Removes first item

// These methods automatically trigger UI updates!
```

### Manual Array Updates
```javascript
const todos = RichFramework.createState([
    { id: 1, text: 'First todo', done: false }
]);

// Add new todo
todos.value = [...todos.value, { id: 2, text: 'Second todo', done: false }];

// Update specific todo
todos.value = todos.value.map(todo =>
    todo.id === 1 ? { ...todo, done: true } : todo
);

// Filter todos
todos.value = todos.value.filter(todo => !todo.done);

// Sort todos
todos.value = todos.value.sort((a, b) => a.text.localeCompare(b.text));
```

### Todo List Example
```javascript
RichFramework.ready(function() {
    const todos = RichFramework.createState([]);
    let nextId = 1;
    
    function addTodo(text) {
        todos.unshift({
            id: nextId++,
            text: text.trim(),
            done: false
        });
    }
    
    function toggleTodo(id) {
        todos.value = todos.value.map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
        );
    }
    
    function deleteTodo(id) {
        todos.value = todos.value.filter(todo => todo.id !== id);
    }
    
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, 'Todo List'),
            
            // Input for new todos
            RichFramework.createElement('input', {
                placeholder: 'Add new todo...',
                onKeydown: (event) => {
                    if (event.originalEvent.key === 'Enter') {
                        addTodo(event.target.value);
                        event.target.value = '';
                    }
                }
            }),
            
            // Todo list
            RichFramework.createElement('ul', {},
                ...todos.value.map(todo =>
                    RichFramework.createElement('li', {
                        'data-id': todo.id,
                        className: todo.done ? 'completed' : ''
                    },
                        RichFramework.createElement('input', {
                            type: 'checkbox',
                            checked: todo.done,
                            onChange: () => toggleTodo(todo.id)
                        }),
                        RichFramework.createElement('span', {}, todo.text),
                        RichFramework.createElement('button', {
                            onClick: () => deleteTodo(todo.id)
                        }, 'Delete')
                    )
                )
            )
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    todos.subscribe(renderApp);
    renderApp();
});
```

## 🏢 Working with Objects

### User Profile Example
```javascript
const user = RichFramework.createState({
    name: '',
    email: '',
    age: 0,
    preferences: {
        theme: 'light',
        notifications: true
    }
});

function updateProfile(updates) {
    user.value = { ...user.value, ...updates };
}

function updatePreferences(prefUpdates) {
    user.value = {
        ...user.value,
        preferences: { ...user.value.preferences, ...prefUpdates }
    };
}

// Usage
updateProfile({ name: 'John Doe', age: 30 });
updatePreferences({ theme: 'dark' });
```

### Form Example
```javascript
RichFramework.ready(function() {
    const formData = RichFramework.createState({
        username: '',
        email: '',
        password: ''
    });
    
    function updateField(field, value) {
        formData.value = { ...formData.value, [field]: value };
    }
    
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h2', {}, 'Sign Up'),
            
            RichFramework.createElement('form', {
                onSubmit: (event) => {
                    event.preventDefault();
                    console.log('Form submitted:', formData.value);
                }
            },
                RichFramework.createElement('input', {
                    type: 'text',
                    placeholder: 'Username',
                    value: formData.value.username,
                    onInput: (e) => updateField('username', e.target.value)
                }),
                
                RichFramework.createElement('input', {
                    type: 'email',
                    placeholder: 'Email',
                    value: formData.value.email,
                    onInput: (e) => updateField('email', e.target.value)
                }),
                
                RichFramework.createElement('input', {
                    type: 'password',
                    placeholder: 'Password',
                    value: formData.value.password,
                    onInput: (e) => updateField('password', e.target.value)
                }),
                
                RichFramework.createElement('button', {
                    type: 'submit'
                }, 'Sign Up')
            ),
            
            // Preview
            RichFramework.createElement('div', {},
                RichFramework.createElement('h3', {}, 'Preview:'),
                RichFramework.createElement('p', {}, `Username: ${formData.value.username}`),
                RichFramework.createElement('p', {}, `Email: ${formData.value.email}`)
            )
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    formData.subscribe(renderApp);
    renderApp();
});
```

## 🔄 Multiple State Management

### Computed State
```javascript
const firstName = RichFramework.createState('John');
const lastName = RichFramework.createState('Doe');

function getFullName() {
    return `${firstName.value} ${lastName.value}`;
}

function renderApp() {
    const app = RichFramework.createElement('div', {},
        RichFramework.createElement('input', {
            placeholder: 'First Name',
            value: firstName.value,
            onInput: (e) => firstName.value = e.target.value
        }),
        RichFramework.createElement('input', {
            placeholder: 'Last Name',
            value: lastName.value,
            onInput: (e) => lastName.value = e.target.value
        }),
        RichFramework.createElement('h2', {}, `Hello, ${getFullName()}!`)
    );
    
    RichFramework.render(app, document.getElementById('app'));
}

// Subscribe to both states
firstName.subscribe(renderApp);
lastName.subscribe(renderApp);
```

### State Coordination
```javascript
const todos = RichFramework.createState([]);
const filter = RichFramework.createState('all'); // 'all', 'active', 'completed'

function getFilteredTodos() {
    if (filter.value === 'active') {
        return todos.value.filter(todo => !todo.done);
    } else if (filter.value === 'completed') {
        return todos.value.filter(todo => todo.done);
    }
    return todos.value; // 'all'
}

function renderApp() {
    const filteredTodos = getFilteredTodos();
    
    const app = RichFramework.createElement('div', {},
        // Filter buttons
        RichFramework.createElement('div', {},
            RichFramework.createElement('button', {
                className: filter.value === 'all' ? 'active' : '',
                onClick: () => filter.value = 'all'
            }, 'All'),
            RichFramework.createElement('button', {
                className: filter.value === 'active' ? 'active' : '',
                onClick: () => filter.value = 'active'
            }, 'Active'),
            RichFramework.createElement('button', {
                className: filter.value === 'completed' ? 'active' : '',
                onClick: () => filter.value = 'completed'
            }, 'Completed')
        ),
        
        // Filtered todo list
        RichFramework.createElement('ul', {},
            ...filteredTodos.map(todo =>
                RichFramework.createElement('li', {}, todo.text)
            )
        )
    );
    
    RichFramework.render(app, document.getElementById('app'));
}

// Both states trigger re-render
todos.subscribe(renderApp);
filter.subscribe(renderApp);
```

## 💡 Best Practices

### 1. Keep State Simple
```javascript
// ✅ Simple state structure
const user = RichFramework.createState({
    id: 1,
    name: 'John',
    email: 'john@example.com'
});

// ❌ Avoid deeply nested state
const app = RichFramework.createState({
    user: {
        profile: {
            personal: {
                details: {
                    name: 'John' // Too deep!
                }
            }
        }
    }
});
```

### 2. Use Immutable Updates
```javascript
// ✅ Immutable updates
const todos = RichFramework.createState([{ id: 1, text: 'Todo 1' }]);
todos.value = [...todos.value, { id: 2, text: 'Todo 2' }];

// ❌ Avoid mutating state directly
todos.value.push({ id: 2, text: 'Todo 2' }); // Won't trigger updates!
```

### 3. One State per Concern
```javascript
// ✅ Separate concerns
const todos = RichFramework.createState([]);
const filter = RichFramework.createState('all');
const user = RichFramework.createState(null);

// ❌ Don't mix unrelated data
const appState = RichFramework.createState({
    todos: [],
    filter: 'all',
    user: null,
    ui: {
        loading: false,
        error: null
    }
});
```

### 4. Use Helper Functions
```javascript
const todos = RichFramework.createState([]);

// ✅ Helper functions for common operations
function addTodo(text) {
    todos.unshift({
        id: Date.now(),
        text: text.trim(),
        done: false
    });
}

function toggleTodo(id) {
    todos.value = todos.value.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
    );
}

function deleteTodo(id) {
    todos.value = todos.value.filter(todo => todo.id !== id);
}
```

## 🎯 Why This Approach?

### 1. **Reactive Updates**
When state changes, all subscribers (usually your render function) are automatically called. No manual DOM manipulation needed.

### 2. **Predictable Data Flow**
- User action → State change → UI update
- Clear, linear flow that's easy to debug

### 3. **Simple Observer Pattern**
Based on the classic Observer pattern - when data changes, observers are notified.

### 4. **Framework Control**
The framework manages when UI updates happen, ensuring consistent behavior and preventing common bugs.

## 🔧 Implementation Details

Our State class works like this:

```javascript
class State {
    constructor(initialValue) {
        this._value = initialValue;
        this._listeners = []; // Functions to call when state changes
    }
    
    get value() {
        return this._value;
    }
    
    set value(newValue) {
        this._value = newValue;
        this._notifyAll(); // Tell all subscribers about the change
    }
    
    subscribe(callback) {
        this._listeners.push(callback);
    }
    
    _notifyAll() {
        this._listeners.forEach(callback => callback(this._value));
    }
}
```

This way:
- ✅ State changes are tracked automatically
- ✅ UI updates happen when needed
- ✅ Simple, predictable behavior

## 🎉 You're Ready!

With this state management system, you can build reactive applications where the UI automatically stays in sync with your data. No more manual DOM manipulation!

**Next**: Learn about [Virtual DOM](virtual-dom.md) to understand how RichFramework efficiently updates your UI.
