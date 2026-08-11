import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';
import HandTracker from './HandTracker';

interface PanoramaProps {
    textureUrl: string;
}

const Panorama: React.FC<PanoramaProps> = ({ textureUrl }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl) as THREE.Texture;

    useEffect(() => {
        if (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
        }
    }, [texture]);

    return (
        <mesh>
            <sphereGeometry args={[500, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
};

const SECTION_02_VARIANTS = {
    bedroom: [
        { id: 'b01', btn: '/assets/images/s_bedroom_01_bttn.png', sphere: '/assets/images/bedroom_01.jpg', label: 'BDRM-01' },
        { id: 'b02', btn: '/assets/images/s_bedroom_02_bttn.png', sphere: '/assets/images/bedroom_02.jpg', label: 'BDRM-02' },
        { id: 'b03', btn: '/assets/images/s_bedroom_03_bttn.png', sphere: '/assets/images/bedroom_03.jpg', label: 'BDRM-03' },
    ],
    kitchen: [
        { id: 'k01', btn: '/assets/images/s_kitchen_01_bttn.png', sphere: '/assets/images/kitchen_01.jpg', label: 'KTCH-01' },
        { id: 'k02', btn: '/assets/images/s_kitchen_02_bttn.png', sphere: '/assets/images/kitchen_02.jpg', label: 'KTCH-02' },
        { id: 'k03', btn: '/assets/images/s_kitchen_03_bttn.png', sphere: '/assets/images/kitchen_03.jpg', label: 'KTCH-03' },
    ],
    livingroom: [
        { id: 'l01', btn: '/assets/images/s_livingroom_01_bttn.png', sphere: '/assets/images/livingroom_01.jpg', label: 'LVRM-01' },
        { id: 'l02', btn: '/assets/images/s_livingroom_02_bttn.png', sphere: '/assets/images/livingroom_02.jpg', label: 'LVRM-02' },
        { id: 'l03', btn: '/assets/images/s_livingroom_03_bttn.png', sphere: '/assets/images/livingroom_03.jpg', label: 'LVRM-03' },
    ]
};

const ControlsHandler = ({ handPos, handTrackingActive }: { handPos: any; handTrackingActive: boolean }) => {
    const { camera } = useThree();
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const targetRotation = useRef({ x: camera.rotation.x, y: camera.rotation.y });

    useEffect(() => {
        // Sync rotation on mount to avoid jumping
        targetRotation.current.x = camera.rotation.x;
        targetRotation.current.y = camera.rotation.y;
    }, [camera]);

    useFrame((state, delta) => {
        if (handTrackingActive && handPos && handPos.isPinching) {
            if (!lastPos.current) {
                lastPos.current = { x: handPos.x, y: handPos.y };
            } else {
                const dx = handPos.x - lastPos.current.x;
                const dy = handPos.y - lastPos.current.y;

                // Increased sensitivity, but smoothed out by lerp
                targetRotation.current.y -= dx * 4.5;
                targetRotation.current.x = Math.max(-1.2, Math.min(1.2, targetRotation.current.x + dy * 3.5));

                lastPos.current = { x: handPos.x, y: handPos.y };
            }
        } else {
            lastPos.current = null;
        }

        camera.rotation.order = 'YXZ';
        
        // Smooth lerping to absorb low frame rates from mediapipe tracking
        camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 12 * delta;
        camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 12 * delta;
        camera.rotation.z = 0; // Prevent rolling
    });

    return null;
};

interface Section02ExperienceProps {
    textureUrl: string;
    lang?: 'EN' | 'PT';
}

const Section02Experience: React.FC<Section02ExperienceProps> = ({ textureUrl: initialTexture, lang = 'EN' }) => {
    const t = TRANSLATIONS[lang];
    const sectionT = t.sections.section_02;
    const [handTrackingActive, setHandTrackingActive] = useState(false);
    const [handPos, setHandPos] = useState<{ x: number; y: number; isPinching?: boolean } | null>(null);
    const [category, setCategory] = useState<keyof typeof SECTION_02_VARIANTS>('bedroom');
    const [activeTexture, setActiveTexture] = useState(initialTexture);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mediapipeStatus, setMediapipeStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [mediapipeProgress, setMediapipeProgress] = useState(0);
    const [handDetected, setHandDetected] = useState(false);

    const handleMediapipeStatus = (status: 'idle' | 'loading' | 'ready' | 'error', detected: boolean, progress: number) => {
        setMediapipeStatus(status);
        setHandDetected(detected);
        setMediapipeProgress(progress);
    };

    const toggleHandTracking = () => {
        setHandTrackingActive(v => !v);
        if (!handTrackingActive) setHandPos(null);
    };

    // Auto-click simulation when hand is open (ready to click)
    const lastClickTime = useRef(0);
    const hoverRef = useRef<HTMLElement | null>(null);
    const hoverStartTime = useRef(0);

    useEffect(() => {
        if (!handTrackingActive || !handPos || handPos.isPinching) {
            hoverRef.current = null;
            return;
        }

        // Convert -1..1 to screen coords
        const x = (handPos.x + 1) / 2 * window.innerWidth;
        const y = (1 - (handPos.y + 1) / 2) * window.innerHeight;

        const element = document.elementFromPoint(x, y) as HTMLElement;
        if (element && (element.tagName === 'BUTTON' || element.closest('button') || element.closest('.group'))) {
            const target = (element.closest('button') || element.closest('.group')) as HTMLElement;
            if (target !== hoverRef.current) {
                hoverRef.current = target;
                hoverStartTime.current = Date.now();
            } else if (Date.now() - hoverStartTime.current > 600) { // faster 600ms dwell to click
                if (Date.now() - lastClickTime.current > 1000) {
                    target.click();
                    lastClickTime.current = Date.now();
                    hoverRef.current = null;
                }
            }
        } else {
            hoverRef.current = null;
        }
    }, [handPos, handTrackingActive]);

    return (
        <div className="absolute inset-0 z-[2500] pointer-events-auto" style={{ background: '#040404' }}>
            <AnimatePresence>
                {handTrackingActive && mediapipeStatus === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-10 max-w-sm w-full px-10 text-center"
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="62" fill="none" stroke="white" strokeWidth="1" className="opacity-10" />
                                    <motion.circle
                                        cx="64" cy="64" r="62" fill="none" stroke="#5282be" strokeWidth="2"
                                        strokeDasharray="390"
                                        animate={{ strokeDashoffset: 390 * (1 - mediapipeProgress / 100) }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-mono text-white font-light">{mediapipeProgress}%</span>
                                    <span className="text-[11px] font-mono text-[#5282be] tracking-[0.3em] uppercase mt-1">Ready</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-[13px] font-mono tracking-[0.5em] uppercase text-white font-bold animate-pulse">
                                        {lang === 'EN' ? 'Initializing AI Engine' : 'A Iniciar Motor IA'}
                                    </h3>
                                    <div className="w-8 h-[1px] bg-[#5282be] mx-auto" />
                                </div>
                                <p className="text-[12px] font-mono tracking-[0.2em] text-white/50 uppercase leading-relaxed">
                                    {lang === 'EN'
                                        ? 'Configuring palm detection and camera streams for 360 viewer'
                                        : 'A configurar deteção de palma e fluxos de câmara para visualizador 360'}
                                </p>
                            </div>

                            <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#5282be]"
                                    animate={{ width: `${mediapipeProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>


                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hand-Tracking Toggle & Instructions */}
            <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-[3005] pointer-events-auto flex flex-col items-center gap-3 md:gap-6 w-full max-w-2xl px-4">
                {/* Mouse Instructions (Desktop only) */}
                {!handTrackingActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            filter: isButtonHovered ? 'blur(10px)' : 'blur(0px)'
                        }}
                        className="flex justify-center w-full"
                    >
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-4 md:px-8 py-2 md:py-4 rounded-full flex items-center justify-center gap-2 md:gap-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse flex-shrink-0" />
                            <span className="text-[10px] md:text-xs font-mono tracking-[0.1em] md:tracking-[0.4em] uppercase text-white font-bold text-center">
                                {sectionT.instructions.mouse}
                            </span>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {handTrackingActive && mediapipeStatus === 'ready' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col items-center gap-3 md:gap-4 mb-2 md:mb-4 w-full"
                        >
                            <div className="flex items-center gap-1.5 md:gap-5 bg-white/5 backdrop-blur-2xl border border-white/10 px-2 md:px-8 py-1 md:py-4 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 md:w-6 md:h-6 flex-shrink-0 ${handDetected ? 'animate-pulse' : 'text-white/40'}`}>
                                    <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                                </svg>
                                <span className="text-[7px] md:text-xs font-mono tracking-[0.1em] md:tracking-[0.4em] uppercase text-white font-bold text-center">
                                    {handDetected ? (lang === 'EN' ? 'Pinch to Rotate • Open hand to click' : 'Aperte para Rodar • Mão aberta para clicar') : (lang === 'EN' ? 'Setup Complete • Show hand to track' : 'Configuração Concluída • Mostre a mão')}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleHandTracking}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    className={`group relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-500 cursor-pointer
                        ${handTrackingActive ? 'bg-[#5282be]/15 border-[#5282be]/60 shadow-[0_0_30px_rgba(82,130,190,0.3)]' : 'bg-black/80 border-[#5282be]/40 hover:border-white/30 hover:bg-white/5'}
                        backdrop-blur-md`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-all duration-300 ${handTrackingActive ? 'text-[#5282be] animate-pulse' : 'text-[#5282be] group-hover:text-white'}`}>
                        <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    <span className={`text-[9px] md:text-xs uppercase font-mono tracking-[0.1em] md:tracking-[0.2em] transition-colors duration-300 ${handTrackingActive ? 'text-[#5282be]' : 'text-[#5282be] group-hover:text-white'}`}>
                        {handTrackingActive ? (lang === 'PT' ? 'Sair da Experiência' : 'Exit Experience') : (lang === 'PT' ? 'use a sua webcam e jogue com as mãos' : 'use your webcam and play with hands')}
                    </span>
                    {handTrackingActive && <span className="absolute inset-0 rounded-full border border-[#5282be]/40 animate-ping" />}
                </button>
            </div>
            {/* Virtual Cursor */}
            {handTrackingActive && handPos && (
                <motion.div
                    className="fixed w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center"
                    animate={{
                        x: (handPos.x + 1) / 2 * window.innerWidth - 16,
                        y: (1 - (handPos.y + 1) / 2) * window.innerHeight - 16,
                        scale: handPos.isPinching ? 0.8 : 1
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                >
                    <div className={`w-full h-full rounded-full border-2 transition-colors duration-300 ${handPos.isPinching ? 'border-[#5282be] bg-[#5282be]/20' : 'border-white/50'}`} />
                    {hoverRef.current && !handPos.isPinching && (
                        <motion.div
                            className="absolute inset-[-4px] rounded-full border-2 border-[#5282be] border-t-transparent animate-spin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                    )}
                </motion.div>
            )}

            {/* Menu Toggle Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    filter: isButtonHovered ? 'blur(10px)' : 'blur(0px)'
                }}
                className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[3002] pointer-events-auto"
            >
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    className={`group relative w-[88px] h-[88px] md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 backdrop-blur-xl cursor-pointer
                        ${menuOpen
                            ? 'bg-white/15 border-[#5282be]/80 shadow-[0_0_40px_rgba(82,130,190,0.35)]'
                            : 'bg-black/60 border-white/20 hover:border-white/50 hover:bg-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                        }`}
                >
                    {/* Animated icon: grid → close */}
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 0 : -4 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className={`absolute w-5 h-0.5 rounded-full transition-colors duration-300 ${menuOpen ? 'bg-[#5282be]' : 'bg-white/70'}`}
                        />
                        <motion.div
                            animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute w-5 h-0.5 rounded-full bg-white/70"
                        />
                        <motion.div
                            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? 0 : 4 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className={`absolute w-5 h-0.5 rounded-full transition-colors duration-300 ${menuOpen ? 'bg-[#5282be]' : 'bg-white/70'}`}
                        />
                    </div>

                    {/* Pulse ring when closed */}
                    {!menuOpen && (
                        <motion.span
                            className="absolute inset-0 rounded-2xl border border-white/20"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    )}
                </button>

                {/* Label below toggle */}
                <motion.span
                    animate={{ opacity: menuOpen ? 0 : 0.5 }}
                    className="block text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase text-white text-center mt-2 pointer-events-none"
                >
                    Menu
                </motion.span>
            </motion.div>

            {/* Collapsible Menu Panel */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed left-[76px] md:left-[100px] top-1/2 -translate-y-1/2 z-[3001] pointer-events-auto"
                    >
                        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 md:p-7 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col gap-6 md:gap-8 max-h-[70vh] overflow-y-auto no-scrollbar">

                            {/* Category Section */}
                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-6 h-[1px] bg-[#5282be]/50" />
                                    <span className="text-[10px] md:text-[11px] font-mono tracking-[0.4em] text-[#5282be]/80 uppercase font-bold">Category</span>
                                </div>
                                <div className="flex flex-col gap-2 md:gap-3">
                                    {(Object.keys(SECTION_02_VARIANTS) as Array<keyof typeof SECTION_02_VARIANTS>).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => { setCategory(cat); setActiveTexture(SECTION_02_VARIANTS[cat][0].sphere); }}
                                            className={`w-full px-5 md:px-7 py-3.5 md:py-4 text-[11px] md:text-[13px] font-mono tracking-[0.3em] border rounded-xl transition-all duration-300 text-left cursor-pointer
                                                ${category === cat
                                                    ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.25)] font-bold'
                                                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {cat.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-[1px] bg-white/10" />

                            {/* Environment Section */}
                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-6 h-[1px] bg-[#5282be]/50" />
                                    <span className="text-[10px] md:text-[11px] font-mono tracking-[0.4em] text-[#5282be]/80 uppercase font-bold">Environment</span>
                                </div>
                                <div className="flex flex-row gap-3 md:gap-4">
                                    {SECTION_02_VARIANTS[category].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTexture(item.sphere); setMenuOpen(false); }}
                                            className="group relative cursor-pointer flex-shrink-0 bg-transparent border-0 p-0"
                                        >
                                            <div className={`w-20 h-20 md:w-24 md:h-24 p-0.5 rounded-xl md:rounded-2xl border-2 transition-all duration-500 overflow-hidden
                                                ${activeTexture === item.sphere
                                                    ? 'border-[#5282be] shadow-[0_0_30px_rgba(82,130,190,0.35)]'
                                                    : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30 bg-white/5'
                                                }`}
                                            >
                                                <img src={item.btn} alt={item.label} className="w-full h-full object-cover rounded-lg md:rounded-xl" />
                                            </div>
                                            <div className="mt-2 text-[9px] md:text-[11px] font-mono text-center tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity text-white font-bold">
                                                {item.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="absolute inset-0 z-[2501]"
                animate={{
                    filter: isButtonHovered ? 'blur(15px)' : 'blur(0px)',
                    scale: isButtonHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                    <Canvas
                        gl={{ antialias: false, powerPreference: 'high-performance' }}
                        dpr={[1, 1.5]}
                        camera={{ position: [0, 0, 0.1], fov: 75 }}
                    >
                        <Suspense fallback={
                            <Html center>
                                <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6 }}>
                                    Loading Panorama...
                                </div>
                            </Html>
                        }>
                            <color attach="background" args={['#040404']} />
                            <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} />
                            {!handTrackingActive && (
                                <OrbitControls
                                    enableZoom={false}
                                    enablePan={false}
                                    rotateSpeed={-0.4}
                                    autoRotate={true}
                                    autoRotateSpeed={0.5}
                                />
                            )}
                            {handTrackingActive && <ControlsHandler handPos={handPos} handTrackingActive={handTrackingActive} />}
                            <Panorama textureUrl={activeTexture} />
                        </Suspense>
                    </Canvas>
                </div>
            </motion.div>

            <HandTracker onHandMove={setHandPos} active={handTrackingActive} onStatusChange={handleMediapipeStatus} color="#5282be" />
        </div>
    );
};

export default Section02Experience;
