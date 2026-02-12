"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Sparkles, User, Bot, MicOff } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatWindowProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    currentEmotion: { face: string; confidence: number; voice: string };
}

export default function ChatWindow({ messages, onSendMessage, isLoading, currentEmotion }: ChatWindowProps) {
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null); // Type as any for Web Speech API

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Stop after one sentence for now, or true for dictation
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result) => result.transcript)
                        .join('');
                    setInput(transcript);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                    // Optional: Automatically send on end? For now, let user review and send.
                    // setInput(prev => { if(prev) onSendMessage(prev); return "" }); 
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput("");
        }
    };

    // Helper to get badge variant for emotion
    const getEmotionBadgeVariant = (emotion: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' => {
        switch (emotion) {
            case 'happy': return 'success';
            case 'sad': return 'info';
            case 'angry': return 'danger';
            case 'surprised': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <Card variant="glass" className="flex flex-col h-full border-none p-0 overflow-hidden relative group">

            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50" />

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            EmpaAI <span className="text-xs font-mono text-primary/80 ml-1">v2.0</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online & Observing
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm bg-black/30 p-2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Face</span>
                        <Badge variant={getEmotionBadgeVariant(currentEmotion.face)} className="capitalize">
                            {currentEmotion.face} <span className="text-xs opacity-70 ml-1">{(currentEmotion.confidence * 100).toFixed(0)}%</span>
                        </Badge>
                    </div>
                    <div className="w-px h-4 bg-white/10"></div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Voice</span>
                        <Badge variant="glass" className="capitalize text-slate-200">
                            {currentEmotion.voice}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl absolute" />
                            <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <Bot className="w-12 h-12 text-primary mx-auto mb-2" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Ready when you are</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">
                                    I'm listening to your voice and seeing your expressions to better understand you.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={clsx(
                                "flex w-full gap-3",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 mt-1 shrink-0">
                                    <Bot size={16} className="text-primary" />
                                </div>
                            )}

                            <div
                                className={clsx(
                                    "max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg backdrop-blur-sm",
                                    msg.role === 'user'
                                        ? "bg-primary text-white rounded-br-sm border border-primary-foreground/10"
                                        : "bg-white/5 text-slate-100 rounded-bl-sm border border-white/10 hover:bg-white/10 transition-colors"
                                )}
                            >
                                {msg.content}
                                <div className={clsx(
                                    "text-[10px] mt-2 opacity-50",
                                    msg.role === 'user' ? "text-primary-foreground" : "text-slate-400"
                                )}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/10 mt-1 shrink-0">
                                    <User size={16} className="text-slate-300" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 mt-1 shrink-0">
                                <Bot size={16} className="text-primary" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                <form onSubmit={handleSubmit} className="flex gap-3 relative">
                    <div className="relative flex-1">
                        <Input
                            variant="glass"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type your message..."}
                            className={clsx(
                                "h-12 pr-12 rounded-xl transition-all",
                                isListening && "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-primary/5 placeholder:text-primary"
                            )}
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleListening}
                            className={clsx(
                                "absolute right-2 top-1/2 -translate-y-1/2 transition-colors duration-300",
                                isListening ? "text-red-500 animate-pulse hover:text-red-400" : "text-slate-400 hover:text-white"
                            )}
                            title={isListening ? "Stop Listening" : "Start Voice Input"}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={clsx(
                            "h-12 w-12 rounded-xl p-0 flex items-center justify-center transition-all",
                            input.trim() ? "bg-primary shadow-lg shadow-primary/25" : "bg-slate-800 text-slate-500"
                        )}
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
