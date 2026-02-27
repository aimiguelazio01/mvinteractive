import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, Center, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import gsap from 'gsap';
import HandTracker from './HandTracker';

// Convert IEEE 754 half-precision float (16-bit) to 32-bit float
const halfToFloat = (h: number): number => {
    const s = (h & 0x8000) >> 15; // Sign bit
    const e = (h & 0x7C00) >> 10; // Exponent (5 bits)
    const f = h & 0x03FF;         // Fraction/Mantissa (10 bits)

    if (e === 0) {
        if (f === 0) return s ? -0 : 0;
        return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
    } else if (e === 31) {
        return f ? NaN : (s ? -Infinity : Infinity);
    }
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
};

const VatParticles = ({ projectionMap, projectionMapNext, transition, virtualMouse }: { projectionMap: THREE.Texture, projectionMapNext: THREE.Texture, transition: number, virtualMouse: THREE.Vector2 }) => {
    const posTexture = useLoader(EXRLoader, '/assets/3d/s04/vat_particles_pos.exr');
    const { raycaster, camera } = useThree();

    const uniforms = useRef({
        uTexture: { value: projectionMap },
        uTextureNext: { value: projectionMapNext },
        uTransition: { value: transition },
        uSize: { value: 5.0 },
        uOpacity: { value: 0.2 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uTime: { value: 0 },
        uRadius: { value: 15.0 },
        uFalloff: { value: 20.0 },
        uTrailColor1: { value: new THREE.Color('#00f2ff') },
        uTrailColor2: { value: new THREE.Color('#0070ff') },
        uTrailColor3: { value: new THREE.Color('#5500ff') }
    });

    useEffect(() => {
        uniforms.current.uTexture.value = projectionMap;
        uniforms.current.uTextureNext.value = projectionMapNext;
    }, [projectionMap, projectionMapNext]);

    useEffect(() => {
        uniforms.current.uTransition.value = transition;
    }, [transition]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        let positions: number[] = [];
        try {
            const img = posTexture.image;
            const data = img?.data;
            if (data && data.length > 0 && img.width > 0) {
                const isHalfFloat = data instanceof Uint16Array;
                const channels = Math.round(data.length / (img.width * img.height));
                const densityMultiplier = 3;
                for (let i = 0; i < img.width * img.height; i++) {
                    let x = data[i * channels];
                    let y = data[i * channels + 1];
                    let z = data[i * channels + 2];
                    if (isHalfFloat) {
                        x = halfToFloat(x);
                        y = halfToFloat(y);
                        z = halfToFloat(z);
                    }
                    if (isFinite(x) && isFinite(y) && isFinite(z)) {
                        for (let j = 0; j < densityMultiplier; j++) {
                            const jitter = 0.4;
                            positions.push(
                                x + (Math.random() - 0.5) * jitter,
                                y + (Math.random() - 0.5) * jitter,
                                z + (Math.random() - 0.5) * jitter
                            );
                        }
                    }
                }
                const posArray = new Float32Array(positions);
                geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
                geo.center();
                geo.computeBoundingBox();
                const size = new THREE.Vector3();
                geo.boundingBox!.getSize(size);
                const scale = 190 / (Math.max(size.x, size.y, size.z) || 1);
                for (let i = 0; i < posArray.length; i++) posArray[i] *= scale;
                geo.computeBoundingSphere();
                const particleCount = positions.length / 3;
                const randomValues = new Float32Array(particleCount);
                for (let i = 0; i < particleCount; i++) randomValues[i] = Math.random();
                geo.setAttribute('aRandom', new THREE.BufferAttribute(randomValues, 1));
            }
        } catch (e) { console.error('VAT Error:', e); }
        if (positions.length === 0) {
            const fallback = [];
            const fallbackRandom = [];
            for (let i = 0; i < 15000; i++) {
                fallback.push((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
                fallbackRandom.push(Math.random());
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(fallback, 3));
            geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(fallbackRandom, 1));
        }
        return geo;
    }, [posTexture]);

    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        const target = new THREE.Vector3();
        raycaster.setFromCamera(virtualMouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        raycaster.ray.intersectPlane(plane, target);
        const time = state.clock.getElapsedTime();
        uniforms.current.uMouse.value.lerp(target, 0.05);
        uniforms.current.uTime.value = time;
        const speed = 0.1;
        const color1 = new THREE.Color().setHSL((0.52 + time * speed) % 1, 1, 0.5);
        const color2 = new THREE.Color().setHSL((0.60 + time * speed) % 1, 1, 0.5);
        const color3 = new THREE.Color().setHSL((0.72 + time * speed) % 1, 1, 0.5);
        if (materialRef.current) {
            materialRef.current.uniforms.uTrailColor1.value.copy(color1);
            materialRef.current.uniforms.uTrailColor2.value.copy(color2);
            materialRef.current.uniforms.uTrailColor3.value.copy(color3);
            materialRef.current.uniforms.uTime.value = time;
            materialRef.current.uniforms.uMouse.value.copy(uniforms.current.uMouse.value);
        }
    });

    return (
        <points geometry={geometry}>
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={uniforms.current}
                vertexShader={`
                    uniform float uSize;
                    uniform vec3 uMouse;
                    uniform float uTime;
                    uniform float uRadius;
                    uniform float uFalloff;
                    attribute float aRandom;
                    varying vec2 vTextureUv;
                    varying float vRandom;
                    varying float vMask;

                    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
                    float snoise(vec3 v){ 
                      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                      vec3 i  = floor(v + dot(v, C.yyy) );
                      vec3 x0 =   v - i + dot(i, C.xxx) ;
                      vec3 g = step(x0.yzx, x0.xyz);
                      vec3 l = 1.0 - g;
                      vec3 i1 = min( g.xyz, l.zxy );
                      vec3 i2 = max( g.xyz, l.zxy );
                      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
                      i = mod(i, 289.0 ); 
                      vec4 p = permute( permute( permute( 
                                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                      float n_ = 1.0/7.0;
                      vec3  ns = n_ * D.wyz - D.xzx;
                      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
                      vec4 x_ = floor(j * ns.z);
                      vec4 y_ = floor(j - 7.0 * x_ );
                      vec4 x = x_ *ns.x + ns.yyyy;
                      vec4 y = y_ *ns.x + ns.yyyy;
                      vec4 h = 1.0 - abs(x) - abs(y);
                      vec4 b0 = vec4( x.xy, y.xy );
                      vec4 b1 = vec4( x.zw, y.zw );
                      vec4 s0 = floor(b0)*2.0 + 1.0;
                      vec4 s1 = floor(b1)*2.0 + 1.0;
                      vec4 sh = -step(h, vec4(0.0));
                      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                      vec3 p0 = vec3(a0.xy,h.x);
                      vec3 p1 = vec3(a0.zw,h.y);
                      vec3 p2 = vec3(a1.xy,h.z);
                      vec3 p3 = vec3(a1.zw,h.w);
                      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                      m = m * m;
                      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
                    }

                    void main() {
                        vTextureUv = position.xy / 190.0 + 0.5;
                        vRandom = aRandom;
                        vec3 pos = position;
                        float dist = distance(pos, uMouse);
                        float mask = 1.0 - smoothstep(5.0, 12.0, dist);
                        vMask = mask;
                        float noise = snoise(pos * 0.08 + uTime * 0.2);
                        float flow = snoise(pos * 0.02 + uTime * 0.05);
                        vec3 toMouse = pos - uMouse;
                        vec3 vortexDir = cross(normalize(toMouse), vec3(0.0, 0.0, 1.0));
                        float swirl = mask * (8.0 + noise * 3.0);
                        pos += vortexDir * swirl;
                        float spreadForce = mask * (4.0 + flow * 2.0);
                        pos += normalize(toMouse) * spreadForce;
                        pos.x += noise * mask * 4.0;
                        pos.y += flow * mask * 4.0;
                        pos.z += snoise(pos * 0.05 - uTime * 0.15) * mask * 8.0;

                        // Global float
                        pos.x += snoise(position * 0.02 + uTime * 0.05) * 3.0;
                        pos.y += snoise(position * 0.02 + uTime * 0.04 + 10.0) * 3.0;
                        pos.z += snoise(position * 0.02 + uTime * 0.06 + 20.0) * 4.0;

                        vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
                        gl_PointSize = uSize * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform sampler2D uTexture;
                    uniform sampler2D uTextureNext;
                    uniform float uTransition;
                    uniform float uOpacity;
                    uniform vec3 uTrailColor1;
                    uniform vec3 uTrailColor2;
                    uniform vec3 uTrailColor3;
                    varying vec2 vTextureUv;
                    varying float vRandom;
                    varying float vMask;
                    void main() {
                        float dist = distance(gl_PointCoord, vec2(0.5));
                        if (dist > 0.5) discard;
                        
                        vec4 texCol1 = texture2D(uTexture, vTextureUv);
                        vec4 texCol2 = texture2D(uTextureNext, vTextureUv);
                        vec4 texCol = mix(texCol1, texCol2, uTransition);
                        vec3 trailColor;
                        if (vRandom < 0.33) trailColor = uTrailColor1;
                        else if (vRandom < 0.66) trailColor = uTrailColor2;
                        else trailColor = uTrailColor3;
                        vec3 bgGray = vec3(0.25, 0.25, 0.25);
                        vec3 randomGray = mix(bgGray * 0.8, bgGray * 1.2, vRandom);
                        vec3 baseColor = texCol.rgb * randomGray;
                        vec3 finalColor = mix(baseColor, trailColor, vMask * 0.8);
                        float glow = smoothstep(0.5, 0.2, dist);
                        float core = smoothstep(0.2, 0.0, dist) * 0.5;
                        float finalOpacity = mix(0.2, 1.0, vMask);
                        gl_FragColor = vec4(finalColor, (glow + core) * finalOpacity * texCol.a);
                    }
                `}
            />
        </points>
    );
};

