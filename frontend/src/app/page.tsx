"use client";

import { useState } from "react";
import MediaCapturer from "@/components/MediaCapturer";
import ChatWindow from "@/components/ChatWindow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Brain, Sparkles, Activity } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function Home() {
  const [emotion, setEmotion] = useState({ face: "neutral", confidence: 0, voice: "silent" });
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm EmpaAI. I'm actively analyzing your expressions and voice to understand you better. How can I help?", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message immediately
    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Call backend API
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          emotion_context: {
            face: emotion.face,
            voice: emotion.voice,
            text: "neutral"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMsg: Message = {
        role: 'assistant',
        content: data.response || "I'm having trouble understanding right now.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I lost connection to my brain. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-primary/30">

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[150px] rounded-full opacity-40"></div>
      </div>

      <div className="z-10 flex flex-col md:flex-row w-full h-full max-w-[1920px] mx-auto p-4 md:p-6 gap-6">

        {/* Sidebar / Media Area */}
        <aside className="w-full md:w-96 flex flex-col gap-6 shrink-0">

          {/* Branding Card */}
          <Card variant="glass" className="p-5 flex items-center gap-3 backdrop-blur-xl bg-white/5 border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Brain className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                EmpaAI
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">EMOTION ENGINE</p>
            </div>
          </Card>

          {/* Visual Input Card */}
          <Card variant="glass" className="p-4 space-y-4 bg-black/20 overflow-visible">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} className="text-accent" /> Sensory Input
              </h3>
              <Badge variant="glass" className="text-[10px] px-1.5 py-0">LIVE</Badge>
            </div>

            <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
              <MediaCapturer onEmotionUpdate={setEmotion} />
            </div>

            <div className="space-y-3 pt-2">
              {/* Face Stats */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <span>Expression</span>
                  <span className="text-primary">{Math.round(emotion.confidence * 100)}% Conf</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="capitalize font-medium text-slate-200 text-lg">{emotion.face}</span>
                </div>
                {/* Simple visual bar for confidence */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${emotion.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Voice Stats */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <span>Vocal Tone</span>
                </div>
                <div className="flex items-center gap-2">
                  {emotion.voice !== 'silent' ? (
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-600" />
                  )}
                  <span className="capitalize font-medium text-slate-200 text-lg">{emotion.voice}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card variant="glass" className="mt-auto p-4 bg-white/5">
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-500 uppercase">System Status</h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Backend</span>
                <span className="text-green-400 font-mono">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Model</span>
                <span className="text-blue-400 font-mono">GEMINI-PRO</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Latency</span>
                <span className="text-slate-300 font-mono">12ms</span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 h-full min-w-0">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            currentEmotion={emotion}
          />
        </section>
      </div>
    </main>
  );
}
