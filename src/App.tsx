import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero';
import StackedSections from './components/StackedSections';
import WorksIndex from './components/WorksIndex';
import CustomCursor from './components/CustomCursor';
import SvgFilters from './components/SvgFilters';
import { SECTIONS } from './data/constants';
import { TRANSLATIONS } from './data/translations';
import ExpertiseModal from './components/ExpertiseModal';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';

const App: React.FC = () => {
  const [isIndexVisible, setIsIndexVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [lang, setLang] = useState<'EN' | 'PT'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang && ['EN', 'PT'].includes(urlLang.toUpperCase())) {
        return urlLang.toUpperCase() as 'EN' | 'PT';
      }
    }
    return 'PT';
  });
  const [isAnySectionExpanded, setIsAnySectionExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpertiseOpen, setIsExpertiseOpen] = useState(false);
  const isEmbeddedExperience = new URLSearchParams(window.location.search).has('experience');

  const t = TRANSLATIONS[lang];

  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Synchronize audio element play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4; // Set background audio volume to a comfortable level (40%)
    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio autoplay prevented. Waiting for user interaction.", err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle browser autoplay policy by starting audio on first interaction
  useEffect(() => {
    const startPlay = () => {
      const audio = audioRef.current;
      if (audio && isPlaying && audio.paused) {
        audio.play().catch((err) => {
          console.log("Audio play on user interaction failed:", err);
        });
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', startPlay);
      window.removeEventListener('keydown', startPlay);
      window.removeEventListener('touchstart', startPlay);
    };

    window.addEventListener('click', startPlay);
    window.addEventListener('keydown', startPlay);
    window.addEventListener('touchstart', startPlay);

    return () => {
      cleanupListeners();
    };
  }, [isPlaying]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isEmbeddedExperience) return;
    // Standard IntersectionObserver doesn't work well with GSAP-pinned stacked sections
    // because pinned sections stay 'intersecting' even when visually covered.
    const triggers: ScrollTrigger[] = [];

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        const st = ScrollTrigger.create({
          trigger: element,
          start: 'top 30%',
          end: 'bottom 70%',
          onEnter: () => setActiveSectionId(section.id),
          onEnterBack: () => setActiveSectionId(section.id),
          onLeave: () => setActiveSectionId(null),
          onLeaveBack: () => setActiveSectionId(null),
        });
        triggers.push(st);
      }
    });

    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      setIsIndexVisible(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      triggers.forEach((st) => st.kill());
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#expertise') {
        setIsExpertiseOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#about') {
        setTimeout(() => scrollToSection('section_about'), 600);
      } else if (hash === '#contact') {
        setTimeout(() => scrollToSection('section_contact'), 600);
      }
    };

    // Delay run on mount to ensure GSAP and DOM elements are fully initialized
    const timeoutId = setTimeout(handleHash, 800);

    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black md:cursor-none">
      <SvgFilters />
      <CustomCursor />
      <ExpertiseModal isOpen={isExpertiseOpen} onClose={() => setIsExpertiseOpen(false)} lang={lang} />

      <audio
        ref={audioRef}
        src="/assets/audio/mv_portfolio_final_audio.mp3"
        loop
        preload="auto"
      />

      {/* Floating Audio Toggle Button */}
      {!isEmbeddedExperience && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          onClick={() => setIsPlaying(prev => !prev)}
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[60] flex items-center gap-3 px-4 py-2.5 rounded-full bg-white hover:bg-white/90 border border-white/20 transition-all pointer-events-auto group shadow-lg shadow-black/50 md:cursor-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? "Mute Background Music" : "Unmute Background Music"}
        >
          {/* Animated Waveform */}
          <div className="flex items-end gap-[3px] h-3 w-3.5 justify-center overflow-hidden">
            <motion.span
              animate={isPlaying ? { height: ["30%", "100%", "30%"] } : { height: "30%" }}
              transition={isPlaying ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : {}}
              className="w-[2px] bg-charcoal group-hover:bg-black rounded-full transition-colors"
            />
            <motion.span
              animate={isPlaying ? { height: ["50%", "100%", "50%"] } : { height: "50%" }}
              transition={isPlaying ? { duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 } : {}}
              className="w-[2px] bg-charcoal group-hover:bg-black rounded-full transition-colors"
            />
            <motion.span
              animate={isPlaying ? { height: ["20%", "100%", "20%"] } : { height: "20%" }}
              transition={isPlaying ? { duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 } : {}}
              className="w-[2px] bg-charcoal group-hover:bg-black rounded-full transition-colors"
            />
          </div>

          {/* Text indicator */}
          <span className="text-[10px] font-mono tracking-widest text-charcoal group-hover:text-black uppercase transition-colors select-none">
            {isPlaying ? t.audio.on : t.audio.off}
          </span>
        </motion.button>
      )}

      {/* Fixed UI - Hidden on Hero or when a section is expanded */}

      {/* Header / Logo Fixed */}
      {!isEmbeddedExperience && (
        <motion.header
          className="fixed top-0 left-0 w-full px-4 sm:px-12 md:px-16 py-3 md:py-5 z-50 pointer-events-none bg-black/40 backdrop-blur-xl border-b border-white/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
        <div className="flex justify-between items-center">
          <div className="cursor-pointer pointer-events-auto group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.svg
                viewBox="0 0 1920 1080"
                className="h-8 md:h-[38.4px] w-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <g fill="#b0b0b0" className="transition-opacity group-hover:opacity-80">
                  <path d="M424.86,291.14c1.02,11.16-1.19,22.28-1.85,33.37-10.01,168.36-21.31,336.76-33,505-1.58,22.77-1.36,47.42-4.13,69.87-5.95,48.25-44.76,75.11-92.37,69.61l-132.51-8.99,29.99-450.51c3.07-46.01,5.15-92.05,9-138,2.16-25.8,1.74-45,20.5-65.5,28.36-30.99,59.72-24.14,97.02-22,33.91,1.95,69.33,2.85,103,6.01,1.51.14,3,.47,4.35,1.14Z" />
                  <path d="M697.96,325.03l105.96,386.54c12.5,42.4-11.69,85.42-53.92,96.94l-138.01,37.49-106.53-388.97c-9.29-44.84,10.39-80.02,53.52-94.54,38.91-13.1,87.6-25.49,127.79-35.21,1.88-.46,10.36-2.97,11.18-2.25Z" />
                  <path d="M881.5,94.04l299.47,360.49c29.61,34.48,27.99,79.47-4.96,110.98l-111.66,92.4c-1.32.24-2.1-1.14-2.88-1.89-9.68-9.42-21.33-25.61-30.45-36.55-88.98-106.73-176.67-214.56-266-321-31.21-36.14-28.65-81.31,6.5-113.45l109.97-90.98Z" />
                  <path d="M1054.06,849.09l280.39-154.14,167.05-583.95c10.52-43.7,52.14-64.24,94.87-54.88l161.66,19.34c1.55,1.16.46,1.27.22,2.26-1.35,5.49-3.04,11.03-4.54,16.49-67.07,244.01-136.55,487.45-204.95,731.05-11.58,29.34-31.64,48.25-58.74,63.26-82.44,45.64-171.49,83.3-254.34,128.66-42.39,18.03-77.87,6.18-102.49-31.87-27.56-42.59-49.97-88.88-77.36-131.64l-1.78-4.58Z" />
                </g>
              </motion.svg>
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-sm md:text-base xl:text-lg font-medium font-orbitron tracking-[0.1em] md:tracking-[0.2em] xl:tracking-[0.3em] text-white/90 group-hover:text-white transition-all flex items-baseline gap-1 whitespace-nowrap flex-shrink-0">
                MIGUEL VIRGÍLIO 
                <span className="opacity-40 font-light text-[0.8em] hidden min-[320px]:inline">STUDIO</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex gap-6 xl:gap-8 pointer-events-auto items-center">
            {/* Archviz Button */}
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              onClick={() => {
                window.location.href = '/archviz/code.html';
              }}
              className="text-sm font-mono uppercase tracking-widest text-concrete hover:text-white cursor-pointer transition-colors relative group"
            >
              {t.nav.convento}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </motion.span>

            {/* Separator */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 1.1 }}
              className="h-4 w-[1px] bg-white pointer-events-none"
            />

            {/* Other buttons */}
            {[
              { label: t.nav.expertise, key: 'expertise' },
              { label: t.nav.about, key: 'about' },
              { label: t.nav.contact, key: 'contact' }
            ].map((item, i) => (
              <motion.span
                key={item.key}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + (i * 0.1) }}
                onClick={() => {
                  if (item.key === 'expertise') {
                    setIsExpertiseOpen(true);
                  } else {
                    scrollToSection(`section_${item.key}`);
                  }
                }}
                className="text-sm font-mono uppercase tracking-widest text-concrete hover:text-white cursor-pointer transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
              </motion.span>
            ))}

            {/* Language Toggle (Desktop) */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              onClick={() => setLang(prev => prev === 'EN' ? 'PT' : 'EN')}
              className="text-sm font-mono uppercase tracking-widest text-concrete hover:text-white cursor-pointer transition-colors relative group w-6 text-center select-none"
            >
              {lang}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          </nav>

          {/* Mobile Navigation controls */}
          <div className="lg:hidden flex items-center gap-3 sm:gap-5 pointer-events-auto">
            {/* Mobile Language Toggle */}
            <button
              onClick={() => setLang(prev => prev === 'EN' ? 'PT' : 'EN')}
              className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-concrete hover:text-white cursor-pointer transition-colors relative group w-6 text-center select-none"
            >
              {lang}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </button>

            {/* Separator */}
            <span className="h-4 w-[1px] bg-white/10" />

            {/* Mobile Menu Toggle */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="text-[10px] sm:text-xs font-mono tracking-widest text-concrete uppercase select-none">
                {isMenuOpen ? (lang === 'EN' ? 'Close' : 'Fechar') : (lang === 'EN' ? 'Menu' : 'Menu')}
              </div>
              <div className="relative w-6 h-4 group cursor-pointer transition-transform duration-300 active:scale-90">
                <span className={`absolute left-0 w-full h-[1px] bg-white transition-all duration-300 ease-out ${isMenuOpen ? 'top-2 rotate-45' : 'top-0'}`}></span>
                <span className={`absolute left-0 w-full h-[1px] bg-white transition-opacity duration-300 top-2 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 w-full h-[1px] bg-white transition-all duration-300 ease-out ${isMenuOpen ? 'top-2 -rotate-45' : 'top-4'}`}></span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 min-h-screen bg-black z-[45] flex flex-col justify-center p-8 lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-6 sm:gap-8 min-[400px]:gap-12 max-w-sm mx-auto w-full">
              {/* Archviz Mobile Button */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, ease: "easeOut" }}
                className="text-lg min-[400px]:text-xl sm:text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter hover:opacity-50 transition-opacity cursor-pointer flex items-center gap-3 sm:gap-6 group"
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    window.location.href = '/archviz/code.html';
                  }, 300);
                }}
              >
                <span className="text-xs font-mono text-concrete group-hover:text-white transition-colors">01</span>
                {t.nav.convento}
              </motion.div>

              {/* Mobile Separator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 0.15 }}
                className="h-[1px] w-full bg-white/10"
              />

              {/* Other Mobile Buttons */}
              {[
                { label: t.nav.expertise, key: 'expertise' },
                { label: t.nav.about, key: 'about' },
                { label: t.nav.contact, key: 'contact' }
              ].map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  className="text-lg min-[400px]:text-xl sm:text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter hover:opacity-50 transition-opacity cursor-pointer flex items-center gap-3 sm:gap-6 group"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      if (item.key === 'expertise') {
                        setIsExpertiseOpen(true);
                      } else {
                        scrollToSection(`section_${item.key}`);
                      }
                    }, 300);
                  }}
                >
                  <span className="text-xs font-mono text-concrete group-hover:text-white transition-colors">0{i + 2}</span>
                  {item.label}
                </motion.div>
              ))}

              {/* Language selection moved to main navbar */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {!isEmbeddedExperience && <Hero lang={lang} />}

        <div className={isEmbeddedExperience ? "relative z-10 h-screen w-screen" : "relative z-10"}>
          <StackedSections
            sections={isEmbeddedExperience
              ? SECTIONS.filter(s => s.id === new URLSearchParams(window.location.search).get('experience'))
              : SECTIONS}
            lang={lang}
            onExpandChange={setIsAnySectionExpanded}
          />
          {!isEmbeddedExperience && <AboutSection lang={lang} />}
          {!isEmbeddedExperience && <ContactSection lang={lang} />}
        </div>

        {/* Footer */}
        {!isEmbeddedExperience && (
          <footer aria-label="Site footer" className="w-full py-16 md:py-24 px-6 md:px-0 bg-black border-t border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>

            {/* Social Media Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 relative z-10">
              {[
                { icon: '/assets/images/social/linkedin.svg', url: 'https://www.linkedin.com/in/mvirgilstudio/', label: 'LinkedIn' },
                { icon: '/assets/images/social/instagram.svg', url: 'https://www.instagram.com/vfxmiguel/?hl=en', label: 'Instagram' },
                { icon: '/assets/images/social/X.svg', url: 'https://x.com/miguelvfx', label: 'X' },
                { icon: '/assets/images/social/facebook.svg', url: 'https://www.facebook.com/profile.php?id=100009122059507', label: 'Facebook' },
                { icon: '/assets/images/social/youtube.svg', url: 'https://www.youtube.com/@MVirgilStudio', label: 'YouTube' },
                { icon: '/assets/images/social/vimeo.svg', url: 'https://vimeo.com/user261754571?fl=pp&fe=sh', label: 'Vimeo' },
              ].map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                  whileHover={{ scale: 1.1 }}
                  className="text-concrete hover:text-white transition-colors"
                >
                  <img src={social.icon} alt={social.label} className="w-8 h-8 md:w-10 md:h-10 opacity-60 hover:opacity-100 transition-all" />
                </motion.a>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-tech text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] text-concrete uppercase mb-2 relative z-10 px-4 md:px-0"
            >
              © {new Date().getFullYear()} {t.footer.copyright}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-mono text-[8.5px] md:text-[10px] text-concrete/40 relative z-10 max-w-[90%] md:max-w-full mx-auto"
            >
              {t.footer.tagline}
            </motion.p>
          </footer>
        )}
      </main>
    </div>
  );
};

export default App;