import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, Center, ContactShadows, Float, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { useLoader } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';

const GALLERY_IFRAMES = [
    "https://player.mediadelivery.net/embed/625906/c4f7268d-51fe-4779-9adb-45bccb8447bd?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false",
    "https://player.mediadelivery.net/embed/625906/83fad43c-984c-43e5-b3bc-82ce27c79387?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false",
    "https://player.mediadelivery.net/embed/625906/7b5e168d-de03-46c4-9d8e-dcc4b20fdcbe?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false",
    "https://player.mediadelivery.net/embed/625906/bf93b238-80ea-4fa2-bc70-6251862943b1?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false",
    "https://player.mediadelivery.net/embed/625906/115ccb02-3030-449e-9b6e-a3bc8f6ce89f?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false"
];

const ImageGallery = ({ onSelect, onHover, collidersRef, occluderMeshes }: {
    onSelect: (index: number | null) => void,
    onHover: (index: number | null) => void,
    collidersRef: React.MutableRefObject<THREE.Mesh[]>,
    occluderMeshes: React.MutableRefObject<THREE.Mesh[]>
}) => {
    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

    useEffect(() => {
        // Filter out nulls and update the colliders ref
        const activeMeshes = meshRefs.current.filter((m): m is THREE.Mesh => m !== null);
        collidersRef.current = activeMeshes;
    }, []);
    const count = 10;

    const items = useMemo(() => {
        const spiralHeight = 10; // Reduced vertical span as requested
        return Array.from({ length: count }, (_, i) => ({
            iframeUrl: GALLERY_IFRAMES[i % GALLERY_IFRAMES.length],
            angleOffset: (i / count) * Math.PI * 2,
            radius: 3.5, // Keep the tighter orbit
            height: -spiralHeight / 2 + (i / (count - 1)) * spiralHeight, // Spaced to avoid overlap
            rotationSpeed: 0.15,
            scale: 1.4 // Increased from 1.2
        }));
    }, [count]);

    const groupRefs = useRef<(THREE.Group | null)[]>([]);

    useFrame((state, delta) => {
        items.forEach((item, i) => {
            const group = groupRefs.current[i];
            if (group) {
                const time = state.clock.elapsedTime * item.rotationSpeed;
                const angle = item.angleOffset + time;
                group.position.x = Math.cos(angle) * item.radius;
                group.position.z = Math.sin(angle) * item.radius;
                group.position.y = item.height + Math.sin(time * 0.5) * 0.5;
                group.lookAt(0, group.position.y, 0); // Face the center
            }
        });
    });

    const [hovered, setHoveredLocal] = useState<number | null>(null);
    const setHovered = (idx: number | null) => {
        setHoveredLocal(idx);
        onHover(idx);
    };

    return (
        <group>
            {items.map((item, i) => (
                <group key={i} ref={(el) => { groupRefs.current[i] = el; }}>
                    <mesh
                        ref={(el) => { meshRefs.current[i] = el; }}
                        scale={[item.scale, item.scale, 1]}
                    >
                        <planeGeometry args={[1, 1]} />
                        <meshPhysicalMaterial
                            transparent
                            opacity={0.1}
                            color="#444444"
                            side={THREE.DoubleSide}
                            roughness={0.1}
                            metalness={0.8}
                            clearcoat={1}
                            reflectivity={0.5}
                        />
                        <Html
                            transform
                            distanceFactor={2.0}
                            position={[0, 0, 0.01]}
                            pointerEvents="none"
                            occlude="raycast"
                            style={{ transition: 'opacity 0.15s ease' }}
                        >
                            <div style={{ width: '300px', pointerEvents: 'none', opacity: 0.8 }}>
                                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderRadius: '4px' }}>
                                    <iframe
                                        src={item.iframeUrl}
                                        loading="lazy"
                                        style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%', pointerEvents: 'none' }}
                                        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                                    />
                                </div>
                            </div>
                        </Html>
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// Flowing nebula dust clouds
const NebulaBackground = ({ count = 50 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const clouds = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                -20 - Math.random() * 30
            ),
            scale: 3 + Math.random() * 8,
            speed: 0.02 + Math.random() * 0.05,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            opacity: 0.03 + Math.random() * 0.08
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        clouds.forEach((c, i) => {
            dummy.position.set(
                c.pos.x + Math.sin(time * c.speed + i) * 5,
                c.pos.y + Math.cos(time * c.speed * 0.7 + i) * 3,
                c.pos.z
            );
            dummy.scale.setScalar(c.scale);
            dummy.rotation.z = time * c.rotSpeed;
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#2a1a4a" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
        </instancedMesh>
    );
};

// Distant glowing orbs for depth
const GlowingOrbs = ({ count = 30 }: { count?: number }) => {
    const groupRef = useRef<THREE.Group>(null);

    const orbs = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30,
                -15 - Math.random() * 25
            ),
            scale: 0.1 + Math.random() * 0.4,
            color: Math.random() > 0.7 ? '#6644ff' : Math.random() > 0.5 ? '#4488ff' : '#ffffff',
            speed: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        }));
    }, [count]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;
        groupRef.current.children.forEach((child, i) => {
            const orb = orbs[i];
            const pulse = 0.7 + 0.3 * Math.sin(time * orb.speed + orb.phase);
            child.scale.setScalar(orb.scale * pulse);
        });
    });

    return (
        <group ref={groupRef}>
            {orbs.map((orb, i) => (
                <mesh key={i} position={orb.pos}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color={orb.color} transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
};

// Ambient floating particles
const AmbientDust = ({ count = 200 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 40
            ),
            speed: 0.1 + Math.random() * 0.3,
            phase: Math.random() * 100
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        particles.forEach((p, i) => {
            dummy.position.set(
                p.pos.x,
                p.pos.y + Math.sin(time * p.speed + p.phase) * 2,
                p.pos.z
            );
            dummy.scale.setScalar(0.02 + Math.sin(time + i) * 0.01);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </instancedMesh>
    );
};

const OrbitingParticles = ({ count = 60, colliders, hoveredPlaneIdx }: { count?: number, colliders?: React.MutableRefObject<THREE.Mesh[]>[], hoveredPlaneIdx?: number | null }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const boxMeshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const envMap = useLoader(RGBELoader, '/assets/3d/s05/moon_lab_1k.hdr');
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    // Physical state for each particle
    const state = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute in a vertical cylinder around the sculpture
            const theta = Math.random() * Math.PI * 2;
            const r = 2.5 + Math.random() * 2.5; // Orbit radius
            const height = 10; // Total height span
            const y = (Math.random() - 0.5) * height; // Top to bottom

            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * r;

            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05; // Less vertical movement initially
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

            sizes[i] = 0.08 + Math.random() * 0.15;

            // Random color between light gray (0.8) and dark gray (0.2)
            const gray = 0.2 + Math.random() * 0.6;
            colors[i * 3] = gray;
            colors[i * 3 + 1] = gray;
            colors[i * 3 + 2] = gray;
        }
        return { positions, velocities, sizes, colors };
    }, [count]);

    const vPos = useMemo(() => new THREE.Vector3(), []);
    const vVel = useMemo(() => new THREE.Vector3(), []);
    const vAcc = useMemo(() => new THREE.Vector3(), []);
    const vOther = useMemo(() => new THREE.Vector3(), []);
    const vAttrack = useMemo(() => new THREE.Vector3(), []);
    const vCellPos = useMemo(() => new THREE.Vector3(), []);
    const center = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    // Track cell data in world space each frame
    const cellWorldData = useMemo(() => [] as {
        pos: THREE.Vector3,
        quat: THREE.Quaternion,
        halfExtents: THREE.Vector3
    }[], []);

    const [initialized, setInitialized] = useState(false);

    useFrame((state_fiber, delta) => {
        if (!meshRef.current) return;
        const dt = Math.min(delta, 0.05);

        // Update all cell world data once per frame
        cellWorldData.length = 0;

        const allMeshes: THREE.Mesh[] = [];
        colliders?.forEach(ref => {
            if (ref.current) allMeshes.push(...ref.current);
        });

        if (allMeshes.length > 0) {
            allMeshes.forEach((m, idx) => {
                const wc = new THREE.Vector3();
                const wq = new THREE.Quaternion();

                // Ensure world matrix is fresh
                m.updateWorldMatrix(true, false);

                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                const box = m.geometry.boundingBox!;

                // Get the actual center of the geometry in world space
                const localCenter = new THREE.Vector3();
                box.getCenter(localCenter);
                wc.copy(localCenter).applyMatrix4(m.matrixWorld);

                m.getWorldQuaternion(wq);

                const localExtents = new THREE.Vector3();
                box.getSize(localExtents).multiplyScalar(0.5);
                const worldScale = m.getWorldScale(new THREE.Vector3());
                localExtents.multiply(worldScale);

                cellWorldData.push({
                    pos: wc,
                    quat: wq,
                    halfExtents: localExtents
                });

            });

            // ONE-TIME INITIALIZATION
            if (!initialized) {
                const color = new THREE.Color();
                for (let i = 0; i < count; i++) {
                    const cell = cellWorldData[i % cellWorldData.length];
                    const angle = Math.random() * Math.PI * 2;
                    const r = 2.0;
                    state.positions[i * 3] = cell.pos.x + Math.cos(angle) * r;
                    state.positions[i * 3 + 1] = cell.pos.y + (Math.random() - 0.5) * 5.0;
                    state.positions[i * 3 + 2] = cell.pos.z + Math.sin(angle) * r;

                    // Set instance color
                    color.setRGB(state.colors[i * 3], state.colors[i * 3 + 1], state.colors[i * 3 + 2]);
                    meshRef.current.setColorAt(i, color);
                }
                if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
                setInitialized(true);
            }
        }

        // Vectors for OBB check
        const relPos = new THREE.Vector3();
        const localPos = new THREE.Vector3();
        const closestPoint = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            vPos.set(state.positions[i * 3], state.positions[i * 3 + 1], state.positions[i * 3 + 2]);
            vVel.set(state.velocities[i * 3], state.velocities[i * 3 + 1], state.velocities[i * 3 + 2]);
            vAcc.set(0, 0, 0);

            // 1. DYNAMIC ATTRACTION: Pull to nearest cell & track index
            let nearestDistSq = Infinity;
            let nearestCellPos = center;
            let nearestCellIdx = -1;

            cellWorldData.forEach((cell, idx) => {
                const dSq = vPos.distanceToSquared(cell.pos);
                if (dSq < nearestDistSq) {
                    nearestDistSq = dSq;
                    nearestCellPos = cell.pos;
                    nearestCellIdx = idx;
                }
            });

            vAttrack.subVectors(nearestCellPos, vPos).normalize();
            // Smoother attraction: Proportional but capped. Soften when very close.
            const dist = Math.sqrt(nearestDistSq);
            let pull = Math.min(dist * 0.6, 3.0);
            if (dist < 1.0) pull *= dist; // Linear falloff when close to stabilize
            vAcc.add(vAttrack.multiplyScalar(pull));

            // 1.5 HOVER REDIRECT: Send particles from hovered plane to the sculpture
            const sculptureCount = colliders?.[0]?.current?.length || 0;
            if (hoveredPlaneIdx !== null && hoveredPlaneIdx !== undefined) {
                const hoveredWorldIdx = sculptureCount + hoveredPlaneIdx;
                if (nearestCellIdx === hoveredWorldIdx && sculptureCount > 0) {
                    // Find nearest sculpture cell to redirect particle there
                    let nearestSculptureDist = Infinity;
                    let nearestSculpturePos = center;
                    for (let s = 0; s < sculptureCount; s++) {
                        const sculptureCell = cellWorldData[s];
                        const dSq = vPos.distanceToSquared(sculptureCell.pos);
                        if (dSq < nearestSculptureDist) {
                            nearestSculptureDist = dSq;
                            nearestSculpturePos = sculptureCell.pos;
                        }
                    }
                    // Strong attraction toward the sculpture
                    const toSculpture = nearestSculpturePos.clone().sub(vPos).normalize();
                    vAcc.add(toSculpture.multiplyScalar(35.0));
                }
            }

            // 2. RECTANGULAR (OBB) COLLISIONS
            cellWorldData.forEach(cell => {
                relPos.subVectors(vPos, cell.pos);
                localPos.copy(relPos).applyQuaternion(cell.quat.clone().invert());

                closestPoint.x = Math.max(-cell.halfExtents.x, Math.min(cell.halfExtents.x, localPos.x));
                closestPoint.y = Math.max(-cell.halfExtents.y, Math.min(cell.halfExtents.y, localPos.y));
                closestPoint.z = Math.max(-cell.halfExtents.z, Math.min(cell.halfExtents.z, localPos.z));

                const distLocal = localPos.distanceTo(closestPoint);
                const particleRadius = state.sizes[i];

                if (distLocal < particleRadius) {
                    const pushDirLocal = new THREE.Vector3();
                    if (distLocal < 0.0001) pushDirLocal.set(0, 1, 0);
                    else pushDirLocal.subVectors(localPos, closestPoint).normalize();

                    const pushDirWorld = pushDirLocal.applyQuaternion(cell.quat);
                    const overlap = particleRadius - distLocal;

                    // Softer collision and much higher energy loss (friction)
                    vAcc.add(pushDirWorld.multiplyScalar(overlap * 50.0));
                    vVel.multiplyScalar(0.4);
                }
            });

            // 3. SELF-REPULSION
            for (let j = 0; j < count; j++) {
                if (i === j) continue;
                vOther.set(state.positions[j * 3], state.positions[j * 3 + 1], state.positions[j * 3 + 2]);
                const d = vPos.distanceTo(vOther);
                const minDist = (state.sizes[i] + state.sizes[j]) * 1.5;
                if (d < minDist) {
                    const push = vPos.clone().sub(vOther).normalize();
                    // Lower repulsion force for stability
                    vAcc.add(push.multiplyScalar((minDist - d) * 5.0));
                }
            }

            // 5. MOUSE INTERACTION (Blowing effect)
            // Map pointer (-1 to 1) to world space at z=0 approx
            const mouseX = (state_fiber.pointer.x * state_fiber.viewport.width) / 2;
            const mouseY = (state_fiber.pointer.y * state_fiber.viewport.height) / 2;
            const vMouse = vCellPos.set(mouseX, mouseY, 0);
            const distMouse = vPos.distanceTo(vMouse);
            const interactionRadius = 1.5;

            if (distMouse < interactionRadius) {
                const blowDir = vAttrack.subVectors(vPos, vMouse).normalize();
                const blowStrength = Math.pow(1.0 - distMouse / interactionRadius, 2) * 300.0;
                vAcc.add(blowDir.multiplyScalar(blowStrength));
            }

            vVel.add(vAcc.multiplyScalar(dt));

            // 6. SMOOTHING: Adjusted damping and higher velocity cap for more energetic movement
            vVel.multiplyScalar(0.85);
            if (vVel.length() > 10.0) vVel.setLength(10.0);

            vPos.add(vVel);

            // Save state
            state.positions[i * 3] = vPos.x;
            state.positions[i * 3 + 1] = vPos.y;
            state.positions[i * 3 + 2] = vPos.z;
            state.velocities[i * 3] = vVel.x;
            state.velocities[i * 3 + 1] = vVel.y;
            state.velocities[i * 3 + 2] = vVel.z;

            dummy.position.copy(vPos);
            const s = state.sizes[i];
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            {/* Particles */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshPhysicalMaterial
                    roughness={0.35}
                    metalness={1.0}
                    color="#ffffff"
                    envMap={envMap}
                    envMapIntensity={3.5}
                    clearcoat={0.8}
                    clearcoatRoughness={0.2}
                />
            </instancedMesh>
        </group>
    );
};

const Sculpture = ({ collidersRef, occluderMeshes }: {
    collidersRef: React.MutableRefObject<THREE.Mesh[]>,
    occluderMeshes: React.MutableRefObject<THREE.Mesh[]>
}) => {
    const { scene } = useGLTF('/assets/3d/s05/s05_sculpture1.gltf');
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        const meshes: THREE.Mesh[] = [];
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshes.push(child);
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#ffffff',
                    metalness: 0.1,
                    roughness: 0.8,
                    clearcoat: 0.2,
                    reflectivity: 0.5,
                    envMapIntensity: 2.0,
                    side: THREE.DoubleSide
                });
            }
        });
        collidersRef.current = meshes;
        // Expose to ImageGallery as Html occluders
        occluderMeshes.current = meshes;
    }, [scene, collidersRef, occluderMeshes]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Center>
                    <primitive object={scene} scale={2.5} />
                </Center>
            </Float>
        </group>
    );
};

