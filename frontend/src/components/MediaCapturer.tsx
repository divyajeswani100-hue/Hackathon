"use client";

import React, { useRef, useEffect, useState } from 'react';
// import * as faceapi from 'face-api.js'; // Removed static import
import { Card } from './ui/Card';
import { Activity, Camera, Eye, Wifi, AlertCircle } from 'lucide-react';
import { Badge } from './ui/Badge';

interface MediaCapturerProps {
    onEmotionUpdate: (emotion: { face: string; confidence: number; voice: string }) => void;
}

export default function MediaCapturer({ onEmotionUpdate }: MediaCapturerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const faceApiRef = useRef<any>(null); // Store face-api module

    useEffect(() => {
        const loadModels = async () => {
            try {
                const faceapi = await import('face-api.js');
                faceApiRef.current = faceapi;

                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelLoaded(true);
            } catch (err) {
                console.error("Failed to load models or face-api", err);
                setError("Failed to load AI models");
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (isModelLoaded) {
            startVideo();
        }
    }, [isModelLoaded]);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {}, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                    videoRef.current.muted = true; // prevent feedback loop since we are capturing audio
                }
            })
            .catch((err) => {
                console.error("Error accessing webcam:", err);
                setError("Camera/Microphone access denied");
            });
    };

    useEffect(() => {
        let audioContext: AudioContext;
        let analyser: AnalyserNode;
        let microphone: MediaStreamAudioSourceNode;
        let scriptProcessor: ScriptProcessorNode;

        const analyzeAudio = (stream: MediaStream) => {
            // Check if stream has audio tracks
            if (stream.getAudioTracks().length === 0) {
                console.warn("No audio track available in stream");
                return;
            }

            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyser = audioContext.createAnalyser();

            try {
                microphone = audioContext.createMediaStreamSource(stream);
                scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                scriptProcessor.onaudioprocess = () => {
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);

                    // Calculate Volume (RMS approximation)
                    let values = 0;
                    const length = array.length;
                    for (let i = 0; i < length; i++) {
                        values += array[i];
                    }
                    const average = values / length;

                    let voiceState = "neutral";
                    // Simple thresholding
                    if (average < 10) voiceState = "silent";
                    else if (average < 30) voiceState = "calm";
                    else if (average < 60) voiceState = "normal";
                    else voiceState = "energetic";

                    currentVoiceRef.current = voiceState;
                };
            } catch (e) {
                console.error("Error setting up audio analysis:", e);
            }
        };

        if (stream) {
            analyzeAudio(stream);
        }

        return () => {
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [stream]);

    const currentVoiceRef = useRef("silent");

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const detectEmotion = async () => {
            let faceEmotion = "neutral";
            let faceConfidence = 0;
            const faceapi = faceApiRef.current;

            if (videoRef.current && isModelLoaded && faceapi && !videoRef.current.paused && !videoRef.current.ended) {
                try {
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceExpressions();

                    if (detections.length > 0) {
                        const expressions = detections[0].expressions;
                        const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
                        if (sorted[0]) {
                            faceEmotion = sorted[0][0];
                            faceConfidence = sorted[0][1] as number;
                        }
                    }
                } catch (e) {
                    // ignore detection errors
                }
            }

            onEmotionUpdate({
                face: faceEmotion,
                confidence: faceConfidence,
                voice: currentVoiceRef.current
            });
        };

        if (isModelLoaded && stream) {
            interval = setInterval(detectEmotion, 500);
        }

        return () => clearInterval(interval);
    }, [isModelLoaded, stream, onEmotionUpdate]);

    return (
        <Card variant="glass" className="relative p-0 overflow-hidden group border-white/5 bg-black/40">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 pointer-events-none" />

            {/* Status Overlays */}
            <div className="absolute top-3 left-3 z-20 flex gap-2">
                <Badge variant={error ? 'danger' : 'success'} className="backdrop-blur-md bg-black/50 border-white/10">
                    {error ? (
                        <><AlertCircle size={12} className="mr-1" /> Error</>
                    ) : (
                        <><Wifi size={12} className="mr-1 animate-pulse" /> Live Feed</>
                    )}
                </Badge>
            </div>

            <div className="relative aspect-video w-full bg-slate-950">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover opacity-80 mix-blend-screen scale-105 group-hover:scale-100 transition-transform duration-700"
                    onPlay={() => console.log("Video started")}
                />

                {/* Tech Overlays / Scifi UI */}
                <div className="absolute inset-0 border-[1px] border-white/5 z-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50"></div>

                    {/* Center Focus Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                </div>

                {!isModelLoaded && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-30 backdrop-blur-sm text-slate-300">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                        <span className="text-xs font-mono animate-pulse">Initializing Neural Nets...</span>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-30 backdrop-blur-sm text-red-400">
                        <AlertCircle size={24} className="mb-2" />
                        <span className="text-xs font-mono">{error}</span>
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Camera size={10} /> source_01
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                        {stream ? "ACTIVE" : "OFFLINE"}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Activity size={10} /> Analysis
                    </span>
                    <span className="text-xs text-primary font-mono">
                        RUNNING
                    </span>
                </div>
            </div>
        </Card>
    );
}
