import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';
import HandTracker from './HandTracker';

interface PanoramaProps {
    textureUrl: string;
}

const Panorama: React.FC<PanoramaProps> = ({ textureUrl }) => {
    const texture = useTexture(textureUrl);
    texture.mapping = THREE.EquirectangularReflectionMapping;
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
    const { camera, gl } = useThree();
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const rotation = useRef({ x: camera.rotation.x, y: camera.rotation.y });

    useEffect(() => {
        // Sync rotation on mount to avoid jumping
        rotation.current.x = camera.rotation.x;
        rotation.current.y = camera.rotation.y;
    }, [camera]);

    useFrame(() => {
        if (handTrackingActive && handPos && handPos.isPinching) {
            if (!lastPos.current) {
                lastPos.current = { x: handPos.x, y: handPos.y };
            } else {
                const dx = handPos.x - lastPos.current.x;
                const dy = handPos.y - lastPos.current.y;

                // Optimized sensitivity for high-res panoramas
                rotation.current.y -= dx * 3.5;
                rotation.current.x = Math.max(-1.2, Math.min(1.2, rotation.current.x + dy * 2.8));

                lastPos.current = { x: handPos.x, y: handPos.y };
            }
        } else {
            lastPos.current = null;
        }

        camera.rotation.order = 'YXZ';
        camera.rotation.y = rotation.current.y;
        camera.rotation.x = rotation.current.x;
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
        <div className="absolute inset-0 z-[2500] pointer-events-none" style={{ background: '#040404' }}>
            {/* Mouse Instructions (Desktop only, top) */}
            {!handTrackingActive && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        filter: isButtonHovered ? 'blur(10px)' : 'blur(0px)'
                    }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 z-[3005] w-full flex justify-center px-6"
                >
                    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full flex items-center gap-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[11px] md:text-sm font-mono tracking-[0.3em] uppercase underline-offset-8 text-white/80">
                            {sectionT.instructions.mouse}
                        </span>
                    </div>
                </motion.div>
            )}


            {/* Hand-Tracking Toggle & Instructions */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[3005] pointer-events-auto flex flex-col items-center gap-2 w-full">
                <AnimatePresence>
                    {handTrackingActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            {mediapipeStatus === 'loading' ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white font-bold">
                                            {lang === 'EN' ? `Loading AI Experience... ${mediapipeProgress}%` : `A Carregar Experiência... ${mediapipeProgress}%`}
                                        </span>
                                    </div>
                                    <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-white"
                                            animate={{ width: `${mediapipeProgress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${handDetected ? 'animate-pulse' : ''}`}>
                                        <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                                    </svg>
                                    <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white font-bold whitespace-nowrap">
                                        {handDetected ? (lang === 'EN' ? 'Pinch to Rotate • Open hand to click' : 'Aperte para Rodar • Mão aberta para clicar') : (lang === 'EN' ? 'Show hand to track • Setup Complete' : 'Mostre a mão para detetar • Configuração Concluída')}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleHandTracking}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    className={`group relative flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 cursor-pointer
                        ${handTrackingActive ? 'bg-[#68F2EB]/15 border-[#68F2EB]/60 shadow-[0_0_30px_rgba(104,242,235,0.3)]' : 'bg-black/80 border-white/20 hover:border-[#68F2EB]/40 hover:bg-[#68F2EB]/10'}
                        backdrop-blur-md`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-all duration-300 ${handTrackingActive ? 'text-[#68F2EB] animate-pulse' : 'text-white/60 group-hover:text-[#68F2EB]'}`}>
                        <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    <span className={`text-xs uppercase font-mono tracking-[0.2em] transition-colors duration-300 ${handTrackingActive ? 'text-[#68F2EB]' : 'text-white/70 group-hover:text-[#68F2EB]'}`}>
                        {handTrackingActive ? (lang === 'PT' ? 'Sair da Experiência' : 'Exit Experience') : (lang === 'PT' ? 'Entrar na Experiência' : 'Enter Experience')}
                    </span>
                    {handTrackingActive && <span className="absolute inset-0 rounded-full border border-[#68F2EB]/40 animate-ping" />}
                </button>
                
                {!handTrackingActive && isButtonHovered && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-mono tracking-[0.3em] text-white font-bold uppercase mt-2"
                    >
                        {lang === 'EN' ? 'Uses MediaPipe AI Hand Tracking' : 'Usa Rastreamento de Mãos MediaPipe IA'}
                    </motion.p>
                )}
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
                    <div className={`w-full h-full rounded-full border-2 transition-colors duration-300 ${handPos.isPinching ? 'border-[#68F2EB] bg-[#68F2EB]/20' : 'border-white/50'}`} />
                    {hoverRef.current && !handPos.isPinching && (
                        <motion.div
                            className="absolute inset-[-4px] rounded-full border-2 border-[#68F2EB] border-t-transparent animate-spin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                    )}
                </motion.div>
            )}

            {/* Environment Selection UI (replicated from Section.tsx for better MP integration) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    filter: isButtonHovered ? 'blur(10px)' : 'blur(0px)'
                }}
                className="fixed left-[60px] md:left-[400px] top-[400px] md:top-[320px] z-[3001] flex flex-col gap-6 pointer-events-auto"
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-[1px] bg-white/30" />
                        <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase font-bold">Category</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        {(Object.keys(SECTION_02_VARIANTS) as Array<keyof typeof SECTION_02_VARIANTS>).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setCategory(cat); setActiveTexture(SECTION_02_VARIANTS[cat][0].sphere); }}
                                className={`px-3 py-1.5 text-[9px] font-mono tracking-widest border transition-all duration-300 ${category === cat ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/10 text-white/70 border-white/20 hover:border-white/50 hover:text-white backdrop-blur-sm'}`}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-[1px] bg-white/30" />
                        <span className="text-[9px] font-mono tracking-widest text-white/60 uppercase font-bold">Environment</span>
                    </div>
                    <div className="flex flex-row gap-4">
                        {SECTION_02_VARIANTS[category].map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setActiveTexture(item.sphere)}
                                className="group relative cursor-pointer"
                            >
                                <div className={`w-14 h-14 md:w-16 md:h-16 p-0.5 rounded-lg border transition-all duration-500 overflow-hidden ${activeTexture === item.sphere ? 'border-[#68F2EB] shadow-[0_0_20px_rgba(104,242,235,0.2)]' : 'border-white/10 grayscale hover:grayscale-0 bg-white/5'}`}>
                                    <img src={item.btn} alt={item.label} className="w-full h-full object-cover rounded-md" />
                                </div>
                                <div className="mt-2 text-[8px] font-mono text-center tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity text-white">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute inset-0 z-[2499]"
                animate={{
                    filter: isButtonHovered ? 'blur(15px)' : 'blur(0px)',
                    scale: isButtonHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.5 }}
            >
                <Canvas
                    style={{ pointerEvents: 'auto' }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0, 0.1], fov: 75 }}
                >
                    <Suspense fallback={null}>
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
            </motion.div>

            <HandTracker onHandMove={setHandPos} active={handTrackingActive} onStatusChange={handleMediapipeStatus} />
        </div>
    );
};

export default Section02Experience;
