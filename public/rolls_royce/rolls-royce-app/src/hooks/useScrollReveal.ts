"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook that applies cinematic scroll-reveal animations to child elements.
 * Uses GSAP ScrollTrigger for GPU-accelerated, 60fps scroll animations.
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Reveal-up elements
      gsap.utils.toArray<HTMLElement>('.gsap-reveal-up').forEach((el) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'bottom 10%',
              // Play when entering, reverse when leaving (both up and down)
              toggleActions: 'play reverse play reverse',
            }
          }
        );
      });

      // Reveal-scale elements
      gsap.utils.toArray<HTMLElement>('.gsap-reveal-scale').forEach((el) => {
        gsap.fromTo(el,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse',
            }
          }
        );
      });

      // Stagger children reveal
      gsap.utils.toArray<HTMLElement>('.gsap-stagger').forEach((parent) => {
        const children = parent.children;
        gsap.fromTo(children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: parent,
              start: 'top 85%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse',
            }
          }
        );
      });

      // Parallax elements (slow scroll, purely scrub-based)
      gsap.utils.toArray<HTMLElement>('.gsap-parallax').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.15');
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true, // True links it directly to scrollbar
          }
        });
      });

      // Fade-in elements
      gsap.utils.toArray<HTMLElement>('.gsap-fade').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse',
            }
          }
        );
      });

      // Horizontal line reveal (section dividers)
      gsap.utils.toArray<HTMLElement>('.gsap-line-reveal').forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.6,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse',
            }
          }
        );
      });

      // --- NEW: Scroll-based (Scrubbed) Animations ---

      // Scrub scale: Scales up based exactly on scroll position
      gsap.utils.toArray<HTMLElement>('.gsap-scrub-scale').forEach((el) => {
        gsap.fromTo(el,
          { scale: 0.8, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'center center',
              scrub: 1, // 1 second smoothing
            }
          }
        );
      });

      // Scrub fade: Fades out as you scroll past it
      gsap.utils.toArray<HTMLElement>('.gsap-scrub-blur').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });

    }, container);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

/**
 * Hook that initializes Lenis smooth scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    let lenis: any;

    const initLenis = async () => {
      const Lenis = (await import('lenis')).default;

      lenis = new Lenis({
        duration: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);
}
