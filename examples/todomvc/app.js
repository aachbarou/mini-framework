// TodoMVC - Pure ES6 Modules
// Clean imports from Core modules

import { createState } from '../../Core/state.js';
import { createElement, render } from '../../Core/virtual-dom.js';
import { navigate, onRouteChange, getCurrentRoute } from '../../Core/router.js';

// State management
let nextTodoId = 1;
const todos = createState([]);
const filter = createState('all');
const editingTodo = createState(null);
const editValue = createState('');

// Local input value (not reactive)
let inputValue = '';
let isSubmitting = false;

// Router integration
onRouteChange((newRoute) => {
    if (newRoute === '/' || newRoute === '') {
        filter.value = 'all';
    } else if (newRoute === '/active') {
        filter.value = 'active';
    } else if (newRoute === '/completed') {
        filter.value = 'completed';
    }
});

// Initialize route
const currentRoute = getCurrentRoute();
if (currentRoute === '/active') {
    filter.value = 'active';
} else if (currentRoute === '/completed') {
    filter.value = 'completed';
} else {
    filter.value = 'all';
}

// Todo functions
function addTodo() {
    if (inputValue.trim() && !isSubmitting) {
        isSubmitting = true;
        const newTodos = [...todos.value, {
            id: nextTodoId++,
            text: inputValue.trim(),
            done: false
        }];
        todos.value = newTodos;
        inputValue = '';
        const input = document.querySelector('.new-todo');
        if (input) {
            input.value = '';
            input.focus();
        }
        // Reset the flag after a short delay
        setTimeout(() => {
            isSubmitting = false;
        }, 100);
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

function startEditingTodo(id) {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
        editingTodo.value = id;
        editValue.value = todo.text;
        
        setTimeout(() => {
            const editInput = document.querySelector('.edit');
            if (editInput) {
                editInput.value = todo.text;
                editInput.focus();
                editInput.select();
            }
        }, 50);
    }
}

function saveEditedTodo(id) {
    console.log('saveEditedTodo called for id:', id, 'with value:', editValue.value);
    if (editValue.value.trim()) {
        const newTodos = todos.value.map(todo => 
            todo.id === id ? {...todo, text: editValue.value.trim()} : todo
        );
        todos.value = newTodos;
    } else {
        // If empty, keep the original text
        console.log('Empty value, keeping original text');
    }
    editingTodo.value = null;
    editValue.value = '';
}

function cancelEditingTodo() {
    editingTodo.value = null;
    editValue.value = '';
}

function getFilteredTodos() {
    const allTodos = todos.value;
    const currentFilter = filter.value;
    
    if (currentFilter === 'active') {
        return allTodos.filter(todo => !todo.done);
    } else if (currentFilter === 'completed') {
        return allTodos.filter(todo => todo.done);
    }
    return allTodos;
}

function clearCompleted() {
    const newTodos = todos.value.filter(todo => !todo.done);
    todos.value = newTodos;
}

function toggleAll() {
    const allCompleted = todos.value.every(todo => todo.done);
    const newTodos = todos.value.map(todo => ({
        ...todo,
        done: !allCompleted
    }));
    todos.value = newTodos;
}

// Components
function createTodoItem(todo) {
    const isEditing = editingTodo.value === todo.id;
    
    if (isEditing) {
        const currentEditValue = editValue.value || todo.text;
        return createElement('li', {
            'data-id': todo.id,
            className: 'editing'
        },
            createElement('input', {
                className: 'edit',
                type: 'text',
                value: currentEditValue,
                onInput: (e) => {
                    editValue.value = e.target.value;
                },
                onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                        saveEditedTodo(todo.id);
                    } else if (e.key === 'Escape') {
                        cancelEditingTodo();
                    }
                },
                onBlur: () => {
                    console.log('Blur event triggered for todo:', todo.id);
                    // Small delay to ensure blur completes before any potential re-render
                    setTimeout(() => {
                        saveEditedTodo(todo.id);
                    }, 10);
                }
            })
        );
    } else {
        return createElement('li', {
            'data-id': todo.id,
            className: todo.done ? 'completed' : ''
        }, 
            createElement('div', { className: 'view' },
                createElement('input', {
                    className: 'toggle',
                    type: 'checkbox',
                    checked: todo.done,
                    onChange: () => toggleTodo(todo.id)
                }),
                createElement('label', {
                    onDoubleClick: () => startEditingTodo(todo.id)
                }, todo.text),
                createElement('button', {
                    className: 'destroy',
                    onClick: () => deleteTodo(todo.id)
                })
            )
        );
    }
}

