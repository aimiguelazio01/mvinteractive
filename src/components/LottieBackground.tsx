import React, { useEffect, useRef, useCallback } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottieBackgroundProps {
    url: string;
    className?: string;
    opacity?: number;
    progress?: number; // 0 to 1
}

const LottieBackground: React.FC<LottieBackgroundProps> = ({ url, className, opacity = 0.5, progress }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<AnimationItem | null>(null);
    const lastFrameRef = useRef<number>(-1);
    const rafIdRef = useRef<number | null>(null);
    const pendingProgressRef = useRef<number | undefined>(undefined);

    // Initialize lottie-web with canvas renderer
    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up any previous animation
        if (animRef.current) {
            animRef.current.destroy();
            animRef.current = null;
        }
        lastFrameRef.current = -1;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (!containerRef.current) return;

                animRef.current = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'canvas',
                    loop: progress === undefined,
                    autoplay: progress === undefined,
                    animationData: data,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice',
                        clearCanvas: true,
                        progressiveLoad: true,
                    },
                });

                // If we already have a progress value queued, apply it
                if (pendingProgressRef.current !== undefined) {
                    requestAnimationFrame(() => updateFrame());
                }
            })
            .catch((error) => console.error('Error loading lottie animation:', error));

        return () => {
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [url]);

    // Frame update function — coalesced via rAF
    const updateFrame = useCallback(() => {
        rafIdRef.current = null;
        const prog = pendingProgressRef.current;
        const anim = animRef.current;

        if (anim && prog !== undefined) {
            const totalFrames = anim.totalFrames;

            if (totalFrames > 0) {
                const targetFrame = Math.max(0, Math.min(prog * totalFrames, totalFrames - 0.01));

                // Skip near-identical frames to avoid redundant repaints
                if (Math.abs(targetFrame - lastFrameRef.current) < 0.5) {
                    return;
                }
                lastFrameRef.current = targetFrame;
                anim.goToAndStop(targetFrame, true);
            }
        }
    }, []);

    // Schedule frame update when progress changes
    useEffect(() => {
        pendingProgressRef.current = progress;

        // Coalesce rapid scroll events into a single paint per frame
        if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(updateFrame);
        }

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [progress, updateFrame]);

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ opacity }}>
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default LottieBackground;
