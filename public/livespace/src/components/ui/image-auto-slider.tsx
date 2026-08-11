
export const Component = () => {
  // Use local images from the project's public folder
  const images = [
    "/img_01.jpg",
    "/img_02.jpg",
    "/img_03.jpg",
    "/img_04.jpg",
    "/img_05.jpg",
    "/img_06.jpg",
    "/img_07.jpg",
    "/img_08.jpg",
    "/img_09.jpg",
    "/img_10.jpg",
    "/img_11.jpg"
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <>
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right 40s linear infinite;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .image-item {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
        }

        .image-item:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }

        .glass-panel {
          background: rgba(249, 249, 249, 0.7);
          backdrop-filter: blur(24px);
        }
      `}</style>
      
      <section className="py-24 px-8 md:px-20" style={{ backgroundColor: '#081a09' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header section with MONOLITH styling */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <span className="text-white/60 font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.4em] mb-4 block">Render Gallery</span>
              <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl tracking-tighter uppercase text-white leading-none">Project Studies</h2>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest border-b border-white pb-1 text-white hover:text-white/80 transition-colors">
              View Full Archive
            </button>
          </div>

          {/* Scrolling images container */}
          <div className="relative w-full overflow-hidden">
            <div className="scroll-container w-full">
              <div className="infinite-scroll flex gap-8 w-max py-4">
                {duplicatedImages.map((image, index) => (
                  <div
                    key={index}
                    className="image-item group relative flex-shrink-0 w-80 h-80 md:w-[500px] md:h-[500px] rounded-sm overflow-hidden shadow-sm bg-stone-200"
                  >
                    <img
                      src={image}
                      alt={`Gallery study ${(index % images.length) + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
