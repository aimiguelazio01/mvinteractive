import React, { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PerspectiveCamera, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

const Model = ({ modelId, progress, mouseRotation }: { modelId: string, progress: number, mouseRotation: THREE.Euler }) => {
    const { scene } = useGLTF(`/assets/3d/s06/${modelId}.gltf`);

    // Ensure shadows and materials
    useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Add a slightly technical material look if needed
                if (child.material) {
                    child.material.roughness = 0.5;
                    child.material.metalness = 0.4;
                }
            }
        });
    }, [scene]);

    // Calculate scale: 0 to 1 based on progress
    const scale = progress;
    const isComplete = progress > 0.98;

    return (
        <primitive
            object={scene}
            scale={scale * 0.04}
            rotation={[
                isComplete ? mouseRotation.x : 0,
                isComplete ? mouseRotation.y : Math.PI * progress * 0.5,
                isComplete ? mouseRotation.z : 0
            ]}
        />
    );
};

interface Section06ExperienceProps {
    scrollProgress: number;
    modelId?: string;
}

const Section06Experience: React.FC<Section06ExperienceProps> = ({ scrollProgress, modelId = 'print01' }) => {
    const [mouseRotation, setMouseRotation] = useState(new THREE.Euler(0, 0, 0));
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // Reset rotation when scrolling back
    useEffect(() => {
        if (scrollProgress < 0.95) {
            setMouseRotation(new THREE.Euler(0, 0, 0));
        }
    }, [scrollProgress]);

    // Handle mouse rotation when progress is 100%
    useEffect(() => {
        if (scrollProgress < 0.95) return;

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                isDragging.current = true;
                lastMouse.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const deltaX = e.clientX - lastMouse.current.x;
            const deltaY = e.clientY - lastMouse.current.y;

            setMouseRotation(prev => new THREE.Euler(
                prev.x + deltaY * 0.01,
                prev.y + deltaX * 0.01,
                0
            ));
            lastMouse.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [scrollProgress]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none">
            <Canvas
                shadows
                style={{ pointerEvents: scrollProgress > 0.95 ? 'auto' : 'none' }}
                gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 25], fov: 30 }}
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={30} />

                    <ambientLight intensity={0.4} />
                    <spotLight position={[15, 20, 15]} angle={0.3} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, 10, -10]} intensity={1} color="#A855F7" />

                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <Center position={[-5, -4, 0]}>
                            <Model modelId={modelId} progress={scrollProgress} mouseRotation={mouseRotation} />
                        </Center>
                    </Float>

                    {!isMobile && (
                        <ContactShadows
                            position={[0, -10, 0]}
                            opacity={0.4}
                            scale={30}
                            blur={2.5}
                            far={15}
                        />
                    )}

                    <Environment preset="warehouse" />
                </Suspense>
            </Canvas>
        </div>
    );
};

useGLTF.preload('/assets/3d/s06/print01.gltf');
useGLTF.preload('/assets/3d/s06/print02.gltf');
useGLTF.preload('/assets/3d/s06/print03.gltf');

export default Section06Experience;
