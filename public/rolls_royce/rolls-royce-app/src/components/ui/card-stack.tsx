import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

export default function CardStack() {
  const initialCards: Card[] = [
    { id: 1, src: "/images/HighresScreenshot00002.jpg", alt: "Rolls-Royce Gallery 1", title: "Sculpted Elegance", description: "The iconic profile in high resolution" },
    { id: 2, src: "/images/HighresScreenshot00006.jpg", alt: "Rolls-Royce Gallery 2", title: "Impeccable Details", description: "Precision engineering on display" },
    { id: 3, src: "/images/HighresScreenshot00009.jpg", alt: "Rolls-Royce Gallery 3", title: "Luxury Redefined", description: "Every surface meticulously crafted" },
    { id: 4, src: "/images/HighresScreenshot00010.jpg", alt: "Rolls-Royce Gallery 4", title: "The Starlight Headliner", description: "A celestial experience inside" },
    { id: 5, src: "/images/HighresScreenshot00011.jpg", alt: "Rolls-Royce Gallery 5", title: "Bespoke Interior", description: "Crafted for the senses" },
    { id: 6, src: "/images/HighresScreenshot00012.jpg", alt: "Rolls-Royce Gallery 6", title: "Commanding Presence", description: "The unmistakable grille" },
    { id: 7, src: "/images/HighresScreenshot00013.jpg", alt: "Rolls-Royce Gallery 7", title: "Artisan Woodwork", description: "Seamless grain matching" },
    { id: 8, src: "/images/HighresScreenshot00014.jpg", alt: "Rolls-Royce Gallery 8", title: "Whisper Quiet", description: "Acoustic insulation technology" },
    { id: 9, src: "/images/HighresScreenshot00015.jpg", alt: "Rolls-Royce Gallery 9", title: "Dynamic Drive", description: "Effortless power delivery" },
    { id: 10, src: "/images/HighresScreenshot00016.jpg", alt: "Rolls-Royce Gallery 10", title: "Iconic Silhouette", description: "Timeless design proportions" },
    { id: 11, src: "/images/HighresScreenshot00017.jpg", alt: "Rolls-Royce Gallery 11", title: "Signature Details", description: "The Spirit of Ecstasy" },
    { id: 12, src: "/images/HighresScreenshot00018.jpg", alt: "Rolls-Royce Gallery 12", title: "Refined Leather", description: "Highest grade materials" },
    { id: 13, src: "/images/HighresScreenshot00019.jpg", alt: "Rolls-Royce Gallery 13", title: "Atelier Customization", description: "Made uniquely yours" }
  ];

  const [cards, setCards] = useState<Card[]>(initialCards);
  const isDark = true; // Defaulting to dark mode after removing toggle
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Magnified Image Modal State
  const [magnifiedImage, setMagnifiedImage] = useState<string | null>(null);
  const modalTimeoutRef = React.useRef<NodeJS.Timeout>();

  const dragY = useMotionValue(0);
  const rotateX = useTransform(dragY, [-200, 0, 200], [15, 0, -15]);
  const opacity = useTransform(dragY, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);

  // Configuration
  const offset = 10;
  const scaleStep = 0.06;
  const dimStep = 0.15;
  const stiff = 170;
  const damp = 26;
  const borderRadius = 12;
  const swipeThreshold = 50;

  const spring = {
    type: 'spring' as const,
    stiffness: stiff,
    damping: damp
  };

  const moveToEnd = () => {
    setCards(prev => [...prev.slice(1), prev[0]]);
    setCurrentIndex((prev) => (prev + 1) % initialCards.length);
  };

  const moveToStart = () => {
    setCards(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    setCurrentIndex((prev) => (prev - 1 + initialCards.length) % initialCards.length);
  };



  const handleDragEnd = (_: any, info: any) => {
    const velocity = info.velocity.y;
    const yOffset = info.offset.y;

    if (Math.abs(yOffset) > swipeThreshold || Math.abs(velocity) > 500) {
      if (yOffset < 0 || velocity < 0) {
        setDragDirection('up');
        setTimeout(() => {
          moveToEnd();
          setDragDirection(null);
        }, 150);
      } else {
        setDragDirection('down');
        setTimeout(() => {
          moveToStart();
          setDragDirection(null);
        }, 150);
      }
    }
    dragY.set(0);
  };

  // Theme configuration
  const theme = {
    dark: {
      bg: 'bg-transparent',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      toggleBg: 'bg-gray-800/80 hover:bg-gray-700/80',
      toggleBorder: 'border-gray-700',
      infoBox: 'bg-gray-900/90 border-gray-700',
      shadowCard: '0 25px 50px rgba(0, 0, 0, 0.7)',
      shadowCardBack: '0 15px 30px rgba(0, 0, 0, 0.4)',
      cardBorder: 'border-2 border-gray-700',
      controlBg: 'bg-gray-800/80 hover:bg-gray-700/80',
      cardInfoBg: 'bg-gradient-to-t from-black/80 to-transparent'
    },
    light: {
      bg: 'bg-transparent',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      toggleBg: 'bg-white/80 hover:bg-gray-100/80',
      toggleBorder: 'border-gray-300',
      infoBox: 'bg-white/90 border-gray-300',
      shadowCard: '0 25px 50px rgba(0, 0, 0, 0.15)',
      shadowCardBack: '0 15px 30px rgba(0, 0, 0, 0.08)',
      cardBorder: 'border-2 border-gray-300',
      controlBg: 'bg-white/80 hover:bg-gray-100/80',
      cardInfoBg: 'bg-gradient-to-t from-white/90 to-transparent'
    }
  };

  const currentTheme = isDark ? theme.dark : theme.light;

  return (
    <div className={`w-full py-20 flex flex-col items-center justify-center ${currentTheme.bg} transition-all duration-500 relative overflow-hidden`}>



      {/* Main Content Wrapper for Stack and Buttons */}
      <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center mt-4">
        {/* Navigation Buttons */}
        <motion.button
          onClick={moveToStart}
          className={`absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-4 rounded-full ${currentTheme.controlBg} border ${currentTheme.toggleBorder} backdrop-blur-sm transition-colors duration-200 z-20 hidden md:block`}
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className={`w-6 h-6 ${currentTheme.text}`} />
        </motion.button>

        <motion.button
          onClick={moveToEnd}
          className={`absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-4 rounded-full ${currentTheme.controlBg} border ${currentTheme.toggleBorder} backdrop-blur-sm transition-colors duration-200 z-20 hidden md:block`}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className={`w-6 h-6 ${currentTheme.text}`} />
        </motion.button>

        {/* Card Stack Container */}
        <div className="relative w-full max-w-3xl aspect-video overflow-visible z-10 mx-auto px-4 md:px-0">
          <ul className="relative w-full h-full m-0 p-0">
            <AnimatePresence>
              {cards.map(({ id, src, alt, title, description }, i) => {
                const isFront = i === 0;
                const brightness = Math.max(0.3, 1 - i * dimStep);
                const baseZ = cards.length - i;

                return (
                  <motion.li
                    key={id}
                    className={`absolute w-full h-full list-none overflow-hidden ${currentTheme.cardBorder}`}
                    style={{
                      borderRadius: `${borderRadius}px`,
                      cursor: isFront ? 'grab' : 'auto',
                      touchAction: 'none',
                      boxShadow: isFront
                        ? currentTheme.shadowCard
                        : currentTheme.shadowCardBack,
                      rotateX: isFront ? rotateX : 0,
                      transformPerspective: 1000
                    }}
                    animate={{
                      top: `${i * -offset}%`,
                      scale: 1 - i * scaleStep,
                      filter: `brightness(${brightness})`,
                      zIndex: baseZ,
                      opacity: dragDirection && isFront ? 0 : 1
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.2 }
                    }}
                    transition={spring}
                    drag={isFront ? 'y' : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.7}
                    onDrag={(_, info) => {
                      if (isFront) {
                        dragY.set(info.offset.y);
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    whileDrag={
                      isFront
                        ? {
                          zIndex: cards.length + 1,
                          cursor: 'grabbing',
                          scale: 1.05,
                        }
                        : {}
                    }
                    onHoverStart={() => {
                      if (isFront) {
                        setShowInfo(true);
                        setMagnifiedImage(src);
                      }
                    }}
                    onHoverEnd={() => {
                      if (isFront) {
                        setShowInfo(false);
                        // DO NOT clear magnifiedImage here. Let the modal's backdrop handle closing it.
                      }
                    }}
                  >
                    <img
                      src={src}
                      alt={alt}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />

                    {/* Card Info Overlay */}
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 p-4 md:p-8 ${currentTheme.cardInfoBg}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: isFront && showInfo ? 1 : 0,
                        y: isFront && showInfo ? 0 : 20
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-white font-bold text-xl md:text-2xl mb-1">{title}</h3>
                      <p className="text-white/80 text-sm md:text-base font-light tracking-wide">{description}</p>
                    </motion.div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {initialCards.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex % initialCards.length
                ? `${isDark ? 'bg-white' : 'bg-gray-900'} w-8`
                : `${isDark ? 'bg-gray-700' : 'bg-gray-300'} w-1.5`
              }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Global Magnified Modal */}
      <AnimatePresence>
        {magnifiedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
            onMouseMove={() => setMagnifiedImage(null)} // If mouse moves on the backdrop, close the modal
          >
            <div
              className="relative max-w-6xl w-[90vw] max-h-[90vh] aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/20 bg-black pointer-events-auto"
              onMouseMove={(e) => e.stopPropagation()} // Prevent the backdrop from closing the modal if mouse is moving inside the image
              onMouseLeave={() => setMagnifiedImage(null)} // If mouse leaves the image window, close it
            >
              <img src={magnifiedImage} alt="Magnified View" className="w-full h-full object-cover pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
