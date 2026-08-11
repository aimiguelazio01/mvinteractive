import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Initial Loading Reveal
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to('.reveal-up', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "expo.out"
    });

    gsap.to('#hero-img-container video, #hero-img-container img', {
        scale: 1,
        duration: 2.5,
        ease: "power2.out"
    });
});

// Parallax and Scroll Effects
gsap.to('.orbital-line', {
    scrollTrigger: {
        trigger: 'section',
        start: 'top bottom',
        scrub: 1
    },
    x: 50,
    opacity: 0.5
});

// Interactive HUD effects
document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, { backgroundColor: 'rgba(255, 255, 255, 0.08)', duration: 0.4 });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, { backgroundColor: 'rgba(25, 28, 31, 0.6)', duration: 0.4 });
    });
});

// --- 3D MODAL LOGIC: FLOATING INSTRUMENT ---
const modal = document.getElementById('planet-modal');
const modalHeader = document.getElementById('modal-header');
const canvasContainer = document.getElementById('three-canvas-container');
const planetBtn = document.getElementById('planet-btn');
const launchBtn = document.getElementById('launch-btn');
const closeBtn = document.getElementById('close-modal');
const loader = document.getElementById('model-loader');
const loadingBar = document.getElementById('loading-bar');

let scene, camera, renderer, controls, gltfModel, starField;
let isInitialized = false;
let isAnimatingLoop = false;
let animationFrameId = null;

// Draggable Logic
let isDragging = false;
let offset = { x: 0, y: 0 };

const dragStart = (clientX, clientY) => {
    isDragging = true;
    const rect = modal.getBoundingClientRect();
    offset.x = clientX - rect.left;
    offset.y = clientY - rect.top;
    modal.style.transition = 'none'; // Disable transition while dragging
};

const dragMove = (clientX, clientY) => {
    if (!isDragging) return;
    modal.style.left = `${clientX - offset.x + (modal.offsetWidth / 2)}px`;
    modal.style.top = `${clientY - offset.y + (modal.offsetHeight / 2)}px`;
};

const dragEnd = () => {
    isDragging = false;
    modal.style.transition = 'opacity 0.5s ease';
};

