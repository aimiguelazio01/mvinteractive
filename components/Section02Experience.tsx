import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PanoramaProps {
    textureUrl: string;
}

const Panorama: React.FC<PanoramaProps> = ({ textureUrl }) => {
    const texture = useTexture(textureUrl);

    // Ensure the texture is mapped correctly for a sphere interior
    texture.mapping = THREE.EquirectangularReflectionMapping;

    return (
        <mesh>
            <sphereGeometry args={[500, 64, 64]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
};

interface Section02ExperienceProps {
    textureUrl: string;
}

const Section02Experience: React.FC<Section02ExperienceProps> = ({ textureUrl }) => {
    return (
        <div className="absolute inset-0 z-[2500] pointer-events-none">
            <Canvas
                style={{ pointerEvents: 'auto' }}
                gl={{ antialias: true }}
                camera={{ position: [0, 0, 0.1], fov: 75 }}
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        rotateSpeed={-0.4}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />
                    <Panorama textureUrl={textureUrl} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Section02Experience;
