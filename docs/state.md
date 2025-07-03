# 🔄 State Management - Pure ES6 Module

> Reactive data that automatically updates your UI when it changes

## 📖 Overview

The State Management module provides reactive data handling. When your state changes, your UI automatically updates without you having to manually manipulate the DOM. This is the core of what makes RichFramework feel "magical" - you just change data, and the UI updates itself.

**Key Benefits:**
- ✅ **Automatic UI Updates** - No manual DOM manipulation needed
- ✅ **Pure ES6 Module** - Clean imports, no global objects
- ✅ **Simple API** - Just `createState()`, `.value`, and `.subscribe()`
- ✅ **Performance** - Only re-renders when data actually changes
- ✅ **Type-safe** - Works with any JavaScript data type

## 🚀 Import and Basic Usage

```javascript
import { createState } from './Core/state.js';

// Create reactive state
const count = createState(0);

// Read the value
console.log(count.value); // 0

// Update the value (triggers subscribers)
count.value = 5;

// Subscribe to changes
count.subscribe((newValue) => {
    console.log('Count changed to:', newValue);
});
```

## 🎯 Creating State

### Simple Values
```javascript
import { createState } from './Core/state.js';

// Numbers
const counter = createState(0);
const price = createState(29.99);

// Strings
const username = createState('');
const message = createState('Hello World');

// Booleans
const isLoggedIn = createState(false);
const isDarkMode = createState(true);

// Objects
const user = createState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
});

// Arrays
const todos = createState([]);
const numbers = createState([1, 2, 3, 4, 5]);
```

### Complex Data Structures
```javascript
// Nested objects
const appState = createState({
    user: {
        id: null,
        profile: {
            name: '',
            avatar: null
        }
    },
    settings: {
        theme: 'light',
        notifications: true
    },
    data: {
        todos: [],
        categories: ['work', 'personal']
    }
});

// Arrays of objects
const todoList = createState([
    { id: 1, text: 'Learn RichFramework', done: false },
    { id: 2, text: 'Build an app', done: false },
    { id: 3, text: 'Deploy to production', done: false }
]);
```

## 🔄 Reading and Updating State

### Reading Values
```javascript
const name = createState('John');

// Always use .value to access the current state
console.log(name.value); // 'John'

// Use in conditions
if (name.value === 'John') {
    console.log('Hello John!');
}

// Use in calculations
const greeting = `Hello, ${name.value}!`;
```

### Updating Values
```javascript
const counter = createState(0);

// Direct assignment
counter.value = 10;

// Increment/decrement
counter.value++;
counter.value--;

// Mathematical operations
counter.value = counter.value * 2;
counter.value += 5;

// String concatenation
const message = createState('Hello');
message.value = message.value + ' World';
message.value += '!';
```

### Updating Objects (Immutable Pattern)
```javascript
const user = createState({
    id: 1,
    name: 'John',
    email: 'john@example.com'
});

// ✅ Good - Create new object (immutable)
user.value = {
    ...user.value,
    name: 'Jane'
};

// ✅ Good - Update nested property
user.value = {
    ...user.value,
    profile: {
        ...user.value.profile,
        avatar: 'new-avatar.jpg'
    }
};

// ❌ Avoid - Direct mutation (may not trigger updates)
user.value.name = 'Jane'; // Don't do this
```

### Updating Arrays (Immutable Pattern)
```javascript
const todos = createState([]);

// ✅ Good - Add item (immutable)
todos.value = [...todos.value, { id: 1, text: 'New todo', done: false }];

// ✅ Good - Remove item
todos.value = todos.value.filter(todo => todo.id !== 1);

// ✅ Good - Update item
todos.value = todos.value.map(todo => 
    todo.id === 1 ? { ...todo, done: true } : todo
);

// ✅ Good - Replace entire array
todos.value = [
    { id: 1, text: 'First todo', done: false },
    { id: 2, text: 'Second todo', done: true }
];

// ❌ Avoid - Direct mutation
todos.value.push(newTodo); // Don't do this
todos.value[0].done = true; // Don't do this
```

## 👂 Subscribing to Changes

