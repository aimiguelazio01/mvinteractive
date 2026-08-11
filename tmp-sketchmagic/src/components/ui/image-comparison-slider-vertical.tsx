import * as React from "react";
import { cn } from "@/lib/utils"; 
import { GripVertical } from "lucide-react";

// Define the props for the component
interface ImageComparisonSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  topImage: string;
  bottomImage: string;
  altTop?: string;
  altBottom?: string;
  initialPosition?: number;
  handleIcon?: React.ReactNode;
}

export const ImageComparisonSlider = React.forwardRef<
  HTMLDivElement,
  ImageComparisonSliderProps
>(
  (
    {
      className,
      topImage,
      bottomImage,
      altTop = "Top image",
      altBottom = "Bottom image",
      initialPosition = 50,
      handleIcon,
      ...props
    },
    ref
  ) => {
    // State to manage slider position (0 to 100)
    const [sliderPosition, setSliderPosition] = React.useState(initialPosition);
    // State to track if the mouse is hovering over the container
    const [isHovering, setIsHovering] = React.useState(false);
    // Ref for the container element to calculate relative cursor position
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Function to handle slider movement
    const handleMove = (clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Calculate position as a percentage of the container's height
      const y = clientY - rect.top;
      let newPosition = (y / rect.height) * 100;

      // Clamp the position between 0 and 100
      if (newPosition < 0) newPosition = 0;
      if (newPosition > 100) newPosition = 100;

      setSliderPosition(newPosition);
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full overflow-hidden select-none group",
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={(e) => {
          setIsHovering(true);
          handleMove(e.clientY);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setSliderPosition(initialPosition);
        }}
        onTouchStart={() => setIsHovering(true)}
        onTouchMove={(e) => {
          setIsHovering(true);
          handleMove(e.touches[0].clientY);
        }}
        onTouchEnd={() => {
          setIsHovering(false);
          setSliderPosition(initialPosition);
        }}
        {...props}
      >
        {/* Bottom Image */}
        <img
          src={bottomImage}
          alt={altBottom}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        {/* Top Image (clipped) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 0 ${100 - sliderPosition}% 0)` }}
        >
          <img
            src={topImage}
            alt={altTop}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Slider Handle */}
        <div
          className={cn(
            "absolute left-0 w-full h-px -translate-y-1/2 bg-white/50 pointer-events-none z-50",
            !isHovering && "transition-[top] duration-300 ease-out"
          )}
          style={{ top: `${sliderPosition}%` }}
          role="separator"
          aria-orientation="vertical"
        >
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white shadow-xl transition-transform group-hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2 border-white"
            aria-label="Drag to compare images"
            aria-valuenow={sliderPosition}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-controls="image-comparison-container"
          >
            {handleIcon || <GripVertical className="h-5 w-5 rotate-90" />}
          </button>
        </div>
      </div>
    );
  }
);

ImageComparisonSlider.displayName = "ImageComparisonSlider";
