import React, { useState } from 'react';
import { WORKS_INDEX } from '../data/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkItem } from '../types';
import WorkModal from './WorkModal';

import { TRANSLATIONS } from '../data/translations';

interface WorksIndexProps {
  isVisible: boolean;
  activeSectionId: string | null;
  lang: 'EN' | 'PT';
}

const WorksIndex: React.FC<WorksIndexProps> = ({ isVisible, activeSectionId, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const t = TRANSLATIONS[lang];

  // Sections 01, 03, 05 -> right side; Sections 02, 04, 06 -> left side
  const isRightSide = !activeSectionId || ['section_01', 'section_03', 'section_05'].includes(activeSectionId);

  const linkableItems: Record<string, string[]> = {
    'section_01': [
      'APPLE HARMONICS',
      'ROCKTOUCH POSTER',
      'TOUCHSTONE CATALOG',
      'ARCHSYNC MODEL',
      'LIVESPACE',
      'GREENHAVEN INTERACTIVE',
      'ORBITARIUM INTERACTIVE',
      'SKETCHMAGIC',
      'MOTIONSCAPE'
    ],
    'section_02': [
      'TOUCHSTONE CATALOG',
      'ARCHSYNC MODEL',
      'LIVESPACE',
      'GREENHAVEN INTERACTIVE',
      'ORBITARIUM INTERACTIVE',
      'PHANTOMVIEW',
      'SUPRAVIEW'
    ],
    'section_03': [
      'ARCHSYNC MODEL',
      'APPLE HARMONICS',
      'TOUCHSTONE CATALOG'
    ],
    'section_04': [
      'SKETCHMAGIC',
      'MOTIONSCAPE'
    ],
    'section_05': [
      'MOTIONSCAPE',
      'VASEMOTION',
      'ORBITARIUM INTERACTIVE',
      'PHANTOMVIEW',
      'SUPRAVIEW'
    ],
    'section_06': [
      'MOTIONSCAPE',
      'VASEMOTION',
      'ORBITARIUM INTERACTIVE',
      'PHANTOMVIEW',
      'SUPRAVIEW'
    ]
  };

  const renderWorkItems = (mobile = false) => {
    return WORKS_INDEX.map((work) => {
      let isLinkable = true;
      if (activeSectionId && linkableItems[activeSectionId]) {
        isLinkable = linkableItems[activeSectionId].includes(work.title);
      }

      return (
        <motion.div
          key={work.id}
          variants={{
            hidden: { opacity: 0, x: isRightSide ? 20 : -20 },
            visible: { opacity: 1, x: 0 }
          }}
          className={`${isLinkable ? 'group cursor-pointer' : ''} flex items-center ${mobile ? 'justify-center py-2' : isRightSide ? 'justify-end' : 'justify-start'} transition-all duration-300`}
          onClick={() => {
            if (isLinkable) {
              setSelectedWork(work);
              if (mobile) setIsOpen(false);
            }
          }}
        >
          <motion.span
            className={`font-tech tracking-widest transition-all duration-300 ${isLinkable
              ? `${mobile ? 'text-xl font-bold text-gray-900' : 'text-[15px] text-white'} group-hover:text-accent group-hover:tracking-[0.3em] group-hover:opacity-100`
              : `${mobile ? 'text-base text-gray-400' : 'text-[13px] text-gray-500'}`
              }`}
            whileHover={isLinkable && !mobile ? { x: isRightSide ? -10 : 10 } : {}}
          >
            {t.worksIndex[work.id as keyof typeof t.worksIndex]?.title || work.title}
          </motion.span>
          {!mobile && isRightSide && (
            <motion.div
              className={`w-1 h-1 ml-3 rounded-full transition-all duration-300 ${isLinkable ? 'bg-white group-hover:bg-accent' : 'bg-gray-500'
                }`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: isLinkable ? 0.6 : 0.3, scale: 1 }}
              whileHover={isLinkable ? { opacity: 1, scale: 2 } : {}}
              transition={{ duration: 0.2 }}
            />
          )}
          {!mobile && !isRightSide && (
            <motion.div
              className={`w-1 h-1 mr-3 rounded-full transition-all duration-300 order-first ${isLinkable ? 'bg-white group-hover:bg-accent' : 'bg-gray-500'
                }`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: isLinkable ? 0.6 : 0.3, scale: 1 }}
              whileHover={isLinkable ? { opacity: 1, scale: 2 } : {}}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      );
    });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            className={`fixed bottom-8 right-8 z-[60] lg:hidden w-12 h-12 rounded-full flex items-center justify-center font-tech font-bold text-[10px] tracking-tighter shadow-lg ${isOpen ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? (lang === 'EN' ? 'CLOSE' : 'FECHAR') : t.works.title}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[55] lg:hidden bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-y-auto"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="mb-12 border-b border-black/20 pb-4 w-full text-center">
              <span className="font-tech text-xl tracking-[0.4em] text-gray-900 uppercase font-bold">
                {t.works.title} INDEX
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {renderWorkItems(true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <AnimatePresence mode="wait">
        {isVisible && activeSectionId && (
          <motion.div
            key={activeSectionId}
            className={`absolute top-[10vh] z-50 hidden lg:flex flex-col gap-3 mix-blend-difference px-4 py-6 rounded-xl ${isRightSide ? 'items-end' : 'items-start'}`}
            style={isRightSide ? { right: 32, left: 'auto' } : { left: 32, right: 'auto' }}
            initial={{ opacity: 0, x: isRightSide ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRightSide ? 20 : -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.div
              className={`mb-4 border-b border-white/20 pb-2 w-full ${isRightSide ? 'text-right pr-4' : 'text-left pl-4'}`}
            >
              <span className="font-tech text-[10px] tracking-[0.4em] text-white uppercase font-bold">
                {t.works.title}
              </span>
            </motion.div>

            {renderWorkItems(false)}
          </motion.div>
        )}
      </AnimatePresence>
      <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} lang={lang} />
    </>
  );
};

export default WorksIndex;