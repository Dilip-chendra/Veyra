"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

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
      console.warn("Cartesia stream error, falling back to speech synthesis:", e);
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

export function RealtimeVoiceExperience() {
  const [persona, setPersona] = useState<"marcus" | "elena">("marcus");
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const srcRef = useRef<VoicePlayerHandle | null>(null);

  const handleVoicePlay = useCallback(async () => {
    if (speaking) {
      try { srcRef.current?.stop(); } catch {}
      srcRef.current = null;
      setSpeaking(false);
      return;
    }

    setLoading(true);
    const sampleText =
      persona === "marcus"
        ? "Tell me about the most challenging distributed database bottleneck you resolved. What were your specific consistency vs latency trade-offs?"
        : "Walk me through how you benchmarked your vector index under peak load. Where did the memory footprint become unsustainable?";

    try {
      const src = await playCartesiaVoice(persona === "marcus" ? "male" : "female", sampleText);
      srcRef.current = src;
      if (src) {
        setSpeaking(true);
        src.onended = () => {
          setSpeaking(false);
          srcRef.current = null;
        };
      }
    } catch {
      setSpeaking(false);
    } finally {
      setLoading(false);
    }
  }, [persona, speaking]);

  useEffect(() => {
    return () => {
      try { srcRef.current?.stop(); } catch {}
    };
  }, []);

  return (
    <section id="features" className="py-32 bg-[#06070d] border-t border-white/[0.04] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            07 / Realtime Audio Synthesis
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[0.98]">
            NOT A CHATBOT.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
              A CONVERSATION.
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Powered by Cartesia Sonic-3.6 and Ink-2. Veyra streams speech with human cadence, sub-400ms turnaround, and natural interruption handling. Click below to hear live generation.
          </p>

          {/* Persona Selector */}
          <div className="flex gap-3">
            {[
              { id: "marcus", name: "Marcus Vance", role: "Engineering Director", photo: "/avatars/interviewer_male.jpg" },
              { id: "elena", name: "Elena Rostova", role: "Principal Architect", photo: "/avatars/interviewer_female.jpg" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (speaking) {
                    try { srcRef.current?.stop(); } catch {}
                    setSpeaking(false);
                  }
                  setPersona(p.id as any);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  persona === p.id
                    ? "border-indigo-500/60 bg-indigo-950/30 text-white shadow-lg shadow-indigo-950/40"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 relative">
                  <Image src={p.photo} alt={p.name} fill className="object-cover" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.role}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Real Audio Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              data-testid="voice-preview-btn"
              onClick={handleVoicePlay}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 cursor-pointer"
            >
              {/* Waveform Bars */}
              <div className="flex items-center gap-1">
                {[4, 8, 14, 7, 12, 5].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 bg-white rounded-full transition-all ${
                      speaking ? "animate-pulse" : ""
                    }`}
                    style={{
                      height: speaking ? `${Math.max(6, (h * 1.5) % 20)}px` : "8px",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <span>
                {loading ? "Synthesizing Speech..." : speaking ? "Stop Voice Playback" : `Hear ${persona === "marcus" ? "Marcus" : "Elena"} Speak`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Photographic Presence */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[440px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/50 bg-black">
            <Image
              src={persona === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
              alt="Interviewer"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Bottom Status HUD */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">
                  {persona === "marcus" ? "Marcus Vance" : "Elena Rostova"}
                </div>
                <div className="text-[10px] font-mono text-indigo-400">
                  {speaking ? "STREAMING AUDIO (CARTESIA SONIC-3.6)" : "STANDBY • READY TO CONVERSE"}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
