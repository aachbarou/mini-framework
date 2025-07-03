// TodoMVC - WITH CUSTOM EVENT HANDLING SYSTEM

// Use the fastest initialization method - zero overhead!
RichFramework.ready(function() {
    
    // Simple ID counter - much cleaner than Date.now()!
    let nextTodoId = 1;
    
    // Create states
    const todos = RichFramework.createState([]);
    const filter = RichFramework.createState('all');
    const editingTodo = RichFramework.createState(null); // Track which todo is being edited
    const editValue = RichFramework.createState(''); // Make edit value reactive
    
    // Keep input value in local variable, NOT state
    let inputValue = '';
    
    // Router integration - Update filter when route changes
    RichFramework.onRouteChange((newRoute) => {
        if (newRoute === '/' || newRoute === '') {
            filter.value = 'all';
        } else if (newRoute === '/active') {
            filter.value = 'active';
        } else if (newRoute === '/completed') {
            filter.value = 'completed';
        }
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
        if (inputValue.trim()) {
            todos.unshift({  // Use unshift() to add at the beginning (top of list)
                id: nextTodoId++, // Clean incrementing ID: 1, 2, 3, 4...
                text: inputValue.trim(),
                done: false
            });
            inputValue = ''; // Clear local variable
            // Find input, clear it, and keep it focused
            const input = document.querySelector('.new-todo');
            if (input) {
                input.value = '';
                input.focus(); // Keep focus for continuous typing
            }
        }
    }
    
    function addTodoOnBlur() {
        if (inputValue.trim()) {
            todos.unshift({  // Use unshift() to add at the beginning (top of list)
                id: nextTodoId++, // Clean incrementing ID: 1, 2, 3, 4...
                text: inputValue.trim(),
                done: false
            });
            inputValue = ''; // Clear local variable
            // Find input and clear it (but don't refocus)
            const input = document.querySelector('.new-todo');
            if (input) {
                input.value = '';
            }
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
    
    // Start editing a todo
    function startEditingTodo(id) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) {
            editingTodo.value = id;
            editValue.value = todo.text;
            
            // Force a re-render and then focus
            setTimeout(() => {
                const editInput = document.querySelector('.edit');
                if (editInput) {
                    // Force set the value to make sure it appears
                    editInput.value = todo.text;
                    editInput.focus();
                    editInput.select(); // Select all text for easy replacement
                }
            }, 50); // Slightly longer timeout to ensure render is complete
        }
    }
    
    // Save edited todo
    function saveEditedTodo(id) {
        if (editValue.value.trim()) {
            const newTodos = todos.value.map(todo => 
                todo.id === id ? {...todo, text: editValue.value.trim()} : todo
            );
            todos.value = newTodos;
        }
        editingTodo.value = null;
        editValue.value = '';
    }
    
    // Cancel editing
    function cancelEditingTodo() {
        editingTodo.value = null;
        editValue.value = '';
    }
    
    // Get filtered todos based on current filter
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
    
    // Clear completed todos
    function clearCompleted() {
        const newTodos = todos.value.filter(todo => !todo.done);
        todos.value = newTodos;
    }

    // Toggle all todos
    function toggleAll() {
        const allCompleted = todos.value.every(todo => todo.done);
        const newTodos = todos.value.map(todo => ({
            ...todo,
            done: !allCompleted
        }));
        todos.value = newTodos;
    }
    
    // Render function - The event handlers inside createElement will now use our custom system
    function renderApp() {
        // Get filtered todos for display
        const filteredTodos = getFilteredTodos();
        const activeTodosCount = todos.value.filter(t => !t.done).length;
        const completedTodosCount = todos.value.filter(t => t.done).length;
        
        // The custom event system will be used automatically because we've updated
        // the createElement function in the virtual-dom.js file to use our custom events
        
        // Input with autofocus attribute like original TodoMVC
        const input = RichFramework.createElement('input', {
            className: 'new-todo',
            placeholder: 'What needs to be done?',
            autofocus: true,
            onInput: (e) => {
                // Our custom event system will pass a similar event object
                inputValue = e.target.value;
            },
            onKeydown: (e) => {
                // Our custom event system will handle the key event
                if (e.originalEvent.key === 'Enter') {
                    addTodo();
                }
            },
            onBlur: (e) => {
                // Auto-add task when input loses focus
                addTodoOnBlur();
            }
        });
        
        // Todo items (filtered) - Event handlers will use our custom system
        const todoItems = filteredTodos.map(todo => {
            const isEditing = editingTodo.value === todo.id;
            
            if (isEditing) {
                // Editing mode - show input field with data-id attribute
                const currentEditValue = editValue.value || todo.text; // Fallback to todo.text
                return RichFramework.createElement('li', {
                    'data-id': todo.id,  // Add data-id attribute like original TodoMVC
                    className: 'editing'
                },
                    RichFramework.createElement('input', {
                        className: 'edit',
                        type: 'text',
                        value: currentEditValue,
                        onInput: (e) => {
                            editValue.value = e.target.value;
                        },
                        onKeydown: (e) => {
                            if (e.originalEvent.key === 'Enter') {
                                saveEditedTodo(todo.id);
                            } else if (e.originalEvent.key === 'Escape') {
                                cancelEditingTodo();
                            }
                        },
                        onBlur: () => {
                            saveEditedTodo(todo.id);
                        }
                    })
                );
            } else {
                // Normal mode - show todo item with data-id attribute like original TodoMVC
                return RichFramework.createElement('li', {
                    'data-id': todo.id,  // Add data-id attribute like original TodoMVC
                    className: todo.done ? 'completed' : ''
                }, 
                    RichFramework.createElement('div', { className: 'view' },
                        RichFramework.createElement('input', {
                            className: 'toggle',
                            type: 'checkbox',
                            checked: todo.done,
                            onChange: () => toggleTodo(todo.id)
                        }),
                        RichFramework.createElement('label', {
                            onDblclick: () => startEditingTodo(todo.id)
                        }, todo.text),
                        RichFramework.createElement('button', {
                            className: 'destroy',
                            onClick: () => deleteTodo(todo.id)
                        })
                    )
                );
            }
        });
        
        // Filter buttons - Event handlers will use our custom system
        const filterButtons = RichFramework.createElement('ul', { className: 'filters' },
            RichFramework.createElement('li', {},
                RichFramework.createElement('a', {
                    className: filter.value === 'all' ? 'selected' : '',
                    href: '#/',
                    onClick: (e) => {
                        e.preventDefault(); // Works with our custom event
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
        
        // Clear completed button - Event handler will use our custom system
        const clearCompletedButton = completedTodosCount > 0 ? 
            RichFramework.createElement('button', {
                className: 'clear-completed',
                onClick: clearCompleted
            }, `Clear completed (${completedTodosCount})`) : null;
        
        // Main section with toggle-all and todo list (only show if there are todos)
        const mainSection = todos.value.length > 0 ? 
            RichFramework.createElement('main', { className: 'main' },
                // Toggle all container
                RichFramework.createElement('div', { className: 'toggle-all-container' },
                    RichFramework.createElement('input', {
                        className: 'toggle-all',
                        type: 'checkbox',
                        id: 'toggle-all',
                        checked: todos.value.length > 0 && todos.value.every(todo => todo.done),
                        onChange: toggleAll
                    }),
                    RichFramework.createElement('label', {
                        className: 'toggle-all-label',
                        htmlFor: 'toggle-all'
                    }, 'Mark all as complete')
                ),
                // Todo list
                RichFramework.createElement('ul', { className: 'todo-list' }, ...todoItems)
            ) : null;

        // Footer (only show if there are todos)
        const footer = todos.value.length > 0 ? 
            RichFramework.createElement('footer', { className: 'footer' },
                RichFramework.createElement('span', { className: 'todo-count' }, 
                    `${activeTodosCount} item${activeTodosCount !== 1 ? 's' : ''} left`
                ),
                filterButtons,
                clearCompletedButton
            ) : null;
        
        // Main app structure matching original TodoMVC
        const app = RichFramework.createElement('div', {},
            // Main todoapp section
            RichFramework.createElement('section', { className: 'todoapp' },
                RichFramework.createElement('header', { className: 'header' },
                    RichFramework.createElement('h1', {}, 'todos'),
                    input
                ),
                mainSection,
                footer
            ),
            
        );
        
        // Render will use our updated virtual-dom system
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // Subscribe to todos, filter, and editing state changes
    todos.subscribe(renderApp);
    filter.subscribe(renderApp);
    editingTodo.subscribe(renderApp);
    
    // Initial render
    renderApp();
    
    // Auto-focus the input when page loads
    setTimeout(() => {
        const input = document.querySelector('.new-todo');
        if (input) {
            input.focus();
        }
    }, 100);
    
    // Add global event for saving todos on page exit
    RichFramework.events.global('beforeunload', () => {
        // Could save to localStorage here
        localStorage.setItem('todos', JSON.stringify(todos.value));
    });
}); 