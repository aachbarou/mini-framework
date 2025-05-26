// RichFramework - richouan's custom framework

// Create the framework object directly (no class)
window.RichFramework = {
    // Method to create simple HTML
    createElement: function(tag, text) {
        console.log(`Creating element: ${tag} with text: ${text}`);
        return `<${tag}>${text}</${tag}>`;
    },
    
    // Method to put HTML on page
    render: function(html, selector) {
        console.log(`Rendering HTML to: ${selector}`);
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = html;
            console.log('Render successful!');
        } else {
            console.log('ERROR: Target element not found!');
        }
    }
};

console.log('RichFramework started!');
console.log('createElement exists:', typeof window.RichFramework.createElement);
console.log('render exists:', typeof window.RichFramework.render);