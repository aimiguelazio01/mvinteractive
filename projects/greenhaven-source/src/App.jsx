import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

const images = [
    'imgs/img_01.jpg', 'imgs/img_02.jpg', 'imgs/img_03.jpg',
    'imgs/img_04.jpg', 'imgs/img_05.jpg', 'imgs/img_06.jpg',
    'imgs/img_07.jpg', 'imgs/img_08.jpg', 'imgs/img_09.jpg',
    'imgs/img_10.jpg', 'imgs/img_11.jpg'
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
                top: -10,
                left: -10,
                width: '24px',
                height: '24px',
                border: '1px solid var(--accent)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                transition: 'transform 0.08s ease-out',
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
            duration: 1.6,
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
        if (hoverTimeout) clearTimeout(hoverTimeout);
        const timeout = setTimeout(() => {
            setPopupPos({ x: e.clientX, y: e.clientY });
            setActivePopup(img);
        }, 800);
        setHoverTimeout(timeout);
    };

    const handleMouseLeaveItem = () => {
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
                            background: 'rgba(6, 7, 6, 0.9)',
                            backdropFilter: 'blur(15px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'auto'
                        }}
                        onMouseMove={() => setActivePopup(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onMouseMove={(e) => e.stopPropagation()}
                            style={{
                                padding: '1rem',
                                background: 'var(--bg-soft)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2rem',
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                boxShadow: '0 80px 100px rgba(0,0,0,0.6)',
                                pointerEvents: 'auto'
                            }}
                        >
                            <img
                                src={activePopup}
                                alt="Forest House Preview"
                                style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '75vh',
                                    objectFit: 'contain'
                                }}
                            />
                            <div style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
                                <p style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'lowercase', letterSpacing: '0.3em', marginBottom: '0.5rem', fontWeight: '500' }}>— spatial exploration</p>
                                <h2 style={{ fontWeight: '300', fontSize: '1.8rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>MATERIAL STUDY</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <a href="/" className="logo">FOREST<span>HOUSE</span></a>
                <div className="nav-links">
                    <a href="#home" className="nav-link">nature</a>
                    <a href="#movie" className="nav-link">film</a>
                    <a href="#gallery" className="nav-link">spaces</a>
                </div>
            </motion.nav>

            <div style={{ height: '10vh' }}></div>

            {/* Home Section */}
            <section id="home" className="section">
                <div className="hero-video-container" style={{ background: '#0b0d0b' }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster="imgs/img_02.jpg"
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
                        <source src="imgs/forestHouse_interactive.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '10vh' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="hero-content"
                    >
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{ textTransform: 'lowercase', letterSpacing: '0.4em', fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '500' }}
                        >
                            — organic architecture in situ
                        </motion.p>
                        <h1 className="title-large">
                            Where Silence <br /> Meets <span className="accent-text">Structure.</span>
                        </h1>
                        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', marginTop: '4rem' }}>
                            <div style={{ width: '80px', height: '1px', background: 'var(--accent)', marginTop: '0.8rem' }}></div>
                            <p style={{ maxWidth: '600px', fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', fontWeight: '300' }}>
                                A residence designed to disappear. Nestled within the deep moss and ancient pines,
                                Forest House is a dialogue between the permanence of concrete and the fleeting dance of light.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1.5 }}
                    style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                >
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'lowercase', color: 'var(--text-muted)' }}>descend</p>
                    <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, var(--accent), transparent)' }}></div>
                </motion.div>
            </section>

            {/* Movie Section */}
            <section id="movie" className="section movie-section" style={{ background: 'var(--bg-darker)', paddingTop: '15vh' }}>
                <div className="container">
                    <div style={{ marginBottom: 'var(--spacing-l)', borderLeft: '1px solid var(--accent)', paddingLeft: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2 }}
                        >
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '300', marginBottom: '1rem' }}>The <span className="accent-text">Cinematic</span> Flow</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px' }}>Tracing the journey from the forest floor to the sanctuary of the interior.</p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="video-card"
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <video controls muted className="video-bg" poster="imgs/img_02.jpg" style={{ filter: 'grayscale(10%) contrast(1.05)' }}>
                            <source src="imgs/forestHouse_movie.mp4" type="video/mp4" />
                        </video>
                    </motion.div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="section" style={{ background: 'var(--bg)', paddingTop: '15vh', paddingBottom: '15vh' }}>
                <div className="container">
                    <div style={{ maxWidth: '900px', marginBottom: 'var(--spacing-xl)' }}>
                        <motion.h2
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            style={{ fontSize: '5rem', fontWeight: '300', marginBottom: '2.5rem', lineHeight: '1.1' }}
                        >
                            Materiality <br /><span className="accent-text">& Light</span>
                        </motion.h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8', fontWeight: '300', maxWidth: '700px' }}>
                            Captured at various intervals of the day, these studies explore how the changing forest canopy
                            sculpts the internal volumes of the residence.
                        </p>
                    </div>

                    <div className="gallery-grid">
                        {images.map((img, index) => (
                            <motion.div
                                key={index}
                                className="gallery-item"
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 1, delay: (index % 3) * 0.15 }}
                                onMouseEnter={(e) => handleMouseEnter(img, e)}
                                onMouseLeave={handleMouseLeaveItem}
                            >
                                <img src={img} alt={`Forest House detail ${index + 1}`} className="gallery-image" loading="lazy" />
                                <div className="gallery-overlay">
                                    <p style={{ fontSize: '0.7rem', textTransform: 'lowercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '0.5rem' }}>study — {String(index + 1).padStart(2, '0')}</p>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '300' }}>Interior Perspective</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={{ padding: 'var(--spacing-xl) var(--spacing-m)', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', letterSpacing: '0.2em', fontWeight: '300' }}>FOREST<span>HOUSE</span></h2>
                    <div className="nav-links" style={{ justifyContent: 'center', marginBottom: '4rem' }}>
                        <a href="#home" className="nav-link">top</a>
                        <a href="#movie" className="nav-link">film</a>
                        <a href="#gallery" className="nav-link">studies</a>
                    </div>
                    <div style={{ width: '40px', height: '1px', background: 'var(--accent)', margin: '0 auto 2.5rem' }}></div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: '300' }}>
                        &copy; 2026 ARCHITECTURAL VISUALIZATION | REIMAGINED FOR THE FOREST
                    </p>
                </div>
            </footer>
        </main>
    );
}

export default App;