const LoadingSection05 = () => (
    <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-mono text-xs tracking-widest uppercase">
        Loading Section 05...
    </div>
);

const Section05Experience: React.FC = () => {
    const sculptureColliders = useRef<THREE.Mesh[]>([]);
    const sculptureOccluderMeshes = useRef<THREE.Mesh[]>([]);
    const galleryColliders = useRef<THREE.Mesh[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [hoveredPlaneIdx, setHoveredPlaneIdx] = useState<number | null>(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none">
            <Canvas
                shadows={!isMobile}
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                dpr={isMobile ? [1, 1] : [1, 1.5]}
                style={{ pointerEvents: 'auto' }}
            >
                <color attach="background" args={['#040404']} />
                <fog attach="fog" args={['#040404', 15, 55]} />
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />

                <Suspense fallback={null}>
                    <NebulaBackground count={40} />
                    <GlowingOrbs count={25} />
                    <AmbientDust count={150} />

                    <OrbitingParticles count={300} colliders={[sculptureColliders, galleryColliders]} hoveredPlaneIdx={hoveredPlaneIdx} />
                    {/* Sculpture renders first so its meshes are populated before ImageGallery uses them as occluders */}
                    <Sculpture collidersRef={sculptureColliders} occluderMeshes={sculptureOccluderMeshes} />
                    <ImageGallery onSelect={setSelectedIdx} onHover={setHoveredPlaneIdx} collidersRef={galleryColliders} occluderMeshes={sculptureOccluderMeshes} />

                    <Environment files="/assets/3d/s05/moon_lab_1k.hdr" />

                    {!isMobile && (
                        <ContactShadows
                            position={[0, -7, 0]}
                            opacity={0.6}
                            scale={20}
                            blur={2}
                            far={10}
                        />
                    )}

                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={30} castShadow />
                    <pointLight position={[0, -10, 0]} intensity={20} color="#ffffff" />
                    <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#444444" />
                    <ambientLight intensity={0.15} />
                </Suspense>
            </Canvas>

            {/* Popup Overlay removed as per user request to disable click actions */}
        </div>
    );
};

useGLTF.preload('/assets/3d/s05/s05_sculpture1.gltf');

export default Section05Experience;
