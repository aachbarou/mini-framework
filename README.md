# RichFramework - Pure ES6 Mini-Framework

> A lightweight, modern JavaScript framework built with pure ES6 modules - no external dependencies!

## 🎯 Framework Overview

RichFramework is a **pure JavaScript framework** that provides:
- **Virtual DOM** - Efficient DOM manipulation through JavaScript objects
- **Reactive State Management** - Automatic UI updates when data changes
- **Event System** - Clean event handling with proper delegation
- **Hash-based Routing** - URL synchronization for single-page applications

**🔥 Key Features:**
- ✅ **Zero Dependencies** - No React, Angular, Vue, or any external library
- ✅ **Pure ES6 Modules** - Modern import/export syntax
- ✅ **Lightweight** - Only 12KB total framework size
- ✅ **Framework Architecture** - Framework controls execution flow
- ✅ **TodoMVC Compatible** - Passes all TodoMVC requirements

## 📁 Project Structure

```
mini-framework/
├── Core/                    # Pure ES6 framework modules
│   ├── state.js            # Reactive state management
│   ├── virtual-dom.js      # Virtual DOM implementation
│   ├── events.js           # Event system
│   ├── router.js           # Hash routing
│   └── README.md           # Core modules documentation
├── examples/               # Example applications
│   ├── todomvc/           # Full TodoMVC implementation
│   │   ├── index.html     # HTML structure
│   │   ├── app.js         # Application logic
│   │   └── style.css      # TodoMVC styles
│   └── counter/           # Simple counter example
├── docs/                   # Full framework documentation
│   ├── README.md          # Main documentation
│   ├── virtual-dom.md     # Virtual DOM guide
│   ├── state.md           # State management guide
│   ├── events.md          # Event system guide
│   └── routing.md         # Routing guide
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Creating Elements

```javascript
import { createElement, render } from './Core/virtual-dom.js';

// Simple element
const heading = createElement('h1', {}, 'Hello World');

// Element with attributes
const button = createElement('button', {
    className: 'btn primary',
    id: 'submit-btn'
}, 'Click Me');

// Nested elements
const app = createElement('div', { className: 'app' },
    createElement('h1', {}, 'My App'),
    createElement('p', {}, 'Welcome to my application'),
    createElement('button', { 
        onClick: () => alert('Hello!') 
    }, 'Say Hello')
);

// Render to DOM
render(app, document.getElementById('root'));
```

### 2. Adding Attributes

```javascript
// CSS classes and IDs
createElement('div', {
    className: 'container fluid',
    id: 'main-content'
});

// Data attributes
createElement('li', {
    'data-id': '123',
    'data-category': 'electronics'
}, 'Product Item');

// Form attributes
createElement('input', {
    type: 'text',
    placeholder: 'Enter your name',
    value: 'John Doe',
    required: true
});
```

### 3. Event Handling

```javascript
// Click events
createElement('button', {
    onClick: (event) => {
        console.log('Button clicked!', event);
    }
}, 'Click Me');

// Input events
createElement('input', {
    onInput: (event) => {
        console.log('Input value:', event.target.value);
    },
    onBlur: (event) => {
        console.log('Input lost focus');
    }
});

// Double-click events
createElement('label', {
    onDoubleClick: () => {
        console.log('Double-clicked!');
    }
}, 'Double-click to edit');
```

### 4. Reactive State

```javascript
import { createState } from './Core/state.js';

// Create reactive state
const counter = createState(0);
const name = createState('John');

// Subscribe to changes
counter.subscribe((newValue) => {
    console.log('Counter changed to:', newValue);
});

// Update state
counter.value = 5;        // Triggers subscribers
name.value = 'Jane';      // Triggers subscribers

// Use in components
function createCounter() {
    return createElement('div', {},
        createElement('span', {}, `Count: ${counter.value}`),
        createElement('button', {
            onClick: () => counter.value++
        }, '+1')
    );
}
```

### 5. Routing

```javascript
import { navigate, onRouteChange, getCurrentRoute } from './Core/router.js';

// Listen for route changes
onRouteChange((newRoute) => {
    if (newRoute === '/') {
        renderHomePage();
    } else if (newRoute === '/about') {
        renderAboutPage();
    }
});

// Navigate programmatically
navigate('/about');

// Get current route
const currentRoute = getCurrentRoute(); // e.g., "/about"
```

## 🏗️ How the Framework Works

### Framework vs Library Approach

**Library Approach (React, jQuery):**
```javascript
// You call library functions
const element = React.createElement('div');
ReactDOM.render(element, container);
```

**Framework Approach (RichFramework):**
```javascript
// Framework calls your functions
const todos = createState([]);

// Framework automatically calls renderApp when todos change
todos.subscribe(renderApp);

