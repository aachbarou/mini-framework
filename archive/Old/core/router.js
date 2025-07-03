// ===== ROUTING SYSTEM =====
// URL synchronization with application state
// Hash-based routing for single-page applications

if (!window.RichFramework) {
    console.error('❌ RichFramework base not found!');
}

class Router {
    constructor() {
        this.currentRoute = this.getCurrentRoute();
        this.listeners = [];
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const newRoute = this.getCurrentRoute();
            const oldRoute = this.currentRoute;
            this.currentRoute = newRoute;
            
            // RichFramework.log(`🔄 Route changed: ${oldRoute} → ${newRoute}`);
            
            // Notify all listeners
            this.listeners.forEach(listener => listener(newRoute, oldRoute));
        });
        
        // RichFramework.log('🔄 Router initialized, current route:', this.currentRoute);
    }
    
    getCurrentRoute() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : '/';
    }
    
    navigate(path) {
        RichFramework.log(`🧭 Navigating to: ${path}`);
        window.location.hash = path;
    }
    
    onRouteChange(callback) {
        this.listeners.push(callback);
        RichFramework.log('👂 Route listener added');
    }
}

// Global instance
const router = new Router();

// Simple API
window.RichFramework.router = router;
window.RichFramework.navigate = (path) => router.navigate(path);

// ===== EXPORT FOR CLEAN IMPORTS =====
export const navigate = (path) => router.navigate(path);
export const onRouteChange = (callback) => router.onRouteChange(callback);
export const getCurrentRoute = () => router.getCurrentRoute();
window.RichFramework.getCurrentRoute = () => router.getCurrentRoute();
window.RichFramework.onRouteChange = (callback) => router.onRouteChange(callback);

RichFramework.log('✅ Router module loaded - URL synchronization ready!');