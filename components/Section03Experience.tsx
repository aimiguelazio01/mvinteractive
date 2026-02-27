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

    // Ensure shadows are enabled on all models
    React.useMemo(() => {
        [pathNormal, triggerNormal, pathCyl, triggerCyl].forEach(s => {
            s.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
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
        return new THREE.Color().setHSL(Math.random(), 0.7, 0.6);
    }, [ballKey]);



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

            {/* Hint overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-800/40 font-mono text-[10px] tracking-[0.2em] pointer-events-none uppercase text-center">
                Left Click + Drag to Tilt and Rotate • Right Click to Pan • Scroll to Zoom
            </div>

            {/* Win Banner */}
            {hasWon && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-white/10 backdrop-blur-2xl border border-black/20 px-16 py-8 rounded-full overflow-hidden relative shadow-[0_0_50px_rgba(136,104,242,0.3)] min-w-[320px]">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
                        <div className="relative font-mono text-[10px] tracking-[0.8em] text-gray-800 uppercase font-black text-center whitespace-nowrap pl-[0.8em]">
                            Congratulations • You Won
                        </div>
                    </div>
                </div>
            )}

            <MouseTrail color={ballColor} />

        </div>
    );
};

useGLTF.preload('/assets/3d/s03/path.gltf');
useGLTF.preload('/assets/3d/s03/trigger.gltf');
useGLTF.preload('/assets/3d/s03/pathcyl.gltf');
useGLTF.preload('/assets/3d/s03/triggercyl.gltf');

useGLTF.preload('/assets/3d/s03/spherepos.gltf');

export default Section03Experience;
