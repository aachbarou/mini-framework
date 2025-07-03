# 🧭 Routing - Pure ES6 Module

> URL synchronization and navigation for single-page applications

## 📖 Overview

The Routing module provides URL synchronization for single-page applications. It allows you to change views based on the current URL, navigate programmatically, and keep your app's state in sync with the browser's address bar. Users can bookmark pages, use back/forward buttons, and share links.

**Key Benefits:**
- ✅ **URL Synchronization** - App state matches browser URL
- ✅ **Browser Navigation** - Back/forward buttons work correctly
- ✅ **Bookmarkable URLs** - Users can bookmark and share links
- ✅ **Hash-based Routing** - Works without server configuration
- ✅ **Pure ES6 Module** - Clean imports, no global objects

## 🚀 Import and Basic Usage

```javascript
import { navigate, onRouteChange, getCurrentRoute } from './Core/router.js';

// Listen for route changes
onRouteChange((newRoute) => {
    console.log('Route changed to:', newRoute);
    
    if (newRoute === '/') {
        showHomePage();
    } else if (newRoute === '/about') {
        showAboutPage();
    }
});

// Navigate programmatically
navigate('/about');

// Get current route
const currentRoute = getCurrentRoute(); // e.g., "/about"
```

## 🎯 Setting Up Routing

### Basic Route Handler
```javascript
import { onRouteChange } from './Core/router.js';
import { createElement, render } from './Core/virtual-dom.js';

function renderPage() {
    let pageContent;
    const route = getCurrentRoute();
    
    switch (route) {
        case '/':
        case '':
            pageContent = createElement('div', {},
                createElement('h1', {}, 'Home Page'),
                createElement('p', {}, 'Welcome to our website!')
            );
            break;
            
        case '/about':
            pageContent = createElement('div', {},
                createElement('h1', {}, 'About Us'),
                createElement('p', {}, 'Learn more about our company.')
            );
            break;
            
        case '/contact':
            pageContent = createElement('div', {},
                createElement('h1', {}, 'Contact'),
                createElement('p', {}, 'Get in touch with us.')
            );
            break;
            
        default:
            pageContent = createElement('div', {},
                createElement('h1', {}, '404 - Page Not Found'),
                createElement('p', {}, 'The page you are looking for does not exist.')
            );
    }
    
    const app = createElement('div', {},
        createElement('nav', {},
            createElement('a', { href: '#/' }, 'Home'),
            createElement('a', { href: '#/about' }, 'About'),
            createElement('a', { href: '#/contact' }, 'Contact')
        ),
        pageContent
    );
    
    render(app, document.getElementById('app'));
}

// Listen for route changes
onRouteChange(renderPage);

// Initial render
renderPage();
```

### Route-based State Management
```javascript
import { createState } from './Core/state.js';
import { onRouteChange, getCurrentRoute } from './Core/router.js';

const currentPage = createState('home');
const pageData = createState({});

// Update state when route changes
onRouteChange((newRoute) => {
    if (newRoute === '/' || newRoute === '') {
        currentPage.value = 'home';
        pageData.value = { title: 'Home', content: 'Welcome!' };
    } else if (newRoute === '/about') {
        currentPage.value = 'about';
        pageData.value = { title: 'About', content: 'About our company' };
    } else if (newRoute === '/contact') {
        currentPage.value = 'contact';
        pageData.value = { title: 'Contact', content: 'Contact information' };
    } else {
        currentPage.value = '404';
        pageData.value = { title: 'Not Found', content: 'Page not found' };
    }
});

// Initialize with current route
const initialRoute = getCurrentRoute();
if (initialRoute === '/about') {
    currentPage.value = 'about';
} else if (initialRoute === '/contact') {
    currentPage.value = 'contact';
} else {
    currentPage.value = 'home';
}
```

## 🔗 Navigation

### Programmatic Navigation
```javascript
import { navigate } from './Core/router.js';

// Navigate to different pages
function goToAbout() {
    navigate('/about');
}

function goToContact() {
    navigate('/contact');
}

function goHome() {
    navigate('/');
}

// Navigate with user interaction
createElement('button', {
    onClick: () => navigate('/about')
}, 'Go to About');

createElement('button', {
    onClick: () => navigate('/contact')
}, 'Go to Contact');
```

