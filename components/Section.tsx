import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants, useMotionValue, useMotionTemplate, AnimatePresence, useInView, useSpring, useMotionValueEvent } from 'framer-motion';
import { SectionData } from '../types';
import { INTEL_DATA } from '../constants';
import { TRANSLATIONS } from '../translations';
import VideoContainer from './VideoContainer';
import Section01Experience from './Section01Experience';
import Section02Experience from './Section02Experience';
import Section03Experience from './Section03Experience';
import Section04Experience from './Section04Experience';
import Section05Experience from './Section05Experience';
import Section06Experience from './Section06Experience';
import LottieBackground from './LottieBackground';

const PALETTE = ["#B6AE9F", "#C5C7BC", "#DEDED1", "#FBF3D1"];

const SECTION_02_VARIANTS = {
  bedroom: [
    { id: 'b01', btn: '/assets/images/s_bedroom_01_bttn.png', sphere: '/assets/images/bedroom_01.png', label: 'BDRM-01' },
    { id: 'b02', btn: '/assets/images/s_bedroom_02_bttn.png', sphere: '/assets/images/bedroom_02.png', label: 'BDRM-02' },
    { id: 'b03', btn: '/assets/images/s_bedroom_03_bttn.png', sphere: '/assets/images/bedroom_03.png', label: 'BDRM-03' },
  ],
  kitchen: [
    { id: 'k01', btn: '/assets/images/s_kitchen_01_bttn.png', sphere: '/assets/images/kitchen_01.png', label: 'KTCH-01' },
    { id: 'k02', btn: '/assets/images/s_kitchen_02_bttn.png', sphere: '/assets/images/kitchen_02.png', label: 'KTCH-02' },
    { id: 'k03', btn: '/assets/images/s_kitchen_03_bttn.png', sphere: '/assets/images/kitchen_03.png', label: 'KTCH-03' },
  ],
  livingroom: [
    { id: 'l01', btn: '/assets/images/s_livingroom_01_bttn.png', sphere: '/assets/images/livingroom_01.png', label: 'LVRM-01' },
    { id: 'l02', btn: '/assets/images/s_livingroom_02_bttn.png', sphere: '/assets/images/livingroom_02.png', label: 'LVRM-02' },
    { id: 'l03', btn: '/assets/images/s_livingroom_03_bttn.png', sphere: '/assets/images/livingroom_03.png', label: 'LVRM-03' },
  ]
};


interface SectionProps {
  data: SectionData;
  index: number;
  lang: 'EN' | 'PT';
  onExpandChange?: (isExpanded: boolean) => void;
}

