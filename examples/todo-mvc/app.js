// Test our framework with TodoMVC

window.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, now testing framework...');
    
    // Create TodoMVC structure
    const header = RichFramework.createElement('h1', 'todos');
    const input = '<input class="new-todo" placeholder="What needs to be done?" autofocus>';
    const todoList = '<ul class="todo-list"></ul>';
    
    // Combine them
    const fullApp = `
        <section class="todoapp">
            ${header}
            ${input}
            <section class="main">
                ${todoList}
            </section>
        </section>
    `;
    
    // Render the full app
    RichFramework.render(fullApp, '#app');
    
    console.log('TodoMVC basic structure created!');
});