### Link Navigation
```javascript
// Using regular links (recommended for SEO and accessibility)
createElement('nav', {},
    createElement('a', {
        href: '#/',
        onClick: (event) => {
            event.preventDefault();
            navigate('/');
        }
    }, 'Home'),
    
    createElement('a', {
        href: '#/about',
        onClick: (event) => {
            event.preventDefault();
            navigate('/about');
        }
    }, 'About'),
    
    createElement('a', {
        href: '#/contact',
        onClick: (event) => {
            event.preventDefault();
            navigate('/contact');
        }
    }, 'Contact')
);

// Helper function for navigation links
function createNavLink(href, text) {
    return createElement('a', {
        href: `#${href}`,
        onClick: (event) => {
            event.preventDefault();
            navigate(href);
        }
    }, text);
}

// Usage
createElement('nav', {},
    createNavLink('/', 'Home'),
    createNavLink('/about', 'About'),
    createNavLink('/contact', 'Contact')
);
```

## 🏗️ Real-World Examples

### Multi-Page App with Navigation
```javascript
import { createState } from './Core/state.js';
import { createElement, render } from './Core/virtual-dom.js';
import { navigate, onRouteChange, getCurrentRoute } from './Core/router.js';

const currentRoute = createState('/');
const isLoading = createState(false);

// Update state when route changes
onRouteChange((newRoute) => {
    currentRoute.value = newRoute;
    
    // Simulate loading for page transitions
    isLoading.value = true;
    setTimeout(() => {
        isLoading.value = false;
    }, 300);
});

// Initialize route
currentRoute.value = getCurrentRoute() || '/';

function createNavigation() {
    return createElement('nav', { className: 'navigation' },
        createElement('div', { className: 'nav-brand' },
            createElement('h2', {}, 'My App')
        ),
        createElement('ul', { className: 'nav-links' },
            createElement('li', {},
                createElement('a', {
                    href: '#/',
                    className: currentRoute.value === '/' ? 'active' : '',
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/');
                    }
                }, 'Home')
            ),
            createElement('li', {},
                createElement('a', {
                    href: '#/products',
                    className: currentRoute.value === '/products' ? 'active' : '',
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/products');
                    }
                }, 'Products')
            ),
            createElement('li', {},
                createElement('a', {
                    href: '#/about',
                    className: currentRoute.value === '/about' ? 'active' : '',
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/about');
                    }
                }, 'About')
            ),
            createElement('li', {},
                createElement('a', {
                    href: '#/contact',
                    className: currentRoute.value === '/contact' ? 'active' : '',
                    onClick: (event) => {
                        event.preventDefault();
                        navigate('/contact');
                    }
                }, 'Contact')
            )
        )
    );
}

function createPageContent() {
    if (isLoading.value) {
        return createElement('div', { className: 'loading' },
            createElement('p', {}, 'Loading...')
        );
    }
    
    switch (currentRoute.value) {
        case '/':
        case '':
            return createElement('div', { className: 'page home' },
                createElement('h1', {}, 'Welcome Home'),
                createElement('p', {}, 'This is the home page of our application.'),
                createElement('button', {
                    onClick: () => navigate('/products')
                }, 'View Products')
            );
            
        case '/products':
            return createElement('div', { className: 'page products' },
                createElement('h1', {}, 'Our Products'),
                createElement('div', { className: 'product-grid' },
                    createElement('div', { className: 'product-card' },
                        createElement('h3', {}, 'Product 1'),
                        createElement('p', {}, 'Description of product 1')
                    ),
                    createElement('div', { className: 'product-card' },
                        createElement('h3', {}, 'Product 2'),
                        createElement('p', {}, 'Description of product 2')
                    )
                )
            );
            
        case '/about':
            return createElement('div', { className: 'page about' },
                createElement('h1', {}, 'About Us'),
                createElement('p', {}, 'We are a company dedicated to building great software.'),
                createElement('button', {
                    onClick: () => navigate('/contact')
                }, 'Contact Us')
            );
            
        case '/contact':
            return createElement('div', { className: 'page contact' },
                createElement('h1', {}, 'Contact Us'),
                createElement('form', {
                    onSubmit: (event) => {
                        event.preventDefault();
                        alert('Message sent!');
                        navigate('/');
                    }
                },
                    createElement('input', {
                        type: 'text',
                        placeholder: 'Your name',
                        required: true
                    }),
                    createElement('input', {
                        type: 'email',
                        placeholder: 'Your email',
                        required: true
                    }),
                    createElement('textarea', {
                        placeholder: 'Your message',
                        required: true
                    }),
                    createElement('button', { type: 'submit' }, 'Send Message')
                )
            );
            
        default:
            return createElement('div', { className: 'page error' },
                createElement('h1', {}, '404 - Page Not Found'),
                createElement('p', {}, 'The page you are looking for does not exist.'),
                createElement('button', {
                    onClick: () => navigate('/')
                }, 'Go Home')
            );
    }
}

