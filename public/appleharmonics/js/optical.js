// --- MediaPipe Hand Tracking → Piano Key Interaction ---
// Fingers hover over the on-screen piano keys. When you curl/tap a finger
// down over a key, it plays that key's note.
(function () {
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('output-canvas');
    if (!videoElement || !canvasElement) {
        console.warn('MediaPipe: Missing #input-video or #output-canvas.');
        return;
    }

    const canvasCtx = canvasElement.getContext('2d');
    const cameraContainer = document.getElementById('camera-container');
    const trackingStatus = document.getElementById('tracking-status');
    const handCursor = document.getElementById('hand-cursor');

    let handTrackingEnabled = false;
    let cameraInstance = null;

    // MediaPipe hand landmark indices
    const FINGER_TIPS = [4, 8, 12, 16, 20];
    const FINGER_PIPS = [3, 6, 10, 14, 18];
    const FINGER_MCPS = [2, 5, 9, 13, 17];
    const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

    // Per-finger state tracking
    const fingerState = {};   // key → { pressed, noteActive, activeKey }
    const DEBOUNCE_MS = 120;
    const lastTriggerTime = {};

    /**
     * Detect if a finger is in "tap/press" position.
     * - Thumb: tip close to index MCP (pinch gesture)
     * - Others: fingertip y > PIP y (tip is curled below the middle joint)
     */
    function isFingerTapping(landmarks, fi) {
        const tip = landmarks[FINGER_TIPS[fi]];
        if (fi === 0) {
            // Thumb: check if thumb tip is near index finger base
            const indexMcp = landmarks[5];
            const dx = tip.x - indexMcp.x;
            const dy = tip.y - indexMcp.y;
            return Math.sqrt(dx * dx + dy * dy) < 0.07;
        } else {
            // Other fingers: tip below PIP = curled
            const pip = landmarks[FINGER_PIPS[fi]];
            return tip.y > pip.y + 0.015;
        }
    }

    /**
     * Find which piano key element a screen coordinate lands on.
     * Returns the .piano-key element or null.
     */
    function getPianoKeyAt(screenX, screenY) {
        // Use elementsFromPoint to find the piano key under the finger
        const elements = document.elementsFromPoint(screenX, screenY);
        for (const el of elements) {
            if (el.classList && el.classList.contains('piano-key')) {
                return el;
            }
        }
        return null;
    }

    // Create on-screen finger dots (2 hands × 5 fingers)
    const fingerDots = [];
    for (let i = 0; i < 10; i++) {
        const dot = document.createElement('div');
        dot.className = 'finger-dot';
        dot.style.cssText = `
            position: fixed; width: 20px; height: 20px; border-radius: 50%;
            pointer-events: none; z-index: 101; opacity: 0;
            transition: opacity .15s, background .1s, transform .1s, box-shadow .1s;
            transform: translate(-50%, -50%) scale(0.6);
            border: 2px solid rgba(220, 38, 38, 0.4);
            background: rgba(220, 38, 38, 0.15);
        `;
        document.body.appendChild(dot);
        fingerDots.push(dot);
    }

    // Note label overlay that appears when a finger hits a key
    const noteLabel = document.createElement('div');
    noteLabel.style.cssText = `
        position: fixed; pointer-events: none; z-index: 102;
        font-family: 'Space Grotesk', monospace; font-size: 14px; font-weight: 600;
        color: #fff; background: rgba(184,115,51,0.85); padding: 3px 8px;
        border-radius: 6px; opacity: 0; transition: opacity .2s;
        transform: translate(-50%, -130%);
    `;
    document.body.appendChild(noteLabel);
    let noteLabelTimeout = null;

    function showNoteLabel(x, y, note) {
        noteLabel.textContent = note;
        noteLabel.style.left = x + 'px';
        noteLabel.style.top = y + 'px';
        noteLabel.style.opacity = '1';
        clearTimeout(noteLabelTimeout);
        noteLabelTimeout = setTimeout(() => { noteLabel.style.opacity = '0'; }, 600);
    }

    let frameCount = 0;

    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Hide all dots
        fingerDots.forEach(d => { d.style.opacity = '0'; });

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
            }

            frameCount++;
            if (frameCount % 180 === 1) {
                console.log(`🖐️ Tracking ${results.multiHandLandmarks.length} hand(s). Move fingers over piano keys and curl to play!`);
            }

            results.multiHandLandmarks.forEach((landmarks, hi) => {
                // Determine if the hand is in a "fist" gesture (used for scrolling)
                let curledFingers = 0;
                for (let i = 1; i <= 4; i++) {
                    if (isFingerTapping(landmarks, i)) curledFingers++;
                }
                const isFist = (curledFingers >= 3); // 3 or 4 fingers curled

                if (isFist) {
                    const currentY = landmarks[9].y; // Middle finger MCP
                    if (!window.isHandScrolling) {
                        window.isHandScrolling = true;
                        window.lastHandScrollY = currentY;
                    } else {
                        const deltaY = currentY - window.lastHandScrollY;
                        // Grabbing and dragging page: hand moves up (deltaY < 0), page scrolls down
                        window.scrollBy({ top: deltaY * 3000, behavior: 'auto' });
                        window.lastHandScrollY = currentY;
                    }
                } else {
                    window.isHandScrolling = false;
                    window.lastHandScrollY = null;
                }

                // Process each fingertip
                FINGER_TIPS.forEach((tipIdx, fi) => {
                    const tip = landmarks[tipIdx];
                    // Mirror X so screen matches user's perspective
                    const sx = (1 - tip.x) * window.innerWidth;
                    const sy = tip.y * window.innerHeight;
                    const fKey = `${hi}_${fi}`;
                    const tapping = isFingerTapping(landmarks, fi);
                    const prev = fingerState[fKey] || { pressed: false, activeNote: null };
                    const now = Date.now();

                    // Update finger dot visual
                    const dot = fingerDots[hi * 5 + fi];
                    if (dot) {
                        dot.style.opacity = '1';
                        dot.style.left = sx + 'px';
                        dot.style.top = sy + 'px';
                        
                        // Finger colors - Bold Red
                        const isPinky = (fi === 4);
                        const baseColor = isPinky ? 'rgba(255, 0, 0, 1.0)' : 'rgba(220, 38, 38, 0.85)';
                        const hoverColor = isPinky ? 'rgba(255, 60, 60, 0.6)' : 'rgba(220, 38, 38, 0.35)';
                        const glowColor = isPinky ? 'rgba(255, 0, 0, 0.9)' : 'rgba(220, 38, 38, 0.6)';

                        if (tapping) {
                            dot.style.background = baseColor;
                            dot.style.transform = 'translate(-50%,-50%) scale(1.4)';
                            dot.style.boxShadow = `0 0 20px ${glowColor}`;
                            if (isPinky) dot.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                        } else {
                            dot.style.background = hoverColor;
                            dot.style.transform = 'translate(-50%,-50%) scale(0.7)';
                            dot.style.boxShadow = 'none';
                            if (isPinky) dot.style.borderColor = 'rgba(255, 0, 0, 0.6)';
                        }
                    }

                    // --- KEY INTERACTION ---
                    // On new tap: check which piano key is under this finger
                    // Do not trigger keys if we are scrolling (isFist)
                    if (tapping && !prev.pressed && !isFist) {
                        const lastTime = lastTriggerTime[fKey] || 0;
                        if (now - lastTime > DEBOUNCE_MS) {
                            const keyEl = getPianoKeyAt(sx, sy);
                            if (keyEl && keyEl.dataset.note) {
                                const note = keyEl.dataset.note;
                                console.log(`🎹 ${FINGER_NAMES[fi]} → ${note}`);
                                showNoteLabel(sx, sy, note);

                                // Play the note
                                if (window.playPianoNote) {
                                    window.playPianoNote(note);
                                }

                                fingerState[fKey] = { pressed: true, activeNote: note };
                                lastTriggerTime[fKey] = now;
                            } else {
                                fingerState[fKey] = { pressed: true, activeNote: null };
                            }
                        }
                    } else if (!tapping && prev.pressed) {
                        // Finger released
                        if (prev.activeNote && window.releasePianoNote) {
                            window.releasePianoNote(prev.activeNote);
                        }
                        fingerState[fKey] = { pressed: false, activeNote: null };
                    } else if (!tapping) {
                        fingerState[fKey] = { pressed: false, activeNote: null };
                    }
                    // While held, keep state
                });

                // First hand's index finger also drives the 3D cursor/vortex
                if (hi === 0) {
                    const idx = landmarks[8];
                    const cx = (1 - idx.x) * window.innerWidth;
                    const cy = idx.y * window.innerHeight;
                    if (handCursor) {
                        handCursor.classList.add('active');
                        handCursor.style.left = cx + 'px';
                        handCursor.style.top = cy + 'px';
                    }
                    if (window.mouse) {
                        window.mouse.x = (1 - idx.x) * 2 - 1;
                        window.mouse.y = -((1 - idx.y) * 2 - 1);
                        window.mouseActive = true;
                    }
                }

                // Draw hand skeleton on mini camera preview
                if (window.drawConnectors && window.drawLandmarks) {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#b87333', lineWidth: 2 });
                    drawLandmarks(canvasCtx, landmarks, { color: '#ffb4a6', lineWidth: 1, radius: 2 });
                }
            });
        } else {
            // No hands detected
            if (trackingStatus) {
                trackingStatus.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
            }
            if (handCursor) handCursor.classList.remove('active');
            // Release any active notes
            Object.keys(fingerState).forEach(k => {
                if (fingerState[k].activeNote && window.releasePianoNote) {
                    window.releasePianoNote(fingerState[k].activeNote);
                }
                delete fingerState[k];
            });
        }
        canvasCtx.restore();
    }

    // Initialize MediaPipe Hands
    let hands;
    try {
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.55,
            minTrackingConfidence: 0.45
        });
        hands.onResults(onResults);
        console.log('✅ MediaPipe Hands ready. Click "Initialize Optical Interface" to start.');
    } catch (e) {
        console.error('❌ MediaPipe init error:', e);
    }

    // Global toggle (called from the button in index.html)
    window.toggleHandTracking = async function () {
        handTrackingEnabled = !handTrackingEnabled;
        const btnText = document.getElementById('tracking-button-text');
        const toggleBtn = document.getElementById('hand-tracking-toggle');

        if (handTrackingEnabled) {
            try {
                if (btnText) {
                    btnText.innerText = (window.currentLang === 'PT') ? 'Controlo Óptico: Ativo' : 'Optical Control: Active';
                }
                if (toggleBtn) toggleBtn.classList.add('ring-4', 'ring-white/50');
                if (cameraContainer) cameraContainer.classList.remove('opacity-0');

                if (typeof Camera === 'undefined' || typeof Hands === 'undefined') {
                    throw new Error('MediaPipe libraries not loaded.');
                }

                // Resume audio context on user gesture
                if (window.resumePianoAudio) window.resumePianoAudio();

                if (!cameraInstance) {
                    cameraInstance = new Camera(videoElement, {
                        onFrame: async () => { await hands.send({ image: videoElement }); },
                        width: 640,
                        height: 480
                    });
                }
                await cameraInstance.start();
                console.log('📷 Camera active! Hover fingers over piano keys and curl to play.');
            } catch (e) {
                console.error('❌ Activation failed:', e);
                alert('Optical Interface Error: ' + e.message);
                handTrackingEnabled = false;
                if (btnText) {
                    btnText.innerText = (window.currentLang === 'PT') ? 'Ative a sua webcam para gestos manuais' : 'Enable your webcam for hand gestures';
                }
                if (toggleBtn) toggleBtn.classList.remove('ring-4', 'ring-white/50');
                if (cameraContainer) cameraContainer.classList.add('opacity-0');
            }
        } else {
            if (btnText) {
                btnText.innerText = (window.currentLang === 'PT') ? 'Ative a sua webcam para gestos manuais' : 'Enable your webcam for hand gestures';
            }
            if (toggleBtn) toggleBtn.classList.remove('ring-4', 'ring-white/50');
            if (cameraContainer) cameraContainer.classList.add('opacity-0');
            if (cameraInstance) { await cameraInstance.stop(); }
            if (handCursor) handCursor.classList.remove('active');
            window.mouseActive = false;
            fingerDots.forEach(d => { d.style.opacity = '0'; });
            // Release all active notes
            Object.keys(fingerState).forEach(k => {
                if (fingerState[k].activeNote && window.releasePianoNote) {
                    window.releasePianoNote(fingerState[k].activeNote);
                }
                delete fingerState[k];
            });
            console.log('MediaPipe: Stopped.');
        }
    };
})();
