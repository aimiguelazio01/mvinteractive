import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RotateCcw } from 'lucide-react';

interface Card {
  id: number;
  image: string;
}

const TOTAL_PAIRS = 12;
const CARD_IMAGES = Array.from({ length: TOTAL_PAIRS }, (_, i) => `/sketchmagic/memory_cards/card_${String(i + 1).padStart(2, '0')}.png`);

interface MemoryGamePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryGamePopup({ isOpen, onClose }: MemoryGamePopupProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const duplicatedCards = [...CARD_IMAGES, ...CARD_IMAGES]
      .map((image, index) => ({ id: index, image }))
      .sort(() => Math.random() - 0.5);
    setCards(duplicatedCards);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
    setIsLocked(false);
  };

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].image === cards[secondIndex].image) {
        setMatchedIndices((prev) => [...prev, firstIndex, secondIndex]);
        setFlippedIndices([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isWin = matchedIndices.length === cards.length && cards.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative flex flex-col bg-game-bg border-8 border-white shadow-[0_0_60px_rgba(0,255,255,0.4)] overflow-hidden"
            style={{ width: 'min(95vw, 1200px)', height: 'min(90vh, 900px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between bg-black/90 border-b-4 border-secondary px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-secondary text-base lg:text-lg">
                  MEMORY_MATCH
                </span>
                <span className="font-pixel text-accent text-sm lg:text-base ml-4">
                  MOVES: {moves}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-1 bg-arcade-red text-white font-headline font-bold text-base border-b-4 border-r-4 border-black hover:translate-y-1 hover:border-b-0 transition-all active:translate-y-2"
              >
                <X className="w-5 h-5" />
                QUIT
              </button>
            </div>

            {/* Game Board */}
            <div className="flex-1 flex flex-col items-center justify-center relative pt-16 pb-4 px-4 sm:px-8 overflow-y-auto">
              
              {isWin ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center text-center p-8 bg-black/80 border-8 border-accent y2k-shadow-cyan max-w-lg w-full"
                >
                  <Trophy className="w-24 h-24 text-accent mb-6" />
                  <h2 className="text-4xl md:text-5xl font-headline font-black text-white mb-4">YOU WIN!</h2>
                  <p className="font-pixel text-secondary text-xl mb-8">COMPLETED IN {moves} MOVES</p>
                  <button
                    onClick={initializeGame}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-headline text-xl border-4 border-white hover:bg-secondary hover:scale-105 transition-all"
                  >
                    <RotateCcw className="w-6 h-6" />
                    PLAY AGAIN
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-4 w-full h-full max-h-full pb-8 place-content-center">
                  {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                    return (
                      <div 
                        key={index}
                        className="relative w-full aspect-square cursor-pointer"
                        onClick={() => handleCardClick(index)}
                        style={{ perspective: '1000px' }}
                      >
                        <motion.div
                          className="w-full h-full relative"
                          initial={false}
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* Card Back */}
                          <div 
                            className="absolute w-full h-full bg-primary border-4 border-white flex items-center justify-center backface-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <span className="font-headline font-black text-white text-3xl sm:text-5xl opacity-50">?</span>
                          </div>
                          
                          {/* Card Front */}
                          <div 
                            className="absolute w-full h-full bg-black border-4 border-accent flex items-center justify-center p-1 sm:p-2 backface-hidden"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <img src={card.image} alt="card" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                            {matchedIndices.includes(index) && (
                              <div className="absolute inset-0 bg-accent/20 border-4 border-accent" />
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