function renderApp() {
    const app = createElement('div', { className: 'app' },
        createNavigation(),
        createElement('main', { className: 'main-content' },
            createPageContent()
        )
    );
    
    render(app, document.getElementById('app'));
}

// Subscribe to state changes
currentRoute.subscribe(renderApp);
isLoading.subscribe(renderApp);

// Initial render
renderApp();
```

### Todo App with Filtering Routes
```javascript
import { createState } from './Core/state.js';
import { navigate, onRouteChange, getCurrentRoute } from './Core/router.js';

const todos = createState([
    { id: 1, text: 'Learn routing', done: false },
    { id: 2, text: 'Build an app', done: true },
    { id: 3, text: 'Deploy to production', done: false }
]);

const filter = createState('all'); // 'all', 'active', 'completed'

// Route-based filtering
onRouteChange((newRoute) => {
    if (newRoute === '/' || newRoute === '') {
        filter.value = 'all';
    } else if (newRoute === '/active') {
        filter.value = 'active';
    } else if (newRoute === '/completed') {
        filter.value = 'completed';
    }
});

// Initialize filter from current route
const currentRoute = getCurrentRoute();
if (currentRoute === '/active') {
    filter.value = 'active';
} else if (currentRoute === '/completed') {
    filter.value = 'completed';
} else {
    filter.value = 'all';
}

function getFilteredTodos() {
    switch (filter.value) {
        case 'active':
            return todos.value.filter(todo => !todo.done);
        case 'completed':
            return todos.value.filter(todo => todo.done);
        default:
            return todos.value;
    }
}

function createFilterButtons() {
    return createElement('div', { className: 'filters' },
        createElement('button', {
            className: filter.value === 'all' ? 'active' : '',
            onClick: () => navigate('/')
        }, 'All'),
        
        createElement('button', {
            className: filter.value === 'active' ? 'active' : '',
            onClick: () => navigate('/active')
        }, 'Active'),
        
        createElement('button', {
            className: filter.value === 'completed' ? 'active' : '',
            onClick: () => navigate('/completed')
        }, 'Completed')
    );
}

function renderTodoApp() {
    const filteredTodos = getFilteredTodos();
    
    const app = createElement('div', { className: 'todo-app' },
        createElement('h1', {}, 'Todo App with Routing'),
        
        createFilterButtons(),
        
        createElement('div', { className: 'current-filter' },
            createElement('p', {}, `Showing: ${filter.value} (${filteredTodos.length} items)`)
        ),
        
        createElement('ul', { className: 'todo-list' },
            ...filteredTodos.map(todo =>
                createElement('li', {
                    key: todo.id,
                    className: todo.done ? 'completed' : ''
                },
                    createElement('span', {}, todo.text),
                    createElement('span', {}, todo.done ? ' ✓' : ' ○')
                )
            )
        )
    );
    
    render(app, document.getElementById('app'));
}

todos.subscribe(renderTodoApp);
filter.subscribe(renderTodoApp);
renderTodoApp();
```

### Router with Parameters (Advanced)
```javascript
// Simple parameter extraction for routes like /user/123
function parseRoute(route) {
    const parts = route.split('/').filter(part => part);
    
    if (parts.length === 0) {
        return { page: 'home', params: {} };
    }
    
    if (parts[0] === 'user' && parts[1]) {
        return { 
            page: 'user', 
            params: { userId: parts[1] } 
        };
    }
    
    if (parts[0] === 'product' && parts[1]) {
        return { 
            page: 'product', 
            params: { productId: parts[1] } 
        };
    }
    
    return { 
        page: parts[0], 
        params: {} 
    };
}

const routeInfo = createState({ page: 'home', params: {} });

onRouteChange((newRoute) => {
    routeInfo.value = parseRoute(newRoute);
});

// Initialize
routeInfo.value = parseRoute(getCurrentRoute());

