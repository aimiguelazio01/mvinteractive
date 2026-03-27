import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, Center, ContactShadows, Float, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { useLoader } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';

// Flowing nebula dust clouds
const NebulaBackground = ({ count = 20 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const clouds = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 25,
                -15 - Math.random() * 20
            ),
            scale: 4 + Math.random() * 6,
            speed: 0.03 + Math.random() * 0.04,
            rotSpeed: (Math.random() - 0.5) * 0.05
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        clouds.forEach((c, i) => {
            dummy.position.set(
                c.pos.x + Math.sin(time * c.speed + i) * 3,
                c.pos.y + Math.cos(time * c.speed * 0.7 + i) * 2,
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
            <meshBasicMaterial color="#2a1a4a" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
        </instancedMesh>
    );
};

// Distant glowing orbs for depth
const GlowingOrbs = ({ count = 12 }: { count?: number }) => {
    const groupRef = useRef<THREE.Group>(null);

    const orbs = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                -10 - Math.random() * 15
            ),
            scale: 0.15 + Math.random() * 0.3,
            color: Math.random() > 0.7 ? '#6644ff' : Math.random() > 0.5 ? '#4488ff' : '#ffffff',
            speed: 0.4 + Math.random() * 0.4,
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
                <sphereGeometry args={[1.5, 12, 12]} />
                    <meshBasicMaterial color={orb.color} transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
};

// Ambient floating particles
const AmbientDust = ({ count = 80 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 30
            ),
            speed: 0.15 + Math.random() * 0.2,
            phase: Math.random() * 100
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        particles.forEach((p, i) => {
            dummy.position.set(
                p.pos.x,
                p.pos.y + Math.sin(time * p.speed + p.phase) * 1.5,
                p.pos.z
            );
            dummy.scale.setScalar(0.025 + Math.sin(time + i) * 0.01);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </instancedMesh>
    );
};

const OrbitingParticles = ({ count = 80, colliders, hoveredPlaneIdx }: { count?: number, colliders?: React.MutableRefObject<THREE.Mesh[]>[], hoveredPlaneIdx?: number | null }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
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
            const theta = Math.random() * Math.PI * 2;
            const r = 2.5 + Math.random() * 2.5;
            const height = 8;
            const y = (Math.random() - 0.5) * height;

            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * r;

            velocities[i * 3] = (Math.random() - 0.5) * 0.05;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

            sizes[i] = 0.1 + Math.random() * 0.15;

            const gray = 0.3 + Math.random() * 0.5;
            colors[i * 3] = gray;
            colors[i * 3 + 1] = gray;
            colors[i * 3 + 2] = gray;
        }
        return { positions, velocities, sizes, colors };
    }, [count]);

    const vPos = useMemo(() => new THREE.Vector3(), []);
    const vVel = useMemo(() => new THREE.Vector3(), []);
    const vAcc = useMemo(() => new THREE.Vector3(), []);
    const vAttrack = useMemo(() => new THREE.Vector3(), []);
    const vCellPos = useMemo(() => new THREE.Vector3(), []);
    const vOther = useMemo(() => new THREE.Vector3(), []);
    const center = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    const cellWorldData = useMemo(() => [] as {
        pos: THREE.Vector3,
        quat: THREE.Quaternion,
        halfExtents: THREE.Vector3
    }[], []);

    const [initialized, setInitialized] = useState(false);

    useFrame((state_fiber, delta) => {
        if (!meshRef.current) return;
        const dt = Math.min(delta, 0.05);

        cellWorldData.length = 0;

        const allMeshes: THREE.Mesh[] = [];
        colliders?.forEach(ref => {
            if (ref.current) allMeshes.push(...ref.current);
        });

        if (allMeshes.length > 0) {
            allMeshes.forEach((m) => {
                const wc = new THREE.Vector3();
                const wq = new THREE.Quaternion();

                m.updateWorldMatrix(true, false);

                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                const box = m.geometry.boundingBox!;

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

            if (!initialized) {
                const color = new THREE.Color();
                for (let i = 0; i < count; i++) {
                    const cell = cellWorldData[i % cellWorldData.length];
                    const angle = Math.random() * Math.PI * 2;
                    const r = 2.0;
                    state.positions[i * 3] = cell.pos.x + Math.cos(angle) * r;
                    state.positions[i * 3 + 1] = cell.pos.y + (Math.random() - 0.5) * 4.0;
                    state.positions[i * 3 + 2] = cell.pos.z + Math.sin(angle) * r;

                    color.setRGB(state.colors[i * 3], state.colors[i * 3 + 1], state.colors[i * 3 + 2]);
                    meshRef.current.setColorAt(i, color);
                }
                if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
                setInitialized(true);
            }
        }

        const relPos = new THREE.Vector3();
        const localPos = new THREE.Vector3();
        const closestPoint = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            vPos.set(state.positions[i * 3], state.positions[i * 3 + 1], state.positions[i * 3 + 2]);
            vVel.set(state.velocities[i * 3], state.velocities[i * 3 + 1], state.velocities[i * 3 + 2]);
            vAcc.set(0, 0, 0);

            let nearestDistSq = Infinity;
            let nearestCellPos = center;

            cellWorldData.forEach((cell) => {
                const dSq = vPos.distanceToSquared(cell.pos);
                if (dSq < nearestDistSq) {
                    nearestDistSq = dSq;
                    nearestCellPos = cell.pos;
                }
            });

            vAttrack.subVectors(nearestCellPos, vPos).normalize();
            const dist = Math.sqrt(nearestDistSq);
            let pull = Math.min(dist * 0.5, 2.5);
            if (dist < 1.0) pull *= dist;
            vAcc.add(vAttrack.multiplyScalar(pull));

            // Skip self-repulsion and OBB collision for performance - just use simple bounding sphere
            const sculptureCount = colliders?.[0]?.current?.length || 0;
            if (hoveredPlaneIdx !== null && hoveredPlaneIdx !== undefined) {
                const hoveredWorldIdx = sculptureCount + hoveredPlaneIdx;
                if (sculptureCount > 0 && hoveredWorldIdx < cellWorldData.length) {
                    const hoveredCell = cellWorldData[hoveredWorldIdx];
                    if (hoveredCell) {
                        const toSculpture = hoveredCell.pos.clone().sub(vPos).normalize();
                        vAcc.add(toSculpture.multiplyScalar(25.0));
                    }
                }
            }

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

                    vAcc.add(pushDirWorld.multiplyScalar(overlap * 40.0));
                    vVel.multiplyScalar(0.5);
                }
            });

            // Self-repulsion between particles
            for (let j = 0; j < count; j++) {
                if (i === j) continue;
                vOther.set(state.positions[j * 3], state.positions[j * 3 + 1], state.positions[j * 3 + 2]);
                const d = vPos.distanceTo(vOther);
                const minDist = (state.sizes[i] + state.sizes[j]) * 1.2;
                if (d < minDist && d > 0.001) {
                    const push = vPos.clone().sub(vOther).normalize();
                    vAcc.add(push.multiplyScalar((minDist - d) * 3.0));
                }
            }

            const mouseX = (state_fiber.pointer.x * state_fiber.viewport.width) / 2;
            const mouseY = (state_fiber.pointer.y * state_fiber.viewport.height) / 2;
            const vMouse = vCellPos.set(mouseX, mouseY, 0);
            const distMouse = vPos.distanceTo(vMouse);
            const interactionRadius = 1.2;

            if (distMouse < interactionRadius) {
                const blowDir = vAttrack.subVectors(vPos, vMouse).normalize();
                const blowStrength = Math.pow(1.0 - distMouse / interactionRadius, 2) * 200.0;
                vAcc.add(blowDir.multiplyScalar(blowStrength));
            }

            vVel.add(vAcc.multiplyScalar(dt));
            vVel.multiplyScalar(0.88);
            if (vVel.length() > 8.0) vVel.setLength(8.0);

            vPos.add(vVel);

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
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshPhysicalMaterial
                    roughness={0.4}
                    metalness={0.9}
                    color="#88ccff"
                    envMap={envMap}
                    envMapIntensity={2.5}
                    clearcoat={0.5}
                    clearcoatRoughness={0.3}
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
                child.material = new THREE.MeshStandardMaterial({
                    color: '#ffffff',
                    metalness: 0.05,
                    roughness: 0.9,
                    side: THREE.DoubleSide
                });
            }
        });
        collidersRef.current = meshes;
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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none">
            <Canvas
                shadows={false}
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
                dpr={isMobile ? [1, 1] : [1, 1.25]}
                style={{ pointerEvents: 'auto' }}
            >
                <color attach="background" args={['#040404']} />
                <fog attach="fog" args={['#040404', 18, 50]} />
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />

                <Suspense fallback={null}>
                    <NebulaBackground count={15} />
                    <GlowingOrbs count={10} />
                    <AmbientDust count={50} />

                    <OrbitingParticles count={80} colliders={[sculptureColliders]} hoveredPlaneIdx={null} />
                    <Sculpture collidersRef={sculptureColliders} occluderMeshes={sculptureOccluderMeshes} />

                    <Environment files="/assets/3d/s05/moon_lab_1k.hdr" />

                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={15} />
                    <pointLight position={[0, -8, 0]} intensity={10} color="#ffffff" />
                    <hemisphereLight intensity={0.25} color="#ffffff" groundColor="#444444" />
                    <ambientLight intensity={0.1} />
                </Suspense>
            </Canvas>

            {/* Popup Overlay removed as per user request to disable click actions */}
        </div>
    );
};

useGLTF.preload('/assets/3d/s05/s05_sculpture1.gltf');

export default Section05Experience;
