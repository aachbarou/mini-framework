// RichFramework Validation Test Suite
// Automated testing for 60fps performance and functionality

console.log('🧪 Starting RichFramework validation tests...');

// Test 1: Framework Loading and Initialization
function testFrameworkLoading() {
    console.log('📦 Testing framework loading...');
    
    const requiredComponents = [
        'createElement', 'render', 'createState', 'navigate', 'onRouteChange',
        'ready', 'events', 'PerformanceMonitor', 'GameLoop', 'BenchmarkSuite',
        'startPerformanceMonitoring', 'getPerformanceStats', 'wrapRender'
    ];
    
    const missing = requiredComponents.filter(component => !RichFramework[component]);
    
    if (missing.length === 0) {
        console.log('✅ All framework components loaded successfully');
        return true;
    } else {
        console.error('❌ Missing components:', missing);
        return false;
    }
}

// Test 2: Virtual DOM Performance
function testVirtualDOMPerformance() {
    console.log('🎯 Testing Virtual DOM performance...');
    
    const startTime = performance.now();
    
    // Create 1000 virtual DOM elements
    const elements = [];
    for (let i = 0; i < 1000; i++) {
        elements.push(
            RichFramework.createElement('div', {
                key: i,
                className: 'test-item',
                onClick: () => console.log(`Clicked ${i}`)
            }, `Item ${i}`)
        );
    }
    
    const endTime = performance.now();
    const createTime = endTime - startTime;
    
    console.log(`📊 Created 1000 virtual elements in ${createTime.toFixed(2)}ms`);
    
    // Check if meets 60fps requirement (16.67ms per frame)
    const passesPerformance = createTime < 16.67;
    
    if (passesPerformance) {
        console.log('✅ Virtual DOM creation meets 60fps requirement');
        return true;
    } else {
        console.warn('⚠️ Virtual DOM creation may impact 60fps performance');
        return false;
    }
}

// Test 3: State Management Performance
function testStatePerformance() {
    console.log('🔄 Testing state management performance...');
    
    const state = RichFramework.createState({ count: 0, items: [] });
    let updateCount = 0;
    
    // Subscribe to changes
    state.subscribe(() => {
        updateCount++;
    });
    
    const startTime = performance.now();
    
    // Perform 1000 state updates
    for (let i = 0; i < 1000; i++) {
        state.value = { count: i, items: new Array(10).fill(i) };
    }
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    console.log(`📊 1000 state updates in ${updateTime.toFixed(2)}ms (${updateCount} callbacks fired)`);
    
    const passesPerformance = updateTime < 50; // Allow 50ms for 1000 updates
    
    if (passesPerformance && updateCount === 1000) {
        console.log('✅ State management meets performance requirements');
        return true;
    } else {
        console.warn('⚠️ State management performance concerns detected');
        return false;
    }
}

// Test 4: Event System Performance
function testEventPerformance() {
    console.log('⚡ Testing event system performance...');
    
    let eventsFired = 0;
    const startTime = performance.now();
    
    // Create many event handlers
    for (let i = 0; i < 1000; i++) {
        const element = RichFramework.createElement('button', {
            onClick: () => eventsFired++,
            onMouseover: () => eventsFired++,
            onFocus: () => eventsFired++
        }, `Button ${i}`);
    }
    
    const endTime = performance.now();
    const eventTime = endTime - startTime;
    
    console.log(`📊 Created 1000 event handlers in ${eventTime.toFixed(2)}ms`);
    
    const passesPerformance = eventTime < 20; // Allow 20ms for event handler creation
    
    if (passesPerformance) {
        console.log('✅ Event system meets performance requirements');
        return true;
    } else {
        console.warn('⚠️ Event system performance concerns detected');
        return false;
    }
}

