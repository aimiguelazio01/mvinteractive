import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { TRANSLATIONS } from '../data/translations';
import HandTracker from './HandTracker';

const GRID_W = 35;
const GRID_H = 50;
const SPACING = 4.0;
const BASE_HEIGHT = 0.12;
const MAX_HEIGHT = 10.0;
const INFLUENCE_RADIUS = 15.0;
const INFLUENCE_RADIUS_SQ = INFLUENCE_RADIUS * INFLUENCE_RADIUS;
const LERP_SPEED = 0.07;

// Central physics area - now ~375 bodies (ultra-optimized)
const PHYS_W = 15;
const PHYS_H = 25;

// Pre-initialize column data at module level
const columnData: { x: number; z: number; currentH: number; baseH: number; color: THREE.Color }[] = (() => {
    const cols: { x: number; z: number; currentH: number; baseH: number; color: THREE.Color }[] = [];
    const offsetX = ((GRID_W - 1) * SPACING) / 2;
    const offsetZ = ((GRID_H - 1) * SPACING) / 2;
    const grayColor = new THREE.Color(0.5, 0.5, 0.5);
    for (let z = 0; z < GRID_H; z++) {
        for (let x = 0; x < GRID_W; x++) {
            const baseH = BASE_HEIGHT + Math.random() * 0.2;
            cols.push({
                x: x * SPACING - offsetX,
                z: z * SPACING - offsetZ,
                currentH: baseH,
                baseH,
                color: grayColor,
            });
        }
    }
    return cols;
})();

// ... (pre-initialized columnData) ...

const MouseAttractor = ({ worldPos, isPinching }: { worldPos: THREE.Vector3, isPinching?: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.copy(worldPos);
            meshRef.current.position.y = 8;
            const s = isPinching ? 1.5 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
        }
        if (ringRef.current) {
            ringRef.current.position.copy(worldPos);
            ringRef.current.position.y = 0.1;
            ringRef.current.rotation.z += 0.02;
            const s = isPinching ? 2.5 : 1.8;
            ringRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
        }
        if (lightRef.current) {
            lightRef.current.position.copy(worldPos);
            lightRef.current.position.y = 10;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color="#68F2EB" transparent opacity={0.6} />
            </mesh>
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[INFLUENCE_RADIUS * 0.8, INFLUENCE_RADIUS * 0.82, 64]} />
                <meshBasicMaterial color="#68F2EB" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <pointLight ref={lightRef} intensity={5} distance={20} color="#68F2EB" />
        </group>
    );
};

const ColumnGrid = ({ handPos, handTrackingActive }: { handPos: any, handTrackingActive: boolean }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { camera, gl } = useThree();
    const count = GRID_W * GRID_H;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);
    const lowColor = useMemo(() => new THREE.Color(0.85, 0.85, 0.95), []); // Slightly cooler white
    const highColor = useMemo(() => new THREE.Color(1.0, 0.3, 0.3), []);
    const mouse2D = useMemo(() => new THREE.Vector2(9999, 9999), []);
    const mouseWorld = useMemo(() => new THREE.Vector3(9999, 0, 9999), []);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

    useEffect(() => {
        const canvas = gl.domElement;
        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        };
        canvas.addEventListener('mousemove', onMove);
        return () => canvas.removeEventListener('mousemove', onMove);
    }, [gl, mouse2D]);

    useFrame(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        if (handTrackingActive && handPos) {
            mouse2D.set(handPos.x, handPos.y);
        }

        raycaster.setFromCamera(mouse2D, camera);
        const hit = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, hit);
        if (hit) mouseWorld.copy(hit);

        let needsMatrixUpdate = false;

        for (let i = 0; i < count; i++) {
            const col = columnData[i];
            const dx = col.x - mouseWorld.x;
            const dz = col.z - mouseWorld.z;
            const distSq = dx * dx + dz * dz;

            // Optimization: Skip calculations for columns far away and already flat
            if (distSq > INFLUENCE_RADIUS_SQ * 4 && Math.abs(col.currentH - col.baseH) < 0.01) continue;

            const dist = Math.sqrt(distSq);
            const falloff = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
            const eased = falloff * falloff * (3 - 2 * falloff);
            const targetH = col.baseH + eased * (MAX_HEIGHT - col.baseH);
            
            const diff = targetH - col.currentH;
            if (Math.abs(diff) < 0.001 && distSq > INFLUENCE_RADIUS_SQ * 2) continue;

            col.currentH += diff * LERP_SPEED;
            needsMatrixUpdate = true;

            dummy.position.set(col.x, col.currentH / 2, col.z);
            dummy.scale.set(1.8, col.currentH, 1.8); // Thicker for larger spacing (4.0)
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);

            const heightRatio = Math.max(0, Math.min(1, (col.currentH - BASE_HEIGHT) / (MAX_HEIGHT - BASE_HEIGHT)));
            tempColor.lerpColors(lowColor, highColor, heightRatio);
            mesh.setColorAt(i, tempColor);
        }

        if (needsMatrixUpdate) {
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }
    });

    const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

    useEffect(() => {
        const mat = matRef.current;
        if (!mat) return;
        mat.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                #ifdef USE_INSTANCING_COLOR
                    float emissiveStrength = smoothstep(0.6, 1.0, vColor.r) * (1.0 - vColor.g * 0.8);
                    totalEmissiveRadiance += vColor * emissiveStrength * 1.2;
                #endif`
            );
        };
        mat.needsUpdate = true;
    }, []);

    return (
        <>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhysicalMaterial
                    ref={matRef}
                    color="#d9dce3"
                    emissive="#000000"
                    emissiveIntensity={1.0}
                    roughness={0.15}
                    metalness={0.95}
                    clearcoat={0.3}
                    clearcoatRoughness={0.1}
                    reflectivity={1.0}
                    envMapIntensity={2.0}
                />
            </instancedMesh>
            {handTrackingActive && <MouseAttractor worldPos={mouseWorld} isPinching={handPos?.isPinching} />}
        </>
    );
};

