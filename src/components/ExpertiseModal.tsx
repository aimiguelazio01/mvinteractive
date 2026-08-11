import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/translations';

interface ExpertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'EN' | 'PT';
}

const ExpertiseModal: React.FC<ExpertiseModalProps> = ({ isOpen, onClose, lang }) => {
  const t = TRANSLATIONS[lang].expertiseModal;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Tech stack items
  const techStack = {
    coding: [
      'Three.js', 'WebGL', 'GSAP Animations', 'React'
    ],
    art: [
      'Sidefx  Houdini', 'Autodesk Maya', 'Audesk 3DS Max', 'Blender 3D', 
      'Unreal Engine', 'Touchdesigner', 'PF Track', 'Zbrush'
    ],
    composition: [
      'Foundry Nuke', 'After Effects', 'Davinci Resolve', 'Mocha Pro', 'Adobe Suite'
    ],
    physical: [
      'Arduino', 'Raspeberry Pi', 'ESP32/ESP8266', 'Kinect SDK', 
      'I2C/SPI Sensors'
    ],
    fabrication: [
      'Solidworks', 'Cura/PrusaSlicer', 'OrcaSlicer', 'FDM 3D Printing'
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-xl md:cursor-auto"
          onClick={onClose}
        >
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-charcoal/95 border border-white/10 rounded-2xl p-6 sm:p-10 custom-scrollbar relative flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8 sm:mb-12 border-b border-white/5 pb-5">
              <div>
                <span className="text-[10px] tracking-[0.3em] font-mono text-concrete/60 uppercase">01 / CAPABILITIES</span>
                <h2 className="text-xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white mt-1">
                  {t.title}
                </h2>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group active:scale-95"
                aria-label="Close modal"
              >
                <svg
                  className="w-4 h-4 text-concrete group-hover:text-white transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Split Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-grow">
              
              {/* Left Column: Topics / Core Skills */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <h3 className="font-tech text-xs tracking-[0.25em] text-concrete/40 uppercase font-bold border-b border-white/5 pb-2">
                  {t.capabilitiesTitle}
                </h3>
                <div className="flex flex-col gap-4">
                  {t.skills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="group flex items-center gap-4 py-1.5 px-3 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/[0.01] transition-all"
                    >
                      <span className="font-mono text-xs text-concrete/40 group-hover:text-white/60 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-sans font-medium text-[15px] sm:text-base text-concrete group-hover:text-white transition-colors tracking-wide">
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: Tech & Hardware Stack */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h3 className="font-tech text-xs tracking-[0.25em] text-concrete/40 uppercase font-bold border-b border-white/5 pb-2">
                  {t.techTitle}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category Card helper */}
                  {[
                    { key: 'coding', title: t.techCategories.coding, color: 'from-[#b48c50]/20 to-transparent' },
                    { key: 'art', title: t.techCategories.art, color: 'from-[#5282be]/20 to-transparent' },
                    { key: 'composition', title: t.techCategories.composition, color: 'from-[#e15b64]/20 to-transparent' },
                    { key: 'physical', title: t.techCategories.physical, color: 'from-[#46aa8c]/20 to-transparent' },
                    { key: 'fabrication', title: t.techCategories.fabrication, color: 'from-[#825ab4]/20 to-transparent' },
                  ].map(({ key, title, color }) => (
                    <div 
                      key={key} 
                      className={`p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-3 relative overflow-hidden group ${
                        key === 'composition' ? 'sm:col-span-2' : ''
                      }`}
                    >
                      {/* Subtle Ambient Hover Backdrop Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}></div>

                      <h4 className="font-sans font-bold text-xs tracking-wider text-white border-b border-white/5 pb-2 uppercase relative z-10">
                        {title}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1 relative z-10">
                        {techStack[key as keyof typeof techStack].map((tool) => (
                          <span
                            key={tool}
                            className="text-[10px] sm:text-[11px] font-mono tracking-wide px-2 py-0.5 rounded bg-white/5 border border-white/5 text-concrete/80 hover:text-white hover:border-white/15 transition-all"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Tagline */}
            <div className="mt-12 pt-5 border-t border-white/5 flex justify-between items-center text-[10px] sm:text-xs font-mono text-concrete/40 uppercase">
              <span>Miguel Virgílio Studio</span>
              <span>Performance & Precision</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpertiseModal;
