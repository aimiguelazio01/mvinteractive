"use client";

import React, { useEffect, useRef, useState } from 'react';
import CardStack from '@/components/ui/card-stack';
import { useScrollReveal, useSmoothScroll } from '@/hooks/useScrollReveal';

// Persistent state across component re-renders
let pCurrentFrame = 1;
let pActiveSeqKey = 'low';
let pLastExteriorFrame = 1;
let pLastExteriorSeqKey = 'low';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize luxury motion and smooth scroll
  const scrollContainerRef = useScrollReveal();
  useSmoothScroll();

  // State for the viewer
  const [currentExterior, setCurrentExterior] = useState('gray');
  const [currentInterior, setCurrentInterior] = useState('beige');
  const [viewMode, setViewMode] = useState<'exterior' | 'interior'>('exterior');
  const [isLoading, setIsLoading] = useState(true);

  const extRef = useRef(currentExterior);
  const intRef = useRef(currentInterior);
  const viewModeRef = useRef(viewMode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 60;
    const images: Record<string, HTMLImageElement[]> = { low: [], mid: [], high: [], trans: [] };
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startFrame = 0;
    let isAnimating = false;

    const sequences = {
      low: { path: '', start: 1, count: 60 },
      mid: { path: '', start: 1, count: 60 },
      high: { path: '', start: 1, count: 60 },
      trans: { path: '', start: 61, count: 30 }
    };

    function updateSequencePaths() {
      const isExt = viewModeRef.current === 'exterior';
      const cExt = extRef.current;
      const cInt = intRef.current;

      sequences.low.path = `sequences/${cExt}_${cInt}/carpaint_${cExt}_ext_${cInt}_int.`;
      sequences.trans.path = `sequences/${cExt}_${cInt}_trans/carpaint_trans_${cExt}_ext_${cInt}_int.`;

      let startFrameNum = isExt ? 1 : 61;
      let totalFrames = isExt ? 60 : 30;

      sequences.low.start = startFrameNum;

      if (isExt) {
        let midPrefix = `carpaint_mid_${cExt}_ext_${cInt}_int.`;
        let highPrefix = `carpaint_high_${cExt}_ext_${cInt}_int.`;

        if (cExt === 'white' && cInt === 'blue') {
          midPrefix = `carpaint_white_mid_ext_blue_int.`;
          highPrefix = `carpaint_white_high_ext_blue_int.`;
        }

        sequences.mid.path = `sequences/${cExt}_${cInt}_mid/${midPrefix}`;
        sequences.mid.start = 1;
        sequences.high.path = `sequences/${cExt}_${cInt}_high/${highPrefix}`;
        sequences.high.start = 1;
      } else {
        sequences.mid.path = sequences.trans.path;
        sequences.mid.start = startFrameNum;
        sequences.high.path = sequences.trans.path;
        sequences.high.start = startFrameNum;
      }

      frameCount = totalFrames;
      loadImages();
    }

    const loadImages = () => {
      setIsLoading(true);
      const isExt = viewModeRef.current === 'exterior';

      Object.keys(images).forEach(key => {
        images[key].forEach(img => { img.src = ''; });
      });
      images.low = []; images.mid = []; images.high = []; images.trans = [];

      let loadedCount = 0;
      let loadedLow = 0;

      const totalToLoad = isExt ? frameCount * 3 : frameCount;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedLow === frameCount && loadedCount === loadedLow) {
          setIsLoading(false);
          drawFrame(pCurrentFrame);
        }
        if (loadedCount === totalToLoad) {
          setIsLoading(false);
          drawFrame(pCurrentFrame);
        }
      };

      const loadSequence = (seqObj: any, imageArray: HTMLImageElement[], isLow = false) => {
        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          const frameNum = (seqObj.start + i).toString().padStart(4, '0');

          img.onload = () => {
            if (isLow) loadedLow++;
            checkAllLoaded();
          };
          img.onerror = () => {
            checkAllLoaded();
          };

          img.src = `${seqObj.path}${frameNum}.jpg`;
          imageArray.push(img);
        }
      };

      if (isExt) {
        loadSequence(sequences.low, images.low, true);
        loadSequence(sequences.mid, images.mid);
        loadSequence(sequences.high, images.high);
      } else {
        loadSequence(sequences.trans, images.trans, true);
        images.low = images.trans;
        images.mid = images.trans;
        images.high = images.trans;
      }
    };

    const drawFrame = (frameIndex: number) => {
      if (!ctx || !canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const isExt = viewModeRef.current === 'exterior';
      const seq = isExt ? sequences[pActiveSeqKey as keyof typeof sequences] : sequences.trans;
      const arr = isExt ? images[pActiveSeqKey] : images.trans;

      if (!arr || arr.length === 0) return;

      let idx = frameIndex - seq.start;
      if (idx < 0) idx = 0;
      if (idx >= arr.length) idx = arr.length - 1;

      const img = arr[idx];

      if (img && img.complete && img.naturalWidth > 0) {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    const playToFrame = (targetFrame: number, delay: number, callback?: () => void) => {
      isAnimating = true;
      const step = targetFrame > pCurrentFrame ? 1 : -1;

      const animate = () => {
        if (pCurrentFrame !== targetFrame) {
          pCurrentFrame += step;
          drawFrame(pCurrentFrame);
          setTimeout(animate, delay);
        } else {
          isAnimating = false;
          if (callback) callback();
        }
      };
      animate();
    };

    // Make functions available globally for button clicks
    (window as any).triggerViewChange = (newView: 'exterior' | 'interior') => {
      if (newView === viewModeRef.current || isAnimating) return;

      if (newView === 'interior') {
        pLastExteriorFrame = pCurrentFrame;
        pLastExteriorSeqKey = pActiveSeqKey;
        playToFrame(60, 20, () => {
          viewModeRef.current = 'interior';
          setViewMode('interior');
          pCurrentFrame = 61;
          pActiveSeqKey = 'trans';
          updateSequencePaths();

          setTimeout(() => {
            playToFrame(90, 30);
          }, 500);
        });
      } else {
        playToFrame(61, 30, () => {
          viewModeRef.current = 'exterior';
          setViewMode('exterior');
          pCurrentFrame = 60;
          pActiveSeqKey = pLastExteriorSeqKey;
          updateSequencePaths();

          setTimeout(() => {
            playToFrame(pLastExteriorFrame, 20);
          }, 500);
        });
      }
    };

    (window as any).triggerConfigChange = (type: string, value: string) => {
      if (type === 'exterior') extRef.current = value;
      else intRef.current = value;
      updateSequencePaths();
    };

    // Resize handling
    const handleResize = () => drawFrame(pCurrentFrame);
    window.addEventListener('resize', handleResize);

    // Event listeners for drag
    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (viewModeRef.current === 'interior' || isAnimating) return;
      isDragging = true;
      startX = (e as MouseEvent).pageX || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageX);
      startY = (e as MouseEvent).pageY || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageY);
      startFrame = pCurrentFrame;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || isAnimating || viewModeRef.current === 'interior') return;
      const x = (e as MouseEvent).pageX || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageX);
      const y = (e as MouseEvent).pageY || ((e as TouchEvent).touches && (e as TouchEvent).touches[0].pageY);
      if (x === undefined || y === undefined) return;

      // Horizontal Drag (Scrubbing)
      const dx = x - startX;
      const sensitivityX = 800 / frameCount;
      const frameDiff = Math.round(dx / sensitivityX);

      let nextFrame = startFrame + frameDiff;
      const startFrameNum = viewModeRef.current === 'exterior' ? 1 : 61;
      nextFrame = ((nextFrame - startFrameNum) % frameCount + frameCount) % frameCount + startFrameNum;

      // Vertical Drag (Sequence Switching)
      const dy = y - startY;
      let nextSeqKey = 'low';

      if (dy > 200) {
        nextSeqKey = 'high';
      } else if (dy > 100) {
        nextSeqKey = 'mid';
      } else {
        nextSeqKey = 'low';
      }

      if (nextFrame !== pCurrentFrame || nextSeqKey !== pActiveSeqKey) {
        pCurrentFrame = nextFrame;
        pActiveSeqKey = nextSeqKey;
        requestAnimationFrame(() => drawFrame(pCurrentFrame));
      }
    };

    const handleEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart as any, { passive: true });
    window.addEventListener('touchmove', handleMove as any, { passive: false });
    window.addEventListener('touchend', handleEnd);

    // Initial load
    updateSequencePaths();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart as any);
      window.removeEventListener('touchmove', handleMove as any);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []); // Run ONLY once on mount!

  return (
    <main ref={scrollContainerRef} className="bg-[#131313] text-white min-h-screen font-body selection:bg-white selection:text-black grain-overlay">

      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[#131313]/50 backdrop-blur-2xl transition-all duration-700 border-b border-white/5">
        <nav className="flex justify-between items-center w-full px-8 md:px-16 py-6 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4">
            <img src="/rolls-royce.svg" alt="Rolls-Royce" className="h-10 w-auto invert opacity-90 transition-opacity hover:opacity-100" />
          </div>
          <div className="hidden md:flex gap-12 items-center">
            <a className="text-white font-medium text-[13px] uppercase tracking-[0.2em] border-b border-white/30 pb-1" href="#">Ghost</a>
            <a className="text-white/50 hover:text-white transition-colors duration-500 font-medium text-[13px] uppercase tracking-[0.2em]" href="#specs">Specifications</a>
            <a className="text-white/50 hover:text-white transition-colors duration-500 font-medium text-[13px] uppercase tracking-[0.2em]" href="#gallery">Gallery</a>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-body hidden md:block">Ghost View</span>
            <button className="btn-luxury bg-white text-black px-8 py-3 rounded-none font-semibold text-[11px] uppercase tracking-[0.15em]">
              Configure Yours
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section & 3D Viewer Base */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          id="hero-sequence"
          className="w-full h-full object-cover gsap-parallax"
          data-speed="0.05"
          style={{ cursor: viewMode === 'exterior' ? 'grab' : 'default' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none"></div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000">
            <div className="w-16 h-16 rounded-full spinner-luxury"></div>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-40 px-6 text-center pointer-events-none gsap-scrub-blur">
          <img src="/rolls-royce.svg" alt="Rolls-Royce" className="h-16 md:h-24 w-auto invert opacity-80 mb-6 gsap-reveal-up" />
          <span className="text-[12px] md:text-[14px] uppercase tracking-[0.6em] text-white/50 font-light font-body mb-2 gsap-reveal-up" style={{transitionDelay: '0.1s'}}>Rolls-Royce</span>
          <span className="text-[9px] uppercase tracking-[0.8em] text-white/30 font-bold font-body mb-10 gsap-reveal-up" style={{transitionDelay: '0.2s'}}>Interactive Presentation</span>
          <h1 className="font-serif-display text-6xl md:text-[110px] font-normal text-white tracking-tight leading-[0.9] mb-8 max-w-5xl text-shadow-hero gsap-reveal-up" style={{transitionDelay: '0.3s'}}>
            The Rolls-Royce <span className="text-white/60 italic">Ghost.</span>
          </h1>
          <p className="text-lg md:text-[22px] text-white/60 font-light max-w-2xl mb-10 leading-relaxed font-body gsap-reveal-up" style={{transitionDelay: '0.4s'}}>
            Explore the pinnacle of automotive luxury in an immersive 3D environment. Every stitch, every surface, rendered with absolute fidelity.
          </p>
        </div>

        {/* Floating UI Control Panel */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-6 z-20">
          {/* Interactive Hint */}
          <div className="flex flex-col items-center mb-10 opacity-50 animate-breathe">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.6em] text-white font-medium font-body">
              <span className="material-symbols-outlined text-[16px] font-light">swipe</span>
              <span>Click & Drag to Rotate</span>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent mt-6"></div>
          </div>

          <div className="bg-[#131313]/30 backdrop-blur-[40px] border border-white/5 p-8 rounded-2xl flex flex-col md:flex-row gap-16 items-center justify-center shadow-2xl gsap-reveal-up" style={{transitionDelay: '0.5s'}}>
            <div className="space-y-8 md:space-y-0 md:flex md:gap-20">

              {/* Exterior Paint */}
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888] mb-5 block font-medium text-center font-body">Exterior Paint</span>
                <div className="flex gap-5 justify-center">
                  {['gray', 'black', 'white'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentExterior(color);
                        (window as any).triggerConfigChange('exterior', color);
                      }}
                      className={`w-14 h-14 p-0 rounded-full overflow-hidden transition-all duration-700 ease-in-out group ${currentExterior === color ? 'ring-1 ring-white/40 ring-offset-8 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={`/buttons/carpaint_${color}.png`} alt={`${color} Paint`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Interior Leather */}
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888] mb-5 block font-medium text-center font-body">Interior Leather</span>
                <div className="flex gap-5 justify-center">
                  {['beige', 'black', 'blue'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentInterior(color);
                        (window as any).triggerConfigChange('interior', color);
                      }}
                      className={`w-14 h-14 p-0 rounded-full overflow-hidden transition-all duration-700 ease-in-out group ${currentInterior === color ? 'ring-1 ring-white/40 ring-offset-8 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={`/buttons/int_${color}.png`} alt={`${color} Leather`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Perspective Toggle */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888] mb-5 block font-medium text-center font-body">Perspective</span>
                <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                  <button
                    onClick={() => (window as any).triggerViewChange('exterior')}
                    className={`px-8 py-3 rounded-full text-[10px] font-semibold tracking-[0.2em] transition-all duration-700 font-body ${viewMode === 'exterior' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    EXTERIOR
                  </button>
                  <button
                    onClick={() => (window as any).triggerViewChange('interior')}
                    className={`px-8 py-3 rounded-full text-[10px] font-semibold tracking-[0.2em] transition-all duration-700 font-body ${viewMode === 'interior' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    INTERIOR
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Ghost View — The Experience (Video Section) */}
      <section className="relative w-full bg-[#0a0a0a] py-40 overflow-hidden flex flex-col items-center justify-center section-divider">
        <div className="max-w-5xl mx-auto text-center px-6 mb-24">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-8 block font-medium font-body gsap-reveal-up">Why Ghost View</span>
          <h2 className="font-serif-display text-5xl md:text-[72px] font-normal text-white mb-10 tracking-tight leading-[1.1] gsap-reveal-up">Beyond The Showroom</h2>
          <div className="max-w-3xl mx-auto gsap-stagger">
            <p className="text-white/60 font-light text-[20px] leading-relaxed mb-8 font-body">
              Ghost View bridges the physical and digital worlds of Rolls-Royce. This interactive presentation was conceived to translate the post-opulent presence of the Ghost into a digital medium — allowing prospective owners, enthusiasts, and designers to explore every bespoke configuration before a single hand touches leather.
            </p>
            <p className="text-white/40 font-light text-[17px] leading-relaxed font-body">
              Built with real-time 3D rendering technology, Ghost View captures the interplay of light on the Ghost's minimalist architecture, the depth of its hand-polished paint, and the warmth of its hand-selected leather — all at photographic fidelity. Drag to rotate, pull down to reveal, and configure to make it yours.
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-[1400px] px-8 relative z-30 gsap-scrub-scale">
          {/* Cinematic Frame */}
          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.9)] ring-1 ring-white/5 bg-black gsap-parallax" data-speed="0.03">
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe src="https://player.mediadelivery.net/embed/625906/5e01c0f1-f170-4c44-85e8-a6dcabadf5de?autoplay=true&loop=true&muted=true&preload=true&responsive=true" loading="lazy" style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowFullScreen={true}></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Specifications */}
      <section id="specs" className="bg-[#111] py-40 px-6 md:px-12 section-divider relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none gsap-parallax" data-speed="-0.05"></div>
        
        <div className="max-w-[1920px] mx-auto relative z-10">
          <div className="text-center mb-24">
            <img src="/rolls-royce.svg" alt="Rolls-Royce" className="h-20 w-auto invert opacity-10 mx-auto mb-10 gsap-reveal-up" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-8 block font-medium font-body gsap-reveal-up">Technical Excellence</span>
            <h2 className="font-serif-display text-5xl md:text-[72px] font-normal text-white mb-8 tracking-tight gsap-reveal-up">Ghost Specifications</h2>
            <p className="text-white/50 font-light max-w-3xl mx-auto text-[20px] leading-relaxed font-body gsap-reveal-up">
              The new Rolls-Royce Ghost is the most technologically advanced Rolls-Royce yet. It distills the brand's pillars into a beautiful, minimalist, and yet highly complex product.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden max-w-6xl mx-auto ring-1 ring-white/5 shadow-2xl gsap-stagger">
            {[
              { label: 'Engine', value: '6.75L V12', detail: 'Twin-Turbocharged' },
              { label: 'Power', value: '563 HP', detail: '627 lb-ft Torque' },
              { label: '0-60 mph', value: '4.6s', detail: 'All-Wheel Drive' },
              { label: 'Top Speed', value: '155 mph', detail: 'Electronically Limited' },
              { label: 'Suspension', value: 'Planar', detail: 'World-First System' },
              { label: 'Weight', value: '2,490 kg', detail: 'Post-Opulent Luxury' },
              { label: 'Transmission', value: '8-Speed', detail: 'Satellite Aided' },
              { label: 'Steering', value: 'All-Wheel', detail: 'Effortless Agility' },
            ].map((spec, i) => (
              <div key={i} className="bg-[#151515] p-12 flex flex-col items-center text-center gap-3 spec-card-luxury">
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-medium font-body mb-2">{spec.label}</span>
                <span className="text-3xl md:text-[40px] font-light text-white font-serif-display tracking-tight leading-none">{spec.value}</span>
                <span className="text-[12px] text-white/40 font-light mt-1 font-body tracking-wide">{spec.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* React Card Stack Gallery */}
      <section id="gallery" className="bg-[#0a0a0a] overflow-hidden py-40 section-divider">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-8 block font-medium font-body gsap-reveal-up">The Perspective</span>
          <h2 className="font-serif-display text-5xl md:text-[72px] font-normal text-white mb-6 tracking-tight gsap-reveal-up">Gallery</h2>
        </div>
        <div className="gsap-reveal-scale">
          <CardStack />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] w-full py-24 px-12 border-t border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1920px] mx-auto opacity-80 gap-16 md:gap-0 relative z-10 gsap-fade">
          <div className="flex items-center gap-6">
            <img src="/rolls-royce.svg" alt="Rolls-Royce" className="h-10 w-auto invert opacity-50" />
            <div className="w-px h-8 bg-white/10"></div>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-body font-medium">Ghost View</span>
          </div>
          <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium font-body text-white/40">
            <a href="#" className="link-luxury hover:text-white transition-colors duration-500">Privacy Policy</a>
            <a href="#" className="link-luxury hover:text-white transition-colors duration-500">Terms of Use</a>
            <a href="#" className="link-luxury hover:text-white transition-colors duration-500">Cookies</a>
          </div>
          <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] font-medium font-body">© 2024 GHOST VIEW. AN INTERACTIVE EXPERIENCE.</p>
        </div>
      </footer>

    </main>
  );
}
