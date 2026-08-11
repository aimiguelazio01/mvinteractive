(function () {
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('output-canvas');
    if (!videoElement || !canvasElement) return;

    const canvasCtx = canvasElement.getContext('2d');
    const cameraContainer = document.getElementById('camera-container');
    const trackingStatus = document.getElementById('tracking-status');
    const handCursor = document.getElementById('hand-cursor');

    let handTrackingEnabled = false;
    let cameraInstance = null;
    let wasPinching = false;
    let lastClickTime = 0;

    // Smoothing: cursor lerps toward the raw position each frame
    let smoothX = window.innerWidth / 2;
    let smoothY = window.innerHeight / 2;
    const SMOOTH_FACTOR = 0.2; // lower = smoother but laggier

    // Track currently hovered element for highlight effect
    let lastHoveredBtn = null;
    let hoverStartTime = null;
    let hasTriggeredHoverClick = false;

    // Inject hover-highlight CSS once
    const style = document.createElement('style');
    style.textContent = `
        .optical-hover {
            outline: 3px solid #00ffff !important;
            outline-offset: 3px;
            box-shadow: 0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(0,255,255,0.2) !important;
            filter: brightness(1.25);
            transition: outline 0.15s, box-shadow 0.15s, filter 0.15s;
        }
    `;
    document.head.appendChild(style);

    function isPinching(landmarks) {
        const thumb = landmarks[4];
        const index = landmarks[8];
        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        return Math.sqrt(dx * dx + dy * dy) < 0.05;
    }

    function highlightElement(el) {
        // Find the closest interactive element
        const interactive = el
            ? (el.closest('button') || el.closest('a') || el.closest('input') || el.closest('[role="button"]'))
            : null;

        if (interactive !== lastHoveredBtn) {
            if (lastHoveredBtn) {
                lastHoveredBtn.classList.remove('optical-hover');
            }
            if (interactive) {
                interactive.classList.add('optical-hover');
                hoverStartTime = Date.now();
                hasTriggeredHoverClick = false;
            } else {
                hoverStartTime = null;
            }
            lastHoveredBtn = interactive;
        } else if (interactive && !hasTriggeredHoverClick && hoverStartTime) {
            const duration = Date.now() - hoverStartTime;
            if (duration >= 2000) {
                interactive.click();
                hasTriggeredHoverClick = true;
                interactive.style.transform = 'scale(0.95)';
                setTimeout(() => interactive.style.transform = '', 150);
                if (handCursor) {
                    handCursor.style.background = 'rgba(0, 255, 255, 0.8)';
                }
            } else {
                if (handCursor) {
                    const pct = (duration / 2000) * 100;
                    handCursor.style.background = `conic-gradient(rgba(0,255,255,0.8) ${pct}%, rgba(255,255,255,0.2) ${pct}%)`;
                }
            }
        }
    }

    function clearHighlight() {
        if (lastHoveredBtn) {
            lastHoveredBtn.classList.remove('optical-hover');
            lastHoveredBtn = null;
            hoverStartTime = null;
        }
    }

    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
            }

            const landmarks = results.multiHandLandmarks[0];
            const idx = landmarks[8];

            // Shrink active zone so edges are easy to reach
            const margin = 0.20;
            const rawX = (idx.x - margin) / (1 - 2 * margin);
            const rawY = (idx.y - margin) / (1 - 2 * margin);
            const clampedX = Math.max(0, Math.min(1, rawX));
            const clampedY = Math.max(0, Math.min(1, rawY));
            const targetX = (1 - clampedX) * window.innerWidth;
            const targetY = clampedY * window.innerHeight;

            // Smooth the cursor with lerp
            smoothX += (targetX - smoothX) * SMOOTH_FACTOR;
            smoothY += (targetY - smoothY) * SMOOTH_FACTOR;
            const cx = smoothX;
            const cy = smoothY;

            if (handCursor) {
                handCursor.style.opacity = '1';
                handCursor.style.left = cx + 'px';
                handCursor.style.top = cy + 'px';
            }

            const isPinch = isPinching(landmarks);
            const now = Date.now();

            // Hide handCursor temporarily to avoid interfering with elementFromPoint
            if (handCursor) handCursor.style.display = 'none';
            const el = document.elementFromPoint(cx, cy);
            if (handCursor) handCursor.style.display = '';

            // Highlight interactive elements under cursor
            highlightElement(el);

            if (el) {
                if (isPinch && !wasPinching) {
                    el.dispatchEvent(new MouseEvent('mousedown', {
                        bubbles: true, cancelable: true, clientX: cx, clientY: cy, buttons: 1
                    }));
                    if (handCursor) {
                        handCursor.style.background = 'rgba(0, 255, 255, 0.8)';
                        handCursor.style.borderColor = '#00ffff';
                        handCursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
                    }
                    lastClickTime = now;
                } else if (isPinch && wasPinching) {
                    el.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true, cancelable: true, clientX: cx, clientY: cy, buttons: 1
                    }));
                } else if (!isPinch && wasPinching) {
                    el.dispatchEvent(new MouseEvent('mouseup', {
                        bubbles: true, cancelable: true, clientX: cx, clientY: cy, buttons: 0
                    }));

                    if (now - lastClickTime < 500) {
                        const btn = el.closest('button');
                        if (btn) {
                            btn.click();
                        } else {
                            el.dispatchEvent(new MouseEvent('click', {
                                bubbles: true, cancelable: true, clientX: cx, clientY: cy
                            }));
                        }
                    }

                    if (handCursor) {
                        handCursor.style.background = 'rgba(255, 255, 255, 0.2)';
                        handCursor.style.borderColor = 'white';
                        handCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    }
                } else if (!isPinch && !wasPinching) {
                    el.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true, cancelable: true, clientX: cx, clientY: cy, buttons: 0
                    }));
                }
            }

            wasPinching = isPinch;

            try {
                if (typeof drawConnectors !== 'undefined' && typeof drawLandmarks !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00ffff', lineWidth: 2 });
                    drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
                }
            } catch (e) {
                console.error('Drawing skeleton failed:', e);
            }
        } else {
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
            }
            if (handCursor) handCursor.style.opacity = '0';
            clearHighlight();
            wasPinching = false;
        }
        canvasCtx.restore();
    }

    let hands;
    try {
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.55,
            minTrackingConfidence: 0.45
        });
        hands.onResults(onResults);
    } catch (e) {
        console.error('MediaPipe init error:', e);
    }

    window.toggleHandTracking = async function () {
        handTrackingEnabled = !handTrackingEnabled;
        const btnText = document.getElementById('tracking-button-text');
        const toggleBtn = document.getElementById('hand-tracking-toggle');

        if (handTrackingEnabled) {
            try {
                if (btnText) btnText.innerText = 'Optical Control: Active';
                if (toggleBtn) toggleBtn.classList.add('ring-4', 'ring-cyan-500/50');
                if (cameraContainer) cameraContainer.classList.remove('opacity-0');

                if (typeof Camera === 'undefined' || typeof Hands === 'undefined') {
                    throw new Error('MediaPipe libraries not loaded.');
                }

                if (!cameraInstance) {
                    cameraInstance = new Camera(videoElement, {
                        onFrame: async () => { await hands.send({ image: videoElement }); },
                        width: 640,
                        height: 480
                    });
                }
                await cameraInstance.start();
            } catch (e) {
                console.error('Activation failed:', e);
                handTrackingEnabled = false;
                if (btnText) btnText.innerText = 'Optical Control';
                if (toggleBtn) toggleBtn.classList.remove('ring-4', 'ring-cyan-500/50');
                if (cameraContainer) cameraContainer.classList.add('opacity-0');
            }
        } else {
            if (btnText) btnText.innerText = 'Optical Control';
            if (toggleBtn) toggleBtn.classList.remove('ring-4', 'ring-cyan-500/50');
            if (cameraContainer) cameraContainer.classList.add('opacity-0');
            if (cameraInstance) { await cameraInstance.stop(); }
            if (handCursor) handCursor.style.opacity = '0';
            clearHighlight();
        }
    };

    window.disableHandTracking = async function () {
        if (handTrackingEnabled) {
            await window.toggleHandTracking();
        }
    };
})();
