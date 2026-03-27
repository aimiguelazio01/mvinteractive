import React, { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';

interface LottieBackgroundProps {
    url: string;
    className?: string;
    opacity?: number;
    progress?: number; // 0 to 1
}

const LottieBackground: React.FC<LottieBackgroundProps> = ({ url, className, opacity = 0.5, progress }) => {
    const [animationData, setAnimationData] = useState<any>(null);
    const lottieRef = useRef<any>(null);
    const lastFrameRef = useRef<number>(-1);
    const isLoadedRef = useRef(false);

    useEffect(() => {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setAnimationData(data);
                isLoadedRef.current = true;
            })
            .catch((error) => console.error('Error loading lottie animation:', error));
    }, [url]);

    useEffect(() => {
        if (lottieRef.current && progress !== undefined && isLoadedRef.current) {
            const totalFrames = lottieRef.current.getDuration(true);

            if (totalFrames > 0) {
                const targetFrame = Math.max(0, Math.min(progress * totalFrames, totalFrames - 0.01));
                
                if (Math.abs(targetFrame - lastFrameRef.current) < 0.5) {
                    return;
                }
                lastFrameRef.current = targetFrame;
                
                lottieRef.current.goToAndStop(targetFrame, true);
            }
        }
    }, [progress, animationData]);

    if (!animationData) return null;

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ opacity }}>
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={progress === undefined}
                autoplay={progress === undefined}
                rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice'
                }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default LottieBackground;
