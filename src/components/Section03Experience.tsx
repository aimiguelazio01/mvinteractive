import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, Environment, Float, ContactShadows } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody, BallCollider, MeshCollider } from '@react-three/rapier';
import * as THREE from 'three';
import gsap from 'gsap';

const Model = ({ rotation, onWinTrigger, useCylinder = false }: { rotation: THREE.Euler, onWinTrigger: () => void, useCylinder?: boolean }) => {
    const { scene: pathNormal } = useGLTF('/assets/3d/s03/path.gltf');
    const { scene: triggerNormal } = useGLTF('/assets/3d/s03/trigger.gltf');
    const { scene: pathCyl } = useGLTF('/assets/3d/s03/pathcyl.gltf');
    const { scene: triggerCyl } = useGLTF('/assets/3d/s03/triggercyl.gltf');

    const pathScene = useCylinder ? pathCyl : pathNormal;
    const triggerScene = useCylinder ? triggerCyl : triggerNormal;

    const rbRef = useRef<RapierRigidBody>(null);
    const rbSensorRef = useRef<RapierRigidBody>(null);

    // Ensure shadows are enabled on all models and set aluminum shader
    React.useMemo(() => {
        [pathNormal, triggerNormal, pathCyl, triggerCyl].forEach(s => {
            s.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material instanceof THREE.Material) {
                        const oldMaterial = child.material as THREE.MeshStandardMaterial;
                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(0.85, 0.87, 0.9),
                            roughness: 0.15,
                            metalness: 0.95,
                            transparent: oldMaterial.transparent,
                            opacity: oldMaterial.opacity,
                        });
                        child.material = newMaterial;
                    }
                }
            });
        });
    }, [pathNormal, triggerNormal, pathCyl, triggerCyl]);

    // Calculate sensor bounds for a fallback/secondary trigger area
    const sensorInfo = useMemo(() => {
        triggerScene.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(triggerScene);
        if (box.isEmpty()) return null;

        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        return {
            args: [size.x / 2, size.y / 2, size.z / 2] as [number, number, number],
            position: [center.x, center.y, center.z] as [number, number, number]
        };
    }, [triggerScene]);



    const currentRotation = useRef(new THREE.Euler(0, 0, 0));

    // Sync physics rotation with the controlled rotation using smoothing
    useFrame(() => {
        // Smoothly interpolate towards target rotation to prevent "kicking" the ball
        currentRotation.current.x = THREE.MathUtils.lerp(currentRotation.current.x, rotation.x, 0.1);
        currentRotation.current.y = THREE.MathUtils.lerp(currentRotation.current.y, rotation.y, 0.1);
        currentRotation.current.z = THREE.MathUtils.lerp(currentRotation.current.z, rotation.z, 0.1);

        const targetQuat = new THREE.Quaternion().setFromEuler(currentRotation.current);

        // Sync both the path and the sensor
        if (rbRef.current) {
            rbRef.current.setNextKinematicRotation(targetQuat);
            rbRef.current.setNextKinematicTranslation({ x: 0, y: 0, z: 0 });
        }
        if (rbSensorRef.current) {
            rbSensorRef.current.setNextKinematicRotation(targetQuat);
            rbSensorRef.current.setNextKinematicTranslation({ x: 0, y: 0, z: 0 });
        }
    });

    return (
        <group>
            {/* The Solid Path - uses auto-trimesh for the pathScene */}
            <RigidBody ref={rbRef} type="kinematicPosition" colliders="trimesh" restitution={0} friction={1}>
                <primitive object={pathScene} />
            </RigidBody>

            {/* The Trigger Sensor - separate body rotated in sync */}
            <RigidBody
                ref={rbSensorRef}
                type="kinematicPosition"
                colliders={false}
                onIntersectionEnter={({ other }) => {
                    if (other.rigidBodyObject?.name === 'ball') {
                        onWinTrigger();
                    }
                }}
            >
                <primitive object={triggerScene} visible={false} />
                {sensorInfo && (
                    <CuboidCollider
                        args={sensorInfo.args}
                        position={sensorInfo.position}
                        sensor
                    />
                )}
            </RigidBody>
        </group>
    );
};

