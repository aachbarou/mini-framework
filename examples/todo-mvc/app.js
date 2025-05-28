// TodoMVC - ROUTER INTEGRATED VERSION

window.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Building TodoMVC...');
    
    // Create states
    const todos = RichFramework.createState([]);
    const filter = RichFramework.createState('all'); // NEW: filter state
    
    // Keep input value in local variable, NOT state
    let inputValue = '';
    
    // Router integration - Update filter when route changes
    RichFramework.onRouteChange((newRoute) => {
        console.log('📍 Route changed to:', newRoute);
        
        if (newRoute === '/' || newRoute === '') {
            filter.value = 'all';
        } else if (newRoute === '/active') {
            filter.value = 'active';
        } else if (newRoute === '/completed') {
            filter.value = 'completed';
        }
        console.log('🔍 Filter updated to:', filter.value);
    });
    
    // Initialize route on page load
    const currentRoute = RichFramework.getCurrentRoute();
    if (currentRoute === '/' || currentRoute === '') {
        filter.value = 'all';
    } else if (currentRoute === '/active') {
        filter.value = 'active';
    } else if (currentRoute === '/completed') {
        filter.value = 'completed';
    }
    
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
    
    // NEW: Get filtered todos based on current filter
    function getFilteredTodos() {
        const allTodos = todos.value;
        const currentFilter = filter.value;
        
        if (currentFilter === 'active') {
            return allTodos.filter(todo => !todo.done);
        } else if (currentFilter === 'completed') {
            return allTodos.filter(todo => todo.done);
        }
        return allTodos; // 'all'
    }
    
    // NEW: Clear completed todos
    function clearCompleted() {
        const newTodos = todos.value.filter(todo => !todo.done);
        todos.value = newTodos;
    }
    
    // Render function
    function renderApp() {
        console.log('🎨 Rendering app... Filter:', filter.value);
        
        // Get filtered todos for display
        const filteredTodos = getFilteredTodos();
        const activeTodosCount = todos.value.filter(t => !t.done).length;
        const completedTodosCount = todos.value.filter(t => t.done).length;
        
        // Input
        const input = RichFramework.createElement('input', {
            className: 'new-todo',
            placeholder: 'What needs to be done?',
            type: 'text',
            onInput: (e) => {
                inputValue = e.target.value;
                console.log('⌨️ Input:', inputValue);
            },
            onKeydown: (e) => {
                if (e.key === 'Enter') {
                    addTodo();
                }
            }
        });
        
        // Todo items (filtered)
        const todoItems = filteredTodos.map(todo => 
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
        
        // Filter buttons
        const filterButtons = RichFramework.createElement('ul', { className: 'filters' },
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', {
                    className: filter.value === 'all' ? 'selected' : '',
                    href: '#/',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/');
                    }
                }, 'All')
            ),
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', {
                    className: filter.value === 'active' ? 'selected' : '',
                    href: '#/active',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/active');
                    }
                }, 'Active')
            ),
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', {
                    className: filter.value === 'completed' ? 'selected' : '',
                    href: '#/completed',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/completed');
                    }
                }, 'Completed')
            )
        );
        
        // Clear completed button (only show if there are completed todos)
        const clearCompletedButton = completedTodosCount > 0 ? 
            RichFramework.createElement('button', {
                className: 'clear-completed',
                onClick: clearCompleted
            }, `Clear completed (${completedTodosCount})`) : null;
        
        // Footer (only show if there are todos)
        const footer = todos.value.length > 0 ? 
            RichFramework.createElement('footer', { className: 'footer' },
                RichFramework.createElement('span', { className: 'todo-count' }, 
                    `${activeTodosCount} item${activeTodosCount !== 1 ? 's' : ''} left`
                ),
                filterButtons,
                clearCompletedButton
            ) : null;
        
        // Main app
        const app = RichFramework.createElement('section', { className: 'todoapp' },
            RichFramework.createElement('header', { className: 'header' },
                RichFramework.createElement('h1', {}, 'todos'),
                input
            ),
            todos.value.length > 0 ? 
                RichFramework.createElement('section', { className: 'main' },
                    RichFramework.createElement('ul', { className: 'todo-list' }, ...todoItems)
                ) : null,
            footer
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // Subscribe to both todos AND filter changes
    todos.subscribe(renderApp);
    filter.subscribe(renderApp);
    
    // Initial render
    renderApp();
    
    console.log('✅ TodoMVC ready!');
});