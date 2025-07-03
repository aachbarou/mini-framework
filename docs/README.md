# RichFramework Documentation

A pure ES6 mini-framework for building interactive web applications with no external dependencies and zero global objects.

## Overview

RichFramework is a lightweight, modular framework that provides the essential building blocks for modern web applications:

- **State Management**: Reactive state system with automatic UI updates
- **Virtual DOM**: Efficient DOM manipulation and rendering
- **Event System**: Powerful event handling with delegation and custom events
- **Routing**: Client-side navigation with history management

## Quick Start

```javascript
// Import the modules you need
import { createState } from '../Core/state.js';
import { createElement, render } from '../Core/virtual-dom.js';
import { EventBus } from '../Core/events.js';
import { Router } from '../Core/router.js';

// Create reactive state
const count = createState(0);

// Create virtual DOM elements
const button = createElement('button', {
  onclick: () => count.value++,
  textContent: 'Click me!'
});

// Render to DOM
render(button, document.getElementById('app'));
```

## Core Modules

### [State Management](./state.md)
Reactive state system that automatically updates the UI when data changes. Features observable state, computed values, and immutable update patterns.

### [Virtual DOM](./virtual-dom.md)
Efficient DOM manipulation through virtual representation. Create elements, handle events, and manage attributes with a simple API.

### [Event System](./events.md)
Comprehensive event handling with custom events, event delegation, and lifecycle management. Perfect for component communication.

### [Routing](./routing.md)
Client-side routing with history management, parameter extraction, and navigation guards. Build single-page applications with ease.

## Examples

### TodoMVC
A complete implementation of the TodoMVC specification demonstrating all framework features:
- State management for todos
- Virtual DOM for efficient rendering
- Event handling for user interactions
- Routing for different views (all, active, completed)

Location: `examples/todomvc/`

### Counter App
A simple counter demonstrating basic state and virtual DOM usage.

Location: `examples/counter/`

## Features

- **Zero Dependencies**: Pure ES6 with no external libraries
- **No Globals**: Clean module system with explicit imports
- **Lightweight**: Minimal footprint with maximum functionality
- **Modern**: Uses latest JavaScript features and patterns
- **Flexible**: Modular design - use only what you need

## Philosophy

RichFramework follows these design principles:

1. **Simplicity**: Easy to understand and use
2. **Modularity**: Import only what you need
3. **Performance**: Efficient virtual DOM and state management
4. **Developer Experience**: Clear APIs and helpful error messages
5. **Standards Compliance**: Follows web standards and best practices

## Browser Support

RichFramework works in all modern browsers that support:
- ES6 modules
- Proxy objects
- Array methods (map, filter, reduce)
- Modern DOM APIs

## Getting Started

1. Clone or download the framework
2. Open any example in a local server (ES6 modules require HTTP)
3. Start building your application!

No build step required - just import and use.

## Architecture

```
RichFramework/
├── Core/                 # Framework modules
│   ├── state.js         # Reactive state management
│   ├── virtual-dom.js   # Virtual DOM implementation
│   ├── events.js        # Event system
│   └── router.js        # Client-side routing
├── examples/            # Example applications
│   ├── todomvc/        # TodoMVC implementation
│   └── counter/        # Simple counter app
└── docs/               # Documentation
    ├── README.md       # This file
    ├── state.md        # State management docs
    ├── virtual-dom.md  # Virtual DOM docs
    ├── events.md       # Event system docs
    └── routing.md      # Routing docs
```

## Contributing

RichFramework is designed to be audit-ready and maintainable. When contributing:

1. Follow ES6 module patterns
2. Keep functions pure where possible
3. Add JSDoc comments for public APIs
4. Update documentation for new features
5. Ensure examples work correctly
