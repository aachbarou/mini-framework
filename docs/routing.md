# 🧭 Routing Documentation

> URL synchronization for single-page applications

## 📖 Overview

RichFramework's routing system keeps your application state synchronized with the browser URL. When users navigate or bookmark your app, the URL reflects the current state, and changing the URL updates your app accordingly.

**Key Benefits:**
- ✅ Browser back/forward buttons work correctly
- ✅ URLs can be bookmarked and shared
- ✅ SEO-friendly navigation
- ✅ Clean hash-based routing

## 🏗️ How It Works

```javascript
// URL changes trigger state updates
window.location.hash = '#/users/123'  // URL becomes: yoursite.com/#/users/123
// → Your app automatically shows user 123

// State changes update the URL
RichFramework.navigate('/products');  // App shows products page
// → URL becomes: yoursite.com/#/products
```

## 🚀 Basic Usage

### Setting Up Routing
```javascript
RichFramework.ready(function() {
    // Create state for current page
    const currentPage = RichFramework.createState('home');
    
    // Listen for route changes
    RichFramework.onRouteChange((newRoute) => {
        console.log('Route changed to:', newRoute);
        
        if (newRoute === '/' || newRoute === '') {
            currentPage.value = 'home';
        } else if (newRoute === '/about') {
            currentPage.value = 'about';
        } else if (newRoute === '/contact') {
            currentPage.value = 'contact';
        }
    });
    
    // Set initial route
    const initialRoute = RichFramework.getCurrentRoute();
    if (initialRoute === '/about') {
        currentPage.value = 'about';
    } else if (initialRoute === '/contact') {
        currentPage.value = 'contact';
    } else {
        currentPage.value = 'home';
    }
    
    // Render based on current page
    function renderApp() {
        let pageContent;
        
        if (currentPage.value === 'home') {
            pageContent = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'Home Page'),
                RichFramework.createElement('p', {}, 'Welcome to our website!')
            );
        } else if (currentPage.value === 'about') {
            pageContent = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'About Us'),
                RichFramework.createElement('p', {}, 'Learn more about our company.')
            );
        } else if (currentPage.value === 'contact') {
            pageContent = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'Contact Us'),
                RichFramework.createElement('p', {}, 'Get in touch with us.')
            );
        }
        
        const app = RichFramework.createElement('div', {},
            // Navigation
            RichFramework.createElement('nav', {},
                RichFramework.createElement('a', {
                    href: '#/',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/');
                    }
                }, 'Home'),
                ' | ',
                RichFramework.createElement('a', {
                    href: '#/about',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/about');
                    }
                }, 'About'),
                ' | ',
                RichFramework.createElement('a', {
                    href: '#/contact',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/contact');
                    }
                }, 'Contact')
            ),
            
            // Page content
            RichFramework.createElement('main', {}, pageContent)
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    currentPage.subscribe(renderApp);
    renderApp();
});
```

### Navigation Methods

#### Programmatic Navigation
```javascript
// Navigate to different routes
RichFramework.navigate('/');           // Home page
RichFramework.navigate('/users');      // Users page
RichFramework.navigate('/users/123');  // Specific user page
RichFramework.navigate('/settings');   // Settings page
```

#### Link Navigation
```javascript
// Links that use routing
RichFramework.createElement('a', {
    href: '#/products',
    onClick: (event) => {
        event.preventDefault();           // Prevent page reload
        RichFramework.navigate('/products'); // Use framework routing
    }
}, 'View Products')
```

### Route Parameters

#### Simple Parameters
```javascript
RichFramework.onRouteChange((newRoute) => {
    const parts = newRoute.split('/');
    
    if (parts[1] === 'users' && parts[2]) {
        const userId = parts[2];
        console.log('Show user:', userId);
        showUserPage(userId);
    } else if (parts[1] === 'products' && parts[2]) {
        const productId = parts[2];
        console.log('Show product:', productId);
        showProductPage(productId);
    }
});

// Usage:
// /users/123 → shows user 123
// /products/456 → shows product 456
```

#### Query Parameters
```javascript
function parseRoute(route) {
    const [path, search] = route.split('?');
    const params = {};
    
    if (search) {
        search.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    }
    
    return { path, params };
}

RichFramework.onRouteChange((newRoute) => {
    const { path, params } = parseRoute(newRoute);
    
    if (path === '/search') {
        const query = params.q || '';
        const category = params.category || 'all';
        performSearch(query, category);
    }
});

// Usage:
// /search?q=laptop&category=electronics
```

## 🎯 Practical Examples