const Section: React.FC<SectionProps> = ({ data, index, lang, onExpandChange }) => {
  const t = TRANSLATIONS[lang];
  const sectionT = t.sections[data.id as keyof typeof t.sections];

  const renderTitle = (isSmall = false) => {
    return (
      <div className="w-full overflow-visible" style={{ maxWidth: isMobile ? '100%' : '75vw' }}>
        {data.id === 'section_01' ? (
          <motion.h3
            className={`${isSmall ? 'text-3xl' : 'text-4xl md:text-5xl lg:text-5xl'} font-display font-semibold text-gray-800 leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-start gap-1`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(7vw, 9vh), 4rem)' } : undefined}
          >
            {sectionT.titleLines.map((word, wordIndex) => (
              <motion.div
                key={wordIndex}
                className="block whitespace-nowrap"
                initial={isSmall ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: isSmall ? 0 : wordIndex * 0.1 }}
              >
                <span className="chromatic-aberration">{word}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : data.id === 'section_02' ? (
          <motion.h3
            className={`${isSmall ? 'text-3xl' : 'text-4xl md:text-5xl lg:text-5xl'} font-display font-semibold text-gray-800 leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-start gap-2`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(7vw, 9vh), 4.5rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="block whitespace-nowrap"
                initial={isSmall ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: isSmall ? 0 : lineIndex * 0.2 }}
              >
                <span className="chromatic-aberration">{line}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : data.id === 'section_03' ? (
          <motion.h3
            className={`${isSmall ? 'text-4xl' : 'text-5xl md:text-6xl lg:text-6xl'} font-display font-semibold text-gray-800 leading-[1.1] tracking-tighter uppercase cursor-pointer flex flex-col items-start gap-0`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(8vw, 10vh), 5rem)' } : undefined}
          >
            {sectionT.titleLines.map((word, wordIndex) => (
              <div key={wordIndex} className="block relative group/word py-2">
                <div className="inline-flex">
                  {word.split('').map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      className="inline-block relative"
                      initial={isSmall ? { opacity: 1 } : {
                        opacity: 0,
                        rotateY: -90,
                        z: -100,
                        x: -20,
                        filter: 'brightness(2) contrast(1.5)'
                      }}
                      whileInView={{
                        opacity: 1,
                        rotateY: 0,
                        z: 0,
                        x: 0,
                        filter: 'brightness(1) contrast(1)'
                      }}
                      transition={{
                        duration: 0.8,
                        delay: isSmall ? 0 : (wordIndex * 0.15) + (charIndex * 0.03),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      viewport={{ once: false }}
                    >
                      <motion.span
                        className="inline-block relative z-10 chromatic-aberration"
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </motion.h3>
        ) : data.id === 'section_05' ? (
          <motion.h3
            className={`${isSmall ? 'text-4xl' : 'text-5xl md:text-6xl lg:text-6xl'} font-display font-bold text-gray-800 leading-[1.1] tracking-tighter uppercase cursor-pointer flex flex-wrap items-start`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(8vw, 10vh), 5.5rem)' } : undefined}
          >
            {sectionT.titleLines.map((word, wordIndex) => (
              <div key={wordIndex} className="inline-flex mr-[0.3em] py-2">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    className="relative inline-block"
                    initial={isSmall ? "visible" : "hidden"}
                    whileInView="visible"
                    viewport={{ once: false }}
                  >
                    <motion.span
                      className="relative z-10 inline-block chromatic-aberration"
                      variants={{
                        hidden: { opacity: 0, scale: 1.5, y: 20 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            duration: 0.6,
                            delay: isSmall ? 0 : (wordIndex * 0.2) + (charIndex * 0.05) + 0.4,
                            ease: "easeOut"
                          }
                        }
                      }}
                    >
                      {char}
                    </motion.span>
                  </motion.span>
                ))}
              </div>
            ))}
          </motion.h3>
        ) : data.id === 'section_06' ? (
          <motion.h3
            className={`${isSmall ? 'text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-display font-bold text-gray-800 leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-start gap-2`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(8vw, 10vh), 5rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <div key={lineIndex} className="block whitespace-nowrap overflow-visible relative">
                <div className="inline-flex relative">
                  {line.split('').map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      className="inline-block relative"
                      initial={isSmall ? "visible" : "hidden"}
                      whileInView="visible"
                      viewport={{ once: false }}
                    >
                      <motion.span
                        className="relative z-20 inline-block text-gray-800"
                        variants={{
                          hidden: { opacity: 0, filter: 'blur(10px)', scale: 0.9 },
                          visible: {
                            opacity: 1,
                            filter: 'blur(0px)',
                            scale: 1,
                            transition: {
                              duration: 0.4,
                              delay: isSmall ? 0 : (lineIndex * 0.4) + (charIndex * 0.05) + 0.6,
                              ease: "easeOut"
                            }
                          }
                        }}
                      >
                        <span className="chromatic-aberration">
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      </motion.span>
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </motion.h3>
        ) : data.id === 'section_04' ? (
          <motion.h3
            className={`${isSmall ? 'text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-display font-semibold text-gray-800 leading-[1.1] tracking-tight uppercase cursor-pointer flex flex-col items-start gap-2`}
            style={!isSmall ? { fontSize: 'clamp(1.5rem, min(7vw, 9vh), 4.5rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="block whitespace-nowrap"
                initial={isSmall ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1, delay: isSmall ? 0 : lineIndex * 0.2 }}
              >
                <span className="chromatic-aberration">{line}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : (
          <motion.h3
            className={`${isSmall ? 'text-4xl' : 'text-5xl md:text-7xl lg:text-9xl'} font-display font-semibold text-gray-800 leading-tight tracking-tight uppercase cursor-pointer transition-all duration-300 ${theme === 'glitch' ? 'hover:skew-x-12' : 'hover:tracking-widest'}`}
          >
            {sectionT.title.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-[0.3em] overflow-hidden">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0, transition: { duration: 0.8, delay: i * 0.1, ease: animConfig.easing } }
                  }}
                  initial={isSmall ? "visible" : "hidden"}
                  whileInView="visible"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h3>
        )}
      </div>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const isAlternate = index % 2 !== 0;
  const [hoveredIntel, setHoveredIntel] = useState<string | null>(null);
  const [intelOffset, setIntelOffset] = useState({ x: 0, y: 0 });
  const [pinnedPos, setPinnedPos] = useState({ left: '75%', top: '50%' });
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeModelId, setActiveModelId] = useState('print01');
  const [s02Category, setS02Category] = useState<keyof typeof SECTION_02_VARIANTS>('bedroom');
  const [s02ActiveTexture, setS02ActiveTexture] = useState('/assets/images/bedroom_01.png');

  useEffect(() => {
    onExpandChange?.(isExpanded);
    // Reset animation to frame 1 when entering section 06 experience
    if (isExpanded && data.id === 'section_06') {
      setScrollProgress(0);
    }
  }, [isExpanded, onExpandChange, data.id]);

  const isInView = useInView(containerRef, { margin: "-15%", once: false });

  // Auto-collapse when section goes out of view
  useEffect(() => {
    if (!isInView && isExpanded) {
      setIsExpanded(false);
    }
  }, [isInView, isExpanded]);

  // Wheel scrubbing for Section 06 experience
  useEffect(() => {
    if (!isExpanded || data.id !== 'section_06') return;

    const handleWheel = (e: WheelEvent) => {
      // If we are in the experience, use wheel to scrub the lottie
      setScrollProgress(prev => {
        const next = Math.min(Math.max(prev + (e.deltaY * 0.0005), 0), 1);
        return next;
      });

      // Stop page scroll while in 3D scrubbing mode
      if (e.cancelable) e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isExpanded, data.id]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleIntelHover = (item: string | null) => {
    if (item && item !== hoveredIntel) {
      if (data.id === 'section_04') {
        setPinnedPos({
          left: `${10 + Math.random() * 25}%`,
          top: `${20 + Math.random() * 60}%`
        });
      } else {
        // Random direction in 360 degrees
        const angle = Math.random() * Math.PI * 2;
        const distance = data.id === 'section_01' ? 60 : 110;
        setIntelOffset({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        });
      }
    }
    setHoveredIntel(item);
  };

  // Define 4 distinct animation themes
  const THEMES = ['architect', 'glitch', 'liquid', 'cinematic'];
  const theme = THEMES[index % THEMES.length];
  const bgColor = PALETTE[index % PALETTE.length];

  // Derive pseudo-random values based on index to ensure consistency across renders
  const animConfig = useMemo(() => {
    switch (theme) {
      case 'architect':
        return {
          parallax: 15,
          stagger: 0.12,
          easing: [0.19, 1, 0.22, 1] as [number, number, number, number], // Expo out
          entry: { x: 0, y: 100, rotate: 0, scale: 1, blur: 0 },
          bgTextSkew: 0,
          lineSize: 80
        };
      case 'glitch':
        return {
          parallax: 8,
          stagger: 0.05,
          easing: [0.45, 0, 0.55, 1] as [number, number, number, number], // Stepped-ish ease
          entry: { x: -50, y: 0, rotate: 2, scale: 1.1, blur: 5 },
          bgTextSkew: 0,
          lineSize: 40
        };
      case 'liquid':
        return {
          parallax: 25,
          stagger: 0.2,
          easing: [0.68, -0.6, 0.32, 1.6] as [number, number, number, number], // Bouncy
          entry: { x: 0, y: 50, rotate: -5, scale: 0.8, blur: 0 },
          bgTextSkew: -5,
          lineSize: 120
        };
      case 'cinematic':
      default:
        return {
          parallax: 12,
          stagger: 0.15,
          easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // Smooth
          entry: { x: 0, y: 0, rotate: 0, scale: 1.05, blur: 20 },
          bgTextSkew: 0,
          lineSize: 60
        };
    }
  }, [theme]);

  // Parallax scroll hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (data.id === 'section_06' && !isExpanded) {
      // Map full 0 to 1 range for better scroll filling when browsing normally
      const mapped = Math.min(Math.max(latest, 0), 1);
      setScrollProgress(mapped);
    }
  });

  // Unique parallax for each section — spring-smoothed so pinned sections don't snap
  const springConfig = { damping: 40, stiffness: 120, mass: 0.5 };
  const yBgRaw = useTransform(scrollYProgress, [0, 1], [`${-animConfig.parallax}%`, `${animConfig.parallax}%`]);
  const yBg = useSpring(yBgRaw, springConfig) as any;
  const yContentRaw = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);
  const yContent = useSpring(yContentRaw, springConfig) as any;
  const rotateContentRaw = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -0.5 : 0.5, index % 2 === 0 ? 0.5 : -0.5]);
  const rotateContent = useSpring(rotateContentRaw, springConfig);

  // Mouse tracking for glow effect (Optimized for minimal latency)
  const mConfig = { damping: 50, stiffness: 4000, mass: 0.02 };
  const mouseX = useSpring(useMotionValue(0), mConfig);
  const mouseY = useSpring(useMotionValue(0), mConfig);
  const vMouseX = useSpring(useMotionValue(0), mConfig);
  const vMouseY = useSpring(useMotionValue(0), mConfig);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    vMouseX.set(clientX);
    vMouseY.set(clientY);
  }

  const maskImage = useMotionTemplate`radial-gradient(${theme === 'glitch' ? '150px' : '350px'} circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  // Variants for content containers
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animConfig.stagger,
        delayChildren: 0.1,
      },
    },
  };

  // Specific reveal animations based on theme
  const getRevealVariants = (delayMult = 1): Variants => {
    switch (theme) {
      case 'architect':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.8,
              ease: animConfig.easing,
              delay: delayMult * 0.1
            }
          }
        };
      case 'glitch':
        return {
          hidden: { opacity: 0, x: -20, skewX: 20 },
          visible: {
            x: 0, opacity: 1, skewX: 0,
            transition: {
              duration: 0.4,
              ease: animConfig.easing,
              repeat: 2,
              repeatType: "reverse",
              repeatDelay: 0.05,
              delay: delayMult * 0.05
            }
          }
        };
      case 'liquid':
        return {
          hidden: { scale: 0.5, opacity: 0, rotate: -10 },
          visible: { scale: 1, opacity: 1, rotate: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
        };
      case 'cinematic':
        return {
          hidden: { opacity: 0, filter: 'blur(30px)', scale: 1.1 },
          visible: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 2, ease: 'easeOut' } }
        };
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  const itemVariants = getRevealVariants();

  return (
    <section
      id={data.id}
      ref={containerRef}
      className={`relative w-full ${(data.id === 'section_06' && isExpanded) ? 'md:min-h-[400vh] min-h-screen' : 'min-h-screen md:h-screen'} border-t border-black/5`}
      style={{ backgroundColor: bgColor }}
    >
      <div className={`w-full ${(data.id === 'section_06' && isExpanded) ? 'md:sticky md:top-0 md:h-screen relative min-h-screen' : 'relative h-full'} flex flex-col overflow-hidden ${isAlternate ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        {/* Lottie Background - Section 06 specific (Global Background) */}
        <AnimatePresence>
          {data.id === 'section_06' && isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 z-[45] bg-black pointer-events-none"
            >
              <LottieBackground
                url={`/assets/3d/s06/${activeModelId}.json`}
                opacity={0.8}
                progress={scrollProgress}
                className="absolute inset-0 brightness-110 contrast-125"
              />
              {/* Scroll/Interaction Caption */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 pointer-events-none"
              >
                <AnimatePresence mode="wait">
                  {scrollProgress > 0.95 ? (
                    <motion.div
                      key="inspect"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.4em] text-accent uppercase font-bold">
                        Click & Drag to Inspect
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="fabricate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-black/50 to-transparent animate-bounce" />
                      <span className="text-[10px] font-mono tracking-[0.4em] text-gray-800/60 uppercase">
                        Scroll to Fabricate
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-[9px] font-tech text-accent/40 tracking-widest uppercase">
                  {Math.round(scrollProgress * 100)}% Complete
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`w-full md:w-[60%] pt-24 md:pt-[15vh] pb-12 md:pb-[8vh] relative flex items-start ${isAlternate ? 'md:justify-center' : 'md:justify-start'} overflow-visible group`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => handleIntelHover(null)}
        >

          {/* BACKGROUND TEXT CONTAINER */}
          <motion.div
            style={{ y: yBg }}
            className="absolute inset-0 pointer-events-none select-none z-0"
          >
            {/* Base Layer */}
            <div className="absolute inset-0 flex flex-col justify-center items-center opacity-[0.03]">
              {sectionT.backgroundText.map((text, i) => (
                <motion.h2
                  key={`base-${i}`}
                  style={{ skewX: animConfig.bgTextSkew }}
                  initial={
                    data.id === 'section_02' ? { opacity: 0, x: -100 } :
                      data.id === 'section_03' ? { opacity: 0, x: 100 } :
                        data.id === 'section_04' ? { opacity: 0, y: 50, filter: 'blur(10px)' } :
                          data.id === 'section_05' ? { opacity: 0, scale: 2, z: -500, rotateX: 45, rotateY: -30, filter: 'blur(20px)' } :
                            data.id === 'section_06' ? { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', y: 50 } : {}
                  }
                  animate={
                    isInView ? (
                      data.id === 'section_02' ? { opacity: 1, x: 0 } :
                        data.id === 'section_03' ? { opacity: 1, x: 0 } :
                          data.id === 'section_04' ? { opacity: 1, y: 0, filter: 'blur(0px)' } :
                            data.id === 'section_05' ? { opacity: 1, scale: 1, z: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' } :
                              data.id === 'section_06' ? { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0 } : { opacity: 1 }
                    ) : { opacity: 0 }
                  }
                  transition={
                    (data.id === 'section_02' || data.id === 'section_03' || data.id === 'section_04' || data.id === 'section_05' || data.id === 'section_06')
                      ? { duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' } : {}
                  }
                  viewport={{ once: false }}
                  className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-gray-800 whitespace-nowrap"
                >
                  {text}
                </motion.h2>
              ))}
            </div>

            {/* Glow Layer (Masked) */}
            <motion.div
              className={`absolute inset-0 hidden md:flex flex-col justify-center items-center ${(data.id === 'section_03' || data.id === 'section_04' || data.id === 'section_05' || data.id === 'section_06') ? 'opacity-15' : 'opacity-30'}`}
              style={{
                WebkitMaskImage: maskImage,
                maskImage: maskImage
              }}
            >
              {sectionT.backgroundText.map((text, i) => (
                <motion.h2
                  key={`glow-${i}`}
                  style={{ skewX: animConfig.bgTextSkew }}
                  initial={
                    data.id === 'section_02' ? { opacity: 0, x: -100 } :
                      data.id === 'section_03' ? { opacity: 0, x: 100 } :
                        data.id === 'section_04' ? { opacity: 0, y: 50, filter: 'blur(10px)' } :
                          data.id === 'section_05' ? { opacity: 0, scale: 2, z: -500, rotateX: 45, rotateY: -30, filter: 'blur(20px)' } :
                            data.id === 'section_06' ? { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', y: 50 } : {}
                  }
                  animate={
                    isInView ? (
                      data.id === 'section_02' ? { opacity: 1, x: 0 } :
                        data.id === 'section_03' ? { opacity: 1, x: 0 } :
                          data.id === 'section_04' ? { opacity: 1, y: 0, filter: 'blur(0px)' } :
                            data.id === 'section_05' ? { opacity: 1, scale: 1, z: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' } :
                              data.id === 'section_06' ? { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0 } : { opacity: 1 }
                    ) : { opacity: 0 }
                  }
                  transition={
                    (data.id === 'section_02' || data.id === 'section_03' || data.id === 'section_04' || data.id === 'section_05' || data.id === 'section_06')
                      ? { duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' } : {}
                  }
                  viewport={{ once: false }}
                  className={`text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-gray-800 whitespace-nowrap ${theme === 'glitch' ? 'drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]' : 'drop-shadow-[0_0_25px_rgba(0,0,0,0.1)]'}`}
                >
                  {text}
                </motion.h2>
              ))}
            </motion.div>

            {/* Lighting Layer (Section 02 exclusive sweep) */}
            {data.id === 'section_02' && (
              <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-20">
                {sectionT.backgroundText.map((text, i) => (
                  <div key={`light-wrap-${i}`} className="relative">
                    {/* Base Text with Gradient Sweep */}
                    <motion.h2
                      className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/20 to-transparent bg-[length:300%_100%]"
                      animate={{
                        backgroundPosition: ["150% 0", "-150% 0"]
                      }}
                      transition={{
                        backgroundPosition: {
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 1 + i * 0.5
                        }
                      }}
                    >
                      {text}
                    </motion.h2>
                  </div>
                ))}
              </div>
            )}

            {/* Lighting Layer (Section 03 exclusive scanner) */}
            {data.id === 'section_03' && (
              <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-15">
                {sectionT.backgroundText.map((text, i) => (
                  <div key={`scanner-wrap-${i}`} className="relative group">
                    {/* The Scanning Bar Text */}
                    <motion.h2
                      initial={{ opacity: 0, x: 100 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/40 to-transparent bg-[length:200%_100%]"
                      animate={{
                        backgroundPosition: ["-100% 0", "100% 0"]
                      }}
                      transition={{
                        x: { duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' },
                        opacity: { duration: 1, delay: 0.2 + i * 0.1 },
                        backgroundPosition: {
                          duration: 3,
                          repeat: Infinity,
                          ease: [0.4, 0, 0.2, 1],
                          delay: 1 + i * 0.8
                        }
                      }}
                    >
                      {text}
                    </motion.h2>

                    {/* High-frequency Data Flicker (Simplified) */}
                    <motion.h2
                      animate={{
                        opacity: [0, 0.4, 0, 0.2, 0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 5,
                      }}
                      className="absolute inset-0 text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-gray-800/10 whitespace-nowrap pointer-events-none"
                    >
                      {text}
                    </motion.h2>

                    {/* Vertical Scanner Accent */}
                    <motion.div
                      className="absolute inset-y-0 w-[2px] bg-black/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] z-10 pointer-events-none"
                      animate={{
                        left: ["-10%", "110%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 1 + i * 0.8
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Lighting Layer (Section 04 exclusive neural pulse) */}
            {data.id === 'section_04' && (
              <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-15">
                {sectionT.backgroundText.map((text, i) => (
                  <div key={`neural-wrap-${i}`} className="relative">
                    <motion.h2
                      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/20 to-transparent bg-[length:200%_100%]"
                      animate={{
                        backgroundPosition: ["0% 0", "200% 0"],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        x: { duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' },
                        backgroundPosition: {
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5
                        },
                        opacity: {
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.3
                        }
                      }}
                    >
                      {text}
                    </motion.h2>

                    {/* Neural Spark Layer (Simplified to words instead of characters) */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <h2 className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-gray-800/10 whitespace-nowrap pointer-events-none">
                        {text}
                      </h2>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
            {/* Lighting Layer (Section 05 exclusive prismatic grid) */}
            {data.id === 'section_05' && (
              <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-15">
                {sectionT.backgroundText.map((text, i) => (
                  <div key={`grid-wrap-${i}`} className="relative group">
                    {/* Prismatic Mesh Shimmer */}
                    <motion.h2
                      initial={{ opacity: 0, scale: 1.2 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-transparent whitespace-nowrap bg-clip-text bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(0,0,0,0.3)_0%,_transparent_50%)] bg-[length:200%_200%]"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {text}
                    </motion.h2>

                    {/* Intersecting Pulse Beams */}
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div
                        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                      />
                      <motion.div
                        className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-rose-400 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.5)] z-10"
                        animate={{ left: ["0%", "100%"] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
                      />
                    </div>

                    {/* simplified mesh vertex points */}
                    <div className="absolute inset-0 flex flex-wrap justify-between items-center opacity-10">
                      {[...Array(6)].map((_, j) => (
                        <motion.div
                          key={j}
                          className="w-1 h-1 bg-black/40 rounded-full"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: j * 0.5 }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Lighting Layer (Section 06 exclusive UV curing bed) */}
            {data.id === 'section_06' && (
              <>
                <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden opacity-15">
                  {sectionT.backgroundText.map((text, i) => (
                    <div key={`fabrication-wrap-${i}`} className="relative group">
                      {/* UV Scanning Mesh */}
                      <motion.h2
                        initial={{ opacity: 0, scale: 1.2 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-[12vw] md:text-[8vw] lg:text-[10vw] font-tech font-bold leading-[0.85] tracking-tight text-transparent whitespace-nowrap bg-clip-text bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(0,0,0,0.3)_0%,_transparent_50%)] bg-[length:200%_200%]"
                        animate={{
                          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        {text}
                      </motion.h2>

                      {/* High-speed Laser Paths */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, lIdx) => (
                          <motion.div
                            key={lIdx}
                            className="absolute bg-black shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                            style={{
                              width: Math.random() * 20 + 10,
                              height: 1,
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`
                            }}
                            animate={{
                              opacity: [0, 0.8, 0],
                              scaleX: [0, 1.5, 0],
                              x: [0, 100, 0]
                            }}
                            transition={{
                              duration: 0.8 + Math.random(),
                              repeat: Infinity,
                              delay: Math.random() * 3
                            }}
                          />
                        ))}
                      </div>

                      {/* Fabrication Hotspots (Simplified count) */}
                      <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-20">
                        {[...Array(4)].map((_, hIdx) => (
                          <motion.div
                            key={hIdx}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0, 0.4, 0]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: hIdx * 0.5
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* FOREGROUND CONTENT */}
          <motion.div
            style={{ y: yContent, rotate: theme === 'architect' ? 0 : rotateContent }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: isMobile ? "-5%" : "-15%" }}
            className={`relative z-20 w-full ${isAlternate ? 'max-w-3xl md:pl-12 md:pr-20 lg:pr-[280px]' : 'max-w-2xl md:pl-20 md:pr-12'} px-8 flex flex-col gap-6 md:gap-[4vh] mt-8 md:mt-0`}
          >
            {/* Main Title / Section Index Transition Block */}
            {!isExpanded ? (
              <motion.div
                layoutId={`section-title-${data.id}`}
                className="w-full origin-left flex flex-col gap-4"
              >
                {/* Section Index Indicator */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: animConfig.lineSize }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-[1px] bg-black/40"
                  />
                  <span className="text-xs font-mono text-gray-800/60">0{index + 1}</span>
                </motion.div>

                <div className="w-full">
                  {renderTitle()}
                </div>
              </motion.div>
            ) : (
              <div className="h-32 w-full" />
            )}

            {/* Interaction Toggle Button - Uniformly moved up for all sections */}
            {!isExpanded && (
              <motion.div
                layoutId={`interaction-button-${data.id}`}
                onClick={() => setIsExpanded(true)}
                className="mt-4 md:mt-2 pointer-events-auto flex items-center gap-6 group cursor-pointer w-fit"
              >
                <motion.div
                  className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:border-black/50 bg-black/5 backdrop-blur-sm transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`bg-black rounded-full ${theme === 'glitch' ? 'w-full h-[1px]' : 'w-1.5 h-1.5'}`}
                    animate={theme === 'glitch' ? { opacity: [0, 1, 0] } : { scale: [1, 1.8, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: isMobile ? 0.8 : 0.5, x: 0 } : { opacity: 0, x: -10 }}
                  whileHover={!isMobile ? { opacity: 1, x: 5 } : {}}
                  transition={{ duration: 0.8 }}
                  className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-gray-800 uppercase pointer-events-none"
                >
                  {t.ui?.enterExperience || "ENTER EXPERIENCE"}
                </motion.span>
              </motion.div>
            )}

            {/* Capability List */}
            <motion.ul
              animate={{ opacity: isExpanded ? 0 : 1, x: isExpanded ? -20 : 0, pointerEvents: isExpanded ? 'none' : 'auto' }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 border-l-2 border-black/20 pl-8 max-w-2xl"
            >
              {data.description.map((item, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  className="flex flex-col gap-2 group cursor-default"
                >
                  <span className="text-sm md:text-base font-tech font-bold tracking-widest text-gray-800 uppercase group-hover:text-gray-950 transition-colors duration-300">
                    {t.intel[item as keyof typeof t.intel]?.title || item}
                  </span>
                  <p className="text-[11px] md:text-xs font-sans text-gray-800/70 leading-relaxed tracking-wide normal-case opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {t.intel[item as keyof typeof t.intel]?.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Grid Overlay */}
          {!isExpanded && data.id !== 'section_06' && (
            <div className={`absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none ${theme === 'glitch' ? 'opacity-[0.25]' : 'opacity-[0.1]'}`}></div>
          )}
        </div>

        {/* Corner Overlay - Outside of transforms for Title and Button */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {data.id === 'section_01' && <Section01Experience />}
              {data.id === 'section_02' && <Section02Experience textureUrl={s02ActiveTexture} />}
              {data.id === 'section_03' && <Section03Experience />}
              {data.id === 'section_04' && <Section04Experience />}
              {data.id === 'section_05' && <Section05Experience />}
              {data.id === 'section_06' && <Section06Experience scrollProgress={scrollProgress} modelId={activeModelId} />}
              {/* Expanded Title & Index */}

              <motion.div
                layoutId={`section-title-${data.id}`}
                style={{
                  position: 'absolute',
                  top: isMobile ? '60px' : '100px',
                  left: isMobile ? '44px' : '60px',
                  right: 'auto',
                  width: isMobile ? '80%' : '45%',
                  zIndex: 3001,
                  opacity: 0.8,
                  transformOrigin: 'left top'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none flex flex-col gap-4"
              >
                {/* Section Index Indicator (Expanded Mode) */}
                <div className="flex items-center gap-4 opacity-60 scale-75 origin-left">
                  <div
                    className="h-[1px] bg-black/40"
                    style={{ width: isMobile ? '30px' : '50px' }}
                  />
                  <span className="text-xs font-mono text-gray-800/60">0{index + 1}</span>
                </div>
                <div>
                  {renderTitle(true)}
                </div>
              </motion.div>

              {/* Expanded Toggle Button */}
              <motion.div
                layoutId={`interaction-button-${data.id}`}
                style={{
                  position: 'absolute',
                  top: isMobile ? '220px' : '320px',
                  left: isMobile ? '44px' : '60px',
                  right: 'auto',
                  zIndex: 3000
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto flex items-center gap-6 group cursor-pointer"
              >
                <motion.div
                  onClick={() => setIsExpanded(false)}
                  className="w-12 h-12 rounded-full border border-black flex items-center justify-center cursor-pointer bg-white/60 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.1)] rotate-45 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`bg-black rounded-full ${theme === 'glitch' ? 'w-full h-[1px]' : 'w-1.5 h-1.5'} scale-[1.5]`} />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-gray-800 uppercase pointer-events-none"
                >
                  {t.ui?.exitExperience || "EXIT EXPERIENCE"}
                </motion.span>
              </motion.div>

              {/* Model Select Buttons for Section 06 */}
              {data.id === 'section_06' && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="fixed left-[400px] top-[320px] z-[3001] flex flex-col gap-3 pointer-events-auto"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-[1px] bg-accent/30" />
                    <span className="text-[9px] font-mono tracking-widest text-concrete uppercase opacity-60 font-bold">Select Prototype</span>
                  </div>

                  <div className="flex flex-row gap-4">
                    {[
                      { id: 'print01', img: '/assets/images/print_01_bttn.png', label: 'PRT-ALPHA' },
                      { id: 'print02', img: '/assets/images/print_02_bttn.png', label: 'PRT-BETA' },
                      { id: 'print03', img: '/assets/images/print_03_bttn.png', label: 'PRT-GAMMA' }
                    ].map((btn) => (
                      <motion.div
                        key={btn.id}
                        onClick={() => {
                          setActiveModelId(btn.id);
                          setScrollProgress(0); // Reset animation when switching
                        }}
                        className="group relative cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-14 h-14 md:w-16 md:h-16 p-0.5 rounded-lg border transition-all duration-500 overflow-hidden ${activeModelId === btn.id ? 'border-accent shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-accent/5' : 'border-black/10 grayscale hover:grayscale-0 bg-black/5'}`}>
                          <img src={btn.img} alt={btn.label} className="w-full h-full object-cover rounded-md" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Category & Texture Select Buttons for Section 02 */}
              {data.id === 'section_02' && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="fixed left-[60px] md:left-[400px] top-[400px] md:top-[320px] z-[3001] flex flex-col gap-6 pointer-events-auto"
                >
                  {/* Category Selection */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-[1px] bg-accent/30" />
                      <span className="text-[9px] font-mono tracking-widest text-concrete uppercase opacity-60 font-bold">Select Category</span>
                    </div>
                    <div className="flex flex-row gap-2">
                      {(Object.keys(SECTION_02_VARIANTS) as Array<keyof typeof SECTION_02_VARIANTS>).map((cat) => (
                        <motion.button
                          key={cat}
                          onClick={() => {
                            setS02Category(cat);
                            setS02ActiveTexture(SECTION_02_VARIANTS[cat][0].sphere);
                          }}
                          className={`px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-mono tracking-widest border transition-all duration-300 ${s02Category === cat ? 'bg-black text-gray-800 border-black' : 'bg-transparent text-gray-800 border-black/20 hover:border-black/50'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {cat.toUpperCase()}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Texture Selection */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-[1px] bg-accent/30" />
                      <span className="text-[9px] font-mono tracking-widest text-concrete uppercase opacity-60 font-bold">Select Environment</span>
                    </div>
                    <div className="flex flex-row gap-4">
                      {SECTION_02_VARIANTS[s02Category].map((item) => (
                        <motion.div
                          key={item.id}
                          onClick={() => setS02ActiveTexture(item.sphere)}
                          className="group relative cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`w-14 h-14 md:w-16 md:h-16 p-0.5 rounded-lg border transition-all duration-500 overflow-hidden ${s02ActiveTexture === item.sphere ? 'border-accent shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-accent/5' : 'border-black/10 grayscale hover:grayscale-0 bg-black/5'}`}>
                            <img src={item.btn} alt={item.label} className="w-full h-full object-cover rounded-md" />
                          </div>
                          <div className="mt-2 text-[8px] font-mono text-center tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                            {item.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Section;