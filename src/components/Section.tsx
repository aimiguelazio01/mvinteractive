import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants, useMotionValue, useMotionTemplate, AnimatePresence, useInView, useSpring, useMotionValueEvent, animate } from 'framer-motion';
import { SectionData } from '../types';
import { INTEL_DATA, SECTION_ACCENTS } from '../data/constants';
import { TRANSLATIONS } from '../data/translations';
import VideoContainer from './VideoContainer';
import Section01Experience from './Section01Experience';
import Section02Experience from './Section02Experience';
import Section03Experience from './Section03Experience';
import Section04Experience from './Section04Experience';
import Section05Experience from './Section05Experience';
import Section06Experience from './Section06Experience';
import LottieBackground from './LottieBackground';
import { Accordion05 } from './ui/accordion-05';
import WorksIndex from './WorksIndex';

const PALETTE = ["#141211", "#080a0f", "#130f0c", "#0a0d14", "#0e0a12", "#12110c"];

const SECTION_02_VARIANTS = {
  bedroom: [
    { id: 'b01', btn: '/assets/images/s_bedroom_01_bttn.png', sphere: '/assets/images/bedroom_01.jpg', label: 'BDRM-01' },
    { id: 'b02', btn: '/assets/images/s_bedroom_02_bttn.png', sphere: '/assets/images/bedroom_02.jpg', label: 'BDRM-02' },
    { id: 'b03', btn: '/assets/images/s_bedroom_03_bttn.png', sphere: '/assets/images/bedroom_03.jpg', label: 'BDRM-03' },
  ],
  kitchen: [
    { id: 'k01', btn: '/assets/images/s_kitchen_01_bttn.png', sphere: '/assets/images/kitchen_01.jpg', label: 'KTCH-01' },
    { id: 'k02', btn: '/assets/images/s_kitchen_02_bttn.png', sphere: '/assets/images/kitchen_02.jpg', label: 'KTCH-02' },
    { id: 'k03', btn: '/assets/images/s_kitchen_03_bttn.png', sphere: '/assets/images/kitchen_03.jpg', label: 'KTCH-03' },
  ],
  livingroom: [
    { id: 'l01', btn: '/assets/images/s_livingroom_01_bttn.png', sphere: '/assets/images/livingroom_01.jpg', label: 'LVRM-01' },
    { id: 'l02', btn: '/assets/images/s_livingroom_02_bttn.png', sphere: '/assets/images/livingroom_02.jpg', label: 'LVRM-02' },
    { id: 'l03', btn: '/assets/images/s_livingroom_03_bttn.png', sphere: '/assets/images/livingroom_03.jpg', label: 'LVRM-03' },
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
            className={`${isSmall ? 'text-xl' : 'text-2xl md:text-3xl lg:text-3xl'} font-display font-semibold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-start gap-1`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.6rem)' : 'clamp(1rem, min(6.5vw, 8.5vh), 2.5rem)' } : undefined}
          >
            {sectionT.titleLines.map((word, wordIndex) => (
              <motion.div
                key={wordIndex}
                className="block whitespace-normal md:whitespace-nowrap"
                initial={isSmall ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: isSmall ? 0 : wordIndex * 0.1 }}
              >
                <span className={isSmall ? '' : 'chromatic-aberration'}>{word}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : data.id === 'section_02' ? (
          <motion.h3
            className={`${isSmall ? 'text-xl' : 'text-2xl md:text-3xl lg:text-3xl'} font-display font-semibold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-end gap-2`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.6rem)' : 'clamp(1rem, min(6.5vw, 8.5vh), 3rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="block whitespace-normal md:whitespace-nowrap text-right"
                initial={isSmall ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: isSmall ? 0 : lineIndex * 0.2 }}
              >
                <span className={isSmall ? '' : 'chromatic-aberration'}>{line}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : data.id === 'section_03' ? (
          <motion.h3
            className={`${isSmall ? 'text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-display font-semibold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[1.1] tracking-tighter uppercase cursor-pointer flex flex-col items-start gap-0`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.6rem)' : 'clamp(1.1rem, min(7vw, 9vh), 3.5rem)' } : undefined}
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
                        className={`inline-block relative z-10 ${isSmall ? '' : 'chromatic-aberration'}`}
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
            className={`${isSmall ? 'text-2xl' : 'text-2xl md:text-3xl lg:text-5xl'} font-display font-bold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[0.85] tracking-tighter uppercase cursor-pointer group flex flex-wrap items-start`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1.1rem, 4.8vw, 1.6rem)' : 'clamp(1.1rem, min(6.5vw, 8.5vh), 3.75rem)' } : undefined}
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
                      className={`relative z-10 inline-block ${isSmall ? '' : 'chromatic-aberration'}`}
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
            className={`${isSmall ? 'text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-display font-bold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[1.2] tracking-tight uppercase cursor-pointer flex flex-col items-end gap-2`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.6rem)' : 'clamp(1rem, min(6.5vw, 8.5vh), 3.5rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <div key={lineIndex} className="block whitespace-normal md:whitespace-nowrap overflow-visible relative text-right">
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
                        className={`relative z-20 inline-block ${isSmall ? 'text-gray-300' : 'text-gray-200'}`}
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
                        <span className={isSmall ? '' : 'chromatic-aberration'}>
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
            className={`${isSmall ? 'text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'} font-display font-semibold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[1.1] tracking-tight uppercase cursor-pointer flex flex-col items-end gap-2`}
            style={!isSmall ? { fontSize: isMobile ? 'clamp(1rem, 4.8vw, 1.6rem)' : 'clamp(1rem, min(6vw, 8vh), 3rem)' } : undefined}
          >
            {sectionT.titleLines.map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="block whitespace-normal md:whitespace-nowrap text-right"
                initial={isSmall ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1, delay: isSmall ? 0 : lineIndex * 0.2 }}
              >
                <span className={isSmall ? '' : 'chromatic-aberration'}>{line}</span>
              </motion.div>
            ))}
          </motion.h3>
        ) : (
          <motion.h3
            className={`${isSmall ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-6xl'} font-display font-bold ${isSmall ? 'text-gray-300' : 'text-gray-200'} leading-[0.85] tracking-tight uppercase cursor-pointer transition-all duration-300 ${theme === 'glitch' ? 'hover:skew-x-12' : 'hover:tracking-widest'}`}
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
  const [s02ActiveTexture, setS02ActiveTexture] = useState('/assets/images/bedroom_01.jpg');
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const [dontShowWarningAgain, setDontShowWarningAgain] = useState(false);

  const handleEnterExperience = () => {
    if (isMobile) {
      const isBypass = localStorage.getItem('mobile_3d_enabled') === 'true';
      if (isBypass) {
        setIsExpanded(true);
      } else {
        setShowPerformanceWarning(true);
      }
    } else {
      setIsExpanded(true);
    }
  };

  const handleConfirmExperience = () => {
    if (dontShowWarningAgain) {
      localStorage.setItem('mobile_3d_enabled', 'true');
    }
    setShowPerformanceWarning(false);
    setIsExpanded(true);
  };

  // Listen for query params to force expand this section's experience
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('experience') === data.id) {
      setIsExpanded(true);
    }
  }, [data.id]);

  useEffect(() => {
    onExpandChange?.(isExpanded);
    if (isExpanded && data.id === 'section_06') {
      setScrollProgress(0);
    }
  }, [isExpanded, onExpandChange, data.id]);

  const isInView = useInView(containerRef, { margin: "-15%", once: false });

  // Auto-collapse when section goes out of view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isForcedExperience = params.get('experience') === data.id;
    if (!isInView && isExpanded && !isForcedExperience) {
      setIsExpanded(false);
    }
  }, [isInView, isExpanded, data.id]);

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

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handleWheel, { capture: true });
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
  const accent = SECTION_ACCENTS[data.id] || SECTION_ACCENTS['section_01'];

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
    const val = latest as number;
    if (data.id === 'section_06' && !isExpanded) {
      // Map full 0 to 1 range for better scroll filling when browsing normally
      const mapped = Math.min(Math.max(val, 0), 1);
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

  const btnOpacityRaw = useTransform(scrollYProgress, [0, 0.4, 0.55], [0, 0, 1]);
  const btnOpacity = useSpring(btnOpacityRaw, { stiffness: 50, damping: 25 });
  const btnYRaw = useTransform(scrollYProgress, [0.4, 0.55], [40, 0]);
  const btnY = useSpring(btnYRaw, { stiffness: 50, damping: 25 });

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

  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const meshSpotlight = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.12) 0%, transparent 100%)`;

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
      className={`relative w-full min-h-screen md:h-screen border-t border-white/5 flex flex-col md:flex-row items-center justify-center overflow-hidden`}
      style={{ backgroundColor: bgColor }}
      onMouseMove={handleMouseMove}
    >
      {/* Section Background Video */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        animate={{ opacity: isExpanded ? 0 : 0.5 }}
        transition={{ duration: 0.8 }}
      >
        {(() => {
          const SECTION_VIDEOS: Record<string, string> = {
            'section_01': 'https://player.mediadelivery.net/embed/625906/bcb45b70-9e3b-474b-a431-7998c75f5c49',
            'section_02': 'https://player.mediadelivery.net/embed/625906/520fffed-d359-4181-989a-5eb79328c867',
            'section_03': 'https://player.mediadelivery.net/embed/625906/39600947-e8d0-4f23-a939-984a92e2940d',
            'section_04': 'https://player.mediadelivery.net/embed/625906/a867ba36-f0ee-4cbb-ac4a-bdc11cbade30',
            'section_05': 'https://player.mediadelivery.net/embed/625906/e4e33f4e-21ab-4d72-b5e0-1df73cf0ffe4',
            'section_06': 'https://player.mediadelivery.net/embed/625906/59572890-0b1f-4933-ad55-142f52a583ca'
          };

          const embedUrl = SECTION_VIDEOS[data.id];

          if (embedUrl) {
            return (
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                <iframe
                  src={`${embedUrl}?autoplay=true&loop=true&muted=true&preload=true&responsive=true&controls=false`}
                  loading="lazy"
                  className="absolute pointer-events-none border-0"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: '100vw',
                    height: '100vh',
                    minWidth: '177.77vh',
                    minHeight: '56.25vw',
                    transform: 'translate(-50%, -50%) scale(1.1)'
                  }}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                />
              </div>
            );
          }

          return (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src={`/assets/videos/sections/${data.id}.mp4`}
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]" style={{ '--bg': bgColor } as React.CSSProperties} />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-transparent to-transparent" style={{ '--bg': bgColor } as React.CSSProperties} />
      </motion.div>

      {/* Content-side gradient overlay for text readability */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        animate={{ opacity: isExpanded ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: isAlternate
            ? `linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)`
            : `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)`
        }}
      />

      {/* Subtle ambient accent glow */}
      <motion.div
        className="absolute z-[1] pointer-events-none"
        animate={{ opacity: isExpanded ? 0 : 0.4 }}
        transition={{ duration: 0.8 }}
        style={{
          width: '50%',
          height: '60%',
          top: '20%',
          [isAlternate ? 'right' : 'left']: '-5%',
          background: `radial-gradient(ellipse at center, rgba(${accent.rgb}, 0.08) 0%, transparent 70%)`,
          filter: 'blur(60px)'
        }}
      />

      <div className={`w-full ${(data.id === 'section_06' && isExpanded) ? 'md:sticky md:top-0 md:h-screen relative min-h-screen' : 'relative h-full'} flex flex-col overflow-hidden ${isAlternate ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        {/* Section 06 Experience and background is now fully encapsulated in Section06Experience */}

        {/* BACKGROUND TEXT CONTAINER (Relocated for true centering) */}
        <motion.div
          style={{ y: yBg }}
          className="absolute inset-0 pointer-events-none select-none z-[2]"
        >
          {/* Base Layer */}
          <div className="absolute inset-0 flex flex-col justify-center items-center opacity-[0.04]">
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
                className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-white/25 whitespace-nowrap`}
              >
                {text}
              </motion.h2>
            ))}
          </div>

          {/* Glow Layer (Masked) */}
          <motion.div
            className={`absolute inset-0 hidden md:flex flex-col justify-center items-center opacity-12`}
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
                className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-white whitespace-nowrap ${theme === 'glitch' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]'}`}
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
                    className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/20 to-transparent bg-[length:300%_100%]`}
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
                    className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/40 to-transparent bg-[length:200%_100%]`}
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
                    className={`absolute inset-0 text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-gray-800/10 whitespace-nowrap pointer-events-none`}
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
                    className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-transparent via-black/20 to-transparent bg-[length:200%_100%]`}
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
                    <h2 className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-gray-800/10 whitespace-nowrap pointer-events-none`}>
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
                    className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-transparent whitespace-nowrap bg-clip-text bg-[length:200%_200%]`}
                    style={{ backgroundImage: meshSpotlight }}
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
                      className={`text-[18vw] md:text-[13vw] lg:text-[15vw] font-tech font-bold leading-[1.2] tracking-tighter text-transparent whitespace-nowrap bg-clip-text bg-[length:200%_200%]`}
                      style={{ backgroundImage: meshSpotlight }}
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


        <div
          className={`w-full md:w-[60%] pt-16 md:pt-[2vh] lg:pt-[4vh] pb-8 md:pb-[2vh] lg:pb-[3vh] flex flex-col justify-start relative overflow-visible group`}
          onMouseLeave={() => handleIntelHover(null)}
        >
          {/* FOREGROUND CONTENT */}
          <motion.div
            style={{ y: yContent, rotate: theme === 'architect' ? 0 : rotateContent }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: isMobile ? "-5%" : "-15%" }}
            className={`relative z-20 w-full ${isAlternate ? 'max-w-3xl md:pl-12 md:pr-12 lg:pr-[80px] items-end self-end' : 'max-w-3xl md:pl-12 md:pr-20 lg:pr-[280px]'} px-8 flex flex-col gap-2 md:gap-[1.5vh] mt-4 md:mt-0`}
          >
            {/* Main Title / Section Index Transition Block */}
            {!isExpanded ? (
              <motion.div
                layoutId={`section-title-${data.id}`}
                className={`w-full sticky top-[80px] md:top-[100px] z-30 ${isAlternate ? 'origin-right px-4 md:px-8' : 'origin-left px-4 md:px-8'} flex items-start gap-4 ${isAlternate ? 'flex-row-reverse' : ''}`}
                animate={{
                  opacity: isBtnHovered ? 0.3 : 1,
                  filter: isBtnHovered ? 'blur(4px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Section Index Indicator (Now inline like accordion ID) */}
                <span className="text-sm md:text-base font-mono mt-2 shrink-0 font-bold" style={{ color: `rgba(${accent.rgb}, 0.75)` }}>0{index + 1}</span>

                <div className={`flex-1 ${isAlternate ? 'text-right' : 'text-left'}`}>
                  {renderTitle()}
                </div>
              </motion.div>
            ) : (
              <div className="h-32 w-full" />
            )}

            {/* Capability List */}
            <motion.div
              animate={{
                opacity: isExpanded ? 0 : (isBtnHovered ? 0.3 : 1),
                x: isExpanded ? -20 : 0,
                pointerEvents: isExpanded ? 'none' : 'auto',
                filter: isBtnHovered ? 'blur(4px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.4 }}
              className="flex flex-col mt-16 md:mt-24 w-full"
            >
              <Accordion05
                items={data.description.map((item, i) => ({
                  id: String(i + 1).padStart(2, '0'),
                  title: t.intel[item as keyof typeof t.intel]?.title || item,
                  content: t.intel[item as keyof typeof t.intel]?.description || ""
                }))}
                align={isAlternate ? 'right' : 'left'}
                accentRgb={accent.rgb}
              />
            </motion.div>

          </motion.div>

          {/* Grid Overlay */}
          {!isExpanded && data.id !== 'section_06' && (
            <div className={`absolute inset-0 z-10 bg-[url('/noise.svg')] mix-blend-overlay pointer-events-none ${theme === 'glitch' ? 'opacity-[0.25]' : 'opacity-[0.1]'}`}></div>
          )}
        </div>

        {!isExpanded && (
          <WorksIndex
            isVisible={isInView && !isExpanded}
            activeSectionId={data.id}
            lang={lang}
          />
        )}

        {/* Centered Interaction Toggle Button - Outside content for desktop centering, after content for mobile flow */}
        {!isExpanded && (
          <motion.div
            layoutId={`interaction-button-${data.id}`}
            style={{
              opacity: btnOpacity,
              y: isMobile ? 0 : btnY,
            }}
            onClick={handleEnterExperience}
            onHoverStart={() => setIsBtnHovered(true)}
            onHoverEnd={() => setIsBtnHovered(false)}
            className={`${isMobile ? 'relative mt-12 mb-8 mx-auto' : 'absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2'} pointer-events-auto cursor-pointer z-[40] flex flex-col items-center gap-4 group w-fit`}
          >
            {/* Icon Wrapper with enhanced Glow */}
            <motion.div
              className="w-16 h-16 md:w-18 md:h-18 rounded-full border-2 flex items-center justify-center opacity-100 backdrop-blur-md transition-all duration-300 relative z-10"
              style={{
                borderColor: `rgba(${accent.rgb}, 0.55)`,
                backgroundColor: `rgba(${accent.rgb}, 0.1)`,
                boxShadow: `0 0 35px rgba(${accent.rgb}, 0.2)`
              }}
              whileHover={{
                scale: 1.1,
                rotate: 90,
                borderColor: accent.hoverHex,
                boxShadow: `0 0 60px rgba(${accent.rgb}, 0.4)`
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`rounded-full ${theme === 'glitch' ? 'w-full h-[1px]' : 'w-2 h-2'} relative z-20`}
                style={{ backgroundColor: accent.hoverHex }}
                animate={theme === 'glitch' ? { opacity: [0, 1, 0] } : { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05, letterSpacing: '0.6em' }}
              transition={{ duration: 0.8 }}
              className={`text-[10px] md:text-sm font-mono tracking-[0.4em] uppercase pointer-events-none font-bold drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] relative z-10 ${isMobile ? 'whitespace-normal px-4 leading-relaxed' : 'whitespace-nowrap'} text-center`}
              style={{ color: accent.hoverHex }}
            >
              {((sectionT as any).enterExperience || t.ui?.enterExperience || "ENTER EXPERIENCE")}
            </motion.span>
          </motion.div>
        )}

      </div>

      {/* Expanded Experience Overlay Wrapper */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[4000]">
        <div className="sticky top-0 w-full h-screen pointer-events-none flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                {data.id === 'section_01' && <Section01Experience lang={lang} />}
                {data.id === 'section_02' && <Section02Experience textureUrl={s02ActiveTexture} lang={lang} />}
                {data.id === 'section_03' && <Section03Experience lang={lang} />}
                {data.id === 'section_04' && <Section04Experience lang={lang} />}
                {data.id === 'section_05' && <Section05Experience />}
                {data.id === 'section_06' && (
                  <Section06Experience
                    scrollProgress={scrollProgress}
                    setScrollProgress={setScrollProgress}
                    modelId={activeModelId}
                    lang={lang}
                    onModelChange={(id) => {
                      setActiveModelId(id);
                      setScrollProgress(0);
                    }}
                    onLottieLoaded={() => {
                      animate(0, 0.95, {
                        duration: 1.5,
                        ease: 'easeInOut',
                        onUpdate: (value) => setScrollProgress(value),
                      });
                    }}
                  />
                )}

                {/* Expanded Title & Index — disabled for all sections */}

                {/* Expanded Toggle Button */}
                <motion.div
                  layoutId={`interaction-button-${data.id}`}
                  style={{
                    position: 'absolute',
                    top: isMobile ? '160px' : '220px',
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
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center cursor-pointer bg-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] rotate-45 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className={`bg-white rounded-full ${theme === 'glitch' ? 'w-full h-[1px]' : 'w-1.5 h-1.5'} scale-[1.5]`} />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-gray-300 uppercase pointer-events-none"
                  >
                    {t.ui?.exitExperience || "EXIT EXPERIENCE"}
                  </motion.span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Performance Warning Modal */}
      <AnimatePresence>
        {showPerformanceWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-black/95 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden text-left"
              style={{
                boxShadow: `0 0 50px rgba(${accent.rgb}, 0.15)`
              }}
            >
              {/* Background ambient accent glow */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none animate-pulse"
                style={{
                  background: `radial-gradient(circle, rgba(${accent.rgb}, 0.2) 0%, transparent 70%)`
                }}
              />

              <div className="flex flex-col gap-2 relative z-10">
                <span className="text-[9px] font-mono tracking-[0.25em]" style={{ color: accent.hoverHex }}>
                  // SYSTEM DIAGNOSTIC
                </span>
                <h3 className="text-xl font-display font-bold text-white tracking-tight uppercase">
                  {t.ui?.perfWarningTitle || "PERFORMANCE WARNING"}
                </h3>
              </div>

              <p className="text-xs text-concrete leading-relaxed relative z-10 font-mono text-white/70">
                {t.ui?.perfWarningMsg}
              </p>

              {/* Checkbox wrapper */}
              <label className="flex items-center gap-3 cursor-pointer select-none text-[10px] text-white/50 hover:text-white/80 transition-colors py-1 relative z-10">
                <input 
                  type="checkbox" 
                  checked={dontShowWarningAgain} 
                  onChange={(e) => setDontShowWarningAgain(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center transition-colors peer-checked:border-white peer-checked:bg-white/10 shrink-0">
                  {dontShowWarningAgain && (
                    <motion.svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      className="w-2.5 h-2.5 text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                </div>
                <span className="font-mono tracking-wider">
                  {t.ui?.perfWarningRemember}
                </span>
              </label>

              {/* Buttons container */}
              <div className="flex gap-3 mt-2 relative z-10 font-mono text-[10px] tracking-widest">
                <button
                  onClick={() => setShowPerformanceWarning(false)}
                  className="flex-1 py-3 px-4 border border-white/10 rounded-lg text-concrete hover:text-white hover:bg-white/5 cursor-pointer text-center transition-all uppercase font-medium"
                >
                  {t.ui?.perfWarningCancel || "CANCEL"}
                </button>
                <button
                  onClick={handleConfirmExperience}
                  className="flex-1 py-3 px-4 rounded-lg text-black font-bold cursor-pointer text-center transition-all uppercase hover:opacity-90"
                  style={{
                    backgroundColor: accent.hoverHex,
                    boxShadow: `0 0 20px rgba(${accent.rgb}, 0.3)`
                  }}
                >
                  {t.ui?.perfWarningProceed || "PROCEED"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Section;