### Todo App with Filtering
```javascript
RichFramework.ready(function() {
    const todos = RichFramework.createState([
        { id: 1, text: 'Learn JavaScript', done: false },
        { id: 2, text: 'Build a todo app', done: true },
        { id: 3, text: 'Deploy to production', done: false }
    ]);
    
    const filter = RichFramework.createState('all');
    
    // Route handling
    RichFramework.onRouteChange((newRoute) => {
        if (newRoute === '/' || newRoute === '') {
            filter.value = 'all';
        } else if (newRoute === '/active') {
            filter.value = 'active';
        } else if (newRoute === '/completed') {
            filter.value = 'completed';
        }
    });
    
    // Initialize route
    const currentRoute = RichFramework.getCurrentRoute();
    if (currentRoute === '/active') {
        filter.value = 'active';
    } else if (currentRoute === '/completed') {
        filter.value = 'completed';
    }
    
    function getFilteredTodos() {
        if (filter.value === 'active') {
            return todos.value.filter(todo => !todo.done);
        } else if (filter.value === 'completed') {
            return todos.value.filter(todo => todo.done);
        }
        return todos.value;
    }
    
    function renderApp() {
        const filteredTodos = getFilteredTodos();
        
        const app = RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, 'Todo App'),
            
            // Filter navigation
            RichFramework.createElement('nav', {},
                RichFramework.createElement('a', {
                    href: '#/',
                    className: filter.value === 'all' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/');
                    }
                }, 'All'),
                ' | ',
                RichFramework.createElement('a', {
                    href: '#/active',
                    className: filter.value === 'active' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/active');
                    }
                }, 'Active'),
                ' | ',
                RichFramework.createElement('a', {
                    href: '#/completed',
                    className: filter.value === 'completed' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/completed');
                    }
                }, 'Completed')
            ),
            
            // Todo list
            RichFramework.createElement('ul', {},
                ...filteredTodos.map(todo =>
                    RichFramework.createElement('li', {
                        className: todo.done ? 'completed' : ''
                    }, todo.text)
                )
            ),
            
            RichFramework.createElement('p', {}, 
                `Showing ${filteredTodos.length} of ${todos.value.length} todos`
            )
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    todos.subscribe(renderApp);
    filter.subscribe(renderApp);
    renderApp();
});
```

### Multi-Page Application
```javascript
RichFramework.ready(function() {
    const currentPage = RichFramework.createState('home');
    const pageData = RichFramework.createState(null);
    
    // Page components
    const pages = {
        home: () => RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, 'Welcome Home'),
            RichFramework.createElement('p', {}, 'This is the home page.'),
            RichFramework.createElement('button', {
                onClick: () => RichFramework.navigate('/users')
            }, 'View Users')
        ),
        
        users: () => RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, 'Users'),
            RichFramework.createElement('ul', {},
                RichFramework.createElement('li', {},
                    RichFramework.createElement('a', {
                        href: '#/users/1',
                        onClick: (e) => {
                            e.preventDefault();
                            RichFramework.navigate('/users/1');
                        }
                    }, 'John Doe')
                ),
                RichFramework.createElement('li', {},
                    RichFramework.createElement('a', {
                        href: '#/users/2',
                        onClick: (e) => {
                            e.preventDefault();
                            RichFramework.navigate('/users/2');
                        }
                    }, 'Jane Smith')
                )
            )
        ),
        
        user: (userId) => {
            const users = {
                '1': { name: 'John Doe', email: 'john@example.com' },
                '2': { name: 'Jane Smith', email: 'jane@example.com' }
            };
            
            const user = users[userId];
            
            if (!user) {
                return RichFramework.createElement('div', {},
                    RichFramework.createElement('h1', {}, 'User Not Found'),
                    RichFramework.createElement('p', {}, `User with ID ${userId} does not exist.`)
                );
            }
            
            return RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, user.name),
                RichFramework.createElement('p', {}, `Email: ${user.email}`),
                RichFramework.createElement('button', {
                    onClick: () => RichFramework.navigate('/users')
                }, 'Back to Users')
            );
        },
        
        notFound: () => RichFramework.createElement('div', {},
            RichFramework.createElement('h1', {}, '404 - Page Not Found'),
            RichFramework.createElement('p', {}, 'The page you are looking for does not exist.'),
            RichFramework.createElement('button', {
                onClick: () => RichFramework.navigate('/')
            }, 'Go Home')
        )
    };
    
    // Route handling
    RichFramework.onRouteChange((newRoute) => {
        const parts = newRoute.split('/').filter(part => part);
        
        if (!parts.length || parts[0] === '') {
            currentPage.value = 'home';
            pageData.value = null;
        } else if (parts[0] === 'users') {
            if (parts[1]) {
                currentPage.value = 'user';
                pageData.value = parts[1]; // User ID
            } else {
                currentPage.value = 'users';
                pageData.value = null;
            }
        } else {
            currentPage.value = 'notFound';
            pageData.value = null;
        }
    });
    
    // Initialize route
    const initialRoute = RichFramework.getCurrentRoute();
    const initialParts = initialRoute.split('/').filter(part => part);
    
    if (!initialParts.length) {
        currentPage.value = 'home';
    } else if (initialParts[0] === 'users') {
        if (initialParts[1]) {
            currentPage.value = 'user';
            pageData.value = initialParts[1];
        } else {
            currentPage.value = 'users';
        }
    } else {
        currentPage.value = 'notFound';
    }
    
    function renderApp() {
        let pageContent;
        
        if (currentPage.value === 'user') {
            pageContent = pages.user(pageData.value);
        } else if (pages[currentPage.value]) {
            pageContent = pages[currentPage.value]();
        } else {
            pageContent = pages.notFound();
        }
        
        const app = RichFramework.createElement('div', {},
            // Global navigation
            RichFramework.createElement('nav', { className: 'main-nav' },
                RichFramework.createElement('a', {
                    href: '#/',
                    className: currentPage.value === 'home' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/');
                    }
                }, 'Home'),
                ' | ',
                RichFramework.createElement('a', {
                    href: '#/users',
                    className: currentPage.value === 'users' || currentPage.value === 'user' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        RichFramework.navigate('/users');
                    }
                }, 'Users')
            ),
            
            // Page content
            RichFramework.createElement('main', {}, pageContent)
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    currentPage.subscribe(renderApp);
    pageData.subscribe(renderApp);
    renderApp();
});
```