modalHeader.addEventListener('mousedown', (e) => dragStart(e.clientX, e.clientY));
modalHeader.addEventListener('touchstart', (e) => dragStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

let lastMouseX = null;
let lastMouseY = null;
let lastMouseTime = null;

document.addEventListener('mousemove', (e) => {
    const currentTime = performance.now();
    if (lastMouseX !== null && lastMouseY !== null && lastMouseTime !== null) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const dt = currentTime - lastMouseTime;
        if (dt > 0) {
            const speed = Math.sqrt(dx * dx + dy * dy) / dt; // pixels per millisecond
            const speedKmS = speed * 1000;
            const orbitalVelocity = document.getElementById('orbital-velocity-value');
            if (orbitalVelocity) {
                orbitalVelocity.textContent = `${speedKmS.toLocaleString('en-US', {maximumFractionDigits: 0})} KM/S`;
            }
        }
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMouseTime = currentTime;
    const sectorCoords = document.getElementById('sector-coordinates-value');
    if (sectorCoords) {
        sectorCoords.textContent = `${e.clientX} / ${e.clientY}`;
    }

    dragMove(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
    dragMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function initThree() {
    if (isInitialized) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    sunLight.position.set(5, 5, 5);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x00F2FF, 3, 50);
    rimLight.position.set(-10, -5, -5);
    scene.add(rimLight);

    const highlightLight = new THREE.SpotLight(0xFFD700, 5, 20, Math.PI / 6, 0.5);
    highlightLight.position.set(0, 10, 0);
    scene.add(highlightLight);

    window.solarLight = sunLight;
    window.rimPulse = rimLight;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 20;
    controls.minDistance = 2;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.PAN
    };
    // --- STARFIELD ---
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.12,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const starVertices = [];
    for (let i = 0; i < 3500; i++) {
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        'assets/3d/scene_v02.gltf', // I WILL UPDATE THIS PATH FOR ASSETS
        (gltf) => {
            gltfModel = gltf.scene;
            scene.add(gltfModel);


            // --- ATTACH INDIVIDUAL PLANET LABELS ---
            const createLabelSprite = (text) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 512;
                canvas.height = 128;
                
                // Clean Text-only Style
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 10;
                ctx.font = 'bold 48px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 256, 64);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.65 });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(2, 0.5, 1);
                return sprite;
            };

            // --- NORMALIZE LABEL SCALING (REF: JUPITER) ---
            let jupiterWorldScale = 1.0;
            gltfModel.traverse((node) => {
                if (node.name.toLowerCase().includes('jupiter')) {
                    const ws = new THREE.Vector3();
                    node.getWorldScale(ws);
                    jupiterWorldScale = ws.x || 1.0; 
                }
            });

            gltfModel.traverse((node) => {
                // Capture nodes starting with planet_ OR special objects like Pluto/Sun
                if (node.isMesh && (node.name.startsWith('planet_') || node.name.includes('Object_44'))) {
                    let planetName = node.name.replace('planet_', '').toUpperCase();
                    if (node.name.includes('Object_44')) planetName = 'PLUTO';
                    if (planetName.includes('OBJECT')) return; // Skip generic objects

                    const label = createLabelSprite(planetName);
                    
                    // Get local size more reliably
                    const nodeBox = new THREE.Box3().setFromObject(node);
                    const nodeSize = nodeBox.getSize(new THREE.Vector3());
                    
                    const ws = new THREE.Vector3();
                    node.getWorldScale(ws);
                    
                    // Normalize scale (ultra-minimalist size - halved again)
                    const scaleFactor = jupiterWorldScale / (ws.x || 1);
                    label.scale.set(0.3 * scaleFactor, 0.075 * scaleFactor, 1);
                    
                    // Position calculation: Per-body vertical offsets
                    const worldHeight = nodeSize.y;
                    let heightMult = 1.5;
                    if (planetName === 'JUPITER') heightMult = 0.75;
                    if (planetName === 'SUN') heightMult = 4.5;
                    label.position.set(0, (worldHeight * heightMult) / (ws.y || 1), 0); 
                    
                    label.renderOrder = 999; // Ensure labels are drawn on top
                    node.add(label);
                }
            });

            const box = new THREE.Box3().setFromObject(gltfModel);
            const center = box.getCenter(new THREE.Vector3());
            gltfModel.position.x += (gltfModel.position.x - center.x);
            gltfModel.position.y += (gltfModel.position.y - center.y);
            gltfModel.position.z += (gltfModel.position.z - center.z);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(maxDim * 0.8, maxDim * 1.2, maxDim * 0.8);
            camera.lookAt(0, 0, 0);
            controls.update();
            loader.style.display = 'none';
        },
        (xhr) => {
            const percent = (xhr.loaded / xhr.total) * 100;
            loadingBar.style.width = percent + '%';
        }
    );

    isInitialized = true;
    isAnimatingLoop = true;
    animate();
}

let time = 0;
function animate() {
    if (!isAnimatingLoop) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }
    animationFrameId = requestAnimationFrame(animate);
    time += 0.01;

    if (gltfModel) {
        gltfModel.rotation.y += 0.001;
    }

    if (starField) {
        starField.rotation.y += 0.0001;
        starField.rotation.z += 0.00005;
    }


    if (window.solarLight) {
        window.solarLight.position.copy(camera.position);
    }

    if (window.rimPulse) {
        window.rimPulse.intensity = 3 + Math.sin(time * 2) * 1.5;
    }

    controls.update();
    renderer.render(scene, camera);
}

function resizeThree() {
    if (isInitialized && renderer && camera && canvasContainer) {
        const width = canvasContainer.clientWidth;
        const height = canvasContainer.clientHeight;
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }
}

function openModal() {
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.classList.remove('hidden');
    gsap.fromTo(modal,
        { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50, y: -50 },
        { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, y: 0, duration: 1, ease: "expo.out" }
    );

    const bottomHud = document.querySelector('nav.fixed.bottom-12');
    if (bottomHud) {
        gsap.to(bottomHud, {
            scale: 1.05,
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            duration: 1,
            ease: "expo.out"
        });

        const hudItems = bottomHud.querySelectorAll('span.font-michroma');
        if (hudItems.length > 0) {
            hudItems[0].innerText = "DRAG TO ROTATE PLANET";
            hudItems[1].innerText = "SCROLL TO ZOOM ORBIT";
            hudItems[2].innerText = "INSTRUMENT ACTIVE";
            hudItems[2].classList.add('text-nebula-cyan');
        }
    }

    isAnimatingLoop = true;
    initThree();
    if (isInitialized) {
        resizeThree();
        animate();
    }
}

function closeModal() {
    isAnimatingLoop = false;
    gsap.to(modal, {
        opacity: 0, scale: 0.95, duration: 0.5, ease: "power3.in", onComplete: () => {
            modal.classList.add('hidden');
        }
    });

    const bottomHud = document.querySelector('nav.fixed.bottom-12');
    gsap.to(bottomHud, {
        scale: 1,
        backgroundColor: 'rgba(25, 28, 31, 0.6)',
        duration: 1,
        ease: "expo.out"
    });

    const hudItems = bottomHud.querySelectorAll('span.font-michroma');
    if (hudItems.length > 0) {
        hudItems[0].innerText = "Swipe to Rotate";
        hudItems[1].innerText = "Pinch to Zoom";
        hudItems[2].innerText = "Double Tap Focus";
        hudItems[2].classList.remove('text-nebula-cyan');
    }
}

