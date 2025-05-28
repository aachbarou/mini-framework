// RichFramework Router - AUDIT-SAFE VERSION
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
            
            console.log(`🔄 Route changed: ${oldRoute} → ${newRoute}`);
            
            // Notify all listeners
            this.listeners.forEach(listener => listener(newRoute, oldRoute));
        });
        
        console.log('🔄 Router initialized, current route:', this.currentRoute);
    }
    
    getCurrentRoute() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : '/';
    }
    
    navigate(path) {
        console.log(`🧭 Navigating to: ${path}`);
        window.location.hash = path;
    }
    
    onRouteChange(callback) {
        this.listeners.push(callback);
        console.log('👂 Route listener added');
    }
}

// Global instance
const router = new Router();

// Simple API
window.RichFramework.router = router;
window.RichFramework.navigate = (path) => router.navigate(path);
window.RichFramework.getCurrentRoute = () => router.getCurrentRoute();
window.RichFramework.onRouteChange = (callback) => router.onRouteChange(callback);

console.log('✅ Router module loaded!');