# RichSignals

A lightweight, standalone, high-performance signals system for reactive web applications.

## What are Signals?

Signals are reactive primitives that allow for efficient updates and dependency tracking. They are an alternative to Virtual DOM approaches, offering better performance for applications that require fine-grained reactivity.

## Key Features

- **High Performance**: Optimized for 60fps applications with minimal overhead
- **Simple API**: Easy to understand and use
- **Fine-grained Reactivity**: Only update what needs to be updated
- **Batching**: Group multiple updates for optimal performance
- **DOM Bindings**: Easily connect signals to DOM elements

## Core Concepts

### Signal

A signal represents a value that can change over time. When a signal's value changes, it notifies all effects that depend on it.

```javascript
const count = signal(0);
console.log(count.value); // 0
count.set(1);
console.log(count.value); // 1
```

### Computed Signal

A computed signal derives its value from other signals. It automatically updates when its dependencies change.

```javascript
const count = signal(1);
const doubled = computed(() => count.value * 2);
console.log(doubled.value); // 2
count.set(2);
console.log(doubled.value); // 4
```

### Effect

An effect runs a function when its dependencies change. It's useful for creating side effects based on signal changes.

```javascript
const count = signal(0);
effect(() => {
    console.log(`Count changed to ${count.value}`);
});
count.set(1); // Logs: "Count changed to 1"
```

### Batch

Batch multiple signal updates to run effects only once at the end.

```javascript
const x = signal(0);
const y = signal(0);

effect(() => {
    console.log(`Position: (${x.value}, ${y.value})`);
});

batch(() => {
    x.set(10);
    y.set(20);
}); // Logs: "Position: (10, 20)" only once
```

## DOM Bindings

Connect signals to DOM elements easily:

```javascript
const name = signal("John");
const element = document.getElementById("greeting");

// Text content binding
bindSignalToText(element, name);

// Attribute binding
bindSignalToAttribute(element, "data-name", name);

// Property binding
bindSignalToProperty(element, "textContent", name);

// Style binding
bindSignalToStyle(element, "color", signal("red"));

// Class binding
bindSignalToClass(element, "active", signal(true));
```

## Performance

The signals system is designed for high-performance applications:

- Minimal overhead per signal update (typically 0.1-0.5ms)
- Efficient dependency tracking
- Optimized batch updates
- No unnecessary re-renders

## Installation

Simply include the standalone signals library in your HTML:

```html
<script src="path/to/signals-standalone.js"></script>
```

## Usage

```html
<script src="path/to/signals-standalone.js"></script>
<script>
    const { signal, computed, effect, batch } = RichSignals;
    
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    
    effect(() => {
        document.getElementById("count").textContent = count.value;
        document.getElementById("doubled").textContent = doubled.value;
    });
    
    document.getElementById("increment").addEventListener("click", () => {
        count.set(count.value + 1);
    });
</script>
```

## Example Applications

1. **Simple Counter**: See the `signals-demo.html` for a basic demonstration of signals.
2. **Todo List**: The `signals-demo.html` also includes a todo list example showing reactive updates.
3. **Bomberman Game**: A more complex example showing how signals can be used in a real-time game.

## License

MIT License