const FallingBall = ({ onRemove, position, color }: { onRemove: () => void; position: [number, number, number]; color: THREE.Color }) => {
    const rbRef = useRef<RapierRigidBody>(null);


    // Trigger removal if ball falls too low
    useFrame(() => {
        if (rbRef.current) {
            const pos = rbRef.current.translation();
            if (pos.y < -6) {
                onRemove();
            }
        }
    });

    return (
        <RigidBody
            ref={rbRef}
            name="ball"
            colliders={false}
            position={position}
            friction={1}
            mass={10}
            linearDamping={0.5}
            angularDamping={0.5}
            ccd={true}
        >
            <BallCollider args={[0.3]} restitution={0} friction={1} />
            <mesh castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
            </mesh>
        </RigidBody>
    );
};

const ControlOverlay = ({ onRotationChange }: { onRotationChange: (rot: THREE.Euler) => void }) => {
    const { gl } = useThree();
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });
    const rotation = useRef(new THREE.Euler(0, 0, 0));

    useEffect(() => {
        const handleDown = (e: MouseEvent) => {
            if (e.button === 0) { // Left click only
                isDragging.current = true;
                lastMouse.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMove = (e: MouseEvent) => {
            if (!isDragging.current) return;

            const deltaX = e.clientX - lastMouse.current.x;
            const deltaY = e.clientY - lastMouse.current.y;

            // Update rotation based on mouse delta
            rotation.current.z += -deltaX * 0.01; // Left/Right -> Z (tilt)
            rotation.current.x += deltaY * 0.01;  // Up/Down -> X

            onRotationChange(rotation.current.clone());
            lastMouse.current = { x: e.clientX, y: e.clientY };
        };

        const handleUp = () => {
            isDragging.current = false;
        };

        const canvas = gl.domElement;
        canvas.addEventListener('mousedown', handleDown);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);

        return () => {
            canvas.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [gl, onRotationChange]);

    return null;
};

const BackgroundPlanes = () => {
    const meshes = useRef<THREE.Mesh[]>([]);

    const planes = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                -Math.random() * 15 - 10 // Placed behind the path.gltf
            ],
            scale: Math.random() * 5 + 2,
            color: new THREE.Color().setHSL(Math.random(), 0.4, 0.5)
        }));
    }, []);

    useFrame((state) => {
        meshes.current.forEach((mesh) => {
            if (mesh) {
                mesh.lookAt(state.camera.position);
            }
        });
    });

    return (
        <group>
            {planes.map((p, i) => (
                <Float key={i} speed={0.5 + Math.random()} rotationIntensity={0} floatIntensity={1}>
                    <mesh
                        ref={(el) => { if (el) meshes.current[i] = el; }}
                        position={p.position as any}
                        scale={p.scale}
                    >
                        <planeGeometry args={[1, 1]} />
                        <meshStandardMaterial
                            color={p.color}
                            transparent
                            opacity={0.15}
                            side={THREE.DoubleSide}
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const MouseTrail = ({ color }: { color: THREE.Color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleArray = useRef<any[]>([]);
    const numberOfParticles = 100;
    const mouse = useRef({ x: 0, y: 0, active: false });
    const colorStr = useRef(`rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.8)`);

    useEffect(() => {
        colorStr.current = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.8)`;
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            x: number;
            y: number;
            size: number;
            weight: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 2;
                this.weight = Math.random() * 2 - 0.5;
            }

            update() {
                this.size -= 0.05;
                if (this.size < 0) {
                    this.x = mouse.current.x + (Math.random() * 20 - 10);
                    this.y = mouse.current.y + (Math.random() * 20 - 10);
                    this.size = Math.random() * 5 + 5;
                    this.weight = Math.random() * 2 - 0.5;
                }
                this.y += this.weight;
                this.weight += 0.05;

                if (this.y > canvas!.height - this.size) {
                    this.weight *= -0.4;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = colorStr.current;
                ctx.fill();
            }
        }

        const init = () => {
            particleArray.current = [];
            const startX = mouse.current.active ? mouse.current.x : window.innerWidth / 2;
            const startY = mouse.current.active ? mouse.current.y : window.innerHeight / 2;
            for (let i = 0; i < numberOfParticles; i++) {
                particleArray.current.push(new Particle(startX, startY));
            }
        };

        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particleArray.current.length; a++) {
                for (let b = a; b < particleArray.current.length; b++) {
                    let distance =
                        (particleArray.current[a].x - particleArray.current[b].x) * (particleArray.current[a].x - particleArray.current[b].x) +
                        (particleArray.current[a].y - particleArray.current[b].y) * (particleArray.current[a].y - particleArray.current[b].y);
                    if (distance < 2800) {
                        opacityValue = 1 - distance / 2800;
                        const baseColor = colorStr.current.replace('0.8', (opacityValue * 0.5).toString());
                        ctx.strokeStyle = baseColor;
                        ctx.beginPath();
                        ctx.lineWidth = 1;
                        ctx.moveTo(particleArray.current[a].x, particleArray.current[a].y);
                        ctx.lineTo(particleArray.current[b].x, particleArray.current[b].y);
                        ctx.stroke();
                    }
                }
            }
        };


        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particleArray.current.length; i++) {
                particleArray.current[i].update();
                // particleArray.current[i].draw(); // Keeping it mostly line-based for the requested effect
            }
            connect();
            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.active = true;
        };

        init();
        animate();

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    );
};


const Section03Experience: React.FC = () => {
    const [modelRotation, setModelRotation] = useState(new THREE.Euler(0, 0, 0));
    const [ballKey, setBallKey] = useState(0);
    const [useCylinder, setUseCylinder] = useState(true);

    const ballColor = useMemo(() => {
        return new THREE.Color(0.15, 0.15, 0.15);
    }, []);



    // Load spawn points from GLTF
    const { scene: posScene } = useGLTF('/assets/3d/s03/spherepos.gltf');

    const spawnPoints = useMemo(() => {
        const p1 = posScene.getObjectByName('spherepos1');
        const p2 = posScene.getObjectByName('spherepos2');

        const points: [number, number, number][] = [];
        const box = new THREE.Box3();
        const center = new THREE.Vector3();

        if (p1) {
            box.setFromObject(p1);
            box.getCenter(center);
            points.push([center.x, center.y, center.z]);
        }
        if (p2) {
            box.setFromObject(p2);
            box.getCenter(center);
            points.push([center.x, center.y, center.z]);
        }

        // Fallback if objects not found
        if (points.length === 0) points.push([0, 3.5, 0]);
        return points;
    }, [posScene]);

    const currentSpawnPoint = useMemo(() => {
        return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    }, [spawnPoints, ballKey]);

    const [isRespawning, setIsRespawning] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const handleBallRemove = () => {
        if (hasWon) return; // Don't respawn if we already won

        // Start reset sequence
        setIsRespawning(true);
        setModelRotation(new THREE.Euler(0, 0, 0));

        // Delay the sphere generation to give the table time to reset
        setTimeout(() => {
            setBallKey(prev => prev + 1);
            setIsRespawning(false);
        }, 1500); // 1.5s delay for rotation reset
    };

    const handleWin = () => {
        setHasWon(true);
        setUseCylinder(prev => !prev);


        // Reset after a few seconds of glory
        setTimeout(() => {
            setIsRespawning(true);
            setHasWon(false);
            setModelRotation(new THREE.Euler(0, 0, 0));
            setTimeout(() => {
                setBallKey(prev => prev + 1);
                setIsRespawning(false);
            }, 1000);
        }, 4000);
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="absolute inset-0 z-[2500] pointer-events-none">
            <Canvas
                shadows
                camera={{ position: [0, 2, 5], fov: 45 }}
                style={{ pointerEvents: 'auto' }}
                gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 1.5]}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#040404']} />
                    <fog attach="fog" args={['#040404', 10, 50]} />
                    <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={35} />

                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#4488ff" />
                    <pointLight position={[10, 5, -5]} intensity={0.5} color="#ff8844" />

                    <Physics
                        debug={false}
                        gravity={[0, -9.81, 0]}
                    >
                        <Model key={`${ballKey}-${useCylinder}`} rotation={modelRotation} onWinTrigger={handleWin} useCylinder={useCylinder} />
                        {!isRespawning && (
                            <FallingBall key={ballKey} onRemove={handleBallRemove} position={currentSpawnPoint} color={ballColor} />
                        )}

                    </Physics>

                    <ControlOverlay key={ballKey} onRotationChange={setModelRotation} />

                    {!isMobile && (
                        <ContactShadows
                            position={[0, -4.9, 0]}
                            opacity={0.4}
                            scale={30}
                            blur={2.5}
                            far={10}
                        />
                    )}

                    <Environment preset="city" />

                    <BackgroundPlanes />

                    <OrbitControls
                        enableRotate={false} // Disable camera rotation to allow model rotation
                        enableZoom={true}
                        enablePan={true}
                        makeDefault
                    />
                </Suspense>
            </Canvas>


            {/* Gameplay Instructions */}
            {!hasWon && (
                <div className="absolute top-24 right-6 md:top-28 md:right-10 z-[3000] pointer-events-none max-w-[340px]">
                    <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg px-6 py-5 flex flex-col gap-5">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse" />
                            <span className="text-xs md:text-sm font-mono tracking-[0.3em] text-white/80 uppercase font-bold">
                                Objective
                            </span>
                        </div>
                        <p className="text-sm md:text-base font-sans text-white/50 leading-relaxed">
                            Guide the ball through the maze to the exit point by tilting the platform.
                        </p>

                        {/* Divider */}
                        <div className="w-full h-[1px] bg-white/10" />

                        {/* Controls */}
                        <div className="flex flex-col gap-4">
                            <span className="text-xs md:text-sm font-mono tracking-[0.3em] text-white/60 uppercase">
                                Controls
                            </span>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4">
                                    <kbd className="text-xs font-mono bg-white/10 border border-white/15 rounded px-3 py-1 text-white/70 min-w-[75px] text-center">L-Click</kbd>
                                    <span className="text-sm text-white/40">Tilt & Rotate</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <kbd className="text-xs font-mono bg-white/10 border border-white/15 rounded px-3 py-1 text-white/70 min-w-[75px] text-center">R-Click</kbd>
                                    <span className="text-sm text-white/40">Pan Camera</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <kbd className="text-xs font-mono bg-white/10 border border-white/15 rounded px-3 py-1 text-white/70 min-w-[75px] text-center">Scroll</kbd>
                                    <span className="text-sm text-white/40">Zoom In / Out</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Win Banner */}
            {hasWon && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[9999]">
                    {/* Full-screen flash */}
                    <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    
                    {/* Radial glow behind text */}
                    <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-white/10 via-transparent to-transparent blur-3xl animate-ping opacity-30" />
                    
                    {/* Main banner */}
                    <div className="relative flex flex-col items-center gap-6">
                        {/* Decorative line top */}
                        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        
                        {/* Main text */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] md:text-xs font-mono tracking-[0.6em] text-white/40 uppercase pl-[0.6em]">
                                Mission Complete
                            </span>
                            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                You Won
                            </h2>
                        </div>
                        
                        {/* Decorative line bottom */}
                        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        
                        {/* Subtitle */}
                        <span className="text-[9px] font-mono tracking-[0.4em] text-white/30 uppercase pl-[0.4em]">
                            Path cleared — switching track
                        </span>
                    </div>
                </div>
            )}



        </div>
    );
};

useGLTF.preload('/assets/3d/s03/path.gltf');
useGLTF.preload('/assets/3d/s03/trigger.gltf');
useGLTF.preload('/assets/3d/s03/pathcyl.gltf');
useGLTF.preload('/assets/3d/s03/triggercyl.gltf');

useGLTF.preload('/assets/3d/s03/spherepos.gltf');

export default Section03Experience;
