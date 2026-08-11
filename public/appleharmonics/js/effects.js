/**
 * Vanilla JS implementation of the TextScramble effect provided in the request.
 * This adapts the React logic to work with the existing HTML/JS structure.
 */

class VanillaTextScramble {
    constructor(el, options = {}) {
        this.el = el;
        this.text = el.innerText;
        this.duration = options.duration || 0.8;
        this.speed = options.speed || 0.04;
        this.characterSet = options.characterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        this.onScrambleComplete = options.onScrambleComplete || null;
        this.isAnimating = false;
    }

    async scramble() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const steps = this.duration / this.speed;
        let step = 0;

        const interval = setInterval(() => {
            let scrambled = '';
            const progress = step / steps;

            for (let i = 0; i < this.text.length; i++) {
                if (this.text[i] === ' ') {
                    scrambled += ' ';
                    continue;
                }

                if (progress * this.text.length > i) {
                    scrambled += this.text[i];
                } else {
                    scrambled += this.characterSet[Math.floor(Math.random() * this.characterSet.length)];
                }
            }

            this.el.innerText = scrambled;
            step++;

            if (step > steps) {
                clearInterval(interval);
                this.el.innerText = this.text;
                this.isAnimating = false;
                if (this.onScrambleComplete) this.onScrambleComplete();
            }
        }, this.speed * 1000);
    }
}

// Initialize scramble effects on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const scrambleElements = document.querySelectorAll('[data-scramble]');
    scrambleElements.forEach(el => {
        const effect = new VanillaTextScramble(el);
        // Trigger on load
        setTimeout(() => effect.scramble(), 500);
        
        // Optional: Re-trigger on hover
        el.parentElement.addEventListener('mouseenter', () => effect.scramble());
    });
});

/**
 * Vanilla JS implementation of MorphingTextReveal.
 */
class VanillaMorphingText {
    constructor(el, texts, options = {}) {
        this.el = el;
        this.texts = texts;
        this.interval = options.interval || 3000;
        this.currentIndex = 0;
        this.isAnimating = false;
        this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        
        // Setup initial structure
        this.el.classList.add('cursor-pointer', 'select-none');
        this.render(this.texts[0]);
        
        // Add cursor
        this.cursor = document.createElement('span');
        this.cursor.className = 'morphing-cursor';
        this.el.after(this.cursor);

        // Hover glitch
        this.el.addEventListener('mouseenter', () => {
            this.el.classList.add('glitch-effect');
            setTimeout(() => this.el.classList.remove('glitch-effect'), 300);
        });

        // Start cycle
        this.timer = setInterval(() => this.morphToNext(), this.interval);
    }

    render(text) {
        this.el.innerHTML = text.split('').map((char, i) => {
            const charText = char === ' ' ? '&nbsp;' : char;
            return `<span class="inline-block ${this.isAnimating ? 'morph-char' : ''}" style="animation-delay: ${i * 35}ms">${charText}</span>`;
        }).join('');
    }

    getRandomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    morphToNext() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const currentText = this.texts[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.texts.length;
        const nextText = this.texts[this.currentIndex];
        const maxLength = Math.max(currentText.length, nextText.length);

        let step = 0;
        const animateStep = () => {
            if (step <= maxLength) {
                let displayed = '';
                for (let i = 0; i < maxLength; i++) {
                    if (i < step) {
                        displayed += nextText[i] || '';
                    } else if (i < currentText.length) {
                        displayed += Math.random() > 0.7 ? this.getRandomChar() : currentText[i];
                    }
                }
                
                // Simplified render during morph
                this.el.innerHTML = displayed.split('').map(c => c === ' ' ? '&nbsp;' : c).join('');
                step++;
                setTimeout(animateStep, 80);
            } else {
                this.render(nextText);
                this.isAnimating = false;
            }
        };

        animateStep();
    }

    updateTexts(newTexts) {
        this.texts = newTexts;
        this.currentIndex = 0;
        this.render(this.texts[0]);
    }
}

// Global initialization for morphing text
window.initMorphingText = (selector, texts, options) => {
    const el = document.querySelector(selector);
    if (el) return new VanillaMorphingText(el, texts, options);
};

// Scroll Reveal Observer (Repeatable & Direction-Aware)
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollY = window.scrollY;

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Set animation direction based on scroll path
                if (isScrollingDown) {
                    entry.target.classList.remove('reveal-down');
                    entry.target.classList.add('reveal-up');
                } else {
                    entry.target.classList.remove('reveal-up');
                    entry.target.classList.add('reveal-down');
                }
                
                // Trigger animation
                entry.target.classList.add('active');
            } else {
                // Remove active class to allow re-animation when re-entering
                entry.target.classList.remove('active');
            }
        });

        lastScrollY = currentScrollY;
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .fade-in');
    revealElements.forEach(el => revealObserver.observe(el));
});



