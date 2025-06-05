/**
 * Advanced Animation System for Mini-Framework
 * Provides high-performance animations with easing, keyframes, and GPU acceleration
 */
class AnimationEngine {
    constructor() {
        this.animations = new Map();
        this.animationId = 0;
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCallbacks = new Set();
        
        // Pre-built easing functions
        this.easings = {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => 1 - (1 - t) * (1 - t),
            easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
            bounce: t => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            },
            elastic: t => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
            }
        };

        this.start();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update all animations
        this.animations.forEach((animation, id) => {
            if (this.updateAnimation(animation, deltaTime)) {
                this.animations.delete(id);
            }
        });

        // Execute frame callbacks
        this.frameCallbacks.forEach(callback => callback(deltaTime));

        requestAnimationFrame(() => this.animate());
    }

    updateAnimation(animation, deltaTime) {
        animation.elapsed += deltaTime;
        const progress = Math.min(animation.elapsed / animation.duration, 1);
        const easedProgress = animation.easing(progress);

        // Update animated properties
        animation.properties.forEach(prop => {
            const currentValue = prop.from + (prop.to - prop.from) * easedProgress;
            
            if (prop.type === 'style') {
                animation.element.style[prop.property] = currentValue + (prop.unit || '');
            } else if (prop.type === 'attribute') {
                animation.element.setAttribute(prop.property, currentValue);
            } else if (prop.type === 'transform') {
                this.applyTransform(animation.element, prop.property, currentValue, prop.unit);
            }
        });

        // Call progress callback
        if (animation.onProgress) {
            animation.onProgress(easedProgress, animation.element);
        }

        // Check if animation is complete
        if (progress >= 1) {
            if (animation.onComplete) {
                animation.onComplete(animation.element);
            }
            return true; // Mark for removal
        }

        return false;
    }

    applyTransform(element, property, value, unit = '') {
        const currentTransform = element.style.transform || '';
        const transformRegex = new RegExp(`${property}\\([^)]*\\)`, 'g');
        const newTransform = `${property}(${value}${unit})`;
        
        if (transformRegex.test(currentTransform)) {
            element.style.transform = currentTransform.replace(transformRegex, newTransform);
        } else {
            element.style.transform = currentTransform + ' ' + newTransform;
        }
    }

    // Main animation method
    animate(element, properties, options = {}) {
        const id = ++this.animationId;
        const duration = options.duration || 1000;
        const easing = this.easings[options.easing] || this.easings.linear;
        const delay = options.delay || 0;

        const animation = {
            id,
            element,
            properties: this.parseProperties(element, properties),
            duration,
            easing,
            elapsed: -delay,
            onProgress: options.onProgress,
            onComplete: options.onComplete
        };

        this.animations.set(id, animation);
        return id;
    }

    parseProperties(element, properties) {
        const parsedProps = [];

        Object.entries(properties).forEach(([key, value]) => {
            let from, to, type, unit = '';

            if (key.startsWith('data-')) {
                // Data attribute
                from = parseFloat(element.getAttribute(key)) || 0;
                to = parseFloat(value);
                type = 'attribute';
            } else if (this.isTransformProperty(key)) {
                // Transform property
                from = this.getCurrentTransformValue(element, key);
                to = parseFloat(value);
                type = 'transform';
                unit = this.getTransformUnit(key);
            } else {
                // Style property
                const computedStyle = getComputedStyle(element);
                const currentValue = computedStyle[key] || element.style[key] || '0';
                from = parseFloat(currentValue);
                to = parseFloat(value);
                type = 'style';
                unit = this.extractUnit(value);
            }

            parsedProps.push({
                property: key,
                from,
                to,
                type,
                unit
            });
        });

        return parsedProps;
    }

    isTransformProperty(property) {
        return ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY'].includes(property);
    }

    getCurrentTransformValue(element, property) {
        const transform = element.style.transform || '';
        const regex = new RegExp(`${property}\\(([^)]+)\\)`);
        const match = transform.match(regex);
        return match ? parseFloat(match[1]) : (property.includes('scale') ? 1 : 0);
    }

    getTransformUnit(property) {
        if (property.includes('translate')) return 'px';
        if (property.includes('rotate')) return 'deg';
        return '';
    }

    extractUnit(value) {
        const match = String(value).match(/[a-zA-Z%]+$/);
        return match ? match[0] : '';
    }

    // Specialized animation methods
    fadeIn(element, duration = 500, easing = 'easeOut') {
        element.style.opacity = '0';
        return this.animate(element, { opacity: 1 }, { duration, easing });
    }

    fadeOut(element, duration = 500, easing = 'easeIn') {
        return this.animate(element, { opacity: 0 }, { duration, easing });
    }

    slideIn(element, direction = 'left', duration = 500, easing = 'easeOut') {
        const property = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
        const value = direction === 'left' || direction === 'up' ? '-100%' : '100%';
        
        element.style.transform = `${property}(${value})`;
        return this.animate(element, { [property]: 0 }, { duration, easing });
    }

    slideOut(element, direction = 'left', duration = 500, easing = 'easeIn') {
        const property = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
        const value = direction === 'left' || direction === 'up' ? '-100%' : '100%';
        
        return this.animate(element, { [property]: value }, { duration, easing });
    }

    bounce(element, intensity = 20, duration = 600) {
        return this.animate(element, { translateY: -intensity }, {
            duration: duration / 2,
            easing: 'easeOut',
            onComplete: () => {
                this.animate(element, { translateY: 0 }, {
                    duration: duration / 2,
                    easing: 'bounce'
                });
            }
        });
    }

    shake(element, intensity = 10, duration = 500) {
        const originalTransform = element.style.transform;
        let shakeCount = 0;
        const maxShakes = 8;
        
        const shakeStep = () => {
            if (shakeCount < maxShakes) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
                shakeCount++;
                setTimeout(shakeStep, duration / maxShakes);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        shakeStep();
    }

    pulse(element, scale = 1.1, duration = 600) {
        return this.animate(element, { scale }, {
            duration: duration / 2,
            easing: 'easeOut',
            onComplete: () => {
                this.animate(element, { scale: 1 }, {
                    duration: duration / 2,
                    easing: 'easeIn'
                });
            }
        });
    }

    // Keyframe animations
    keyframes(element, keyframes, options = {}) {
        const totalDuration = options.duration || 1000;
        const easing = options.easing || 'linear';
        let currentIndex = 0;

        const playKeyframe = () => {
            if (currentIndex >= keyframes.length) {
                if (options.onComplete) options.onComplete(element);
                return;
            }

            const keyframe = keyframes[currentIndex];
            const frameDuration = keyframe.duration || totalDuration / keyframes.length;

            this.animate(element, keyframe.properties, {
                duration: frameDuration,
                easing: keyframe.easing || easing,
                onComplete: () => {
                    currentIndex++;
                    playKeyframe();
                }
            });
        };

        playKeyframe();
    }

    // Chain animations
    chain(animations) {
        let currentIndex = 0;

        const playNext = () => {
            if (currentIndex >= animations.length) return;

            const animation = animations[currentIndex];
            const id = this.animate(animation.element, animation.properties, {
                ...animation.options,
                onComplete: (element) => {
                    if (animation.options?.onComplete) {
                        animation.options.onComplete(element);
                    }
                    currentIndex++;
                    playNext();
                }
            });
        };

        playNext();
    }

    // Parallel animations
    parallel(animations) {
        const ids = [];
        animations.forEach(animation => {
            const id = this.animate(animation.element, animation.properties, animation.options);
            ids.push(id);
        });
        return ids;
    }

    // Cancel animation
    cancel(id) {
        this.animations.delete(id);
    }

    // Cancel all animations for element
    cancelAll(element) {
        this.animations.forEach((animation, id) => {
            if (animation.element === element) {
                this.animations.delete(id);
            }
        });
    }

    // Frame callback registration
    onFrame(callback) {
        this.frameCallbacks.add(callback);
        return () => this.frameCallbacks.delete(callback);
    }

    // Utility methods
    isAnimating(element) {
        for (let animation of this.animations.values()) {
            if (animation.element === element) return true;
        }
        return false;
    }

    getAnimationCount() {
        return this.animations.size;
    }

    // Game-specific animations
    explode(element, intensity = 1) {
        const fragments = [];
        const rect = element.getBoundingClientRect();
        
        // Create explosion fragments
        for (let i = 0; i < 8; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'explosion-fragment';
            fragment.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #ff6b00;
                border-radius: 50%;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(fragment);
            fragments.push(fragment);

            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 * intensity;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            this.parallel([
                {
                    element: fragment,
                    properties: { translateX: x, translateY: y },
                    options: { duration: 600, easing: 'easeOut' }
                },
                {
                    element: fragment,
                    properties: { opacity: 0 },
                    options: { 
                        duration: 600, 
                        delay: 200,
                        onComplete: () => fragment.remove()
                    }
                }
            ]);
        }

        // Scale and fade the main element
        this.parallel([
            {
                element,
                properties: { scale: 1.5 },
                options: { duration: 200, easing: 'easeOut' }
            },
            {
                element,
                properties: { opacity: 0 },
                options: { 
                    duration: 400, 
                    delay: 100,
                    onComplete: () => {
                        element.style.display = 'none';
                        element.style.opacity = '1';
                        element.style.transform = '';
                    }
                }
            }
        ]);
    }

    powerUpEffect(element) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
        `;
        element.appendChild(glow);

        this.chain([
            {
                element: glow,
                properties: { scale: 0.8, opacity: 1 },
                options: { duration: 300, easing: 'easeOut' }
            },
            {
                element: glow,
                properties: { scale: 1.2, opacity: 0 },
                options: { 
                    duration: 400, 
                    easing: 'easeIn',
                    onComplete: () => glow.remove()
                }
            }
        ]);

        this.bounce(element, 10, 500);
    }
}

// Create global instance
const AnimationEngine = new AnimationEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationEngine;
}

// Make available globally
window.AnimationEngine = AnimationEngine;
