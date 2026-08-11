import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles, Wand2, Zap, Layers, Share2, ArrowRight } from 'lucide-react';
import { ImageComparisonSlider } from './components/ui/image-comparison-slider-vertical';
import { ColoringPopup } from './components/ColoringPopup';
import { MemoryGamePopup } from './components/MemoryGamePopup';

const Nav = ({ lang, setLang, isMenuOpen, setIsMenuOpen }: {
  lang: 'EN' | 'PT',
  setLang: (l: 'EN' | 'PT') => void,
  isMenuOpen: boolean,
  setIsMenuOpen: (o: boolean) => void
}) => (
  <motion.header
    className="fixed top-0 left-0 w-full px-6 sm:px-12 md:px-16 py-3 md:py-5 z-[100] mix-blend-difference pointer-events-none bg-neutral-800/80 backdrop-blur-md grayscale-[10%]"
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
  >
    <div className="flex justify-between items-center">
      <a href="/" className="cursor-pointer pointer-events-auto group no-underline">
        <div className="flex items-center gap-2 sm:gap-3">
          <svg
            viewBox="0 0 1920 1080"
            className="h-8 md:h-[38.4px] w-auto transition-transform hover:scale-105"
          >
            <g fill="#b0b0b0" className="transition-opacity group-hover:opacity-80">
              <path d="M424.86,291.14c1.02,11.16-1.19,22.28-1.85,33.37-10.01,168.36-21.31,336.76-33,505-1.58,22.77-1.36,47.42-4.13,69.87-5.95,48.25-44.76,75.11-92.37,69.61l-132.51-8.99,29.99-450.51c3.07-46.01,5.15-92.05,9-138,2.16-25.8,1.74-45,20.5-65.5,28.36-30.99,59.72-24.14,97.02-22,33.91,1.95,69.33,2.85,103,6.01,1.51.14,3,.47,4.35,1.14Z" />
              <path d="M697.96,325.03l105.96,386.54c12.5,42.4-11.69,85.42-53.92,96.94l-138.01,37.49-106.53-388.97c-9.29-44.84,10.39-80.02,53.52-94.54,38.91-13.1,87.6-25.49,127.79-35.21,1.88-.46,10.36-2.97,11.18-2.25Z" />
              <path d="M881.5,94.04l299.47,360.49c29.61,34.48,27.99,79.47-4.96,110.98l-111.66,92.4c-1.32.24-2.1-1.14-2.88-1.89-9.68-9.42-21.33-25.61-30.45-36.55-88.98-106.73-176.67-214.56-266-321-31.21-36.14-28.65-81.31,6.5-113.45l109.97-90.98Z" />
              <path d="M1054.06,849.09l280.39-154.14,167.05-583.95c10.52-43.7,52.14-64.24,94.87-54.88l161.66,19.34c1.55,1.16.46,1.27.22,2.26-1.35,5.49-3.04,11.03-4.54,16.49-67.07,244.01-136.55,487.45-204.95,731.05-11.58,29.34-31.64,48.25-58.74,63.26-82.44,45.64-171.49,83.3-254.34,128.66-42.39,18.03-77.87,6.18-102.49-31.87-27.56-42.59-49.97-88.88-77.36-131.64l-1.78-4.58Z" />
            </g>
          </svg>
          <span className="text-[10px] sm:text-sm md:text-base xl:text-lg font-medium font-orbitron tracking-[0.1em] md:tracking-[0.2em] xl:tracking-[0.3em] text-[#b0b0b0] group-hover:opacity-80 transition-opacity hidden min-[400px]:block whitespace-nowrap flex-shrink-0 uppercase">MIGUEL VIRGÍLIO <span className="opacity-60 font-light text-[0.85em]">STUDIO</span></span>
        </div>
      </a>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex gap-6 xl:gap-8 pointer-events-auto items-center">
        {[
          { label: lang === 'PT' ? 'ESPECIALIDADE' : 'EXPERTISE', hash: '/#expertise' },
          { label: lang === 'PT' ? 'SOBRE' : 'ABOUT', hash: '/#about' },
          { label: lang === 'PT' ? 'CONTACTO' : 'CONTACT', hash: '/#contact' }
        ].map((item, i) => (
          <a
            key={item.label}
            href={item.hash}
            className="text-sm font-mono uppercase tracking-widest text-[#b0b0b0] hover:text-white transition-colors relative group pointer-events-auto no-underline"
          >
            {item.label}
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        ))}

        {/* Language Toggle (Desktop) */}
        <span
          onClick={() => setLang(lang === 'EN' ? 'PT' : 'EN')}
          className="text-sm font-mono uppercase tracking-widest text-[#b0b0b0] hover:text-white cursor-pointer transition-colors relative group w-6 text-center pointer-events-auto"
        >
          {lang}
          <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
        </span>
      </div>

      {/* Mobile Menu Toggle */}
      <div
        className="lg:hidden flex items-center gap-2 sm:gap-4 pointer-events-auto"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="text-[10px] sm:text-xs font-mono tracking-widest text-[#b0b0b0] uppercase">
          {isMenuOpen ? (lang === 'EN' ? 'Close' : 'Fechar') : (lang === 'EN' ? 'Menu' : 'Menu')}
        </div>
        <div className="relative w-6 h-4 group cursor-pointer transition-transform duration-300 active:scale-90">
          <span className={`absolute left-0 w-full h-[1px] bg-white transition-all duration-300 ease-out ${isMenuOpen ? 'top-2 rotate-45' : 'top-0'}`}></span>
          <span className={`absolute left-0 w-full h-[1px] bg-white transition-opacity duration-300 top-2 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`absolute left-0 w-full h-[1px] bg-white transition-all duration-300 ease-out ${isMenuOpen ? 'top-2 -rotate-45' : 'top-4'}`}></span>
        </div>
      </div>
    </div>
  </motion.header>
);


const FloatingImage = ({ src, className, delay = 0 }: { src: string, className: string, delay?: number }) => (
  <motion.img
    initial={{ y: 0 }}
    animate={{ y: [-15, 15, -15] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    src={src}
    className={className}
    alt="sticker"
  />
);

export default function App() {
  const [isColoringOpen, setIsColoringOpen] = useState(false);
  const [isMemoryGameOpen, setIsMemoryGameOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'PT'>('PT');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpticalInfoOpen, setIsOpticalInfoOpen] = useState(false);

  // Show optical UI only when a popup is open
  useEffect(() => {
    const opticalUI = document.getElementById('optical-ui-wrapper');
    if (isColoringOpen || isMemoryGameOpen) {
      if (opticalUI) {
        opticalUI.style.visibility = 'visible';
        opticalUI.style.opacity = '1';
        opticalUI.style.pointerEvents = 'auto'; // allow clicking the button
      }
    } else {
      if (opticalUI) {
        opticalUI.style.visibility = 'hidden';
        opticalUI.style.opacity = '0';
        opticalUI.style.pointerEvents = 'none';
      }
      // Turn off hand tracking if it is active
      if (typeof window !== 'undefined' && (window as any).disableHandTracking) {
        (window as any).disableHandTracking();
      }
    }
  }, [isColoringOpen, isMemoryGameOpen]);

  return (
    <div className="font-body selection:bg-accent selection:text-black">
      <Nav
        lang={lang}
        setLang={setLang}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 min-h-screen bg-black z-[90] flex flex-col justify-center p-8 lg:hidden"
          >
            <div className="flex flex-col gap-6 sm:gap-8 min-[400px]:gap-12 max-w-sm mx-auto w-full">
              {[
                { label: lang === 'PT' ? 'ESPECIALIDADE' : 'EXPERTISE', hash: '/#expertise' },
                { label: lang === 'PT' ? 'SOBRE' : 'ABOUT', hash: '/#about' },
                { label: lang === 'PT' ? 'CONTACTO' : 'CONTACT', hash: '/#contact' }
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.hash}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (i * 0.1), ease: "easeOut" }}
                  className="text-lg min-[400px]:text-xl sm:text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter hover:opacity-50 transition-opacity cursor-pointer flex items-center gap-3 sm:gap-6 group no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xs font-mono text-[#b0b0b0] group-hover:text-white transition-colors">0{i + 1}</span>
                  {item.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 pt-12 border-t border-white/10 flex justify-between items-center"
              >
                <div
                  className="text-[#b0b0b0] hover:text-white font-mono text-[10px] min-[400px]:text-xs md:text-sm tracking-widest cursor-pointer flex items-center gap-2 sm:gap-3 transition-colors"
                  onClick={() => {
                    setLang(lang === 'EN' ? 'PT' : 'EN');
                    setIsMenuOpen(false);
                  }}
                >
                  <span className={lang === 'PT' ? 'text-white' : 'opacity-40'}>PT-BR</span>
                  <span className="text-[10px] opacity-20">/</span>
                  <span className={lang === 'EN' ? 'text-white' : 'opacity-40'}>ENGLISH</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="relative pt-40 pb-40 px-4 md:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
          <iframe
            src="https://player.mediadelivery.net/embed/625906/50875b16-1f76-461c-8c40-0cc509f88bce?autoplay=true&loop=true&muted=true&preload=true&responsive=true"
            loading="lazy"
            style={{
              border: 0,
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.77vh',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen={true}
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-black/50 pointer-events-none z-0"></div>
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse z-0"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:w-1/2 text-left -rotate-2"
          >
            <div className="inline-block bg-accent text-black font-pixel px-4 py-1 text-xl mb-4 uppercase tracking-widest font-bold">Unleash Imagination!</div>
            <h1 className="font-headline text-6xl md:text-8xl leading-none text-white drop-shadow-[8px_8px_0px_#FF00FF] mb-6 font-black uppercase">
              DRAW WITH <br /> YOUR <span className="text-secondary">HANDS!</span>
            </h1>
            <p className="font-pixel text-2xl text-secondary mb-10 leading-snug max-w-lg">
              Wave your hands to create magical sketches and watch them transform into playful AI images in real time!
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsColoringOpen(true)}
                className="px-10 py-6 bg-primary text-white font-headline text-2xl y2k-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-4 border-white font-bold"
              >
                START MAGIC!
              </button>
              <button
                onClick={() => setIsMemoryGameOpen(true)}
                className="px-10 py-6 bg-secondary text-white font-headline text-2xl y2k-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-4 border-white font-bold"
              >
                MEMORY GAME!
              </button>
            </div>

            {/* Optical Control Info Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsOpticalInfoOpen(true)}
              className="mt-6 flex items-center gap-3 px-6 py-3 bg-black/50 backdrop-blur-sm border-2 border-cyan-400/40 rounded-full hover:bg-cyan-400/10 hover:border-cyan-400 transition-all group"
            >
              <span className="text-cyan-400 text-lg group-hover:scale-110 transition-transform">✋</span>
              <span className="font-pixel text-cyan-400 text-sm uppercase tracking-wider font-bold">{lang === 'PT' ? 'Instruções de Controlo Ótico' : 'Optical Control Instructions'}</span>
            </motion.button>
          </motion.div>

          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              <motion.div
                initial={{ rotate: 5, scale: 0.9, opacity: 0 }}
                whileInView={{ rotate: 3, scale: 1, opacity: 1 }}
                className="absolute inset-0 border-8 border-white bg-black overflow-hidden y2k-shadow-cyan"
              >
                <ImageComparisonSlider
                  topImage="/sketchmagic/comp_scketch.png"
                  bottomImage="/sketchmagic/comp_monster.png"
                  className="w-full h-full"
                />
                <div className="absolute top-4 left-4 font-pixel bg-primary px-2 text-white text-lg z-50">RE_MIXING...</div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Concept Section */}
      <section className="relative py-32 bg-primary transform -skew-y-3 z-20" id="concept">
        <div className="transform skew-y-3 max-w-5xl mx-auto px-8 flex flex-col gap-16 items-center text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="w-full bg-black p-4 md:p-8 border-8 border-white y2k-shadow flex flex-col justify-center"
          >
            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
              <iframe
                src="https://player.mediadelivery.net/embed/625906/e50574bf-c360-4554-89d2-51e828913089?autoplay=true&loop=true&muted=true&preload=true&responsive=true"
                loading="lazy"
                style={{ border: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen={true}
              ></iframe>
            </div>
          </motion.div>

          <div className="text-black max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-headline mb-8 leading-none font-black uppercase italic">FUN & INTERACTIVE <br /><span className="text-white drop-shadow-[4px_4px_0px_#000]">MAGIC</span></h2>
            <p className="font-body text-xl md:text-2xl font-bold mb-8 leading-relaxed">
              An immersive experience combining creativity and technology. Sensors capture your movements and transform them into art instantly!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['#MAGIC_WAND', '#SUPER_FUN', '#CREATIVE'].map((tag, i) => (
                <span key={tag} className="px-6 py-2 bg-white font-pixel text-black border-4 border-black font-bold text-lg hover:bg-accent transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-40 px-8 relative overflow-hidden" id="how-it-works">
        <div className="absolute inset-0 diagonal-stripes pointer-events-none opacity-20"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-9xl font-headline text-white drop-shadow-[0_8px_0px_#00FFFF] mb-4 font-black">HOW TO PLAY</h2>
            <div className="h-4 w-64 bg-accent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { id: '01', title: 'WAVE & DRAW', desc: 'Wave your hands in the air to draw on the screen. The more creative, the better!', icon: Wand2, color: 'primary' },
              { id: '02', title: 'PICK A THEME', desc: 'Choose your theme: Cute Cartoon Monsters, Rainbow Stars, or Abstract Landscapes.', icon: Gamepad2, color: 'secondary' },
              { id: '03', title: 'WATCH IT GLOW', desc: 'Watch projections display your results in real time! Share your magical art with everyone.', icon: Sparkles, color: 'accent' }
            ].map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className={`bg-black/80 p-10 border-t-8 border-${step.color} hover:scale-105 transition-all cursor-crosshair group relative`}
              >
                <div className={`text-8xl font-black text-${step.color} opacity-20 absolute top-4 right-4`}>{step.id}</div>
                <div className={`w-20 h-20 bg-${step.color} mb-8 flex items-center justify-center rotate-45 border-4 border-white group-hover:rotate-0 transition-transform`}>
                  <step.icon className={`w-10 h-10 text-${step.color === 'accent' ? 'black' : 'white'} -rotate-45 group-hover:rotate-0 transition-transform`} />
                </div>
                <h4 className="text-3xl font-headline text-white mb-4 italic font-black">{step.title}</h4>
                <p className="font-pixel text-lg text-secondary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="py-32 px-4 max-w-7xl mx-auto" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -10 }}
            className="md:col-span-2 bg-white text-black p-12 border-8 border-black y2k-shadow relative overflow-hidden"
          >
            <div className="checkerboard absolute inset-0 opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary px-4 py-2 font-pixel text-white text-3xl font-bold">REAL-TIME</div>
                <Zap className="w-12 h-12 text-primary fill-primary" />
              </div>
              <h3 className="text-6xl font-headline mb-4 uppercase font-black">INSTANT PROJECTIONS</h3>
              <p className="font-body text-2xl font-bold max-w-xl mb-10 text-black/70">
                Sensors instantly capture your every gesture, projecting your playful AI-generated art onto screens in real time.
              </p>
              <div className="flex gap-4">
                <div className="w-20 h-6 bg-primary"></div>
                <div className="w-20 h-6 bg-secondary"></div>
                <div className="w-20 h-6 bg-accent"></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-secondary text-black p-10 border-8 border-black y2k-shadow flex flex-col justify-between hover:bg-white transition-colors group"
          >
            <div>
              <Zap className="w-16 h-16 mb-8 group-hover:scale-125 transition-transform" />
              <h3 className="text-4xl font-headline mb-4 font-black italic">SUPER FAST</h3>
              <p className="font-pixel text-xl">As you move, the magic follows. See your art transform instantly on the big screen.</p>
            </div>
            <div className="mt-8 border-4 border-black p-4 bg-white/50 text-center font-headline font-black text-2xl">100% FUN</div>
          </motion.div>

          {[
            { title: 'CUTE MONSTERS', desc: "Create friendly, colorful cartoon monsters that react to your movements.", icon: Layers, color: 'accent' },
            { title: 'RAINBOW STARS', desc: "Fill the screen with magical, glowing rainbow stars and bright colors.", icon: Wand2, color: 'primary' },
            { title: 'DREAM LANDSCAPES', desc: "Build beautiful, abstract landscapes based on your pure imagination.", icon: Share2, color: 'black' }
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              whileHover={{ rotate: i % 2 === 0 ? 2 : -2 }}
              className={`bg-${feat.color} ${feat.color === 'black' ? 'text-secondary border-secondary' : 'text-black border-black'} p-10 border-8 y2k-shadow group`}
            >
              <feat.icon className="w-16 h-16 mb-6 group-hover:animate-spin" />
              <h3 className={`text-3xl font-headline font-black mb-4 ${feat.color === 'black' ? 'text-white' : ''}`}>{feat.title}</h3>
              <p className="font-pixel text-lg">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 md:py-24 px-6 md:px-0 bg-black border-t border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 relative z-10">
          {[
            { icon: '/assets/images/social/linkedin.svg', url: 'https://www.linkedin.com/in/mvirgilstudio/', label: 'LinkedIn' },
            { icon: '/assets/images/social/instagram.svg', url: 'https://instagram.com/miguelvirgilio', label: 'Instagram' },
            { icon: '/assets/images/social/X.svg', url: 'https://x.com/miguelvirgilio', label: 'X' },
            { icon: '/assets/images/social/facebook.svg', url: 'https://facebook.com/miguelvirgilio', label: 'Facebook' },
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
              className="text-[#b0b0b0] hover:text-white transition-colors"
            >
              <img src={social.icon} alt={social.label} className="w-8 h-8 md:w-10 md:h-10 opacity-60 hover:opacity-100 transition-all pointer-events-auto" />
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-sans text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] text-[#b0b0b0] uppercase mb-2 relative z-10 px-4 md:px-0"
        >
          © {new Date().getFullYear()} MV Interactive Systems
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-mono text-[8.5px] md:text-[10px] text-[#b0b0b0]/40 relative z-10 max-w-[90%] md:max-w-full mx-auto uppercase"
        >
          SOLUÇÕES EM TECNOLOGIA DE MISTURA DE REALIDADES
        </motion.p>
      </footer>

      <ColoringPopup isOpen={isColoringOpen} onClose={() => setIsColoringOpen(false)} />
      <MemoryGamePopup isOpen={isMemoryGameOpen} onClose={() => setIsMemoryGameOpen(false)} />

      {/* Optical Control Instructions Popup */}
      <AnimatePresence>
        {isOpticalInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setIsOpticalInfoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-400/60 rounded-2xl p-8 md:p-10 max-w-lg w-[95vw] shadow-[0_0_60px_rgba(0,255,255,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpticalInfoOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all text-lg"
              >
                ✕
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✋</span>
                </div>
                <div>
                  <h3 className="font-headline text-white text-xl font-bold uppercase">{lang === 'PT' ? 'Controlo Ótico' : 'Optical Control'}</h3>
                  <p className="font-pixel text-cyan-400/70 text-xs">{lang === 'PT' ? 'Instruções de Rastreamento Manual' : 'Hand Tracking Instructions'}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                {(lang === 'PT' ? [
                  { emoji: '👆', title: 'NAVEGAR', desc: 'Move a tua mão em frente à câmara para controlar o cursor no ecrã.' },
                  { emoji: '🤏', title: 'CLICAR E DESENHAR', desc: 'Junta o polegar e o indicador para clicar em botões ou desenhar na tela.' },
                  { emoji: '✊', title: 'SOLTAR', desc: 'Abre os dedos para parar de desenhar ou soltar um botão.' },
                  { emoji: '🎯', title: 'SOBREVOAR', desc: 'Os botões brilham em ciano quando o cursor está sobre eles — junta os dedos para ativar!' },
                ] : [
                  { emoji: '👆', title: 'NAVIGATE', desc: 'Move your hand in front of the camera to control the cursor on screen.' },
                  { emoji: '🤏', title: 'CLICK & DRAW', desc: 'Pinch your thumb and index finger together to click buttons or draw on the canvas.' },
                  { emoji: '✊', title: 'RELEASE', desc: 'Open your fingers to stop drawing or release a button.' },
                  { emoji: '🎯', title: 'HOVER', desc: 'Buttons glow cyan when the cursor is over them — pinch to activate!' },
                ]).map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <span className="text-3xl flex-shrink-0 mt-0.5">{step.emoji}</span>
                    <div>
                      <span className="font-pixel text-cyan-400 text-sm font-bold">{step.title}</span>
                      <p className="font-pixel text-white/70 text-xs leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer note */}
              <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-3 text-center">
                <p className="font-pixel text-cyan-400/80 text-xs">
                  💡 {lang === 'PT'
                    ? <>Clica no botão <strong>"Controlo Ótico"</strong> dentro de cada jogo para ativar</>
                    : <>Click the <strong>"Optical Control"</strong> button inside each game to activate</>}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
