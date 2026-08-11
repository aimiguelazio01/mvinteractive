import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Eraser, Paintbrush, Trash2, PaintBucket, Wand2 } from 'lucide-react';

const TOTAL_IMAGES = 16;
const PALETTE_COLORS = [
  '#FF3131', // Red
  '#FF6B00', // Orange
  '#FFFF00', // Yellow
  '#39FF14', // Green
  '#00BFFF', // Sky Blue
  '#005AB4', // Blue
  '#A259FF', // Purple
  '#FF69B4', // Pink
  '#000000', // Black
  '#808080', // Gray
];

function padIndex(n: number): string {
  return String(n).padStart(3, '0');
}

interface ColoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ColoringPopup({ isOpen, onClose }: ColoringPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [isBucket, setIsBucket] = useState(false);
  const [brushSize, setBrushSize] = useState(18);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorLayerRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Store color layers per image index
  const colorLayersData = useRef<Map<number, ImageData>>(new Map());

  const currentImageSrc = `/sketchmagic/lineart/lineart-${padIndex(currentIndex)}.png`;

  // Save current color layer data before switching
  const saveCurrentLayer = useCallback(() => {
    const colorCanvas = colorLayerRef.current;
    if (!colorCanvas) return;
    const ctx = colorCanvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
    colorLayersData.current.set(currentIndex, data);
  }, [currentIndex]);

  // Composite: color layer underneath, lineart on top
  const compositeCanvas = useCallback((lineartImg: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const colorCanvas = colorLayerRef.current;
    if (!canvas || !colorCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw color layer underneath
    ctx.drawImage(colorCanvas, 0, 0);

    // Draw lineart on top with multiply-like effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lineartImg, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Load lineart image and set up canvases
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const colorCanvas = colorLayerRef.current;
    const container = containerRef.current;
    if (!canvas || !colorCanvas || !container) return;

    const img = new Image();
    img.src = currentImageSrc;
    img.onload = () => {
      // Determine canvas sizing to fit container
      const containerRect = container.getBoundingClientRect();
      const maxW = containerRect.width;
      const maxH = containerRect.height;

      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = Math.floor(img.naturalWidth * scale);
      const h = Math.floor(img.naturalHeight * scale);

      canvas.width = w;
      canvas.height = h;
      colorCanvas.width = w;
      colorCanvas.height = h;

      // Restore saved color layer if any
      const colorCtx = colorCanvas.getContext('2d');
      if (colorCtx) {
        const savedData = colorLayersData.current.get(currentIndex);
        if (savedData && savedData.width === w && savedData.height === h) {
          colorCtx.putImageData(savedData, 0, 0);
        } else {
          colorCtx.clearRect(0, 0, w, h);
        }
      }

      compositeCanvas(img);

      // Store the loaded image for recompositing during drawing
      (canvas as any).__lineartImg = img;
    };
  }, [isOpen, currentIndex, currentImageSrc, compositeCanvas]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

   const floodFill = (startX: number, startY: number) => {
    const colorCanvas = colorLayerRef.current;
    const canvas = canvasRef.current;
    if (!colorCanvas || !canvas) return;
    
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
    if (!colorCtx) return;

    const lineartImg = (canvas as any).__lineartImg;
    if (!lineartImg) return;

    // Create temporary canvas for clean lineart sampling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(lineartImg, 0, 0, canvas.width, canvas.height);
    const lineartData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    const colorData = colorCtx.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
    
    const width = lineartData.width;
    const height = lineartData.height;
    const pixels = lineartData.data;
    const colorPixels = colorData.data;

    const fillR = parseInt(selectedColor.slice(1, 3), 16);
    const fillG = parseInt(selectedColor.slice(3, 5), 16);
    const fillB = parseInt(selectedColor.slice(5, 7), 16);

    const x = Math.floor(startX);
    const y = Math.floor(startY);
    
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    const startIdx = (y * width + x) * 4;

    // Boundary check: fill only areas that are white in the lineart
    const isWhiteInLineart = (idx: number) => pixels[idx] > 220 && pixels[idx+1] > 220 && pixels[idx+2] > 220;
    
    if (!isWhiteInLineart(startIdx)) return;

    // Optimized Flood Fill (Stack-based)
    const stack: [number, number][] = [[x, y]];
    const visited = new Uint8Array(width * height);
    visited[y * width + x] = 1;

    while (stack.length > 0) {
      const [currX, currY] = stack.pop()!;
      const idx = (currY * width + currX) * 4;

      colorPixels[idx] = fillR;
      colorPixels[idx + 1] = fillG;
      colorPixels[idx + 2] = fillB;
      colorPixels[idx + 3] = 255;

      const neighbors = [[currX + 1, currY], [currX - 1, currY], [currX, currY + 1], [currX, currY - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const vIdx = ny * width + nx;
          if (!visited[vIdx]) {
            const nIdx = vIdx * 4;
            if (isWhiteInLineart(nIdx)) {
              visited[vIdx] = 1;
              stack.push([nx, ny]);
            }
          }
        }
      }
    }

    colorCtx.putImageData(colorData, 0, 0);
    compositeCanvas(lineartImg);
  };

  const autoColor = () => {
    const colorCanvas = colorLayerRef.current;
    const canvas = canvasRef.current;
    if (!colorCanvas || !canvas) return;
    
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
    if (!colorCtx) return;

    const lineartImg = (canvas as any).__lineartImg;
    if (!lineartImg) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(lineartImg, 0, 0, canvas.width, canvas.height);
    const lineartData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    const colorData = colorCtx.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
    
    const width = lineartData.width;
    const height = lineartData.height;
    const pixels = lineartData.data;
    const colorPixels = colorData.data;

    const isWhiteInLineart = (idx: number) => pixels[idx] > 220 && pixels[idx+1] > 220 && pixels[idx+2] > 220;
    
    const visited = new Uint8Array(width * height);
    const colorfulPalette = PALETTE_COLORS.slice(0, 8); // exclude black and gray
    
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const vIdx = y * width + x;
        const startIdx = vIdx * 4;
        
        if (isWhiteInLineart(startIdx) && !visited[vIdx] && colorPixels[startIdx+3] === 0) {
           const randomColor = colorfulPalette[Math.floor(Math.random() * colorfulPalette.length)];
           const fillR = parseInt(randomColor.slice(1, 3), 16);
           const fillG = parseInt(randomColor.slice(3, 5), 16);
           const fillB = parseInt(randomColor.slice(5, 7), 16);
           
           const stack: [number, number][] = [[x, y]];
           visited[vIdx] = 1;

           while (stack.length > 0) {
             const [currX, currY] = stack.pop()!;
             const idx = (currY * width + currX) * 4;

             colorPixels[idx] = fillR;
             colorPixels[idx + 1] = fillG;
             colorPixels[idx + 2] = fillB;
             colorPixels[idx + 3] = 255;

             const neighbors = [[currX + 1, currY], [currX - 1, currY], [currX, currY + 1], [currX, currY - 1]];
             for (const [nx, ny] of neighbors) {
               if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                 const nVIdx = ny * width + nx;
                 if (!visited[nVIdx]) {
                   const nIdx = nVIdx * 4;
                   if (isWhiteInLineart(nIdx)) {
                     visited[nVIdx] = 1;
                     stack.push([nx, ny]);
                   }
                 }
               }
             }
           }
        }
      }
    }
    
    colorCtx.putImageData(colorData, 0, 0);
    compositeCanvas(lineartImg);
  };

  const drawStroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const colorCanvas = colorLayerRef.current;
    const canvas = canvasRef.current;
    if (!colorCanvas || !canvas) return;
    const ctx = colorCanvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Reset
    ctx.globalCompositeOperation = 'source-over';

    // Recomposite
    const lineartImg = (canvas as any).__lineartImg;
    if (lineartImg) {
      compositeCanvas(lineartImg);
    }
  };

   const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    if (!pos) return;

    if (isBucket) {
      floodFill(pos.x, pos.y);
    } else {
      isDrawing.current = true;
      lastPos.current = pos;
      drawStroke(pos, pos);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    if (pos && lastPos.current) {
      drawStroke(lastPos.current, pos);
      lastPos.current = pos;
    }
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const goForward = () => {
    saveCurrentLayer();
    setCurrentIndex((prev) => (prev >= TOTAL_IMAGES ? 1 : prev + 1));
  };

  const goBackward = () => {
    saveCurrentLayer();
    setCurrentIndex((prev) => (prev <= 1 ? TOTAL_IMAGES : prev - 1));
  };

   const selectColor = (color: string) => {
    setSelectedColor(color);
    setIsEraser(false);
    // Keep bucket if it was selected
  };

  const toggleBucket = () => {
    setIsBucket((prev) => !prev);
    setIsEraser(false);
  };

   const toggleEraser = () => {
    setIsEraser((prev) => !prev);
    setIsBucket(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const colorCanvas = colorLayerRef.current;
    if (!canvas || !colorCanvas) return;
    
    // Clear the color layer
    const colorCtx = colorCanvas.getContext('2d');
    if (colorCtx) {
      colorCtx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    }
    
    // Recomposite with the original lineart
    const lineartImg = (canvas as any).__lineartImg;
    if (lineartImg) {
      compositeCanvas(lineartImg);
    }
  };

   const cursorRadius = brushSize / 2;
  const cursorColor = isEraser ? '#FF3131' : selectedColor;
  
  // Custom cursor logic
  let customCursor = 'crosshair';
  if (!isBucket) {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${cursorRadius}" cy="${cursorRadius}" r="${Math.max(1, cursorRadius - 1)}" fill="none" stroke="${cursorColor}" stroke-width="1.5"/></svg>`;
    const hotSpot = Math.round(cursorRadius);
    const base64Svg = btoa(svgString);
    customCursor = `url(data:image/svg+xml;base64,${base64Svg}) ${hotSpot} ${hotSpot}, crosshair`;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative flex flex-col lg:flex-row bg-game-bg border-8 border-white shadow-[0_0_60px_rgba(255,0,255,0.4)] overflow-hidden"
            style={{ width: 'min(98vw, 1600px)', height: 'min(95vh, 950px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between bg-black/90 border-b-4 border-primary px-4 py-2">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-secondary" />
                <span className="font-pixel text-secondary text-base lg:text-lg">
                  COLOR_MODE
                </span>
                <span className="font-pixel text-accent text-sm lg:text-base ml-2">
                  [{padIndex(currentIndex)}/{padIndex(TOTAL_IMAGES)}]
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

            {/* Main canvas area */}
            <div className="flex-1 flex items-center justify-center relative pt-14 pb-4 px-4 min-w-0">
              {/* Backward arrow */}
              <button
                onClick={goBackward}
                className="absolute left-2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-primary border-4 border-white text-white flex items-center justify-center hover:bg-secondary transition-colors y2k-shadow active:translate-x-1 active:translate-y-1 active:shadow-none"
                title="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Canvas container */}
              <div
                ref={containerRef}
                className="flex items-center justify-center overflow-hidden"
                style={{ width: '100%', height: '100%' }}
              >
                {/* Offscreen color layer (hidden) */}
                <canvas ref={colorLayerRef} className="hidden" />

                {/* Main visible canvas */}
                <canvas
                  ref={canvasRef}
                  className="border-4 border-white/30 bg-white"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    cursor: customCursor,
                    touchAction: 'none',
                  }}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                />
              </div>

              {/* Forward arrow */}
              <button
                onClick={goForward}
                className="absolute right-2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-primary border-4 border-white text-white flex items-center justify-center hover:bg-secondary transition-colors y2k-shadow active:translate-x-1 active:translate-y-1 active:shadow-none"
                title="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Right side panel - Palette & Tools */}
            <div className="lg:w-[100px] w-full lg:h-full flex lg:flex-col flex-row items-center justify-center gap-2 lg:gap-3 bg-black/60 border-l-0 lg:border-l-4 border-t-4 lg:border-t-0 border-white/30 p-3 lg:pt-16">
              {/* Color palette */}
              <div className="flex lg:flex-col flex-row flex-wrap items-center justify-center gap-2">
                {PALETTE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectColor(color)}
                    className="relative w-9 h-9 lg:w-10 lg:h-10 border-4 transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color && !isEraser ? '#FFFFFF' : 'rgba(0,0,0,0.6)',
                      boxShadow:
                        selectedColor === color && !isEraser
                          ? `0 0 12px ${color}, 0 0 24px ${color}60`
                          : 'none',
                      transform: selectedColor === color && !isEraser ? 'scale(1.15)' : undefined,
                    }}
                    title={color}
                  >
                    {selectedColor === color && !isEraser && (
                      <div className="absolute inset-0 border-2 border-white/50 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="lg:w-full lg:h-1 w-1 h-full bg-white/20 lg:my-1 mx-1 lg:mx-0" />

              {/* Brush size */}
              <div className="flex lg:flex-col flex-row items-center gap-1">
                <span className="font-pixel text-white/60 text-[10px]">SIZE</span>
                <input
                  type="range"
                  min={4}
                  max={50}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="lg:w-16 w-16 h-2 accent-secondary"
                  style={{ writingMode: 'horizontal-tb' }}
                />
              </div>

              {/* Divider */}
              <div className="lg:w-full lg:h-1 w-1 h-full bg-white/20 lg:my-1 mx-1 lg:mx-0" />

              {/* Magic Wand button */}
              <button
                onClick={autoColor}
                className="w-10 h-10 lg:w-12 lg:h-12 border-4 bg-white/10 border-white/40 text-white/70 hover:bg-[#A259FF] hover:border-white hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Magic Auto-Color"
              >
                <Wand2 className="w-6 h-6" />
              </button>

               {/* Bucket button */}
              <button
                onClick={toggleBucket}
                className={`w-10 h-10 lg:w-12 lg:h-12 border-4 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isBucket
                    ? 'bg-secondary border-white text-white shadow-[0_0_15px_rgba(0,191,255,0.6)]'
                    : 'bg-white/10 border-white/40 text-white/70 hover:bg-white/20'
                }`}
                title="Paint Bucket (Flood Fill)"
              >
                <PaintBucket className="w-6 h-6" />
              </button>

              {/* Eraser button */}
              <button
                onClick={toggleEraser}
                className={`w-10 h-10 lg:w-12 lg:h-12 border-4 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isEraser
                    ? 'bg-arcade-red border-white text-white shadow-[0_0_15px_rgba(255,49,49,0.6)]'
                    : 'bg-white/10 border-white/40 text-white/70 hover:bg-white/20'
                }`}
                title="Eraser"
              >
                <Eraser className="w-6 h-6" />
              </button>

              {/* Clear button */}
              <button
                onClick={clearCanvas}
                className="w-10 h-10 lg:w-12 lg:h-12 border-4 bg-white/10 border-white/40 text-white/70 hover:bg-arcade-red hover:border-white hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Clear All"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