const PhysicsColumns = () => {
    const bodyRefs = useRef<(RapierRigidBody | null)[]>([]);
    const lastHeights = useRef<Float32Array | null>(null);

    const physIndices = useMemo(() => {
        const indices: number[] = [];
        const startX = Math.floor((GRID_W - PHYS_W) / 2);
        const startZ = Math.floor((GRID_H - PHYS_H) / 2);
        for (let z = 0; z < PHYS_H; z++) {
            for (let x = 0; x < PHYS_W; x++) {
                indices.push((startZ + z) * GRID_W + (startX + x));
            }
        }
        return indices;
    }, []);

    if (!lastHeights.current) {
        lastHeights.current = new Float32Array(physIndices.length).fill(-1);
    }

    useFrame(() => {
        const hArr = lastHeights.current!;
        for (let i = 0; i < physIndices.length; i++) {
            const body = bodyRefs.current[i];
            if (!body) continue;
            const col = columnData[physIndices[i]];
            if (!col) continue;

            // PERFORMANCE: Only update physics if there's a significant height change
            const diff = Math.abs(col.currentH - hArr[i]);
            if (diff < 0.05) continue;

            const halfH = Math.max(col.currentH / 2, 0.06);
            body.setNextKinematicTranslation({ x: col.x, y: halfH, z: col.z });
            const collider = body.collider(0);
            if (collider) collider.setHalfExtents({ x: 0.9, y: halfH, z: 0.9 });
            hArr[i] = col.currentH;
        }
    });

    return (
        <>
            {physIndices.map((gi, i) => {
                const col = columnData[gi];
                if (!col) return null;
                const initHalfH = Math.max(col.baseH / 2, 0.06);
                return (
                    <RigidBody
                        key={i} ref={(r) => { bodyRefs.current[i] = r; }}
                        type="kinematicPosition" position={[col.x, initHalfH, col.z]}
                        colliders={false}
                    >
                        <CuboidCollider args={[0.9, initHalfH, 0.9]} restitution={1.5} />
                    </RigidBody>
                );
            })}
        </>
    );
};

