// --- Three.js and Cannon.js Physics Scene ---
(function () {
    const container = document.getElementById('threejs-canvas');
    if (!container) return;

    // Global Interaction State (Exposed to window for other scripts)
    window.mouse = new THREE.Vector2();
    window.mouseActive = false;
    window.sphereBodies = [];
    window.appleMeshes = [];
    window.containerBounds = null;

    // Physics World
    let world;
    try {
        world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
    } catch (e) {
        console.error("Cannon error", e);
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x131313, 0.004);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.PointLight(0xff5539, 2, 50);
    fillLight.position.set(-15, 10, 10);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xb8cda8, 2, 50);
    accentLight.position.set(15, 5, -10);
    scene.add(accentLight);

    let loadedModel = null;

    // Global trigger for piano interaction
    window.triggerAppleImpulse = function () {
        if (window.sphereBodies.length > 0) {
            window.sphereBodies.forEach(body => {
                const strength = 3;
                const impulse = new CANNON.Vec3(
                    (Math.random() - 0.5) * strength * 0.3,
                    strength + Math.random() * strength,
                    (Math.random() - 0.5) * strength * 0.3
                );
                body.applyImpulse(impulse, body.position);
            });
        }
    };

    // Apple GLTF model paths
    const appleModelPaths = [
        './3d_assets/apple_01/gltf/low/tefcefala_tier_3.gltf',
        './3d_assets/apple_02/gltf/low/td3nedtla_tier_3.gltf',
        './3d_assets/apple_03/gltf/low/tgzoahbpa_tier_3.gltf'
    ];
    const loadedAppleModels = [];

    // Load GLTF Models
    const loader = new THREE.GLTFLoader();
    loader.load(
        './3d_assets/web_apples_container_tall_cap.gltf',
        function (gltf) {
            try {
                loadedModel = gltf.scene;
                loadedModel.rotation.y = 0;
                loadedModel.updateMatrixWorld(true);

                const box = new THREE.Box3().setFromObject(loadedModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 25 / maxDim;
                loadedModel.scale.set(scale * 1.5, scale, scale * 1.5);

                loadedModel.position.x = -center.x * scale;
                loadedModel.position.y = -center.y * scale + 13;
                loadedModel.position.z = -center.z * scale;

                scene.add(loadedModel);
                loadedModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = new THREE.MeshPhysicalMaterial({
                            transparent: true,
                            opacity: 0,
                            transmission: 0,
                            thickness: 0
                        });
                    }
                });
                loadedModel.updateMatrixWorld(true);

                const staticBody = new CANNON.Body({ mass: 0 });
                loadedModel.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        const geometry = child.geometry.clone();
                        geometry.applyMatrix4(child.matrixWorld);
                        const vertices = Array.from(geometry.attributes.position.array);
                        let indices = [];
                        if (geometry.index) {
                            indices = Array.from(geometry.index.array);
                        } else {
                            for (let i = 0; i < vertices.length / 3; i++) indices.push(i);
                        }
                        const trimesh = new CANNON.Trimesh(vertices, indices);
                        staticBody.addShape(trimesh);
                    }
                });
                world.addBody(staticBody);

                const newBox = new THREE.Box3().setFromObject(loadedModel);
                const newSize = newBox.getSize(new THREE.Vector3());
                const newCenter = newBox.getCenter(new THREE.Vector3());

                window.containerBounds = {
                    min: newBox.min.clone(),
                    max: newBox.max.clone(),
                    center: newCenter.clone(),
                    size: newSize.clone()
                };

                // Boundary Walls
                const wallMargin = 0.5;
                const wallMaterial = new CANNON.Material();

                const floor = new CANNON.Body({ mass: 0, material: wallMaterial });
                floor.addShape(new CANNON.Plane());
                floor.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
                floor.position.set(0, newBox.min.y, 0);
                world.addBody(floor);

                const ceiling = new CANNON.Body({ mass: 0, material: wallMaterial });
                ceiling.addShape(new CANNON.Plane());
                ceiling.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
                ceiling.position.set(0, newBox.max.y + wallMargin * 3, 0);
                world.addBody(ceiling);

                const leftWall = new CANNON.Body({ mass: 0, material: wallMaterial });
                leftWall.addShape(new CANNON.Plane());
                leftWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
                leftWall.position.set(newBox.min.x - wallMargin, 0, 0);
                world.addBody(leftWall);

                const rightWall = new CANNON.Body({ mass: 0, material: wallMaterial });
                rightWall.addShape(new CANNON.Plane());
                rightWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
                rightWall.position.set(newBox.max.x + wallMargin, 0, 0);
                world.addBody(rightWall);

                const backWall = new CANNON.Body({ mass: 0, material: wallMaterial });
                backWall.addShape(new CANNON.Plane());
                backWall.position.set(0, 0, newBox.min.z - wallMargin);
                world.addBody(backWall);

                const frontWall = new CANNON.Body({ mass: 0, material: wallMaterial });
                frontWall.addShape(new CANNON.Plane());
                frontWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
                frontWall.position.set(0, 0, newBox.max.z + wallMargin);
                world.addBody(frontWall);

                const sphereRadius = 0.6;
                const physicsMaterial = new CANNON.Material();
                const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, { friction: 0.1, restitution: 0.5 });
                world.addContactMaterial(physicsContactMaterial);
                world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterial, wallMaterial, { friction: 0.3, restitution: 0.3 }));

                let applesLoaded = 0;
                appleModelPaths.forEach((path, idx) => {
                    loader.load(path, (appleGltf) => {
                        const appleScene = appleGltf.scene;
                        const appleBox = new THREE.Box3().setFromObject(appleScene);
                        const appleSize = appleBox.getSize(new THREE.Vector3());
                        const appleMaxDim = Math.max(appleSize.x, appleSize.y, appleSize.z);
                        const appleScale = (sphereRadius * 2) / appleMaxDim;
                        appleScene.scale.set(appleScale, appleScale, appleScale);
                        const appleCenter = appleBox.getCenter(new THREE.Vector3());
                        appleScene.position.set(-appleCenter.x * appleScale, -appleCenter.y * appleScale, -appleCenter.z * appleScale);
                        loadedAppleModels[idx] = appleScene;
                        applesLoaded++;
                        if (applesLoaded === 3) spawnApples(newBox, newSize, 300, sphereRadius, physicsMaterial);
                    });
                });

                function spawnApples(box, size, count, radius, material) {
                    for (let i = 0; i < count; i++) {
                        const insetX = size.x * 0.2;
                        const insetZ = size.z * 0.2;
                        const x = box.min.x + insetX + radius + Math.random() * (size.x - 2 * insetX - 2 * radius);
                        const z = box.min.z + insetZ + radius + Math.random() * (size.z - 2 * insetZ - 2 * radius);
                        const startY = box.min.y + size.y * 0.2 + Math.random() * (size.y * 0.6);
                        const sphereBody = new CANNON.Body({
                            mass: 1,
                            shape: new CANNON.Sphere(radius),
                            position: new CANNON.Vec3(x, startY, z),
                            material: material,
                            linearDamping: 0.3,
                            angularDamping: 0.3
                        });
                        world.addBody(sphereBody);
                        window.sphereBodies.push(sphereBody);
                        const appleClone = loadedAppleModels[Math.floor(Math.random() * 3)].clone();
                        appleClone.position.set(x, startY, z);
                        appleClone.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
                        scene.add(appleClone);
                        window.appleMeshes.push(appleClone);
                    }
                }
            } catch (e) { console.error("Physics setup error", e); }
        }
    );

    camera.position.set(0, 22, 0);
    camera.lookAt(0, 8, 0);

    // Mouse Collider
    const mouseColliderRadius = 2.5;
    const mouseColliderHeight = 40;
    const mouseColliderBody = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, position: new CANNON.Vec3(0, -200, 0) });
    mouseColliderBody.addShape(new CANNON.Cylinder(mouseColliderRadius, mouseColliderRadius, mouseColliderHeight, 12));
    world.addBody(mouseColliderBody);

    const mouseColliderGeo = new THREE.CylinderGeometry(mouseColliderRadius, mouseColliderRadius, mouseColliderHeight, 12);
    const mouseColliderMesh = new THREE.Mesh(mouseColliderGeo, new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }));
    scene.add(mouseColliderMesh);

    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -8);
    const intersectPoint = new THREE.Vector3();

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        window.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        window.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        window.mouseActive = true;
    });

    container.addEventListener('mouseleave', () => {
        mouseColliderBody.position.set(0, -100, 0);
        window.mouseActive = false;
    });

    // Swirl & Noise Logic
    const timeStep = 1 / 60;
    const vortexStrength = 65, vortexPull = 20, vortexRange = 22;
    const curlNoiseStrength = 3, curlNoiseScale = 0.15, attractionStrength = 0.2;
    let elapsedTime = 0;

    function hash(x, y, z) {
        let h = x * 374761393 + y * 668265263 + z * 1274126177;
        h = ((h ^ (h >> 13)) * 1274126177) | 0;
        return (h & 0x7fffffff) / 0x7fffffff;
    }

    function smoothNoise3D(x, y, z) {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = x - ix, fy = y - iy, fz = z - iz;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), sz = fz * fz * (3 - 2 * fz);
        const n000 = hash(ix, iy, iz), n100 = hash(ix + 1, iy, iz), n010 = hash(ix, iy + 1, iz), n110 = hash(ix + 1, iy + 1, iz);
        const n001 = hash(ix, iy, iz + 1), n101 = hash(ix + 1, iy, iz + 1), n011 = hash(ix, iy + 1, iz + 1), n111 = hash(ix + 1, iy + 1, iz + 1);
        const nx0 = n000 + sx * (n100 - n000), nx1 = n010 + sx * (n110 - n010), nx2 = n001 + sx * (n101 - n001), nx3 = n011 + sx * (n111 - n011);
        const ny0 = nx0 + sy * (nx1 - nx0), ny1 = nx2 + sy * (nx3 - nx2);
        return ny0 + sz * (ny1 - ny0);
    }

    function curlNoise(x, y, z) {
        const e = 0.01;
        const dndy_z = (smoothNoise3D(x, y + e, z) - smoothNoise3D(x, y - e, z)) / (2 * e);
        const dndz_y = (smoothNoise3D(x, y, z + e) - smoothNoise3D(x, y, z - e)) / (2 * e);
        const dndz_x = (smoothNoise3D(x, y, z + e) - smoothNoise3D(x, y, z - e)) / (2 * e);
        const dndx_z = (smoothNoise3D(x + e, y, z) - smoothNoise3D(x - e, y, z)) / (2 * e);
        const dndx_y = (smoothNoise3D(x + e, y, z) - smoothNoise3D(x - e, y, z)) / (2 * e);
        const dndy_x = (smoothNoise3D(x, y + e, z) - smoothNoise3D(x, y - e, z)) / (2 * e);
        return { x: dndy_z - dndz_y, y: dndz_x - dndx_z, z: dndx_y - dndy_x };
    }

    function animate() {
        requestAnimationFrame(animate);
        elapsedTime += timeStep;
        if (world) world.step(timeStep);

        // Update Mouse Collider position based on window.mouse (Physical or Optical)
        if (window.mouseActive) {
            raycaster.setFromCamera(window.mouse, camera);
            raycaster.ray.intersectPlane(groundPlane, intersectPoint);
            if (intersectPoint) {
                mouseColliderBody.position.set(intersectPoint.x, 8, intersectPoint.z);
                mouseColliderMesh.position.set(intersectPoint.x, 8, intersectPoint.z);
            }
        }

        if (window.mouseActive && window.sphereBodies.length > 0) {
            const mx = mouseColliderBody.position.x, mz = mouseColliderBody.position.z;
            window.sphereBodies.forEach(body => {
                const dx = body.position.x - mx, dz = body.position.z - mz, dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < vortexRange && dist > 0.5) {
                    const falloff = 1 - (dist / vortexRange), strength = falloff * falloff;
                    const nx = dx / dist, nz = dz / dist, tx = -nz, tz = nx;
                    body.applyForce(new CANNON.Vec3((tx * vortexStrength - nx * vortexPull) * strength, 0, (tz * vortexStrength - nz * vortexPull) * strength), body.position);
                }
            });
        }

        window.sphereBodies.forEach(body => {
            const px = body.position.x * curlNoiseScale, py = body.position.y * curlNoiseScale, pz = body.position.z * curlNoiseScale, t = elapsedTime * 0.3;
            const curl = curlNoise(px + t, py + t * 0.7, pz + t * 0.5);
            body.applyForce(new CANNON.Vec3(curl.x * curlNoiseStrength, curl.y * curlNoiseStrength * 0.3, curl.z * curlNoiseStrength), body.position);
            if (window.containerBounds) {
                body.applyForce(new CANNON.Vec3((window.containerBounds.center.x - body.position.x) * attractionStrength, (window.containerBounds.center.y - body.position.y) * attractionStrength, (window.containerBounds.center.z - body.position.z) * attractionStrength), body.position);
            }
        });

        if (window.appleMeshes.length > 0 && window.sphereBodies.length > 0 && window.containerBounds) {
            window.sphereBodies.forEach((body, i) => {
                const p = body.position, m = 2;
                if (p.x < window.containerBounds.min.x - m || p.x > window.containerBounds.max.x + m || p.y < window.containerBounds.min.y - m || p.z < window.containerBounds.min.z - m || p.z > window.containerBounds.max.z + m) {
                    body.position.set(window.containerBounds.min.x + 0.6 + Math.random() * (window.containerBounds.size.x - 1.2), window.containerBounds.max.y - 1, window.containerBounds.min.z + 0.6 + Math.random() * (window.containerBounds.size.z - 1.2));
                    body.velocity.set(0, 0, 0);
                }
                if (window.appleMeshes[i]) { window.appleMeshes[i].position.copy(body.position); window.appleMeshes[i].quaternion.copy(body.quaternion); }
            });
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
})();
