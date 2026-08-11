import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PerspectiveCamera, Center, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import LottieBackground from './LottieBackground';

import { TRANSLATIONS } from '../data/translations';

const Model = ({ modelId, progress, rotationX, rotationY }: { modelId: string, progress: number, rotationX: number, rotationY: number }) => {
    const { scene } = useGLTF(`/assets/3d/s06/${modelId}.gltf`);

    // Ensure shadows and materials
    useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.roughness = 0.5;
                    child.material.metalness = 0.4;
                }
            }
        });
    }, [scene]);

    // Scale: show minimal geometry at start, full size at end
    const easedProgress = Math.max(0, (progress - 0.02) / 0.98);
    const scale = (0.1 + easedProgress * 0.9) * 0.034;

    return (
        <primitive
            object={scene}
            scale={scale}
            rotation={[
                rotationX,
                rotationY + Math.PI * progress * 0.5,
                0
            ]}
        />
    );
};

interface Section06ExperienceProps {
    scrollProgress: number;
    setScrollProgress: React.Dispatch<React.SetStateAction<number>>;
    modelId?: string;
    onModelChange?: (id: string) => void;
    onLottieLoaded?: () => void;
    lang: string;
}

const Section06Experience: React.FC<Section06ExperienceProps> = ({ 
    scrollProgress, 
    setScrollProgress, 
    modelId = 'print01', 
    onModelChange, 
    onLottieLoaded, 
    lang 
}) => {
    const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.EN;
    const [isMobile, setIsMobile] = useState(false);
    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
    const isMouseDownRef = useRef(false);
    const lastMouseXRef = useRef(0);
    const lastMouseYRef = useRef(0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handlePointerDown = (e: PointerEvent) => {
            isMouseDownRef.current = true;
            lastMouseXRef.current = e.clientX;
            lastMouseYRef.current = e.clientY;
        };

        const handlePointerUp = () => {
            isMouseDownRef.current = false;
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (isMouseDownRef.current) {
                const deltaX = e.clientX - lastMouseXRef.current;
                const deltaY = e.clientY - lastMouseYRef.current;
                lastMouseXRef.current = e.clientX;
                lastMouseYRef.current = e.clientY;
                setRotationY((prev) => prev + deltaX * 0.01);
                setRotationX((prev) => prev + deltaY * 0.01);
            }
        };

        const handleWheel = (e: WheelEvent) => {
            // Prevent default scroll behavior of the page while inside the experience
            e.preventDefault();
            
            setScrollProgress((prev) => {
                const change = e.deltaY * 0.001;
                return Math.min(Math.max(prev + change, 0), 1);
            });
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            // Prevent default scrolling on mobile
            if (e.cancelable) {
                e.preventDefault();
            }
            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY; // Positive when swiping up (scrolling down)
            touchStartY = touchEndY;

            setScrollProgress((prev) => {
                const change = deltaY * 0.003;
                return Math.min(Math.max(prev + change, 0), 1);
            });
        };

        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [setScrollProgress]);

    return (
        <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black">
            {/* Lottie Fabrication Animation Layer */}
            <div className="absolute inset-0 z-[15] opacity-60">
                <LottieBackground
                    key={modelId}
                    url={`/assets/3d/s06/${modelId}.json`}
                    progress={scrollProgress}
                    onLoaded={onLottieLoaded}
                    opacity={0.8}
                />
            </div>

            {/* 3D Scene Layer — transparent background */}
            <div
                className="absolute inset-0 w-full h-full z-[20]"
                style={{ pointerEvents: 'auto', background: 'transparent' }}
            >
                <Canvas
                    shadows={!isMobile}
                    gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                    dpr={isMobile ? [1, 1] : [1, 1.5]}
                    camera={{ position: [0, 0, 25], fov: 30 }}
                >
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={30} />

                        <ambientLight intensity={0.6} />
                        <spotLight position={[15, 20, 15]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
                        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#A855F7" />

                        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Center position={[-4, -1.5, 8]}>
                                <Model 
                                    modelId={modelId} 
                                    progress={scrollProgress} 
                                    rotationX={rotationX}
                                    rotationY={rotationY}
                                />
                            </Center>
                        </Float>

                        <Environment files="/assets/images/monochrome_studio_04_1k.hdr" />
                        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Scroll Interaction Captions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-3 z-[100] pointer-events-none w-[90%] md:w-auto"
            >
                <AnimatePresence mode="wait">
                    {scrollProgress > 0.95 ? (
                        <motion.div
                            key="inspect"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                            <span className="text-xs font-mono tracking-widest text-white uppercase font-bold bg-black/40 px-3 py-1 rounded backdrop-blur-sm border border-white/20">
                                {t.ui?.inspectExperience || "Click & Drag to Inspect"}
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="fabricate"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-[2px] h-10 bg-[#b46464]/50 animate-bounce" />
                            <span className="text-xs font-mono tracking-widest text-[#b46464] font-bold uppercase bg-black/40 px-3 py-1 rounded backdrop-blur-sm border border-[#b46464]/20">
                                {t.sections.section_06.instructions?.mouse || "Scroll Mouse to Fabricate"}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="text-xs font-tech text-white tracking-widest font-bold">
                    {Math.round(scrollProgress * 100)}% {lang === 'EN' ? 'Complete' : 'Completo'}
                </div>
            </motion.div>

            {/* Sidebar Buttons */}
            <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4 md:gap-6 pointer-events-auto items-end">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-white/30 hidden md:block" />
                    <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase font-bold hidden md:inline-block">Prototypes</span>
                </div>

                <div className="flex flex-col gap-3 md:gap-5">
                    {[
                        { id: 'print01', img: '/assets/images/vfx/vfx_07.png', label: 'OBJ-ALPHA' },
                        { id: 'print02', img: '/assets/images/vfx/vfx_08.png', label: 'OBJ-BETA' },
                        { id: 'print03', img: '/assets/images/vfx/vfx_09.png', label: 'OBJ-GAMMA' }
                    ].map((btn) => (
                        <div
                            key={btn.id}
                            onClick={() => onModelChange?.(btn.id)}
                            className="group relative cursor-pointer"
                        >
                            <div className={`w-14 h-14 md:w-24 md:h-24 p-0.5 rounded-xl border transition-all duration-500 overflow-hidden ${modelId === btn.id ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] bg-white/5 scale-110' : 'border-white/10 grayscale hover:grayscale-0 bg-white/5 hover:border-white/30'}`}>
                                <img src={btn.img} alt={btn.label} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div className={`absolute -left-4 top-1/2 -translate-y-1/2 translate-x-full px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                                <span className="text-[8px] font-mono text-white tracking-widest uppercase">{btn.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Section06Experience;
