"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Volume2, Sparkles, Shield, Cpu, Square } from "lucide-react";

interface VoicePlayerHandle {
  stop: () => void;
  onended?: () => void;
}

// Real Cartesia PCM Audio Streaming Player with Web Speech fallback
async function playCartesiaVoice(
  gender: "male" | "female",
  text: string
): Promise<VoicePlayerHandle | null> {
  const AudioContextClass = typeof window !== "undefined"
    ? (window.AudioContext || (window as any).webkitAudioContext)
    : null;

  if (AudioContextClass) {
    try {
      const audioCtx = new AudioContextClass({ sampleRate: 44100 });
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const res = await fetch("/api/cartesia/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender, isPreview: true }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const chunks: Float32Array[] = [];
        let totalSamples = 0;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") break;
              try {
                const parsed = JSON.parse(raw);
                const b64 = parsed.data || parsed.audio;
                if (b64) {
                  const binary = atob(b64);
                  const numFloats = Math.floor(binary.length / 4);
                  if (numFloats > 0) {
                    const u8 = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
                    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
                    const f32Chunk = new Float32Array(numFloats);
                    for (let i = 0; i < numFloats; i++) {
                      f32Chunk[i] = dv.getFloat32(i * 4, true); // little-endian
                    }
                    chunks.push(f32Chunk);
                    totalSamples += numFloats;
                  }
                }
              } catch {}
            }
          }
        }

        if (totalSamples > 0) {
          const audioBuffer = audioCtx.createBuffer(1, totalSamples, 44100);
          const channelData = audioBuffer.getChannelData(0);
          let offset = 0;
          for (const chunk of chunks) {
            channelData.set(chunk, offset);
            offset += chunk.length;
          }

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          const handle: VoicePlayerHandle = {
            stop: () => {
              try { source.stop(); } catch {}
              try { audioCtx.close(); } catch {}
            },
            onended: undefined,
          };
          source.onended = () => {
            try { audioCtx.close(); } catch {}
            if (handle.onended) handle.onended();
          };
          source.start(0);
          return handle;
        }
      }
    } catch (e) {
      console.warn("Cartesia stream encountered error, falling back to speech synthesis:", e);
    }
  }

  // Graceful browser SpeechSynthesis fallback
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    utter.pitch = gender === "male" ? 0.92 : 1.05;

    const voices = synth.getVoices();
    if (gender === "male") {
      const maleVoice = voices.find(v => /david|mark|alex|male|george|james/i.test(v.name));
      if (maleVoice) utter.voice = maleVoice;
    } else {
      const femaleVoice = voices.find(v => /zira|samantha|victoria|female|elena|karen/i.test(v.name));
      if (femaleVoice) utter.voice = femaleVoice;
    }

    const handle: VoicePlayerHandle = {
      stop: () => {
        synth.cancel();
      },
      onended: undefined,
    };

    utter.onend = () => {
      if (handle.onended) handle.onended();
    };
    utter.onerror = () => {
      if (handle.onended) handle.onended();
    };

    synth.speak(utter);
    return handle;
  }

  return null;
}

const TYPEWRITER_PHRASES = [
  "YOUR SYSTEM ARCHITECTURE.",
  "YOUR REAL CODE COMMITS.",
  "YOUR CONCURRENCY TRADEOFFS.",
  "YOUR EXACT RESUME CLAIMS.",
  "YOUR FAILURE DOMAIN LOGIC.",
];

