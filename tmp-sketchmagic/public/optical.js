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

    function isPinching(landmarks) {
        const thumb = landmarks[4];
        const index = landmarks[8];
        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        return Math.sqrt(dx * dx + dy * dy) < 0.05;
    }

    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
            }

            // Only use the first hand detected
            const landmarks = results.multiHandLandmarks[0];
            const idx = landmarks[8]; // Index finger tip

            // Mirror X so screen matches user's perspective
            const cx = (1 - idx.x) * window.innerWidth;
            const cy = idx.y * window.innerHeight;

            if (handCursor) {
                handCursor.style.opacity = '1';
                handCursor.style.left = cx + 'px';
                handCursor.style.top = cy + 'px';
            }

            const isPinch = isPinching(landmarks);
            const now = Date.now();

            if (isPinch && !wasPinching && (now - lastClickTime > 500)) {
                // Trigger a click
                const el = document.elementFromPoint(cx, cy);
                if (el) {
                    const btn = el.closest('button');
                    if (btn) {
                        btn.click();
                    } else {
                        el.click();
                    }
                    if (handCursor) {
                        handCursor.style.background = 'rgba(0, 255, 255, 0.8)';
                        handCursor.style.borderColor = '#00ffff';
                        handCursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
                    }
                    lastClickTime = now;
                }
            } else if (!isPinch && wasPinching) {
                if (handCursor) {
                    handCursor.style.background = 'rgba(255, 255, 255, 0.2)';
                    handCursor.style.borderColor = 'white';
                    handCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            } else if (!isPinch) {
                if (handCursor) {
                    handCursor.style.background = 'rgba(255, 255, 255, 0.2)';
                    handCursor.style.borderColor = 'white';
                    handCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            }

            wasPinching = isPinch;

            // Draw basic hand skeleton on preview
            if (typeof drawConnectors !== 'undefined' && typeof drawLandmarks !== 'undefined') {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00ffff', lineWidth: 2 });
                drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
            }
        } else {
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
            }
            if (handCursor) handCursor.style.opacity = '0';
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
        }
    };
})();