function createFilterButtons() {
    return createElement('ul', { className: 'filters' },
        createElement('li', {},
            createElement('a', {
                className: filter.value === 'all' ? 'selected' : '',
                href: '#/',
                onClick: (e) => {
                    e.preventDefault();
                    navigate('/');
                }
            }, 'All')
        ),
        createElement('li', {},
            createElement('a', {
                className: filter.value === 'active' ? 'selected' : '',
                href: '#/active',
                onClick: (e) => {
                    e.preventDefault();
                    navigate('/active');
                }
            }, 'Active')
        ),
        createElement('li', {},
            createElement('a', {
                className: filter.value === 'completed' ? 'selected' : '',
                href: '#/completed',
                onClick: (e) => {
                    e.preventDefault();
                    navigate('/completed');
                }
            }, 'Completed')
        )
    );
}

// Main render function
function renderApp() {
    const filteredTodos = getFilteredTodos();
    const activeTodosCount = todos.value.filter(t => !t.done).length;
    const completedTodosCount = todos.value.filter(t => t.done).length;
    
    const input = createElement('input', {
        className: 'new-todo',
        placeholder: 'What needs to be done?',
        autofocus: true,
        onInput: (e) => {
            inputValue = e.target.value;
        },
        onKeyDown: (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        },
        onBlur: () => {
            addTodo();
        }
    });
    
    const todoItems = filteredTodos.map(createTodoItem);
    
    const clearCompletedButton = completedTodosCount > 0 ? 
        createElement('button', {
            className: 'clear-completed',
            onClick: clearCompleted
        }, `Clear completed (${completedTodosCount})`) : null;
    
    const mainSection = todos.value.length > 0 ? 
        createElement('main', { className: 'main' },
            createElement('div', { className: 'toggle-all-container' },
                createElement('input', {
                    className: 'toggle-all',
                    type: 'checkbox',
                    id: 'toggle-all',
                    checked: todos.value.length > 0 && todos.value.every(todo => todo.done),
                    onChange: toggleAll
                }),
                createElement('label', {
                    className: 'toggle-all-label',
                    htmlFor: 'toggle-all'
                }, 'Mark all as complete')
            ),
            createElement('ul', { className: 'todo-list' }, ...todoItems)
        ) : null;

    const footer = todos.value.length > 0 ? 
        createElement('footer', { className: 'footer' },
            createElement('span', { className: 'todo-count' }, 
                `${activeTodosCount} item${activeTodosCount !== 1 ? 's' : ''} left`
            ),
            createFilterButtons(),
            clearCompletedButton
        ) : null;
    
    const app = createElement('div', {},
        createElement('section', { className: 'todoapp' },
            createElement('header', { className: 'header' },
                createElement('h1', {}, 'todos'),
                input
            ),
            mainSection,
            footer
        )
    );
    
    render(app, document.getElementById('app'));
}

// Initialize app
todos.subscribe(renderApp);
filter.subscribe(renderApp);
editingTodo.subscribe(renderApp);

renderApp();

// Auto-focus the input
setTimeout(() => {
    const input = document.querySelector('.new-todo');
    if (input) {
        input.focus();
    }
}, 100);