### Shopping Cart with Route State
```javascript
RichFramework.ready(function() {
    const products = RichFramework.createState([
        { id: 1, name: 'Laptop', price: 999 },
        { id: 2, name: 'Mouse', price: 29 },
        { id: 3, name: 'Keyboard', price: 79 }
    ]);
    
    const cart = RichFramework.createState([]);
    const currentView = RichFramework.createState('products');
    const selectedProduct = RichFramework.createState(null);
    
    // Route handling
    RichFramework.onRouteChange((newRoute) => {
        const parts = newRoute.split('/').filter(part => part);
        
        if (!parts.length) {
            currentView.value = 'products';
            selectedProduct.value = null;
        } else if (parts[0] === 'products' && parts[1]) {
            const productId = parseInt(parts[1]);
            const product = products.value.find(p => p.id === productId);
            if (product) {
                currentView.value = 'product-detail';
                selectedProduct.value = product;
            } else {
                currentView.value = 'not-found';
            }
        } else if (parts[0] === 'cart') {
            currentView.value = 'cart';
            selectedProduct.value = null;
        } else {
            currentView.value = 'not-found';
        }
    });
    
    function addToCart(product) {
        const existingItem = cart.value.find(item => item.id === product.id);
        if (existingItem) {
            cart.value = cart.value.map(item =>
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            cart.value = [...cart.value, { ...product, quantity: 1 }];
        }
    }
    
    function renderApp() {
        let content;
        
        if (currentView.value === 'products') {
            content = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'Products'),
                RichFramework.createElement('div', { className: 'product-grid' },
                    ...products.value.map(product =>
                        RichFramework.createElement('div', { className: 'product-card' },
                            RichFramework.createElement('h3', {}, product.name),
                            RichFramework.createElement('p', {}, `$${product.price}`),
                            RichFramework.createElement('button', {
                                onClick: () => RichFramework.navigate(`/products/${product.id}`)
                            }, 'View Details'),
                            RichFramework.createElement('button', {
                                onClick: () => addToCart(product)
                            }, 'Add to Cart')
                        )
                    )
                )
            );
        } else if (currentView.value === 'product-detail' && selectedProduct.value) {
            const product = selectedProduct.value;
            content = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, product.name),
                RichFramework.createElement('p', { className: 'price' }, `Price: $${product.price}`),
                RichFramework.createElement('p', {}, 'Product description goes here...'),
                RichFramework.createElement('button', {
                    onClick: () => addToCart(product)
                }, 'Add to Cart'),
                RichFramework.createElement('button', {
                    onClick: () => RichFramework.navigate('/')
                }, 'Back to Products')
            );
        } else if (currentView.value === 'cart') {
            const total = cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            content = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'Shopping Cart'),
                cart.value.length === 0
                    ? RichFramework.createElement('p', {}, 'Your cart is empty')
                    : RichFramework.createElement('div', {},
                        RichFramework.createElement('ul', {},
                            ...cart.value.map(item =>
                                RichFramework.createElement('li', {},
                                    `${item.name} - $${item.price} x ${item.quantity} = $${item.price * item.quantity}`
                                )
                            )
                        ),
                        RichFramework.createElement('p', { className: 'total' }, `Total: $${total}`)
                    ),
                RichFramework.createElement('button', {
                    onClick: () => RichFramework.navigate('/')
                }, 'Continue Shopping')
            );
        } else {
            content = RichFramework.createElement('div', {},
                RichFramework.createElement('h1', {}, 'Page Not Found'),
                RichFramework.createElement('button', {
                    onClick: () => RichFramework.navigate('/')
                }, 'Go Home')
            );
        }
        
        const app = RichFramework.createElement('div', {},
            // Header with navigation
            RichFramework.createElement('header', {},
                RichFramework.createElement('nav', {},
                    RichFramework.createElement('a', {
                        href: '#/',
                        onClick: (e) => {
                            e.preventDefault();
                            RichFramework.navigate('/');
                        }
                    }, 'Products'),
                    ' | ',
                    RichFramework.createElement('a', {
                        href: '#/cart',
                        onClick: (e) => {
                            e.preventDefault();
                            RichFramework.navigate('/cart');
                        }
                    }, `Cart (${cart.value.length})`)
                )
            ),
            
            // Main content
            RichFramework.createElement('main', {}, content)
        );
        
        RichFramework.render(app, document.getElementById('app'));
    }
    
    // Subscribe to all state changes
    currentView.subscribe(renderApp);
    selectedProduct.subscribe(renderApp);
    cart.subscribe(renderApp);
    products.subscribe(renderApp);
    
    // Initialize
    const initialRoute = RichFramework.getCurrentRoute();
    const initialParts = initialRoute.split('/').filter(part => part);
    
    if (!initialParts.length) {
        currentView.value = 'products';
    } else if (initialParts[0] === 'products' && initialParts[1]) {
        const productId = parseInt(initialParts[1]);
        const product = products.value.find(p => p.id === productId);
        if (product) {
            currentView.value = 'product-detail';
            selectedProduct.value = product;
        }
    } else if (initialParts[0] === 'cart') {
        currentView.value = 'cart';
    }
    
    renderApp();
});
```

