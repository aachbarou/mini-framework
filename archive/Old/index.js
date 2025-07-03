// RichFramework - Main Export File
// Clean, simple, modern approach

// Export everything from individual modules
export { 
    version, 
    log, 
    setDebug, 
    metrics, 
    bootstrap, 
    ready, 
    run, 
    gameLoop 
} from './framework-new.js';

export { 
    State, 
    createState 
} from './state-new.js';

export { 
    on, 
    off, 
    emit, 
    onGlobal 
} from './events-new.js';

export { 
    VNode, 
    createElement, 
    createRealElement, 
    render 
} from './virtual-dom-new.js';

// For convenience, export a default object too (optional)
import * as framework from './framework-new.js';
import * as state from './state-new.js';
import * as events from './events-new.js';
import * as vdom from './virtual-dom-new.js';

export default {
    ...framework,
    ...state,
    ...events,
    ...vdom
};
