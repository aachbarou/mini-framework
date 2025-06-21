# 📚 RichFramework Documentation

> A lightweight, easy-to-use JavaScript framework for building interactive web applications

## 🚀 Overview

RichFramework is a custom JavaScript framework that provides:
- **Virtual DOM** - Efficient DOM manipulation through JavaScript objects
- **State Management** - Reactive data that automatically updates the UI
- **Event System** - Clean event handling without direct `addEventListener` calls
- **Routing** - URL synchronization for single-page applications

**Framework Size**: Only 12KB total - smaller than most popular libraries!

## 🎯 Philosophy

RichFramework follows the **"Framework, not Library"** principle:
- **With a library**: You call the library functions (you're in control)
- **With a framework**: The framework calls your functions (framework is in control)

When you use RichFramework, you define your components and logic, then the framework manages the rendering, state updates, and event handling for you.

## 📋 Quick Start

### 1. Include the Framework
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <div id="app"></div>
    
    <!-- Load framework modules in order -->
    <script src="src/framework.js"></script>
    <script src="src/core/events.js"></script>
    <script src="src/core/virtual-dom.js"></script>
    <script src="src/core/state.js"></script>
    <script src="src/core/router.js"></script>
    <script src="your-app.js"></script>
</body>
</html>
```

### 2. Create Your First App
```javascript
RichFramework.ready(function() {
    // Create reactive state
    const counter = RichFramework.createState(0);
    
    // Define your app
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, 'Counter App'),
            RichFramework.createElement('p', {}, `Count: ${counter.value}`),
            RichFramework.createElement('button', {
                onClick: () => counter.value++
            }, 'Increment')
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // Subscribe to state changes
    counter.subscribe(renderApp);
    
    // Initial render
    renderApp();
});
```

## 🏗️ Core Concepts

### Creating Elements
Use `RichFramework.createElement()` to create virtual DOM elements:

```javascript
// Basic element
RichFramework.createElement('div', {}, 'Hello World')

// Element with attributes
RichFramework.createElement('input', {
    type: 'text',
    placeholder: 'Enter your name',
    className: 'my-input'
})

// Element with children
RichFramework.createElement('div', { className: 'container' },
    RichFramework.createElement('h1', {}, 'Title'),
    RichFramework.createElement('p', {}, 'Content')
)
```

### Adding Events
Use event props (not `addEventListener` directly):

```javascript
RichFramework.createElement('button', {
    onClick: (event) => {
        console.log('Button clicked!');
        event.preventDefault(); // Standard event methods available
    },
    onMouseOver: (event) => {
        console.log('Mouse over button');
    }
}, 'Click Me')
```

### Nesting Elements
Elements can contain other elements as children:

```javascript
const nav = RichFramework.createElement('nav', { className: 'navigation' },
    RichFramework.createElement('ul', {},
        RichFramework.createElement('li', {},
            RichFramework.createElement('a', { href: '#home' }, 'Home')
        ),
        RichFramework.createElement('li', {},
            RichFramework.createElement('a', { href: '#about' }, 'About')
        )
    )
);
```

### Adding Attributes
Attributes are passed as the second parameter (props object):

```javascript
RichFramework.createElement('img', {
    src: 'image.jpg',
    alt: 'My Image',
    className: 'responsive-image',
    'data-id': '123',
    width: '300',
    height: '200'
})
```

Special attributes:
- `className` → sets CSS class
- `htmlFor` → sets `for` attribute (for labels)
- `onClick`, `onInput`, etc. → event handlers
- `value`, `checked` → form properties

## 📖 Detailed Guides

- [🎮 Event System](docs/events.md) - Event handling without `addEventListener`
- [🔄 State Management](docs/state.md) - Reactive data and UI updates
- [🏗️ Virtual DOM](docs/virtual-dom.md) - Efficient DOM manipulation
- [🧭 Routing](docs/routing.md) - URL synchronization and navigation

## 🎯 Why RichFramework Works This Way

### 1. **Virtual DOM for Performance**
Instead of directly manipulating the DOM (which is slow), we create JavaScript objects representing our UI. The framework then efficiently updates only the parts that changed.

### 2. **State Management for Reactivity**
When your data changes, the UI automatically updates. No manual DOM manipulation needed - just change your state and the framework handles the rest.

### 3. **Event Abstraction for Cleaner Code**
Instead of calling `addEventListener` everywhere, you use our event props. This keeps your code cleaner and the framework manages the event lifecycle.

### 4. **Framework Control for Consistency**
The framework controls when rendering happens, how events are handled, and when state updates occur. This prevents common bugs and ensures consistent behavior.

## 🔥 Examples

### Todo App
```javascript
RichFramework.ready(function() {
    const todos = RichFramework.createState([]);
    let nextId = 1;
    
    function addTodo(text) {
        todos.unshift({ id: nextId++, text, done: false });
    }
    
    function toggleTodo(id) {
        const newTodos = todos.value.map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
        );
        todos.value = newTodos;
    }
    
    function renderApp() {
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('input', {
                placeholder: 'Add todo...',
                onKeydown: (e) => {
                    if (e.originalEvent.key === 'Enter') {
                        addTodo(e.target.value);
                        e.target.value = '';
                    }
                }
            }),
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
                        todo.text
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

## 🎉 You're Ready!

With these basics, you can start building applications with RichFramework. Check out the detailed guides for each module to learn more advanced features.

**Happy coding!** 🚀
