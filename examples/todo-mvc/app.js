// TodoMVC - ACTUALLY FIXED VERSION

window.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Building TodoMVC...');
    
    // Create todos state only
    const todos = RichFramework.createState([]);
    
    // Keep input value in local variable, NOT state
    let inputValue = '';
    
    // Functions
    function addTodo() {
        console.log('🎮 addTodo called! Input:', inputValue);
        if (inputValue.trim()) {
            todos.push({
                id: Date.now(),
                text: inputValue.trim(),
                done: false
            });
            inputValue = ''; // Clear local variable
            // Find input and clear it
            const input = document.querySelector('.new-todo');
            if (input) input.value = '';
        }
    }
    
    function toggleTodo(id) {
        const newTodos = todos.value.map(todo => 
            todo.id === id ? {...todo, done: !todo.done} : todo
        );
        todos.value = newTodos;
    }
    
    function deleteTodo(id) {
        const newTodos = todos.value.filter(todo => todo.id !== id);
        todos.value = newTodos;
    }
    
    // Render function
    function renderApp() {
        console.log('🎨 Rendering app...');
        
        // Input - NO state binding, just local events
        const input = RichFramework.createElement('input', {
            className: 'new-todo',
            placeholder: 'What needs to be done?',
            type: 'text',
            onInput: (e) => {
                inputValue = e.target.value; // Update local variable only
                console.log('⌨️ Input:', inputValue);
            },
            onKeydown: (e) => {
                if (e.key === 'Enter') {
                    addTodo();
                }
            }
        });
        
        // Todo items
        const todoItems = todos.value.map(todo => 
            RichFramework.createElement('li', {
                className: todo.done ? 'completed' : ''
            }, 
                RichFramework.createElement('div', { className: 'view' },
                    RichFramework.createElement('input', {
                        className: 'toggle',
                        type: 'checkbox',
                        checked: todo.done,
                        onChange: () => toggleTodo(todo.id)
                    }),
                    RichFramework.createElement('label', {}, todo.text),
                    RichFramework.createElement('button', {
                        className: 'destroy',
                        onClick: () => deleteTodo(todo.id)
                    }, '×')
                )
            )
        );
        
        // Main app
        const app = RichFramework.createElement('section', { className: 'todoapp' },
            RichFramework.createElement('h1', {}, 'todos'),
            input,
            RichFramework.createElement('section', { className: 'main' },
                RichFramework.createElement('ul', { className: 'todo-list' }, ...todoItems)
            ),
            RichFramework.createElement('footer', {},
                RichFramework.createElement('span', {}, 
                    `${todos.value.filter(t => !t.done).length} items left`
                )
            )
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // ONLY subscribe to todos changes, NOT input!
    todos.subscribe(renderApp);
    
    // Initial render
    renderApp();
    
    console.log('✅ TodoMVC ready!');
});