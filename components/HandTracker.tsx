import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
    onHandMove: (pos: { x: number; y: number }) => void;
    active: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandMove, active }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function init() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            landmarkerRef.current = handLandmarker;
            setIsLoaded(true);
        }

        if (active) {
            init();
        }

        return () => {
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }
        };
    }, [active]);

    useEffect(() => {
        if (!active || !isLoaded) return;

        async function setupCamera() {
            if (!videoRef.current) return;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false,
            });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }

        setupCamera();

        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [active, isLoaded]);

    const predict = () => {
        if (landmarkerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            const startTimeMs = performance.now();
            const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                // Use the index finger tip (landmark 8) or the palm center
                const landmark = results.landmarks[0][8];
                // MediaPipe coords are 0-1. Convert to -1 to 1 for Three.js mouse space
                // x is mirrored in webcam
                const x = (1 - landmark.x) * 2 - 1;
                const y = -(landmark.y * 2 - 1);

                onHandMove({ x, y });
            }
        }
        requestRef.current = requestAnimationFrame(predict);
    };

    useEffect(() => {
        if (active && isLoaded) {
            requestRef.current = requestAnimationFrame(predict);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [active, isLoaded]);

    return (
        <div
            className={`fixed bottom-8 right-8 z-[100] w-48 h-36 overflow-hidden rounded-xl border-2 transition-all duration-500 shadow-2xl ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'} ${isLoaded ? 'border-white/30 bg-black/60' : 'border-white/10 bg-black/40'}`}
            style={{ backdropFilter: 'blur(10px)' }}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1] opacity-60"
                playsInline
                muted
            />

            {/* Overlay Info */}
            <div className="absolute top-2 left-3 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-[10px] font-mono text-gray-800/80 tracking-widest uppercase">
                    {isLoaded ? 'Visual Input' : 'Initializing...'}
                </span>
            </div>

            {!isLoaded && active && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-gray-800/50 text-center uppercase tracking-tighter">
                    Loading AI Model...
                </div>
            )}

            <div className="absolute bottom-2 left-3">
                <span className="text-[9px] font-mono text-gray-800/40 uppercase tracking-widest">Hand Tracker v1.0</span>
            </div>
        </div>
    );
};

export default HandTracker;
