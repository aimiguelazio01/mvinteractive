import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { motion } from 'framer-motion';

interface HandTrackerProps {
    onHandMove: (pos: { x: number; y: number; isPinching?: boolean }) => void;
    active: boolean;
    onStatusChange?: (status: 'idle' | 'loading' | 'ready' | 'error', handDetected: boolean, progress: number) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandMove, active, onStatusChange }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const rafRef = useRef<number>(0);
    const onHandMoveRef = useRef(onHandMove);
    const streamRef = useRef<MediaStream | null>(null);
    const lastVideoTimeRef = useRef(-1);

    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [handDetected, setHandDetected] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    useEffect(() => { onHandMoveRef.current = onHandMove; }, [onHandMove]);

    useEffect(() => {
        if (onStatusChange) {
            onStatusChange(status, handDetected, loadProgress);
        }
    }, [status, handDetected, loadProgress, onStatusChange]);

    const predict = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;

        if (landmarker && video && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;
                const results = landmarker.detectForVideo(video, performance.now());

                if (results.landmarks && results.landmarks.length > 0) {
                    const lm = results.landmarks[0][9];
                    const indexTip = results.landmarks[0][8];
                    const thumbTip = results.landmarks[0][4];

                    const dist = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
                    const isPinching = dist < 0.05;

                    const x = (1 - lm.x) * 2 - 1;
                    const y = -(lm.y * 2 - 1);
                    onHandMoveRef.current({ x, y, isPinching });
                    setHandDetected(true);
                } else {
                    setHandDetected(false);
                }
            }
        }
        rafRef.current = requestAnimationFrame(predict);
    }, []);

    useEffect(() => {
        if (!active) {
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            landmarkerRef.current?.close();
            landmarkerRef.current = null;
            setStatus('idle');
            setHandDetected(false);
            setLoadProgress(0);
            return;
        }

        let cancelled = false;
        async function bootstrap() {
            setStatus('loading');
            setLoadProgress(0);
            try {
                // Fetch vision wasm fileset
                const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm');
                if (cancelled) return;
                setLoadProgress(20);

                // Fetch model with progress
                const response = await fetch('https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task');
                const contentLength = +(response.headers.get('Content-Length') || 0);
                const reader = response.body?.getReader();
                if (!reader) throw new Error('Failed to read model body');

                let receivedLength = 0;
                const chunks = [];
                while(true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    receivedLength += value.length;
                    if (contentLength) {
                        setLoadProgress(20 + Math.round((receivedLength / contentLength) * 60)); // 20% to 80% range for model download
                    }
                }
                if (cancelled) return;

                const modelBuffer = new Uint8Array(receivedLength);
                let position = 0;
                for(let chunk of chunks) {
                    modelBuffer.set(chunk, position);
                    position += chunk.length;
                }

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetBuffer: modelBuffer,
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                    minHandDetectionConfidence: 0.5,
                });

                if (cancelled) { landmarker.close(); return; }
                landmarkerRef.current = landmarker;
                setLoadProgress(85);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false,
                });
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setLoadProgress(100);
                setTimeout(() => {
                    if (!cancelled) {
                        setStatus('ready');
                        rafRef.current = requestAnimationFrame(predict);
                    }
                }, 500);
            } catch (err) {
                console.error('[HandTracker] init failed:', err);
                if (!cancelled) setStatus('error');
            }
        }
        bootstrap();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            landmarkerRef.current?.close();
            landmarkerRef.current = null;
            setStatus('idle');
            setHandDetected(false);
        };
    }, [active, predict]);

    const statusColor = status === 'ready' ? (handDetected ? '#68F2EB' : '#ffffff40') : status === 'loading' ? '#facc15' : status === 'error' ? '#f87171' : '#ffffff20';
    const statusLabel = status === 'ready' ? (handDetected ? 'Hand Detected' : 'Tracking...') : status === 'loading' ? 'Loading AI...' : status === 'error' ? 'Error' : '';

    const overlay = (
        <div className={`fixed bottom-8 right-8 w-64 h-48 overflow-hidden rounded-2xl border transition-all duration-500 shadow-2xl ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'} ${status === 'ready' ? 'border-[#68F2EB]/30' : 'border-white/10'} bg-black/80`} style={{ backdropFilter: 'blur(12px)', zIndex: 99999 }}>
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] opacity-80" playsInline muted />
            <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'ready' && handDetected ? 'animate-pulse' : ''}`} style={{ backgroundColor: statusColor }} />
                <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: statusColor }}>{statusLabel}</span>
            </div>
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="2" className="opacity-10" />
                            <motion.circle 
                                cx="32" cy="32" r="28" fill="none" stroke="#68F2EB" strokeWidth="2" 
                                strokeDasharray="175.9"
                                animate={{ strokeDashoffset: 175.9 * (1 - loadProgress / 100) }}
                                transition={{ duration: 0.3 }}
                            />
                        </svg>
                        <span className="absolute text-[10px] font-mono text-[#68F2EB] font-bold">{loadProgress}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest animate-pulse">
                            {loadProgress < 85 ? 'Downloading Model' : 'Starting Camera'}
                        </span>
                        <div className="w-32 h-[1px] bg-white/10 overflow-hidden rounded-full">
                            <motion.div 
                                className="h-full bg-[#68F2EB]"
                                animate={{ width: `${loadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-4">
                    <span className="text-[11px] font-mono text-red-400 text-center leading-tight">Camera or model failed to load</span>
                </div>
            )}
            <div className="absolute inset-3 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#68F2EB]/40 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#68F2EB]/40 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#68F2EB]/40 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#68F2EB]/40 rounded-br-sm" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center px-3 py-1.5 bg-black/50 backdrop-blur-sm">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">MediaPipe v0.10</span>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Palm Tracking</span>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? ReactDOM.createPortal(overlay, document.body) : null;
};

export default HandTracker;
