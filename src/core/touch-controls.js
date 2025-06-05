/**
 * Mobile Touch Controls for Mini-Framework Games
 * Provides touch-friendly input handling for mobile devices
 */
class TouchControls {
    constructor(gameContainer) {
        this.container = gameContainer;
        this.touchPoints = new Map();
        this.currentTouch = null;
        this.deadZone = 20; // Minimum distance for swipe detection
        this.holdThreshold = 500; // Time for hold gesture
        this.callbacks = {
            move: null,
            action: null,
            hold: null
        };
        
        this.setupTouchEvents();
        this.createVirtualControls();
    }

    setupTouchEvents() {
        // Prevent default touch behaviors
        this.container.style.touchAction = 'none';
        
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });

        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }, { passive: false });

        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });

        this.container.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });
    }

    createVirtualControls() {
        const controlsHTML = `
            <div class="touch-controls" id="touchControls">
                <div class="dpad-container">
                    <div class="dpad">
                        <button class="dpad-btn dpad-up" data-direction="up">↑</button>
                        <button class="dpad-btn dpad-left" data-direction="left">←</button>
                        <button class="dpad-btn dpad-center"></button>
                        <button class="dpad-btn dpad-right" data-direction="right">→</button>
                        <button class="dpad-btn dpad-down" data-direction="down">↓</button>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="action-btn bomb-btn" data-action="bomb">💣</button>
                    <button class="action-btn menu-btn" data-action="menu">⚙️</button>
                </div>
            </div>
        `;

        const controlsCSS = `
            <style>
                .touch-controls {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 200px;
                    display: none;
                    pointer-events: auto;
                    z-index: 1000;
                    background: rgba(0, 0, 0, 0.1);
                }

                .dpad-container {
                    position: absolute;
                    left: 20px;
                    bottom: 20px;
                    width: 120px;
                    height: 120px;
                }

                .dpad {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    grid-template-rows: 1fr 1fr 1fr;
                    gap: 2px;
                }

                .dpad-btn {
                    border: none;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                    transition: all 0.1s ease;
                    user-select: none;
                    -webkit-user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .dpad-btn:active {
                    background: rgba(255, 255, 255, 1);
                    transform: scale(0.95);
                }

                .dpad-up { grid-area: 1 / 2 / 2 / 3; }
                .dpad-left { grid-area: 2 / 1 / 3 / 2; }
                .dpad-center { 
                    grid-area: 2 / 2 / 3 / 3; 
                    background: rgba(255, 255, 255, 0.4);
                    pointer-events: none;
                }
                .dpad-right { grid-area: 2 / 3 / 3 / 4; }
                .dpad-down { grid-area: 3 / 2 / 4 / 3; }

                .action-buttons {
                    position: absolute;
                    right: 20px;
                    bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .action-btn {
                    width: 60px;
                    height: 60px;
                    border: none;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    font-size: 24px;
                    transition: all 0.1s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                .action-btn:active {
                    background: rgba(255, 255, 255, 1);
                    transform: scale(0.95);
                }

                @media (max-width: 768px) {
                    .touch-controls {
                        display: block;
                    }
                }

                /* Hide on desktop by default */
                @media (min-width: 769px) {
                    .touch-controls {
                        display: none !important;
                    }
                }
            </style>
        `;

        // Add CSS to head
        document.head.insertAdjacentHTML('beforeend', controlsCSS);
        
        // Add controls to body
        document.body.insertAdjacentHTML('beforeend', controlsHTML);

        this.setupVirtualControlEvents();
    }

    setupVirtualControlEvents() {
        const dpadButtons = document.querySelectorAll('.dpad-btn[data-direction]');
        const actionButtons = document.querySelectorAll('.action-btn[data-action]');

        // D-pad controls
        dpadButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.triggerMove(direction);
                btn.classList.add('active');
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
                this.triggerMove('stop');
            });
        });

        // Action buttons
        actionButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.triggerAction(action);
                btn.classList.add('active');
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
            });
        });
    }

    handleTouchStart(e) {
        for (let touch of e.changedTouches) {
            const touchInfo = {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now(),
                moved: false
            };
            
            this.touchPoints.set(touch.identifier, touchInfo);
            
            // If this is the first touch, make it current
            if (!this.currentTouch) {
                this.currentTouch = touchInfo;
                this.startHoldTimer(touchInfo);
            }
        }
    }

    handleTouchMove(e) {
        for (let touch of e.changedTouches) {
            const touchInfo = this.touchPoints.get(touch.identifier);
            if (!touchInfo) continue;

            touchInfo.currentX = touch.clientX;
            touchInfo.currentY = touch.clientY;

            const deltaX = touchInfo.currentX - touchInfo.startX;
            const deltaY = touchInfo.currentY - touchInfo.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.deadZone && !touchInfo.moved) {
                touchInfo.moved = true;
                this.clearHoldTimer(touchInfo);
                
                if (touchInfo === this.currentTouch) {
                    this.handleSwipeGesture(deltaX, deltaY);
                }
            }
        }
    }

    handleTouchEnd(e) {
        for (let touch of e.changedTouches) {
            const touchInfo = this.touchPoints.get(touch.identifier);
            if (!touchInfo) continue;

            this.clearHoldTimer(touchInfo);

            // Handle tap gesture (if not moved)
            if (!touchInfo.moved) {
                const duration = Date.now() - touchInfo.startTime;
                if (duration < this.holdThreshold) {
                    this.handleTapGesture(touchInfo);
                }
            }

            this.touchPoints.delete(touch.identifier);
            
            if (touchInfo === this.currentTouch) {
                this.currentTouch = null;
                this.triggerMove('stop');
                
                // Find next active touch
                if (this.touchPoints.size > 0) {
                    this.currentTouch = this.touchPoints.values().next().value;
                }
            }
        }
    }

    handleSwipeGesture(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        let direction;
        if (absX > absY) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        this.triggerMove(direction);
    }

    handleTapGesture(touchInfo) {
        // Determine if tap is in action area (right side of screen)
        const screenWidth = window.innerWidth;
        if (touchInfo.startX > screenWidth * 0.7) {
            this.triggerAction('bomb');
        }
    }

    startHoldTimer(touchInfo) {
        touchInfo.holdTimer = setTimeout(() => {
            if (!touchInfo.moved) {
                this.triggerHold(touchInfo);
            }
        }, this.holdThreshold);
    }

    clearHoldTimer(touchInfo) {
        if (touchInfo.holdTimer) {
            clearTimeout(touchInfo.holdTimer);
            touchInfo.holdTimer = null;
        }
    }

    triggerMove(direction) {
        if (this.callbacks.move) {
            this.callbacks.move(direction);
        }
    }

    triggerAction(action) {
        if (this.callbacks.action) {
            this.callbacks.action(action);
        }
    }

    triggerHold(touchInfo) {
        if (this.callbacks.hold) {
            this.callbacks.hold(touchInfo);
        }
    }

    // API methods
    onMove(callback) {
        this.callbacks.move = callback;
        return this;
    }

    onAction(callback) {
        this.callbacks.action = callback;
        return this;
    }

    onHold(callback) {
        this.callbacks.hold = callback;
        return this;
    }

    show() {
        const controls = document.getElementById('touchControls');
        if (controls) {
            controls.style.display = 'block';
        }
    }

    hide() {
        const controls = document.getElementById('touchControls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    destroy() {
        const controls = document.getElementById('touchControls');
        if (controls) {
            controls.remove();
        }
        this.touchPoints.clear();
        this.currentTouch = null;
    }

    // Utility methods
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    supportsTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchControls;
}

// Make available globally
window.TouchControls = TouchControls;