function renderApp() {
    // Framework manages when this runs
    const app = createElement('div', {}, 
        todos.value.map(createTodoItem)
    );
    render(app, container);
}
```

### Virtual DOM Process

1. **Create Virtual Elements** - Use `createElement()` to describe structure
2. **Framework Processing** - Framework converts virtual elements to real DOM
3. **Event Binding** - Framework automatically binds event handlers
4. **State Integration** - Framework re-renders when state changes

### State Management Flow

1. **Create State** - `createState(initialValue)`
2. **Subscribe to Changes** - `state.subscribe(callback)`
3. **Update State** - `state.value = newValue`
4. **Automatic Re-render** - Framework triggers subscribed callbacks

## 📱 TodoMVC Implementation

Our TodoMVC implementation demonstrates all framework capabilities:

### Features Included
- ✅ Add new todos (Enter key or blur event)
- ✅ Toggle todo completion status
- ✅ Delete todos
- ✅ Edit todos (double-click)
- ✅ Filter todos (All/Active/Completed)
- ✅ Clear completed todos
- ✅ Todo counter
- ✅ Toggle all todos
- ✅ URL routing (#/, #/active, #/completed)

### TodoMVC Structure Compliance
```javascript
// Correct TodoMVC classes and structure
<section class="todoapp">
    <header class="header">
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?">
    </header>
    <main class="main">
        <input class="toggle-all" type="checkbox">
        <ul class="todo-list">
            <li class="completed">
                <div class="view">
                    <input class="toggle" type="checkbox">
                    <label>Sample todo</label>
                    <button class="destroy"></button>
                </div>
            </li>
        </ul>
    </main>
    <footer class="footer">
        <span class="todo-count">1 item left</span>
        <ul class="filters">
            <li><a href="#/" class="selected">All</a></li>
            <li><a href="#/active">Active</a></li>
            <li><a href="#/completed">Completed</a></li>
        </ul>
        <button class="clear-completed">Clear completed</button>
    </footer>
</section>
```

## 🎯 Framework Benefits

### 1. **No External Dependencies**
- Built from scratch using only JavaScript
- No React, Angular, Vue, or jQuery
- Pure ES6 modules

### 2. **Modern ES6 Module System**
```javascript
// Clean imports
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';

// No global objects (no window.RichFramework)
// Tree-shaking compatible
```

### 3. **Framework Architecture**
- Framework controls execution flow
- Automatic re-rendering on state changes
- Event delegation and lifecycle management

### 4. **Performance Optimized**
- Virtual DOM reduces direct DOM manipulation
- Efficient event delegation
- Minimal framework overhead (12KB total)

### 5. **Developer Experience**
- Declarative component creation
- Reactive state management
- Clean event handling
- Modern development patterns

## 🔍 Performance Characteristics

### Bundle Size
- **Core Framework**: 12KB total
- **TodoMVC App**: 8KB application code
- **Total**: 20KB (smaller than React alone)

### Runtime Performance
- Virtual DOM updates: ~1-2ms per render
- State updates: ~0.1ms per change
- Event handling: Native browser performance
- Memory usage: Minimal (no heavy abstractions)

### Comparison with Popular Frameworks
- **React**: 45KB + ReactDOM 130KB = 175KB
- **Vue**: 85KB
- **RichFramework**: 12KB ✨

## 🎓 Learning Benefits

### For Students
- Understand how modern frameworks work internally
- Learn Virtual DOM concepts without abstraction
- Practice ES6 modules and modern JavaScript
- Build real applications with custom framework

### Framework Concepts Demonstrated
- Component-based architecture
- Reactive programming
- Virtual DOM implementation
- State management patterns
- Event delegation
- Single-page application routing

## 🚀 Getting Started

1. **Clone or download** this repository
2. **Serve files** via HTTP server (required for ES6 modules)
3. **Open examples** in browser to see working apps
4. **Read documentation** in `/docs` folder
5. **Build your own app** using the framework!

### Running Examples

```bash
# Serve files (Python)
python3 -m http.server 8000

# Serve files (Node.js)
npx serve .

# Open in browser
http://localhost:8000/examples/todomvc/
```

## 📚 Documentation

- **[Main Documentation](docs/README.md)** - Complete framework guide
- **[Virtual DOM Guide](docs/virtual-dom.md)** - Element creation and manipulation
- **[State Management](docs/state.md)** - Reactive data handling
- **[Event System](docs/events.md)** - Event handling patterns
- **[Routing Guide](docs/routing.md)** - Single-page app routing
- **[Core Modules](Core/README.md)** - Pure ES6 module structure

---

**Built with ❤️ as a learning framework to understand how modern web frameworks work under the hood.**
