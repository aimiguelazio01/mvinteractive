import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

const images = [
    './imgs/img_02.jpg', './imgs/img_03.jpg', './imgs/img_04.jpg',
    './imgs/img_05.jpg', './imgs/img_07.jpg', './imgs/img_08.jpg',
    './imgs/img_09.jpg', './imgs/img_10.jpg', './imgs/img_11.jpg',
    './imgs/img_12.jpg', './imgs/img_13.jpg', './imgs/img_14.jpg',
    './imgs/img_15.jpg', './imgs/img_16.jpg', './imgs/img_17.jpg'
];

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '20px',
                height: '20px',
                border: '1px solid var(--accent)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                transition: 'transform 0.1s ease-out',
                mixBlendMode: 'difference'
            }}
        />
    );
};

function App() {
    const [activePopup, setActivePopup] = useState(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const [hoverTimeout, setHoverTimeout] = useState(null);

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        return () => lenisInstance.destroy();
    }, []);

    const handleMouseEnter = (img, e) => {
        // Clear any existing timeout
        if (hoverTimeout) clearTimeout(hoverTimeout);

        // Set a new timeout to open the popup after 0.75 seconds
        const timeout = setTimeout(() => {
            setPopupPos({ x: e.clientX, y: e.clientY });
            setActivePopup(img);
        }, 750); // 750ms = 0.75 seconds

        setHoverTimeout(timeout);
    };

    const handleMouseLeaveItem = () => {
        // If the user leaves the image before 2 seconds, cancel the popup
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
    };

    return (
        <main>
            <CustomCursor />

            <AnimatePresence>
                {activePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 10000,
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'auto'
                        }}
                        onMouseMove={() => setActivePopup(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onMouseMove={(e) => e.stopPropagation()}
                            style={{
                                padding: '1rem',
                                background: 'rgba(20, 20, 20, 0.9)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem',
                                maxWidth: '85vw',
                                maxHeight: '85vh',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                                pointerEvents: 'auto'
                            }}
                        >
                            <img
                                src={activePopup}
                                alt="Gallery Preview"
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                            />
                            <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                                <p style={{ color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>Detail Perspective</p>
                                <h2 style={{ fontWeight: '200', fontSize: '1.5rem', letterSpacing: '0.1em' }}>ARCHITECTURAL STUDY</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    padding: '1.5rem',
                    zIndex: 100,
                    mixBlendMode: 'difference',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                {/* MVFX Logo */}
                <a
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <motion.svg
                        viewBox="0 0 1920 1080"
                        style={{ height: '2rem', width: 'auto' }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <g fill="#808080" style={{ transition: 'opacity 0.3s' }}>
                            <path d="M424.86,291.14c1.02,11.16-1.19,22.28-1.85,33.37-10.01,168.36-21.31,336.76-33,505-1.58,22.77-1.36,47.42-4.13,69.87-5.95,48.25-44.76,75.11-92.37,69.61l-132.51-8.99,29.99-450.51c3.07-46.01,5.15-92.05,9-138,2.16-25.8,1.74-45,20.5-65.5,28.36-30.99,59.72-24.14,97.02-22,33.91,1.95,69.33,2.85,103,6.01,1.51.14,3,.47,4.35,1.14Z" />
                            <path d="M697.96,325.03l105.96,386.54c12.5,42.4-11.69,85.42-53.92,96.94l-138.01,37.49-106.53-388.97c-9.29-44.84,10.39-80.02,53.52-94.54,38.91-13.1,87.6-25.49,127.79-35.21,1.88-.46,10.36-2.97,11.18-2.25Z" />
                            <path d="M881.5,94.04l299.47,360.49c29.61,34.48,27.99,79.47-4.96,110.98l-111.66,92.4c-1.32.24-2.1-1.14-2.88-1.89-9.68-9.42-21.33-25.61-30.45-36.55-88.98-106.73-176.67-214.56-266-321-31.21-36.14-28.65-81.31,6.5-113.45l109.97-90.98Z" />
                            <path d="M1054.06,849.09l280.39-154.14,167.05-583.95c10.52-43.7,52.14-64.24,94.87-54.88l161.66,19.34c1.55,1.16.46,1.27.22,2.26-1.35,5.49-3.04,11.03-4.54,16.49-67.07,244.01-136.55,487.45-204.95,731.05-11.58,29.34-31.64,48.25-58.74,63.26-82.44,45.64-171.49,83.3-254.34,128.66-42.39,18.03-77.87,6.18-102.49-31.87-27.56-42.59-49.97-88.88-77.36-131.64l-1.78-4.58Z" />
                        </g>
                    </motion.svg>
                </a>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {[
                        { label: 'Home', href: '#home' },
                        { label: 'The Movie', href: '#movie' },
                        { label: 'Gallery', href: '#gallery' }
                    ].map((item, i) => (
                        <motion.a
                            key={item.label}
                            href={item.href}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            style={{
                                fontSize: '0.7rem',
                                fontFamily: 'monospace',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em',
                                color: '#888',
                                textDecoration: 'none',
                                position: 'relative',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = '#888'}
                        >
                            {item.label}
                        </motion.a>
                    ))}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

                    {/* Back to Portfolio */}
                    <motion.a
                        href="/"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        style={{
                            fontSize: '0.65rem',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'opacity 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        ← Back
                    </motion.a>
                </div>
            </motion.nav>

            <div style={{ height: '15vh' }}></div>

            {/* Home Section */}
            <section id="home" className="section">
                <div className="hero-video-container" style={{ background: '#000' }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster="./imgs/img_02.jpg"
                        className="video-bg"
                        style={{
                            opacity: 1,
                            visibility: 'visible',
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    >
                        <source src="./imgs/casa_pr_interactive.mp4" type="video/mp4" />
                    </video>
                    {/* Fallback image if video fails to load/play */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(./imgs/img_02.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: -1
                    }}></div>
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '15vh' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="hero-content"
                    >
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '1rem' }}
                        >
                            Interactive Portfolio
                        </motion.p>
                        <h1 className="title-large">
                            CASA <span className="accent-text">PR</span>
                        </h1>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '2rem' }}>
                            <div style={{ width: '60px', height: '1px', background: 'var(--accent)' }}></div>
                            <p style={{ maxWidth: '500px', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                Architecture is the learned game, correct and magnificent, of forms assembled in the light.
                                Experience the harmony of Casa PR.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                >
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</p>
                    <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--accent), transparent)' }}></div>
                </motion.div>
            </section>

            {/* Movie Section */}
            <section id="movie" className="section movie-section" style={{ background: '#080808', paddingTop: '10vh' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-l)' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <h2 style={{ fontSize: '3rem', fontWeight: '200' }}>Cinema <span className="accent-text">Verite</span></h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>A visual walk-through of the spatial flow.</p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="video-card glass-panel"
                        initial={{ opacity: 0, y: 50, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <video controls muted className="video-bg" poster="./imgs/img_02.jpg">
                            <source src="./imgs/casa_pr_movie.mp4" type="video/mp4" />
                        </video>
                    </motion.div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="section" style={{ background: '#050505', paddingTop: '10vh' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', marginBottom: 'var(--spacing-xl)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{ fontSize: '4rem', fontWeight: '200', marginBottom: '2rem' }}
                        >
                            Gallery of <br /><span className="accent-text">Spatiality</span>
                        </motion.h2>
                        <div style={{ width: '100px', height: '1px', background: 'var(--accent)', marginBottom: '2rem' }}></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            Every corner of Casa PR has been meticulously captured to show the interplay of light and shadow,
                            defining the character of the residence.
                        </p>
                    </div>

                    <div className="gallery-grid">
                        {images.map((img, index) => (
                            <motion.div
                                key={index}
                                className="gallery-item"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
                                whileHover={{ y: -10 }}
                                onMouseEnter={(e) => handleMouseEnter(img, e)}
                                onMouseLeave={handleMouseLeaveItem}
                            >
                                <img src={img} alt={`Architectural detail ${index + 1}`} className="gallery-image" loading="lazy" />
                                <div className="gallery-overlay">
                                    <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>Space Study</p>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '300' }}>Detail {String(index + 1).padStart(2, '0')}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={{ padding: 'var(--spacing-xl) var(--spacing-m)', textAlign: 'center', background: '#030303' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', letterSpacing: '0.5em', fontWeight: '200' }}>CASA PR</h2>
                    <div className="nav-links" style={{ justifyContent: 'center', marginBottom: '3rem' }}>
                        <a href="#home" className="nav-link">Top</a>
                        <a href="#movie" className="nav-link">Movie</a>
                        <a href="#gallery" className="nav-link">Details</a>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.2em' }}>
                        &copy; 2026 ARCHITECTURAL VISUALIZATION | DESIGNED BY ARTIFICIAL INTELLIGENCE
                    </p>
                </div>
            </footer>
        </main>
    );
}

export default App;