const FallingSphere = ({ id, color, position, onRemove }: { id: number; color: THREE.Color; position: [number, number, number]; onRemove: (id: number, reason: 'oob') => void }) => {
    const bodyRef = useRef<RapierRigidBody>(null);

    useFrame(() => {
        const body = bodyRef.current;
        if (!body) return;
        const pos = body.translation();
        
        const minX = -45;
        const maxX = 45;
        const minZ = -55;
        const maxZ = 20;
        
        if (pos.x < minX || pos.x > maxX || pos.z < minZ || pos.z > maxZ) {
            onRemove(id, 'oob');
            return;
        }
        
        if (pos.y < -10) {
            body.setTranslation({ x: position[0], y: 25, z: position[2] }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
    });

    useFrame(() => {
        const body = bodyRef.current;
        if (!body) return;
        const vel = body.linvel();
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        const MAX_SPEED = 15;
        if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            body.setLinvel({ x: vel.x * scale, y: vel.y * scale, z: vel.z * scale }, true);
        }
    });

    return (
        <RigidBody
            ref={bodyRef}
            name={`sphere-${id}`}
            colliders="ball"
            restitution={1.5}
            friction={0}
            position={position}
            mass={100}
            linearDamping={0}
            angularDamping={0}
        >
            <mesh castShadow>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshPhysicalMaterial
                    color={color}
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={1.0}
                    clearcoatRoughness={0.1}
                    envMapIntensity={1.5}
                />
            </mesh>
        </RigidBody>
    );
};

const SphereSpawner = () => {
    const [spheres, setSpheres] = useState<{ id: number; color: THREE.Color; position: [number, number, number] }[]>([{
        id: 0,
        color: new THREE.Color('#ff0000'),
        position: [0, 20, 5]
    }]);

    const nextId = useRef(1);
    const plasticColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#9900ff', '#00ff66', '#0066ff', '#ff0066', '#ffffff', '#ff1493'];

    const handleRemove = React.useCallback((id: number, reason: 'oob') => {
        setSpheres(prev => prev.filter(s => s.id !== id));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpheres(prev => {
                if (prev.length >= 5) return prev; // Limit to 5 spheres total
                const randomX = (Math.random() - 0.5) * 60;
                const randomZ = -35 + Math.random() * 40;
                return [...prev, {
                    id: nextId.current++,
                    color: new THREE.Color(plasticColors[Math.floor(Math.random() * plasticColors.length)]),
                    position: [randomX, 20, randomZ] as [number, number, number]
                }];
            });
        }, 6500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {spheres.map(s => (
                <FallingSphere key={s.id} id={s.id} color={s.color} position={s.position} onRemove={handleRemove} />
            ))}
        </>
    );
};

const DynamicBounds = () => {
    const { camera } = useThree();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const leftRef = useRef<RapierRigidBody>(null);
    const rightRef = useRef<RapierRigidBody>(null);
    const backRef = useRef<RapierRigidBody>(null);
    const frontRef = useRef<RapierRigidBody>(null);

    useFrame(() => {
        const measurePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10);
        raycaster.setFromCamera(new THREE.Vector2(-0.99, 0), camera);
        const hitLeft = new THREE.Vector3();
        raycaster.ray.intersectPlane(measurePlane, hitLeft);
        raycaster.setFromCamera(new THREE.Vector2(0.99, 0), camera);
        const hitRight = new THREE.Vector3();
        raycaster.ray.intersectPlane(measurePlane, hitRight);

        const minZ = -50;
        const maxZ = 15;
        const centerZ = (minZ + maxZ) / 2;
        let minX = hitLeft && hitLeft.x ? hitLeft.x : -30;
        let maxX = hitRight && hitRight.x ? hitRight.x : 30;
        minX *= 1.5;
        maxX *= 1.5;
        const wallH = 20;

        if (leftRef.current) leftRef.current.setNextKinematicTranslation({ x: minX, y: wallH / 2, z: centerZ });
        if (rightRef.current) rightRef.current.setNextKinematicTranslation({ x: maxX, y: wallH / 2, z: centerZ });
        if (backRef.current) backRef.current.setNextKinematicTranslation({ x: 0, y: wallH / 2, z: minZ });
        if (frontRef.current) frontRef.current.setNextKinematicTranslation({ x: 0, y: wallH / 2, z: maxZ });
    });

    return (
        <>
            <RigidBody ref={leftRef} type="kinematicPosition" position={[-35, 10, 0]} colliders={false}><CuboidCollider args={[1, 20, 60]} /></RigidBody>
            <RigidBody ref={rightRef} type="kinematicPosition" position={[35, 10, 0]} colliders={false}><CuboidCollider args={[1, 20, 60]} /></RigidBody>
            <RigidBody ref={backRef} type="kinematicPosition" position={[0, 10, -50]} colliders={false}><CuboidCollider args={[40, 20, 1]} /></RigidBody>
            <RigidBody ref={frontRef} type="kinematicPosition" position={[0, 10, 15]} colliders={false}><CuboidCollider args={[40, 20, 1]} /></RigidBody>
        </>
    );
};