## 💡 Best Practices

### 1. Prevent Default on Links
```javascript
// ✅ Always prevent default for SPA links
RichFramework.createElement('a', {
    href: '#/about',
    onClick: (event) => {
        event.preventDefault();
        RichFramework.navigate('/about');
    }
}, 'About')

// ❌ Don't rely on href alone for routing
RichFramework.createElement('a', {
    href: '#/about'  // Will cause page reload
}, 'About')
```

### 2. Initialize Routes Properly
```javascript
// ✅ Handle initial route on page load
const initialRoute = RichFramework.getCurrentRoute();
if (initialRoute === '/users') {
    currentPage.value = 'users';
} else {
    currentPage.value = 'home';
}

// ✅ Set up route change listener
RichFramework.onRouteChange((newRoute) => {
    // Handle route changes
});
```

### 3. Use Route Parameters
```javascript
// ✅ Parse route parameters
RichFramework.onRouteChange((newRoute) => {
    const parts = newRoute.split('/');
    
    if (parts[1] === 'users' && parts[2]) {
        const userId = parts[2];
        loadUser(userId);
    }
});
```

### 4. Handle 404s
```javascript
// ✅ Always have a fallback for unknown routes
RichFramework.onRouteChange((newRoute) => {
    if (newRoute === '/') {
        showHomePage();
    } else if (newRoute === '/about') {
        showAboutPage();
    } else {
        show404Page(); // Fallback for unknown routes
    }
});
```

## 🎯 Why Hash-Based Routing?

### 1. **Simplicity**
Hash-based routing (`#/page`) is simple to implement and works without server configuration.

### 2. **Client-Side Only**
Hash changes don't trigger server requests, perfect for single-page applications.

### 3. **Browser Support**
Works in all browsers, including older ones.

### 4. **Bookmarkable**
URLs with hashes can be bookmarked and shared.

## 🔧 Implementation Details

Our router uses the browser's `hashchange` event:

```javascript
class Router {
    constructor() {
        this.listeners = [];
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newRoute = this.getCurrentRoute();
            this.listeners.forEach(listener => listener(newRoute));
        });
    }
    
    getCurrentRoute() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : '/'; // Remove the # symbol
    }
    
    navigate(path) {
        window.location.hash = path; // This triggers hashchange event
    }
    
    onRouteChange(callback) {
        this.listeners.push(callback);
    }
}
```

This way:
- ✅ URL changes trigger route updates
- ✅ Route updates change the URL
- ✅ Browser back/forward buttons work
- ✅ URLs are bookmarkable

## 🎉 You're Ready!

With RichFramework's routing system, you can build single-page applications with proper URL handling and navigation. Your users can bookmark pages, use the back button, and share links!

**You now have all the tools**: Events, State, Virtual DOM, and Routing - everything you need to build amazing applications with RichFramework! 🚀
