// TodoMVC with EVENT HANDLING!

window.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Building TodoMVC with Events...');
    
    // Test event handlers
    const handleInputChange = (event) => {
        console.log('🎮 User typed:', event.target.value);
    };
    
    const handleButtonClick = () => {
        console.log('🎮 Button clicked!');
        };
    
    // Create TodoMVC structure with EVENTS
    const title = RichFramework.createElement('h1', {}, 'todos');
    
    const input = RichFramework.createElement('input', {
        className: 'new-todo',
        placeholder: 'What needs to be done?',
        type: 'text',
        onInput: handleInputChange  // 🎮 NEW: Event handler!
    });
    
    const testButton = RichFramework.createElement('button', {
        onClick: handleButtonClick  // 🎮 NEW: Click handler!
    }, 'Test Events');
    
    const todoList = RichFramework.createElement('ul', {
        className: 'todo-list'
    });
    
    const mainSection = RichFramework.createElement('section', {
        className: 'main'
    }, todoList);
    
    const todoApp = RichFramework.createElement('section', {
        className: 'todoapp'
    }, title, input, testButton, mainSection);
    
    // Render with events
    const appDiv = document.getElementById('app');
    RichFramework.render(todoApp, appDiv);
    
    console.log('✅ TodoMVC with events ready! Try typing and clicking!');
});