const Section04Experience: React.FC<{ lang?: 'EN' | 'PT' }> = ({ lang = 'EN' }) => {
    const [handTrackingActive, setHandTrackingActive] = useState(false);
    const [handPos, setHandPos] = useState<{ x: number; y: number; isPinching?: boolean } | null>(null);
    const [mediapipeStatus, setMediapipeStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [mediapipeProgress, setMediapipeProgress] = useState(0);
    const [handDetected, setHandDetected] = useState(false);

    const handleMediapipeStatus = (status: 'idle' | 'loading' | 'ready' | 'error', detected: boolean, progress: number) => {
        setMediapipeStatus(status);
        setHandDetected(detected);
        setMediapipeProgress(progress);
    };

    const toggleHandTracking = () => {
        setHandTrackingActive(v => {
            const next = !v;
            if (!next) {
                setHandPos(null);
                setMediapipeStatus('idle');
                setMediapipeProgress(0);
            }
            return next;
        });
    };

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none" style={{ background: '#040404' }}>
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
                                        cx="64" cy="64" r="62" fill="none" stroke="#68F2EB" strokeWidth="2" 
                                        strokeDasharray="390"
                                        animate={{ strokeDashoffset: 390 * (1 - mediapipeProgress / 100) }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-mono text-white font-light">{mediapipeProgress}%</span>
                                    <span className="text-[9px] font-mono text-[#68F2EB] tracking-[0.3em] uppercase mt-1">Ready</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-[11px] font-mono tracking-[0.5em] uppercase text-white font-bold animate-pulse">
                                        {lang === 'EN' ? 'Initializing AI Engine' : 'A Iniciar Motor IA'}
                                    </h3>
                                    <div className="w-8 h-[1px] bg-[#68F2EB] mx-auto" />
                                </div>
                                <p className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase leading-relaxed">
                                    {lang === 'EN' 
                                        ? 'Simulating physical forces and vision tasks for pillar interaction' 
                                        : 'A simular forças físicas e tarefas de visão para interação com pilares'}
                                </p>
                            </div>

                            <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#68F2EB]"
                                    animate={{ width: `${mediapipeProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>

                        <div className="absolute bottom-16 flex flex-col items-center gap-3">
                            <span className="text-[9px] font-mono tracking-[0.4em] text-white/20 uppercase">Powered by MediaPipe</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[3005] pointer-events-auto flex flex-col items-center gap-4 w-full px-4">
                <AnimatePresence>
                    {handTrackingActive && mediapipeStatus === 'ready' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex flex-col items-center gap-2 mb-2"
                        >
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${handDetected ? 'animate-pulse' : 'text-white/40'}`}>
                                    <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                                </svg>
                                <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white font-bold whitespace-nowrap">
                                    {handDetected ? (lang === 'EN' ? 'Move hand to attract • Pinch to repel' : 'Mova a mão para atrair • Aperte para repelir') : (lang === 'EN' ? 'Setup Complete • Show hand to track' : 'Configuração Concluída • Mostre a mão')}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleHandTracking}
                    className={`group relative flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 cursor-pointer
                        ${handTrackingActive ? 'bg-[#68F2EB]/15 border-[#68F2EB]/60 shadow-[0_0_30px_rgba(104,242,235,0.3)]' : 'bg-black/80 border-white/20 hover:border-[#68F2EB]/40 hover:bg-[#68F2EB]/10'}
                        backdrop-blur-md`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-5 h-5 transition-all duration-300 ${handTrackingActive ? 'text-[#68F2EB] animate-pulse' : 'text-white/60 group-hover:text-[#68F2EB]'}`}
                    >
                        <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    <span className={`text-xs uppercase font-mono tracking-[0.2em] transition-colors duration-300 ${handTrackingActive ? 'text-[#68F2EB]' : 'text-white/70 group-hover:text-[#68F2EB]'}`}>
                        {handTrackingActive ? (lang === 'PT' ? 'Sair da Experiência' : 'Exit Experience') : (lang === 'PT' ? 'Entrar na Experiência' : 'Enter Experience')}
                    </span>
                    {handTrackingActive && <span className="absolute inset-0 rounded-full border border-[#68F2EB]/40 animate-ping" />}
                </button>
                
                {!handTrackingActive && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase mt-2 hidden md:block"
                    >
                        {lang === 'EN' ? 'Uses MediaPipe AI Hand Tracking' : 'Usa Rastreamento de Mãos MediaPipe IA'}
                    </motion.p>
                )}
            </div>

        <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} dpr={[1, 1.5]} camera={{ position: [0, 22, 34], fov: 48, near: 0.1, far: 500 }} style={{ pointerEvents: 'auto' }}>
            <fog attach="fog" args={['#040404', 80, 200]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 35, 10]} intensity={3.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
            <pointLight position={[0, 25, 0]} intensity={8} color="#40e0d0" />
            <pointLight position={[-22, 10, -22]} intensity={5} color="#4488ff" />
            <pointLight position={[22, 10, -22]} intensity={5} color="#ffcc33" />
            <Grid position={[0, 0, 0]} args={[200, 200]} cellSize={SPACING} cellThickness={0.5} cellColor="#2a3a5a" sectionSize={SPACING * 5} sectionThickness={1.0} sectionColor="#3a5080" fadeDistance={90} infiniteGrid />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[300, 300]} />
                <meshPhysicalMaterial color="#000000" roughness={0.0} metalness={1.0} reflectivity={1.0} envMapIntensity={2.0} />
            </mesh>
            <Physics gravity={[0, -30, 0]}>
                <SphereSpawner />
                <PhysicsColumns />
                <CuboidCollider args={[150, 0.5, 150]} position={[0, -0.5, 0]} restitution={1.5} />
                <DynamicBounds />
            </Physics>
            <ColumnGrid handPos={handPos} handTrackingActive={handTrackingActive} />
        </Canvas>
        <HandTracker onHandMove={setHandPos} active={handTrackingActive} onStatusChange={handleMediapipeStatus} />
    </div>
    );
};

export default Section04Experience;