// Test 5: Rendering Performance
function testRenderingPerformance() {
    console.log('🖼️ Testing rendering performance...');
    
    // Create a complex virtual DOM tree
    const complexApp = RichFramework.createElement('div', { className: 'app' },
        RichFramework.createElement('header', {},
            RichFramework.createElement('h1', {}, 'Performance Test'),
            RichFramework.createElement('nav', {},
                ...new Array(10).fill(0).map((_, i) =>
                    RichFramework.createElement('a', { href: `#${i}` }, `Link ${i}`)
                )
            )
        ),
        RichFramework.createElement('main', {},
            ...new Array(100).fill(0).map((_, i) =>
                RichFramework.createElement('div', { key: i, className: 'item' },
                    RichFramework.createElement('h3', {}, `Item ${i}`),
                    RichFramework.createElement('p', {}, `Description for item ${i}`),
                    RichFramework.createElement('button', {
                        onClick: () => console.log(`Item ${i} clicked`)
                    }, 'Click me')
                )
            )
        )
    );
    
    // Create test container
    const testContainer = document.createElement('div');
    testContainer.id = 'test-render-container';
    testContainer.style.display = 'none';
    document.body.appendChild(testContainer);
    
    // Measure render time
    const startTime = performance.now();
    RichFramework.render(complexApp, testContainer);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    console.log(`📊 Rendered complex app in ${renderTime.toFixed(2)}ms`);
    
    // Clean up
    document.body.removeChild(testContainer);
    
    const passesPerformance = renderTime < 16.67; // Must meet 60fps requirement
    
    if (passesPerformance) {
        console.log('✅ Rendering meets 60fps requirement');
        return true;
    } else {
        console.warn('⚠️ Rendering may not maintain 60fps');
        return false;
    }
}

// Test 6: Memory Management
function testMemoryManagement() {
    console.log('🧠 Testing memory management...');
    
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Create and destroy many components
    for (let cycle = 0; cycle < 10; cycle++) {
        const state = RichFramework.createState([]);
        const items = [];
        
        // Create large state
        for (let i = 0; i < 1000; i++) {
            items.push({ id: i, value: Math.random() });
        }
        state.value = items;
        
        // Create virtual DOM
        const vdom = RichFramework.createElement('div', {},
            ...items.map(item =>
                RichFramework.createElement('div', { key: item.id }, item.value.toString())
            )
        );
    }
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`📊 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    const passesMemoryTest = memoryIncrease < 50 * 1024 * 1024; // Less than 50MB increase
    
    if (passesMemoryTest) {
        console.log('✅ Memory management appears efficient');
        return true;
    } else {
        console.warn('⚠️ Potential memory leak detected');
        return false;
    }
}

// Run all tests
async function runValidationSuite() {
    console.log('🚀 Running RichFramework validation suite for Bomberman compatibility...\n');
    
    const tests = [
        { name: 'Framework Loading', fn: testFrameworkLoading },
        { name: 'Virtual DOM Performance', fn: testVirtualDOMPerformance },
        { name: 'State Management Performance', fn: testStatePerformance },
        { name: 'Event System Performance', fn: testEventPerformance },
        { name: 'Rendering Performance', fn: testRenderingPerformance },
        { name: 'Memory Management', fn: testMemoryManagement }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        console.log(`\n--- ${test.name} ---`);
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name} failed with error:`, error);
            failed++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 VALIDATION RESULTS:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('🎮 RichFramework is READY for Bomberman game development!');
        console.log('🎯 All performance requirements met for 60fps gaming');
    } else {
        console.warn('⚠️ Framework needs optimization before Bomberman development');
        console.log('🔧 Consider optimizing failed components');
    }
    
    return { passed, failed, successRate: (passed / (passed + failed)) * 100 };
}

// Auto-run tests when framework is ready
if (typeof RichFramework !== 'undefined' && RichFramework.ready) {
    RichFramework.ready(() => {
        setTimeout(runValidationSuite, 100); // Small delay to ensure everything is loaded
    });
} else {
    console.error('❌ RichFramework not found! Make sure framework files are loaded.');
}