if (planetBtn) planetBtn.addEventListener('click', openModal);
if (launchBtn) launchBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);

// Click outside to close modal
document.addEventListener('mousedown', (e) => {
    if (!modal.classList.contains('hidden')) {
        if (!modal.contains(e.target) && 
           (!launchBtn || !launchBtn.contains(e.target)) && 
           (!planetBtn || !planetBtn.contains(e.target))) {
            closeModal();
        }
    }
});

// --- DEMO MODAL LOGIC: ENCYCLOPEDIA POPUP ---
const demoModal = document.getElementById('demo-modal');
const demoModalHeader = document.getElementById('demo-modal-header');
const demoBackdrop = document.getElementById('demo-backdrop');
const watchDemoBtn = document.getElementById('watch-demo-btn');
const closeDemoBtn = document.getElementById('close-demo-modal');
const demoIframe = document.getElementById('demo-iframe');
const demoLoader = document.getElementById('demo-loader');

// Draggable Logic for Demo Modal
let isDemoDrawing = false;
let demoOffset = { x: 0, y: 0 };

const demoDragStart = (clientX, clientY) => {
    isDemoDrawing = true;
    const rect = demoModal.getBoundingClientRect();
    demoOffset.x = clientX - rect.left;
    demoOffset.y = clientY - rect.top;
    demoModal.style.transition = 'none';
    if (demoIframe) {
        demoIframe.style.pointerEvents = 'none';
    }
};

const demoDragMove = (clientX, clientY) => {
    if (!isDemoDrawing) return;
    demoModal.style.left = `${clientX - demoOffset.x + (demoModal.offsetWidth / 2)}px`;
    demoModal.style.top = `${clientY - demoOffset.y + (demoModal.offsetHeight / 2)}px`;
};

const demoDragEnd = () => {
    if (isDemoDrawing) {
        isDemoDrawing = false;
        demoModal.style.transition = 'opacity 0.5s ease';
        if (demoIframe) {
            demoIframe.style.pointerEvents = 'auto';
        }
    }
};

demoModalHeader.addEventListener('mousedown', (e) => demoDragStart(e.clientX, e.clientY));
demoModalHeader.addEventListener('touchstart', (e) => demoDragStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

document.addEventListener('mousemove', (e) => demoDragMove(e.clientX, e.clientY));
document.addEventListener('touchmove', (e) => demoDragMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

document.addEventListener('mouseup', demoDragEnd);
document.addEventListener('touchend', demoDragEnd);

function openDemoModal() {
    // Load the encyclopedia page
    const srcPath = demoIframe.dataset.src || 'assets/planetary/solar_system_encyclopedia/code.html';
    demoIframe.src = srcPath;
    demoLoader.style.opacity = '1';
    demoLoader.style.pointerEvents = 'all';

    demoIframe.addEventListener('load', () => {
        demoLoader.style.opacity = '0';
        demoLoader.style.pointerEvents = 'none';
        if (demoIframe.contentWindow) {
            const lang = window.currentLang || 'PT';
            demoIframe.contentWindow.postMessage({ type: 'setLanguage', lang: lang }, '*');
        }
    }, { once: true });

    // Show backdrop
    demoBackdrop.classList.remove('hidden');
    gsap.fromTo(demoBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });

    // Show modal
    demoModal.classList.remove('hidden');
    // Reset position to center
    demoModal.style.left = '50%';
    demoModal.style.top = '50%';
    gsap.fromTo(demoModal,
        { opacity: 0, scale: 0.92, xPercent: -50, yPercent: -50, y: -40 },
        { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, y: 0, duration: 0.8, ease: 'expo.out' }
    );
}

function closeDemoModal() {
    gsap.to(demoModal, {
        opacity: 0, scale: 0.95, duration: 0.4, ease: 'power3.in', onComplete: () => {
            demoModal.classList.add('hidden');
            demoIframe.src = ''; // Unload iframe
        }
    });
    gsap.to(demoBackdrop, {
        opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
            demoBackdrop.classList.add('hidden');
        }
    });
}

if (watchDemoBtn) watchDemoBtn.addEventListener('click', openDemoModal);
if (closeDemoBtn) closeDemoBtn.addEventListener('click', closeDemoModal);
if (demoBackdrop) demoBackdrop.addEventListener('click', closeDemoModal);

window.addEventListener('resize', () => {
    if (isInitialized && !modal.classList.contains('hidden')) {
        resizeThree();
    }
});
