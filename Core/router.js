// Pure Router - No window.RichFramework at all!
// Just like your friends use

class Router {
    constructor() {
        this.currentRoute = this.getCurrentRoute();
        this.listeners = [];
        
        window.addEventListener('hashchange', () => {
            const newRoute = this.getCurrentRoute();
            const oldRoute = this.currentRoute;
            this.currentRoute = newRoute;
            this.listeners.forEach(listener => listener(newRoute, oldRoute));
        });
    }
    
    getCurrentRoute() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : '/';
    }
    
    navigate(path) {
        window.location.hash = path;
    }
    
    onRouteChange(callback) {
        this.listeners.push(callback);
    }
}

const router = new Router();

export function navigate(path) {
    return router.navigate(path);
}

export function onRouteChange(callback) {
    return router.onRouteChange(callback);
}

export function getCurrentRoute() {
    return router.getCurrentRoute();
}