export function HeroExperience() {
  const [selectedPersona, setSelectedPersona] = useState<"marcus" | "elena">("marcus");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);

  // Typewriter effect state for headline
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [headlineText, setHeadlineText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect state for active inquiry probe
  const [probeText, setProbeText] = useState("");

  const currentSourceRef = useRef<VoicePlayerHandle | null>(null);

  const personas = {
    marcus: {
      name: "Marcus Vance",
      role: "Engineering Director",
      experience: "Ex-Staff Distributed Systems",
      photo: "/avatars/interviewer_male.jpg",
      voiceSampleText: "Hello. I've analyzed your distributed queue repository and your resume. Before we write any code, walk me through how your Raft cluster handles leader heartbeats during an asymmetric network partition.",
      activeProbe: "Walk me through how your Raft cluster handles leader heartbeats during an asymmetric network partition.",
      contextTag: "Raft Quorum · Distributed Consensus",
      turnNumber: "Turn 03"
    },
    elena: {
      name: "Elena Rostova",
      role: "Principal Systems Architect",
      experience: "Cloud Platforms & Core Infrastructure",
      photo: "/avatars/interviewer_female.jpg",
      voiceSampleText: "Welcome. Let's dig into your event-driven data pipeline. When your Kafka consumer lag spikes by 500 percent during peak load, what backpressure strategy prevents downstream database connection exhaustion?",
      activeProbe: "When your Kafka consumer lag spikes 500%, what backpressure strategy prevents database connection pool exhaustion?",
      contextTag: "Kafka Backpressure · Connection Pool Exhaustion",
      turnNumber: "Turn 04"
    }
  };

  const current = personas[selectedPersona];

  // 1. Headline Typewriter Effect Loop
  useEffect(() => {
    const fullPhrase = TYPEWRITER_PHRASES[headlineIndex];
    const typingSpeed = isDeleting ? 38 : 65;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (headlineText.length < fullPhrase.length) {
          setHeadlineText(fullPhrase.slice(0, headlineText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (headlineText.length > 0) {
          setHeadlineText(fullPhrase.slice(0, headlineText.length - 1));
        } else {
          setIsDeleting(false);
          setHeadlineIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [headlineText, isDeleting, headlineIndex]);

  // 2. Active Probe Typewriter Effect (runs when persona changes)
  useEffect(() => {
    setProbeText("");
    let charIdx = 0;
    const probe = current.activeProbe;

    const interval = setInterval(() => {
      if (charIdx <= probe.length) {
        setProbeText(probe.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [selectedPersona, current.activeProbe]);

  // Stop any active audio when switching persona or unmounting
  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingVoice(false);
  }, []);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const handlePersonaChange = (p: "marcus" | "elena") => {
    if (p === selectedPersona) return;
    stopAudio();
    setSelectedPersona(p);
  };

  const handleVoiceToggle = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsLoadingVoice(true);
      const handle = await playCartesiaVoice(
        selectedPersona === "marcus" ? "male" : "female",
        current.voiceSampleText
      );
      setIsLoadingVoice(false);

      if (handle) {
        currentSourceRef.current = handle;
        setIsPlaying(true);
        handle.onended = () => {
          setIsPlaying(false);
          currentSourceRef.current = null;
        };
      }
    } catch {
      setIsLoadingVoice(false);
      setIsPlaying(false);
    }
  };

  return (
    <section 
      className="relative z-10 min-h-[92vh] flex flex-col justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent text-white overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] pointer-events-none rounded-full blur-[160px] opacity-25"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.45) 0%, rgba(147, 51, 234, 0.2) 40%, transparent 70%)"
        }}
      />
      <div 
        className="absolute top-2/3 right-1/4 w-[600px] h-[400px] pointer-events-none rounded-full blur-[180px] opacity-15"
        style={{
          background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.3) 0%, transparent 70%)"
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:pt-4">
          
          {/* Left Column: Hero Narrative & Controls */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-300 font-semibold">
                Veyra 2.0 · Autonomous Voice Intelligence
              </span>
            </div>

            {/* Monolithic Kinetic Headline with Stable Fixed Container (Prevents Layout Jitter) */}
            <div className="w-full min-h-[160px] sm:min-h-[200px] md:min-h-[230px] flex flex-col justify-start">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.035em] leading-[1.04] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                THE INTERVIEW <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400">
                  ADAPTS TO{" "}
                </span>
                <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100 font-serif italic tracking-tight">
                  {headlineText}
                </span>
                <span className="inline-block w-1 sm:w-1.5 h-8 sm:h-12 bg-amber-400 animate-pulse ml-1 align-middle" />
              </h1>
            </div>

            {/* Subhead with strict product philosophy */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
              Veyra doesn&apos;t just ask questions. Veyra <strong className="text-white font-semibold underline decoration-indigo-500/50 underline-offset-4">interviews you</strong>. 
              An autonomous engineering director that inspects your actual code, listens to your architectural choices, 
              and interrogates edge cases in real time with sub-200ms voice turn latency.
            </p>

            {/* Persona Selector Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Choose Evaluator:</span>
              <div className="inline-flex p-1 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <button
                  onClick={() => handlePersonaChange("marcus")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedPersona === "marcus"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <Image src="/avatars/interviewer_male.jpg" alt="Marcus" width={20} height={20} className="w-full h-full object-cover" />
                  </div>
                  <span>Marcus Vance (Director)</span>
                </button>
                <button
                  onClick={() => handlePersonaChange("elena")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedPersona === "elena"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <Image src="/avatars/interviewer_female.jpg" alt="Elena" width={20} height={20} className="w-full h-full object-cover" />
                  </div>
                  <span>Elena Rostova (Architect)</span>
                </button>
              </div>
            </div>

            {/* CTA & Voice Preview Row */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Live Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Cartesia Voice Preview Button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isLoadingVoice}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all backdrop-blur-md"
              >
                {isLoadingVoice ? (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Square className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                )}
                <span>
                  {isLoadingVoice
                    ? "Connecting Cartesia..."
                    : isPlaying
                    ? "Pause Voice Sample"
                    : `Hear ${current.name.split(" ")[0]} Speak`}
                </span>
                
                {/* Audio visualizer dots */}
                {isPlaying && (
                  <div className="flex items-center gap-1 ml-1">
                    <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-indigo-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
                  </div>
                )}
              </button>
            </div>

            {/* Bottom Proof Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 border-t border-white/[0.08] pt-6 w-full">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sonic-3.6 TTS · Ink-2 STT</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Hallucination Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Dynamic Branching Reasoning</span>
              </div>
            </div>

          </div>

          {/* Right Column: Completely Static Focal Interviewer Stage (No Mouse Tilt / No Layout Shift) */}
          <div 
            className="lg:col-span-5 flex flex-col items-center justify-center w-full"
          >
            {/* Top context badge (fully visible, aligned) */}
            <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <div className="flex items-center gap-2 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Repository Ingested</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Audio 44.1kHz</span>
              </div>
            </div>

            {/* Focal Portrait Card: Completely Static */}
            <div 
              className="relative w-full max-w-[420px] rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.02] p-2.5 shadow-2xl shadow-black/80"
            >
              
              {/* Photo Viewport */}
              <div className="relative aspect-[4/4.7] w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                <Image
                  src={current.photo}
                  alt={current.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-cover object-top filter brightness-[0.98] contrast-[1.05]"
                  priority
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-transparent to-black/25 pointer-events-none" />

                {/* Top Status Overlay */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{current.turnNumber} · ACTIVE COGNITION</span>
                </div>

                {/* Top Audio Stream Equalizer */}
                <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-indigo-300 shadow-lg">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlaying ? "STREAMING" : "READY"}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <span className={`w-0.5 h-2 bg-indigo-400 rounded-full ${isPlaying ? "animate-pulse" : ""}`} />
                    <span className={`w-0.5 h-3 bg-indigo-400 rounded-full ${isPlaying ? "animate-pulse delay-75" : ""}`} />
                    <span className={`w-0.5 h-1.5 bg-indigo-400 rounded-full ${isPlaying ? "animate-pulse delay-150" : ""}`} />
                  </div>
                </div>

                {/* Sleek Live Typing Probe Overlay at bottom of portrait */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 shadow-xl min-h-[96px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        Active Inquiry Probe
                      </span>
                      <span className="text-slate-400">{current.contextTag}</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-white font-medium leading-snug italic font-serif">
                      &ldquo;{probeText}&rdquo;
                      <span className="inline-block w-1 h-3 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-slate-200 font-semibold">{current.name}</span>
                    <span>{current.role}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom feature pill (fully visible, aligned) */}
            <div className="w-full max-w-[420px] mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="text-slate-400">Sub-200ms Turn-Taking</span>
              <span className="text-indigo-400">Zero Scripting Engine</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