const VoronoiBackground = ({ diffuseMap, bumpMap, diffuseMapNext, bumpMapNext, transition, virtualMouse }: { diffuseMap: THREE.Texture, bumpMap: THREE.Texture, diffuseMapNext: THREE.Texture, bumpMapNext: THREE.Texture, transition: number, virtualMouse: THREE.Vector2 }) => {
    const { scene } = useGLTF('/assets/3d/s04/voronoi8.gltf');
    const { raycaster, camera } = useThree();
    const uniforms = useRef({
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uRadius: { value: 8.0 },
        uFalloff: { value: 12.0 },
        uTime: { value: 0 },
        uTransition: { value: transition },
        uDiffuseNext: { value: diffuseMapNext },
        uBumpNext: { value: bumpMapNext }
    });

    useEffect(() => {
        uniforms.current.uTransition.value = transition;
        uniforms.current.uDiffuseNext.value = diffuseMapNext;
        uniforms.current.uBumpNext.value = bumpMapNext;
    }, [transition, diffuseMapNext, bumpMapNext]);

    useMemo(() => {
        const noiseGLSL = `
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            float snoise(vec3 v){ 
              const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
              const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
              vec3 i  = floor(v + dot(v, C.yyy) );
              vec3 x0 =   v - i + dot(i, C.xxx) ;
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min( g.xyz, l.zxy );
              vec3 i2 = max( g.xyz, l.zxy );
              vec3 x1 = x0 - i1 + 1.0 * C.xxx;
              vec3 x2 = x0 - i2 + 2.0 * C.xxx;
              vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
              i = mod(i, 289.0 ); 
              vec4 p = permute( permute( permute( 
                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                       + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                       + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
              float n_ = 1.0/7.0;
              vec3  ns = n_ * D.wyz - D.xzx;
              vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_ );
              vec4 x = x_ *ns.x + ns.yyyy;
              vec4 y = y_ *ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
              vec4 b0 = vec4( x.xy, y.xy );
              vec4 b1 = vec4( x.zw, y.zw );
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
              vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
              vec3 p0 = vec3(a0.xy,h.x);
              vec3 p1 = vec3(a0.zw,h.y);
              vec3 p2 = vec3(a1.xy,h.z);
              vec3 p3 = vec3(a1.zw,h.w);
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
              p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }
        `;
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = child.receiveShadow = true;
                child.geometry.computeBoundingBox();
                const center = new THREE.Vector3();
                child.geometry.boundingBox!.getCenter(center);
                const spread = new THREE.Vector3((Math.random() - 0.5) * 10.0, (Math.random() - 0.5) * 10.0, (Math.random() - 0.5) * 1.0);
                const phase = Math.random() * Math.PI * 2.0;
                const speed = 0.12 + Math.random() * 0.12;
                const material = new THREE.MeshPhysicalMaterial({
                    map: diffuseMap, bumpMap: bumpMap, bumpScale: 0.1, metalness: 0.1, roughness: 0.5, color: '#ffffff', side: THREE.DoubleSide, envMapIntensity: 2.0
                });
                material.onBeforeCompile = (shader) => {
                    shader.uniforms.uMouse = uniforms.current.uMouse;
                    shader.uniforms.uRadius = uniforms.current.uRadius;
                    shader.uniforms.uFalloff = uniforms.current.uFalloff;
                    shader.uniforms.uTime = uniforms.current.uTime;
                    shader.uniforms.uTransition = uniforms.current.uTransition;
                    shader.uniforms.uDiffuseNext = uniforms.current.uDiffuseNext;
                    shader.uniforms.uBumpNext = uniforms.current.uBumpNext;
                    shader.uniforms.uMotionTexture = { value: bumpMap };
                    shader.uniforms.uCenter = { value: center };
                    shader.uniforms.uSpread = { value: spread };
                    shader.uniforms.uPhase = { value: phase };
                    shader.uniforms.uSpeed = { value: speed };
                    shader.vertexShader = `
                        uniform vec3 uMouse; uniform float uRadius; uniform float uFalloff; uniform float uTime; uniform vec3 uCenter; uniform vec3 uSpread; uniform float uPhase; uniform float uSpeed;
                        varying vec3 vWorldPosition; varying float vActive; varying float vMask;
                        ${noiseGLSL}
                        ${shader.vertexShader}
                    `.replace('#include <begin_vertex>', `
                        #include <begin_vertex>
                        vec3 worldPieceCenter = (modelMatrix * vec4(uCenter, 1.0)).xyz;
                        float dist = distance(worldPieceCenter, uMouse);
                        float activeValue = sin(uTime * uSpeed + uPhase);
                        float activeState = step(0.0, activeValue);
                        vActive = activeState;
                        float noise = snoise(worldPieceCenter * 0.1 + uTime * 0.1) * 5.0;
                        float mask = (1.0 - smoothstep(uRadius + noise, uRadius + uFalloff + noise, dist)) * activeState;
                        vMask = mask;
                        vec3 dirToCamera = normalize(cameraPosition - worldPieceCenter);
                        transformed += dirToCamera * mask * 1.5; transformed += uSpread * mask;
                    `).replace('#include <worldpos_vertex>', `
                        #include <worldpos_vertex>
                        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                    `);
                    shader.fragmentShader = `
                        uniform vec3 uMouse; uniform float uRadius; uniform float uFalloff; uniform float uTime;
                        uniform float uTransition;
                        uniform sampler2D uDiffuseNext;
                        uniform sampler2D uBumpNext;
                        varying vec3 vWorldPosition; varying float vActive; varying float vMask;
                        ${noiseGLSL}
                        ${shader.fragmentShader}
                    `.replace('#include <map_fragment>', `
                        #ifdef USE_MAP
                            vec4 defaultTex1 = texture2D(map, vMapUv);
                            vec4 defaultTex2 = texture2D(uDiffuseNext, vMapUv);
                            vec4 defaultTex = mix(defaultTex1, defaultTex2, uTransition);
                            vec3 affectedColor = vec3(0.25, 0.25, 0.25); 
                            diffuseColor.rgb = mix(defaultTex.rgb, affectedColor, vMask);
                        #endif
                    `).replace('#include <roughnessmap_fragment>', `
                        #include <roughnessmap_fragment>
                        float fDist = distance(vWorldPosition, uMouse);
                        float fn = snoise(vWorldPosition * 0.1 + uTime * 0.1) * 5.0;
                        float fMask = mix(1.0, smoothstep(uRadius + fn, uRadius + uFalloff + fn, fDist), vActive);
                        roughnessFactor = mix(0.9, 0.15, fMask);
                    `).replace('#include <metalnessmap_fragment>', `
                        #include <metalnessmap_fragment>
                        float mDist = distance(vWorldPosition, uMouse);
                        float mn = snoise(vWorldPosition * 0.1 + uTime * 0.1) * 5.0;
                        float mMask = mix(1.0, smoothstep(uRadius + mn, uRadius + uFalloff + mn, mDist), vActive);
                        metalnessFactor = mix(0.1, 0.95, mMask);
                    `).replace('#include <bumpmap_fragment>', `
                        #ifdef USE_BUMPMAP
                            float bDist = distance(vWorldPosition, uMouse);
                            float bn = snoise(vWorldPosition * 0.1 + uTime * 0.1) * 5.0;
                            float bMask = mix(1.0, smoothstep(uRadius + bn, uRadius + uFalloff + bn, bDist), vActive);
                            float finalBumpScale = mix(0.0, 0.5, bMask);
                            vec2 dxy1 = dHdxy_fwd();
                            // Temporarily swap bumpMap to sample the second one's gradient
                            // Surface gradients is messy to mix manually, so we mix the results of the normals
                            vec3 normal1 = normalize(vNormal - finalBumpScale * (dxy1.x * vNormal + dxy1.y * vNormal));
                            
                            // This is a simplified blend approach for bump
                            vNormal = normal1; 
                        #endif
                    `);
                };
                child.material = material;
            }
        });
    }, [scene, diffuseMap, bumpMap]);

    useFrame((state) => {
        const target = new THREE.Vector3();
        raycaster.setFromCamera(virtualMouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        raycaster.ray.intersectPlane(plane, target);
        uniforms.current.uMouse.value.lerp(target, 0.05);
        uniforms.current.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <group>
            <primitive object={scene} scale={13} position={[0, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]} />
        </group>
    );
};

const MouseTrail = ({ virtualMouse }: { virtualMouse: THREE.Vector2 }) => {
    const { camera, raycaster } = useThree();
    const trailConfigs = useMemo(() => [
        { color: '#00f2ff', thickness: 2.5, spring: 0.02, friction: 0.92 },
        { color: '#0070ff', thickness: 3.5, spring: 0.015, friction: 0.94 },
        { color: '#5500ff', thickness: 5.0, spring: 0.01, friction: 0.96 }
    ], []);
    const trails = useRef(trailConfigs.map(() => ({ points: Array.from({ length: 50 }, () => new THREE.Vector3()), v: new THREE.Vector3(), lastMouse: new THREE.Vector3() })));
    const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

    useFrame((state) => {
        const target = new THREE.Vector3();
        raycaster.setFromCamera(virtualMouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        raycaster.ray.intersectPlane(plane, target);
        const time = state.clock.getElapsedTime();
        trails.current.forEach((trail, index) => {
            const config = trailConfigs[index];
            const mesh = meshRefs.current[index];
            if (!mesh) return;
            const speed = 0.1;
            const hueOffset = [0.52, 0.60, 0.72][index];
            (mesh.material as THREE.ShaderMaterial).uniforms.uColor.value.setHSL((hueOffset + time * speed) % 1, 1, 0.5);
            const points = trail.points;
            const posAttr = mesh.geometry.attributes.position;
            for (let i = points.length - 1; i >= 0; i--) {
                if (i === 0) {
                    const accel = new THREE.Vector3().copy(target).sub(points[i]).multiplyScalar(config.spring);
                    trail.v.add(accel).multiplyScalar(config.friction);
                    points[i].add(trail.v);
                } else {
                    points[i].lerp(points[i - 1], 0.65);
                }
                const p = points[i];
                const nextP = points[Math.max(0, i - 1)];
                const dir = new THREE.Vector3().copy(nextP).sub(p).normalize();
                const normal = new THREE.Vector3(-dir.y, dir.x, 0).multiplyScalar(config.thickness);
                const taper = (1.0 - i / points.length);
                normal.multiplyScalar(taper);
                const baseIdx = i * 2;
                posAttr.setXYZ(baseIdx, p.x - normal.x, p.y - normal.y, p.z);
                posAttr.setXYZ(baseIdx + 1, p.x + normal.x, p.y + normal.y, p.z);
            }
            posAttr.needsUpdate = true;
        });
    });

    return (
        <>
            {trailConfigs.map((config, i) => (
                <mesh key={i} ref={el => { meshRefs.current[i] = el; }}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={100} array={new Float32Array(100 * 3)} itemSize={3} />
                        <bufferAttribute attach="attributes-uv" count={100} array={new Float32Array(Array.from({ length: 50 }, (_, i) => [0, i / 49, 1, i / 49]).flat())} itemSize={2} />
                        <bufferAttribute attach="index" count={49 * 6} array={new Uint16Array(Array.from({ length: 49 }, (_, i) => { const b = i * 2; return [b, b + 1, b + 2, b + 1, b + 3, b + 2]; }).flat())} itemSize={1} />
                    </bufferGeometry>
                    <shaderMaterial
                        transparent depthWrite={false} blending={THREE.AdditiveBlending}
                        uniforms={{ uColor: { value: new THREE.Color(config.color) } }}
                        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                        fragmentShader={`uniform vec3 uColor; varying vec2 vUv; void main() { float alpha = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.4, vUv.y); alpha *= (1.0 - vUv.y); gl_FragColor = vec4(uColor, alpha * 0.6); }`}
                    />
                </mesh>
            ))}
        </>
    );
};

// This component handles texture loading and rotates every 10s
const Section04Content = ({ virtualMouse }: { virtualMouse: THREE.Vector2 }) => {
    const texturePaths = useMemo(() => [
        '/assets/3d/s04/background_01.png',
        '/assets/3d/s04/background_02.png',
        '/assets/3d/s04/background_03.png',
        '/assets/3d/s04/background_04.png',
        '/assets/3d/s04/background_05.png',
        '/assets/3d/s04/background_01_diff.png',
        '/assets/3d/s04/background_02_diff.png',
        '/assets/3d/s04/background_03_diff.png',
        '/assets/3d/s04/background_04_diff.png',
        '/assets/3d/s04/background_05_diff.png'
    ], []);

    const loadedTextures = useTexture(texturePaths);

    const [indices, setIndices] = useState({ curr: 4, next: 0 });
    const [transition, setTransition] = useState(0);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        loadedTextures.forEach(tex => {
            tex.flipY = false;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        });
    }, [loadedTextures]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIdx = (indices.next + 1) % 5;

            // Animate transition
            const obj = { val: 0 };
            gsap.to(obj, {
                val: 1,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: () => setTransition(obj.val),
                onComplete: () => {
                    setIndices(prev => ({ curr: prev.next, next: nextIdx }));
                    setTransition(0);
                }
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [indices]);

    const currentBump = loadedTextures[indices.curr];
    const nextBump = loadedTextures[indices.next];
    const currentDiff = loadedTextures[indices.curr + 5];
    const nextDiff = loadedTextures[indices.next + 5];

    return (
        <>
            <ambientLight intensity={1.0} />
            <spotLight position={[20, 20, 20]} angle={0.25} penumbra={1} intensity={10} castShadow />
            <pointLight position={[15, 10, -10]} intensity={5} color="#ff00ff" />

            <VoronoiBackground
                bumpMap={currentBump}
                diffuseMap={currentDiff}
                bumpMapNext={nextBump}
                diffuseMapNext={nextDiff}
                transition={transition}
                virtualMouse={virtualMouse}
            />
            <VatParticles
                projectionMap={currentBump}
                projectionMapNext={nextBump}
                transition={transition}
                virtualMouse={virtualMouse}
            />
            <MouseTrail virtualMouse={virtualMouse} />

            {!isMobile && <ContactShadows position={[0, -15, 0]} opacity={0.3} scale={50} blur={2.5} far={20} />}
            <Environment files="/assets/3d/s04/hdri.exr" />
        </>
    );
};

const Section04Experience: React.FC = () => {
    const [virtualMouse] = useState(() => new THREE.Vector2(0, 0));
    const [useHand, setUseHand] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="absolute inset-0 z-[50] pointer-events-none" style={{ background: '#1e1d1c' }}>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto flex flex-col items-center gap-4">
                <button
                    onClick={() => setUseHand(!useHand)}
                    className={`px-8 py-3 rounded-full border-2 text-[12px] font-mono font-bold tracking-[0.2em] transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.1)] ${useHand ? 'bg-black text-gray-800 border-black scale-110 shadow-[0_0_30px_rgba(0,0,0,0.4)]' : 'bg-white/60 text-gray-800 border-black/40 hover:border-black/80 hover:scale-105'}`}
                >
                    {useHand ? 'HAND CONTROL: ACTIVE' : 'ENABLE HAND CONTROL'}
                </button>

                <div className="flex flex-col items-center gap-3 transition-opacity duration-300" style={{ opacity: useHand ? 1 : 0.6 }}>
                    <span className="text-[16px] md:text-[20px] font-mono text-gray-800 tracking-[0.2em] uppercase font-bold text-center">
                        {useHand ? "Move index finger to interact" : "Use webcam for air-touch control"}
                    </span>
                    {!useHand && (
                        <span className="text-[12px] md:text-[14px] font-mono text-gray-800/70 tracking-[0.15em] text-center">
                            (Requires camera access)
                        </span>
                    )}
                </div>
            </div>

            <HandTracker
                active={useHand}
                onHandMove={(pos) => {
                    virtualMouse.set(pos.x, pos.y);
                }}
            />

            <Canvas
                shadows={!isMobile}
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                dpr={isMobile ? [1, 1] : [1, 1.5]}
                style={{ pointerEvents: 'auto' }}
                onPointerMove={(e) => {
                    if (!useHand) {
                        // Update virtual mouse with standard Three.js normalized coords
                        const x = (e.clientX / window.innerWidth) * 2 - 1;
                        const y = -(e.clientY / window.innerHeight) * 2 + 1;
                        virtualMouse.set(x, y);
                    }
                }}
            >
                <color attach="background" args={['#404040']} />
                <ResponsiveCamera />
                <Suspense fallback={null}>
                    <Section04Content virtualMouse={virtualMouse} />
                </Suspense>
            </Canvas>
        </div>
    );
};

const ResponsiveCamera = () => {
    const { viewport, camera } = useThree();
    const aspect = viewport.aspect;
    React.useLayoutEffect(() => {
        const baseFov = 30;
        const threshold = 1.6;
        (camera as THREE.PerspectiveCamera).fov = aspect < threshold ? baseFov * (threshold / aspect) : baseFov;
        camera.position.set(0, 0, 190);
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }, [aspect, camera]);
    return <PerspectiveCamera makeDefault />;
};

useGLTF.preload('/assets/3d/s04/voronoi8.gltf');

export default Section04Experience;
