// RichFramework - Unified Framework (richouan's custom framework)
// Combines all our core modules

window.RichFramework = {
    // Will be populated by core modules
    version: '1.0.0',
    
    // Initialize the framework
    init: function() {
        console.log('🚀 RichFramework v' + this.version + ' initialized!');
        console.log('Available methods:', Object.keys(this));
    }
};

console.log('RichFramework base loaded - waiting for core modules...');