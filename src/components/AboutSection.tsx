import React from 'react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';

interface AboutSectionProps {
  lang: 'EN' | 'PT';
}

const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].about;

  return (
    <section
      id="section_about"
      className="relative w-full min-h-screen flex items-center justify-center py-20 px-6 sm:px-12 md:px-24 bg-gradient-to-b from-black via-charcoal to-black overflow-hidden border-t border-white/5"
    >
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[#b48c50] to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 60, 0],
            y: [0, 70, -30, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#5282be] to-[#825ab4] blur-[150px]"
        />
      </div>

      {/* Grid Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Heading and expressiveness */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-white leading-[1.05]">
              {t.title}
            </h2>
          </div>
          <div className="h-[2px] w-20 bg-gradient-to-r from-white/40 to-transparent"></div>
          
          <p className="font-sans font-light text-base sm:text-lg text-concrete tracking-wide leading-relaxed">
            {t.bio}
          </p>
        </motion.div>

        {/* Right Column: Deeper Profile Context */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col gap-8 p-6 sm:p-10 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md relative overflow-hidden"
        >
          {/* Top border ambient glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex flex-col gap-1">
            <h3 className="text-lg sm:text-2xl font-sans font-bold uppercase text-white tracking-wide leading-tight">
              {t.subtitle.split(/[—–-]/)[0]?.trim()}
            </h3>
            <span className="text-xs sm:text-sm font-mono font-medium uppercase text-concrete/60 tracking-wider">
              {t.subtitle.split(/[—–-]/)[1]?.trim()}
            </span>
          </div>

          <p className="font-sans font-light text-[15px] sm:text-base text-concrete/80 tracking-wide leading-relaxed">
            {t.bioExtended}
          </p>

          {/* Core Vision Mappings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4 border-t border-white/5 pt-6">
            {[
              { num: '01', title: lang === 'EN' ? '3D Modeling, Animation, 3D Tracking & VFX' : 'Modelação 3D, Animação, Tracking 3D & VFX' },
              { num: '02', title: lang === 'EN' ? 'Video/Image Composition' : 'Composição de Vídeo/Imagem' },
              { num: '03', title: 'Web & Creative Coding' },
              { num: '04', title: lang === 'EN' ? 'Physical Computing' : 'Computação Física' },
              { num: '05', title: lang === 'EN' ? 'Digital Fabrication' : 'Fabricação Digital' }
            ].map((pillar) => (
              <div key={pillar.num} className="flex flex-col gap-2">
                <span className="font-orbitron font-medium text-xs text-concrete/40">{pillar.num} //</span>
                <span className="font-sans font-bold text-xs tracking-wider text-white uppercase">{pillar.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