function renderDynamicApp() {
    const { page, params } = routeInfo.value;
    
    let pageContent;
    
    switch (page) {
        case 'home':
            pageContent = createElement('div', {},
                createElement('h1', {}, 'Home'),
                createElement('div', {},
                    createElement('button', {
                        onClick: () => navigate('/user/123')
                    }, 'View User 123'),
                    createElement('button', {
                        onClick: () => navigate('/product/456')
                    }, 'View Product 456')
                )
            );
            break;
            
        case 'user':
            pageContent = createElement('div', {},
                createElement('h1', {}, `User Profile: ${params.userId}`),
                createElement('p', {}, `Displaying information for user ${params.userId}`),
                createElement('button', {
                    onClick: () => navigate('/')
                }, 'Back to Home')
            );
            break;
            
        case 'product':
            pageContent = createElement('div', {},
                createElement('h1', {}, `Product: ${params.productId}`),
                createElement('p', {}, `Product details for ${params.productId}`),
                createElement('button', {
                    onClick: () => navigate('/')
                }, 'Back to Home')
            );
            break;
            
        default:
            pageContent = createElement('div', {},
                createElement('h1', {}, '404 - Not Found')
            );
    }
    
    const app = createElement('div', {},
        createElement('nav', {},
            createElement('a', {
                href: '#/',
                onClick: (e) => { e.preventDefault(); navigate('/'); }
            }, 'Home')
        ),
        pageContent
    );
    
    render(app, document.getElementById('app'));
}

routeInfo.subscribe(renderDynamicApp);
renderDynamicApp();
```

## 🎯 Routing Best Practices

### 1. **Initialize Route State**
```javascript
// Always initialize with current route
const currentRoute = getCurrentRoute();
if (currentRoute === '/about') {
    currentPage.value = 'about';
} else {
    currentPage.value = 'home';
}
```

### 2. **Use Consistent Route Structure**
```javascript
// ✅ Good - Consistent structure
'/users'           // List all users
'/users/123'       // View user 123
'/users/123/edit'  // Edit user 123

// ❌ Avoid - Inconsistent structure
'/user-list'
'/show-user-123'
'/edit_user/123'
```

### 3. **Handle 404 Cases**
```javascript
function renderPage() {
    const route = getCurrentRoute();
    
    switch (route) {
        case '/':
            return createHomePage();
        case '/about':
            return createAboutPage();
        default:
            return create404Page(); // Always have a fallback
    }
}
```

### 4. **Use Descriptive Route Names**
```javascript
// ✅ Good - Clear and descriptive
'/dashboard'
'/settings/profile'
'/reports/monthly'
'/help/getting-started'

// ❌ Avoid - Unclear abbreviations
'/dash'
'/cfg'
'/rpt'
'/hlp'
```

## 🔧 Internal Architecture

### How Routing Works
1. **Hash-based** - Uses `window.location.hash` for routing
2. **Event-driven** - Listens to `hashchange` events
3. **State synchronization** - Keeps route in sync with URL
4. **Browser integration** - Back/forward buttons work correctly

### Why Hash-based Routing?
- **No server config** - Works on any static host
- **Bookmark friendly** - URLs are shareable
- **Browser support** - Works in all browsers
- **No page reloads** - Fast navigation

### Route Format
```
https://myapp.com/#/about        → route: '/about'
https://myapp.com/#/users/123    → route: '/users/123'
https://myapp.com/#/            → route: '/'
https://myapp.com/              → route: '/' (empty hash)
```

## 🚀 Advanced Patterns

### Route Guards
```javascript
const isLoggedIn = createState(false);

onRouteChange((newRoute) => {
    // Protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];
    
    if (protectedRoutes.includes(newRoute) && !isLoggedIn.value) {
        // Redirect to login
        navigate('/login');
        return;
    }
    
    // Public routes
    updateCurrentPage(newRoute);
});
```

### Route History
```javascript
const routeHistory = createState([]);

onRouteChange((newRoute) => {
    routeHistory.value = [...routeHistory.value, newRoute];
    
    // Keep only last 10 routes
    if (routeHistory.value.length > 10) {
        routeHistory.value = routeHistory.value.slice(-10);
    }
});

function goBack() {
    const history = routeHistory.value;
    if (history.length > 1) {
        const previousRoute = history[history.length - 2];
        navigate(previousRoute);
    }
}
```

### Nested Routes
```javascript
function parseNestedRoute(route) {
    const parts = route.split('/').filter(p => p);
    
    return {
        section: parts[0] || 'home',
        subsection: parts[1] || null,
        id: parts[2] || null
    };
}

onRouteChange((newRoute) => {
    const { section, subsection, id } = parseNestedRoute(newRoute);
    
    currentSection.value = section;
    currentSubsection.value = subsection;
    currentId.value = id;
});
```

---

**Master routing to build sophisticated single-page applications with proper URL handling and navigation!** 🧭
