// --- Piano Interface & Audio Logic ---
(function() {
    const keys = document.querySelectorAll('.piano-key');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const noteFrequencies = {
        'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
        'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
        'A#3': 233.08, 'B3': 246.94,
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
        'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
        'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
    };

    function playNote(note) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFrequencies[note], audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    }

    keys.forEach(key => {
        const handlePress = () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            key.classList.add('active');
            playNote(key.dataset.note);

            // Trigger 3D physics impulse from scene.js
            if (window.triggerAppleImpulse) {
                window.triggerAppleImpulse();
            }
        };

        const handleRelease = () => {
            key.classList.remove('active');
        };

        key.addEventListener('mousedown', handlePress);
        key.addEventListener('mouseup', handleRelease);
        key.addEventListener('mouseleave', handleRelease);

        // Touch support
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePress();
        });
        key.addEventListener('touchend', handleRelease);
    });

    // --- Global API for optical.js (MediaPipe hand tracking) ---

    // Resume AudioContext (must be called from a user gesture)
    window.resumePianoAudio = function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    };

    // Play a note by name (e.g. 'C4') — called when a finger curls
    window.playPianoNote = function(note) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (!noteFrequencies[note]) return;

        playNote(note);

        // Visually highlight the matching key
        const keyEl = document.querySelector(`.piano-key[data-note="${note}"]`);
        if (keyEl && !keyEl.classList.contains('active')) {
            keyEl.classList.add('active');
            // Trigger 3D physics impulse
            if (window.triggerAppleImpulse) window.triggerAppleImpulse();
        }
    };

    // Release a note — called when a finger uncurls
    window.releasePianoNote = function(note) {
        const keyEl = document.querySelector(`.piano-key[data-note="${note}"]`);
        if (keyEl) keyEl.classList.remove('active');
    };

    // Legacy collision checker
    window.checkPianoCollisions = function(x, y, z) {
        const isPressing = z < -0.15; 
        const element = document.elementFromPoint(x, y);
        if (element && element.classList.contains('piano-key')) {
            if (isPressing) {
                if (!element.classList.contains('active')) {
                    element.dispatchEvent(new Event('mousedown'));
                    setTimeout(() => {
                        element.dispatchEvent(new Event('mouseup'));
                    }, 300);
                }
            }
        }
    };
})();