### Basic Subscription
```javascript
const counter = createState(0);

// Subscribe to changes
counter.subscribe((newValue) => {
    console.log('Counter is now:', newValue);
    document.getElementById('display').textContent = newValue;
});

// Now when you change the value, the subscriber runs
counter.value = 5; // Logs: "Counter is now: 5"
counter.value = 10; // Logs: "Counter is now: 10"
```

### Multiple Subscribers
```javascript
const user = createState({ name: 'John', role: 'user' });

// First subscriber - updates UI
user.subscribe((newUser) => {
    document.getElementById('username').textContent = newUser.name;
    document.getElementById('role').textContent = newUser.role;
});

// Second subscriber - logs changes
user.subscribe((newUser) => {
    console.log('User updated:', newUser);
});

// Third subscriber - saves to localStorage
user.subscribe((newUser) => {
    localStorage.setItem('user', JSON.stringify(newUser));
});

// All three subscribers will run when you update
user.value = { ...user.value, name: 'Jane' };
```

### Integration with Virtual DOM
```javascript
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';

const todos = createState([]);

function renderApp() {
    const app = createElement('div', {},
        createElement('h1', {}, 'Todo List'),
        createElement('ul', {},
            ...todos.value.map(todo =>
                createElement('li', { 
                    key: todo.id,
                    className: todo.done ? 'completed' : ''
                }, todo.text)
            )
        )
    );
    
    render(app, document.getElementById('app'));
}

// Subscribe to automatically re-render when todos change
todos.subscribe(renderApp);

// Initial render
renderApp();

// Now when you add todos, the UI automatically updates
todos.value = [...todos.value, { id: 1, text: 'Learn state management', done: false }];
```

## 🏗️ Real-World Examples

### Counter App
```javascript
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';

// State
const count = createState(0);

// Render function
function renderCounter() {
    const app = createElement('div', { className: 'counter' },
        createElement('h1', {}, `Count: ${count.value}`),
        createElement('div', { className: 'buttons' },
            createElement('button', {
                onClick: () => count.value--
            }, '-'),
            createElement('button', {
                onClick: () => count.value = 0
            }, 'Reset'),
            createElement('button', {
                onClick: () => count.value++
            }, '+')
        )
    );
    
    render(app, document.getElementById('app'));
}

// Auto re-render when count changes
count.subscribe(renderCounter);
renderCounter();
```

### User Profile Form
```javascript
const user = createState({
    name: '',
    email: '',
    age: '',
    bio: ''
});

function renderUserForm() {
    const app = createElement('form', { className: 'user-form' },
        createElement('h2', {}, 'User Profile'),
        
        createElement('input', {
            type: 'text',
            placeholder: 'Name',
            value: user.value.name,
            onInput: (e) => {
                user.value = { ...user.value, name: e.target.value };
            }
        }),
        
        createElement('input', {
            type: 'email',
            placeholder: 'Email',
            value: user.value.email,
            onInput: (e) => {
                user.value = { ...user.value, email: e.target.value };
            }
        }),
        
        createElement('input', {
            type: 'number',
            placeholder: 'Age',
            value: user.value.age,
            onInput: (e) => {
                user.value = { ...user.value, age: e.target.value };
            }
        }),
        
        createElement('textarea', {
            placeholder: 'Bio',
            value: user.value.bio,
            onInput: (e) => {
                user.value = { ...user.value, bio: e.target.value };
            }
        }),
        
        createElement('div', { className: 'preview' },
            createElement('h3', {}, 'Preview:'),
            createElement('p', {}, `Name: ${user.value.name}`),
            createElement('p', {}, `Email: ${user.value.email}`),
            createElement('p', {}, `Age: ${user.value.age}`),
            createElement('p', {}, `Bio: ${user.value.bio}`)
        )
    );
    
    render(app, document.getElementById('app'));
}

user.subscribe(renderUserForm);
renderUserForm();
```

### Shopping Cart
```javascript
const cart = createState([]);
const total = createState(0);

// Calculate total whenever cart changes
cart.subscribe((items) => {
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    total.value = newTotal;
});

function addToCart(product) {
    const existingItem = cart.value.find(item => item.id === product.id);
    
    if (existingItem) {
        // Update quantity
        cart.value = cart.value.map(item =>
            item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
    } else {
        // Add new item
        cart.value = [...cart.value, { ...product, quantity: 1 }];
    }
}

function removeFromCart(productId) {
    cart.value = cart.value.filter(item => item.id !== productId);
}

function renderCart() {
    const app = createElement('div', { className: 'cart' },
        createElement('h2', {}, 'Shopping Cart'),
        
        createElement('div', { className: 'items' },
            ...cart.value.map(item =>
                createElement('div', { key: item.id, className: 'cart-item' },
                    createElement('span', {}, item.name),
                    createElement('span', {}, `$${item.price} x ${item.quantity}`),
                    createElement('button', {
                        onClick: () => removeFromCart(item.id)
                    }, 'Remove')
                )
            )
        ),
        
        createElement('div', { className: 'total' },
            createElement('strong', {}, `Total: $${total.value.toFixed(2)}`)
        ),
        
        createElement('button', {
            className: 'checkout',
            onClick: () => {
                alert(`Checkout total: $${total.value.toFixed(2)}`);
                cart.value = [];
            }
        }, 'Checkout')
    );
    
    render(app, document.getElementById('app'));
}

cart.subscribe(renderCart);
total.subscribe(renderCart);
renderCart();
```

## 🎯 Best Practices

### 1. **Use Immutable Updates**
```javascript
// ✅ Good - Creates new object/array
state.value = { ...state.value, newProperty: 'value' };
state.value = [...state.value, newItem];

// ❌ Avoid - Direct mutation
state.value.newProperty = 'value';
state.value.push(newItem);
```

### 2. **Keep State Simple**
```javascript
// ✅ Good - Simple, focused state
const username = createState('');
const isLoggedIn = createState(false);
const todos = createState([]);

// ❌ Avoid - Everything in one giant state
const appState = createState({
    ui: { modals: {}, forms: {}, navigation: {} },
    data: { users: [], todos: [], categories: [] },
    cache: { api: {}, images: {} }
});
```

### 3. **Use Functions for Complex Updates**
```javascript
const todos = createState([]);

function addTodo(text) {
    const newTodo = {
        id: Date.now(),
        text: text.trim(),
        done: false,
        createdAt: new Date()
    };
    todos.value = [...todos.value, newTodo];
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

### 4. **Subscribe for Side Effects**
```javascript
const user = createState(null);

// Auto-save to localStorage
user.subscribe((userData) => {
    if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    } else {
        localStorage.removeItem('user');
    }
});

// Log analytics
user.subscribe((userData) => {
    if (userData) {
        analytics.track('user_logged_in', { userId: userData.id });
    }
});
```

## 🔧 Internal Architecture

### How State Works
1. **createState()** creates a State instance with initial value
2. **State.value getter** returns current value
3. **State.value setter** updates value and calls all subscribers
4. **State.subscribe()** adds callback to subscriber list

### Why Immutable Updates?
- **Predictable** - Easy to track what changed
- **Performance** - Can compare references for changes
- **Debugging** - Clear history of state changes
- **Concurrent Safe** - No race conditions

### Integration with Virtual DOM
- State subscribers trigger re-renders
- Virtual DOM efficiently updates only changed parts
- Framework manages the timing of updates

## 🚀 Advanced Patterns

### Computed State
```javascript
const firstName = createState('John');
const lastName = createState('Doe');
const fullName = createState('');

// Update fullName when either name changes
firstName.subscribe(() => {
    fullName.value = `${firstName.value} ${lastName.value}`;
});

lastName.subscribe(() => {
    fullName.value = `${firstName.value} ${lastName.value}`;
});
```

### State Persistence
```javascript
const preferences = createState(
    JSON.parse(localStorage.getItem('preferences') || '{}')
);

preferences.subscribe((prefs) => {
    localStorage.setItem('preferences', JSON.stringify(prefs));
});
```

### State Validation
```javascript
const email = createState('');
const emailError = createState('');

email.subscribe((emailValue) => {
    if (!emailValue) {
        emailError.value = 'Email is required';
    } else if (!emailValue.includes('@')) {
        emailError.value = 'Invalid email format';
    } else {
        emailError.value = '';
    }
});
```

---

**State management is the heart of reactive applications. Master it, and you'll build UIs that feel magical to use!** ✨
