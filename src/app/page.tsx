"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useSectionReveal() {
  const { ref, visible } = useInView(0.08);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
    },
  };
}

// Cartesia voice playback
async function playCartesiaVoice(gender: "male" | "female", text: string): Promise<AudioBufferSourceNode | null> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx({ sampleRate: 44100 });
  if (ctx.state === "suspended") await ctx.resume();

  const res = await fetch("/api/cartesia/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, gender, isPreview: true }),
  });
  if (!res.ok) throw new Error("TTS failed");

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;
      try {
        const ev = JSON.parse(jsonStr);
        if (ev.data) {
          const bin = atob(ev.data);
          const b = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
          chunks.push(b);
        }
      } catch {}
    }
  }
  if (!chunks.length) return null;
  const total = chunks.reduce((a, c) => a + c.length, 0);
  const combined = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { combined.set(c, off); off += c.length; }
  const f32 = new Float32Array(combined.buffer, 0, Math.floor(combined.byteLength / 4));
  const audioBuf = ctx.createBuffer(1, f32.length, 44100);
  audioBuf.getChannelData(0).set(f32);
  const src = ctx.createBufferSource();
  src.buffer = audioBuf;
  src.connect(ctx.destination);
  src.start(0);
  return src;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">
      <span className="w-4 h-px bg-indigo-500 opacity-60" />
      {children}
      <span className="w-4 h-px bg-indigo-500 opacity-60" />
    </span>
  );
}

function GlowDot({ color = "#6366f1" }: { color?: string }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

function WaveformBars({ active, bars = 9 }: { active: boolean; bars?: number }) {
  const heights = [4, 7, 11, 15, 18, 14, 10, 7, 4];
  return (
    <span className="inline-flex items-end gap-[2px]" style={{ height: 20 }} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={active ? "wave-bar" : ""}
          style={{
            display: "inline-block",
            width: 2,
            height: active ? heights[i % heights.length] : 3,
            borderRadius: 2,
            background: active ? "#818cf8" : "#3f4673",
            animationDelay: active ? `${i * 0.07}s` : "0s",
            transition: active ? "none" : "height 0.4s ease",
          }}
        />
      ))}
    </span>
  );
}

function PrimaryButton({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  const cls =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[14px] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";
  const style = {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.25)",
  };
  if (href) return <Link href={href} className={cls} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
}

function SecondaryButton({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  const cls =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[14px] text-slate-300 transition-all duration-200 hover:text-white hover:bg-white/5 border";
  const style = { borderColor: "rgba(255,255,255,0.1)" };
  if (href) return <Link href={href} className={cls} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
}

// Arrow icon inline
function Arrow() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE SECTION
// ─────────────────────────────────────────────────────────────────────────────

const TECH_ITEMS = [
  { label: "GitHub", icon: "GH" },
  { label: "LinkedIn", icon: "LI" },
  { label: "Cartesia", icon: "CA" },
  { label: "OpenAI", icon: "OA" },
  { label: "Google", icon: "GO" },
  { label: "Notion", icon: "NO" },
  { label: "Next.js", icon: "NX" },
  { label: "TypeScript", icon: "TS" },
  { label: "Vercel", icon: "VL" },
  { label: "Prisma", icon: "PR" },
  { label: "Tailwind", icon: "TW" },
  { label: "Python", icon: "PY" },
];

function MarqueeItem({ label, icon }: { label: string; icon: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-5 py-2.5 mx-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-default"
      style={{ minWidth: 130 }}
    >
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-300 shrink-0"
        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        {icon}
      </span>
      <span className="text-[13px] font-medium text-slate-400 whitespace-nowrap">{label}</span>
    </div>
  );
}

function MarqueeSection() {
  const items = [...TECH_ITEMS, ...TECH_ITEMS];
  return (
    <div className="relative py-16 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {/* Fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to right, #06070d 0%, transparent 100%)" }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to left, #06070d 0%, transparent 100%)" }} />

      <div className="text-center mb-8">
        <SectionLabel>Ecosystem &amp; Integrations</SectionLabel>
      </div>

      <div className="overflow-hidden space-y-3">
        {/* Row 1 — left */}
        <div className="overflow-hidden">
          <div className="marquee-track-left">
            {items.map((item, i) => <MarqueeItem key={`l1-${i}`} {...item} />)}
          </div>
        </div>
        {/* Row 2 — right */}
        <div className="overflow-hidden">
          <div className="marquee-track-right">
            {[...items].reverse().map((item, i) => <MarqueeItem key={`r2-${i}`} {...item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC PRODUCT VIDEO SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ProductVideoSection() {
  const { ref, style } = useSectionReveal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section
      ref={ref}
      style={style}
      className="py-24 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative"
    >
      <div className="text-center mb-12 space-y-4">
        <SectionLabel>The experience</SectionLabel>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          See what an interview with Veyra feels like.
        </h2>
        <p className="text-slate-400 text-[15px] sm:text-[17px] max-w-2xl mx-auto leading-relaxed">
          Not another question generator. A realtime conversation that listens, understands, and adapts.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl w-full">
        {/* Cinematic Ambient Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-3xl opacity-60 blur-3xl transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 75%)",
          }}
        />

        {/* Video Player Box */}
        <div
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/80 shadow-2xl shadow-indigo-950/50 aspect-[16/9] w-full"
          style={{
            boxShadow: "0 30px 100px -15px rgba(0, 0, 0, 0.9), 0 0 60px -10px rgba(99, 102, 241, 0.18)",
          }}
        >
          <video
            ref={videoRef}
            src="/videos/veyra_preview.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />

          {/* Top overlay badge */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-200 bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 8px #34d399" }} />
            <span>Actual Veyra Live Session</span>
          </div>

          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium text-slate-200 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <>
                  <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Unmute</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Mute</span>
                </>
              )}
            </button>
          </div>

          {/* Center Play/Pause button on hover or when paused */}
          <div
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
              !isPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/20"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 transition-transform transform hover:scale-110">
              {isPlaying ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </div>
          </div>

          {/* Bottom subtle bar */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 flex items-center justify-between text-[11px] text-slate-400 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
            <span className="flex items-center gap-2">
              <span className="text-white font-semibold">Elena Rostova</span>
              <span className="text-slate-500">•</span>
              <span>Principal Technical Architect</span>
            </span>
            <span className="hidden sm:inline text-indigo-300 font-mono">1080p HD • Realtime Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM SECTION — "The old way vs Veyra"
// ─────────────────────────────────────────────────────────────────────────────

function ProblemSection() {
  const { ref, style } = useSectionReveal();
  return (
    <section id="how-it-works" ref={ref} style={style} className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <SectionLabel>The problem</SectionLabel>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
          Most interview practice doesn&apos;t behave<br className="hidden sm:inline" /> like an interview.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Old way */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">The old way</span>
          </div>
          <div className="space-y-2">
            {[
              "Question 1 is asked",
              "You answer",
              "Question 2 is asked (unrelated)",
              "You answer",
              "Question 3 is asked (still unrelated)",
              "Session ends. Generic feedback.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-rose-400" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>{i + 1}</div>
                  {i < 5 && <div className="w-px h-5 bg-rose-500/20 mt-1" />}
                </div>
                <p className="text-[13px] text-slate-400 pt-0.5 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Veyra way */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.18)" }}
        >
          <div className="flex items-center gap-2">
            <GlowDot />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Veyra</span>
          </div>
          <div className="space-y-2">
            {[
              { step: "Question asked based on your resume", branch: false },
              { step: "You answer", branch: false },
              { step: "Veyra analyzes: what was claimed?", branch: true },
              { step: "Finds a weak point — asks follow-up", branch: true },
              { step: "You elaborate — Veyra finds a gap", branch: true },
              { step: "Challenges reasoning from first principles", branch: true },
              { step: "Evidence-backed evaluation generated", branch: false },
            ].map(({ step, branch }, i, arr) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background: branch ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
                      border: `1px solid rgba(99,102,241,${branch ? 0.4 : 0.2})`,
                      color: branch ? "#a5b4fc" : "#6366f1",
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px mt-1" style={{ height: 20, background: branch ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)" }} />
                  )}
                </div>
                <p className="text-[13px] pt-0.5 leading-snug" style={{ color: branch ? "#c7d2fe" : "#94a3b8" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTIVE CONVERSATION DEMO
// ─────────────────────────────────────────────────────────────────────────────

const CONVO_NODES = [
  { from: "interviewer", text: "Tell me about a system you built at scale." },
  { from: "candidate", text: "I built a RAG pipeline serving 50k daily requests." },
  { from: "interviewer", text: "Why RAG over fine-tuning for that use case?" },
  { from: "candidate", text: "We needed dynamic knowledge without retraining costs." },
  { from: "interviewer", text: "How did you handle retrieval failures in production?" },
  { from: "candidate", text: "We had a fallback to keyword search and a circuit breaker." },
  { from: "interviewer", text: "What happened when retrieved context was irrelevant to the query?" },
];

function AdaptiveSection() {
  const { ref, style } = useSectionReveal();
  const [activeIdx, setActiveIdx] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i < CONVO_NODES.length - 1 ? i + 1 : 2)), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} style={style} className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Conversation panel */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(10,11,18,0.95)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
            <GlowDot />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Live interview — Adaptive AI</span>
          </div>
          <div className="p-5 space-y-3 min-h-[360px]">
            {CONVO_NODES.slice(0, activeIdx + 1).map((node, i) => (
              <div key={i} className={`flex gap-3 ${node.from === "candidate" ? "flex-row-reverse" : ""}`}
                style={{ opacity: i === activeIdx ? 1 : 0.55, transition: "opacity 0.4s ease" }}
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={node.from === "interviewer"
                    ? { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }
                  }
                >
                  {node.from === "interviewer" ? "M" : "Y"}
                </div>
                <div
                  className="max-w-[78%] px-3.5 py-2 rounded-xl text-[12px] leading-relaxed"
                  style={node.from === "interviewer"
                    ? { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", color: "#e2e8f0", borderTopLeftRadius: 4 }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8", borderTopRightRadius: 4 }
                  }
                >
                  {node.text}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div className="flex items-center gap-1.5 pl-9">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500" style={{ animation: `wave-bar 1s ease-in-out ${i * 0.2}s infinite`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Text side */}
        <div className="space-y-6">
          <SectionLabel>Adaptive intelligence</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
            Every question follows from<br className="hidden lg:inline" /> your last answer.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md">
            Veyra listens to what you say, extracts claims, identifies weak points, and decides what to probe next. No scripts. No canned transitions.
          </p>
          <div className="space-y-3 text-[13px] text-slate-300">
            {[
              "Claim extracted — depth probe generated",
              "Ownership verified across three-turn progression",
              "Contradiction detected — revisited later in session",
              "First-principles pivot when answers stay vague",
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#34d399" strokeWidth="1" />
                  <path d="M5 8.25l2 2 4-4.5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REALTIME VOICE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function VoiceSection({ persona, onPersonaChange }: { persona: "marcus" | "elena"; onPersonaChange: (p: "marcus" | "elena") => void }) {
  const { ref, style } = useSectionReveal();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);

  const handleListen = useCallback(async () => {
    if (speaking) {
      try { srcRef.current?.stop(); } catch {}
      srcRef.current = null;
      setSpeaking(false);
      return;
    }
    setLoading(true);
    setError(null);
    const text =
      persona === "marcus"
        ? "Tell me about the most challenging distributed system you've designed. I want to understand the trade-offs you made."
        : "Walk me through a critical performance bottleneck you identified. What was your diagnostic process?";
    try {
      const src = await playCartesiaVoice(persona === "marcus" ? "male" : "female", text);
      srcRef.current = src;
      if (src) {
        setSpeaking(true);
        src.onended = () => { setSpeaking(false); srcRef.current = null; };
      }
    } catch {
      setError("Voice preview unavailable. Check server configuration.");
    } finally {
      setLoading(false);
    }
  }, [speaking, persona]);

  useEffect(() => {
    return () => { try { srcRef.current?.stop(); } catch {} };
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      style={{ ...style, background: "rgba(10,11,18,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      className="py-28 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <SectionLabel>Realtime voice</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
            Not a chatbot.<br />A conversation.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md">
            Veyra uses Cartesia Sonic-3.6 for speech output and Ink-2 for real-time transcription. You hear a real human-quality voice. The system hears you instantly.
          </p>

          {/* Persona selector */}
          <div className="flex gap-3">
            {(["marcus", "elena"] as const).map(p => (
              <button
                key={p}
                type="button"
                data-testid={`persona-${p}`}
                onClick={() => onPersonaChange(p)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-left"
                style={persona === p
                  ? { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.4)", color: "white" }
                  : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }
                }
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={p === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
                    alt={p === "marcus" ? "Marcus" : "Elena"}
                    width={32} height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[12px] font-bold leading-tight">{p === "marcus" ? "Marcus Vance" : "Elena Rostova"}</p>
                  <p className="text-[10px] opacity-50 leading-tight mt-0.5">{p === "marcus" ? "Engineering Director" : "Principal Architect"}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              data-testid="voice-preview-btn"
              onClick={handleListen}
              disabled={loading}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-[14px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 w-fit"
              style={{
                background: speaking
                  ? "rgba(99,102,241,0.15)"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: speaking ? "none" : "0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.25)",
                border: speaking ? "1px solid rgba(99,102,241,0.4)" : "none",
                color: "white",
              }}
            >
              <WaveformBars active={speaking} />
              <span>{loading ? "Loading voice..." : speaking ? "Stop preview" : "Hear Veyra speak"}</span>
            </button>
            {error && <p className="text-[11px] text-rose-400">{error}</p>}
          </div>
        </div>

        {/* Interviewer panel */}
        <div className="relative flex justify-center">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: "min(420px, 92vw)",
              aspectRatio: "4/5",
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            }}
          >
            <Image
              src={persona === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
              alt={persona === "marcus" ? "Marcus Vance" : "Elena Rostova"}
              fill
              className="object-cover object-top transition-opacity duration-500"
              sizes="420px"
              priority
            />
            {/* Overlay gradient */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,7,13,0.95) 0%, rgba(6,7,13,0.3) 50%, transparent 100%)" }} />

            {/* Status bar */}
            <div className="absolute bottom-5 left-5 right-5">
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(6,7,13,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                  style={speaking
                    ? { background: "#34d399", boxShadow: "0 0 8px #34d399" }
                    : { background: "#6366f1", boxShadow: "0 0 6px #6366f1" }
                  }
                />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white leading-tight">
                    {persona === "marcus" ? "Marcus Vance" : "Elena Rostova"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {speaking ? "Speaking..." : persona === "marcus" ? "Senior Engineering Director" : "Principal Technical Architect"}
                  </p>
                </div>
                {speaking && <WaveformBars active={true} bars={7} />}
              </div>
            </div>
          </div>

          {/* Floating chip */}
          <div
            className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
            style={{
              background: "rgba(6,7,13,0.9)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              backdropFilter: "blur(12px)",
            }}
          >
            Cartesia Sonic-3.6
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME → INTELLIGENCE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ResumeSection() {
  const { ref, style } = useSectionReveal();
  const steps = [
    { label: "Resume", desc: "Upload, paste, or sync a saved resume" },
    { label: "Candidate Intelligence", desc: "Claims, roles, and technical signals extracted" },
    { label: "Experience Map", desc: "Timeline, ownership levels, and tech stack" },
    { label: "Claim Registry", desc: "Every claimable fact tracked for verification" },
    { label: "Follow-up Strategy", desc: "Probing questions built from your specific background" },
    { label: "Personalized Interview", desc: "Questions you can't answer with generic prep" },
  ];

  return (
    <section ref={ref} style={style} className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-6">
          <SectionLabel>Resume intelligence</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
            Your resume becomes<br className="hidden lg:inline" /> the interview.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md">
            Every bullet point is a probe waiting to happen. Veyra extracts claims, maps them against the job description, and builds questions a real interviewer would ask about your background.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Resume parsing", "JD gap mapping", "Role calibration", "Seniority tuning"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-medium text-indigo-300" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Flow diagram */}
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 mt-1 mb-1" style={{ background: "rgba(99,102,241,0.15)", minHeight: 20 }} />
                )}
              </div>
              <div
                className="flex-1 px-4 py-3 rounded-xl mb-2"
                style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)" }}
              >
                <p className="text-[13px] font-semibold text-white">{step.label}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GITHUB / PROJECT DEFENSE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function GitHubSection() {
  const { ref, style } = useSectionReveal();
  return (
    <section
      ref={ref}
      style={{ ...style, background: "rgba(10,11,18,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      className="py-28 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Code panel */}
        <div
          className="rounded-2xl overflow-hidden order-2 lg:order-1"
          style={{ background: "rgba(8,9,16,0.98)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <span className="ml-2 text-[11px] text-slate-500 font-mono">consumer_group.py — Project scan</span>
          </div>

          <div className="p-5 font-mono text-[12px] leading-[1.8]" style={{ color: "#cdd6f4" }}>
            <div><span style={{ color: "#6272a4" }}># Your Kafka consumer implementation</span></div>
            <div><span style={{ color: "#8be9fd" }}>consumer</span><span> = KafkaConsumer(</span></div>
            <div className="pl-5"><span style={{ color: "#f1fa8c" }}>&quot;user-events&quot;</span><span>,</span></div>
            <div className="pl-5"><span style={{ color: "#bd93f9" }}>group_id</span><span>=</span><span style={{ color: "#f1fa8c" }}>&quot;analytics-consumers&quot;</span><span>,</span></div>
            <div className="pl-5"><span style={{ color: "#bd93f9" }}>auto_offset_reset</span><span>=</span><span style={{ color: "#f1fa8c" }}>&quot;earliest&quot;</span></div>
            <div><span>)</span></div>
            <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.15)" }}>
              <p style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Marcus</p>
              <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.6 }}>
                You set <span style={{ color: "#a5b4fc" }}>auto_offset_reset=&quot;earliest&quot;</span> here. What happens to offset commits if a consumer crashes mid-partition? Walk me through your recovery handling.
              </p>
            </div>
            <div className="mt-3 px-4 py-3 rounded-xl" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <p style={{ color: "#6366f1", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Next probe</p>
              <p style={{ color: "#64748b", fontSize: 11, lineHeight: 1.6 }}>
                &quot;Why did you choose Kafka here instead of a simple queue like SQS?&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-6 order-1 lg:order-2">
          <SectionLabel>Project defense</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
            Don&apos;t just explain it.<br />Defend it.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md">
            Connect a GitHub repository or paste a URL. Veyra reads your actual source code and generates questions from your real implementation decisions — not patterns from a textbook.
          </p>
          <div className="space-y-3 text-[13px] text-slate-300">
            {[
              "Repository scan reads architecture and framework choices",
              "Questions target your actual design decisions",
              "Error handling and edge-case probing from real code",
              "10x traffic and failure scenario challenges",
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#34d399" strokeWidth="1" />
                  <path d="M5 8.25l2 2 4-4.5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW TYPES — BENTO GRID
// ─────────────────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  {
    title: "Technical Interview",
    desc: "Deep-dive into algorithms, data structures, system internals, and runtime complexity.",
    size: "lg",
    accent: "#6366f1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Coding",
    desc: "Live coding with execution, time complexity, and edge-case analysis.",
    size: "sm",
    accent: "#10b981",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "System Design",
    desc: "Whiteboard-style architectural sessions at scale.",
    size: "sm",
    accent: "#8b5cf6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Project Defense",
    desc: "Live interrogation of your GitHub repositories and architectural choices.",
    size: "sm",
    accent: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Behavioral",
    desc: "STAR-method probing three levels deep. Ownership and impact verified.",
    size: "sm",
    accent: "#06b6d4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "AI / ML Interview",
    desc: "Domain-specific questioning on models, training, inference, and evaluation.",
    size: "lg",
    accent: "#ec4899",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function BentoSection() {
  const { ref, style } = useSectionReveal();
  return (
    <section id="interview-types" ref={ref} style={style} className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-14 space-y-4">
        <SectionLabel>Interview types</SectionLabel>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Every type. Precisely calibrated.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTERVIEW_TYPES.map(({ title, desc, size, accent, icon }) => (
          <div
            key={title}
            className={`tilt-card rounded-2xl p-6 space-y-4 ${size === "lg" ? "lg:col-span-1" : ""}`}
            style={{
              background: "rgba(10,11,18,0.8)",
              border: `1px solid ${accent}18`,
              boxShadow: `0 0 60px ${accent}06`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${accent}14`, border: `1px solid ${accent}28`, color: accent }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">{title}</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed mt-1.5">{desc}</p>
            </div>
            <div className="w-6 h-0.5 rounded-full" style={{ background: accent, opacity: 0.5 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY SECTION
// ─────────────────────────────────────────────────────────────────────────────

function MemorySection() {
  const { ref, style } = useSectionReveal();
  const timeline = [
    { min: "02:14", text: "I optimized the retrieval pipeline with semantic caching.", type: "claim" },
    { min: "07:53", text: "Veyra: You mentioned a 40% latency reduction. What was the baseline p99?", type: "probe" },
    { min: "15:31", text: "We used Redis for the cache layer.", type: "claim" },
    { min: "24:07", text: "Veyra: Earlier you said you optimized retrieval — what actually changed after that optimization?", type: "followup" },
  ];

  return (
    <section
      ref={ref}
      style={{ ...style, background: "rgba(10,11,18,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      className="py-28 px-5 sm:px-8 lg:px-12"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Timeline visual */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(8,9,16,0.95)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-violet-500" style={{ boxShadow: "0 0 6px #8b5cf6" }} />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Interview memory — active session</span>
          </div>
          <div className="relative pl-7 space-y-6">
            <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(99,102,241,0.1))" }} />
            {timeline.map(({ min, text, type }, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-4 top-0.5 w-2 h-2 rounded-full"
                  style={{
                    background: type === "probe" || type === "followup" ? "#8b5cf6" : "#6366f1",
                    boxShadow: `0 0 6px ${type === "probe" || type === "followup" ? "#8b5cf6" : "#6366f1"}`,
                  }}
                />
                <p className="text-[10px] font-mono text-slate-500 mb-1">{min}</p>
                <div
                  className="px-3 py-2 rounded-lg text-[12px] leading-relaxed"
                  style={
                    type === "probe" || type === "followup"
                      ? { background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#c4b5fd" }
                      : { background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", color: "#94a3b8" }
                  }
                >
                  {text}
                </div>
                {type === "followup" && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest text-violet-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    Referenced minute 2:14
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-6">
          <SectionLabel>Interview memory</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
            It remembers what you<br className="hidden lg:inline" /> said 20 minutes ago.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-md">
            Every claim is tracked in a session registry. When you say &ldquo;we reduced latency by 40%&rdquo; at minute 2, Marcus returns to that specific claim at minute 24 — asking for the baseline, the benchmark, and the production measurement.
          </p>
          <div className="space-y-3 text-[13px] text-slate-300">
            {[
              "Full-session claim registry — no claim slips through",
              "3-stage ownership probe: individual vs team contribution",
              "Contradictions flagged, revisited, and re-challenged",
              "Evidence-backed evaluation with verbatim citations",
            ].map(t => (
              <div key={t} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#a78bfa" strokeWidth="1" />
                  <path d="M5 8.25l2 2 4-4.5" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ReportSection() {
  const { ref, style } = useSectionReveal();
  const scores = [
    { label: "Technical Depth", score: 4, max: 5, color: "#6366f1" },
    { label: "Problem Solving", score: 4, max: 5, color: "#8b5cf6" },
    { label: "Communication", score: 3, max: 5, color: "#06b6d4" },
    { label: "System Design", score: 3, max: 5, color: "#10b981" },
    { label: "Project Ownership", score: 5, max: 5, color: "#f59e0b" },
  ];

  return (
    <section ref={ref} style={style} className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-14 space-y-4">
        <SectionLabel>Post-interview evaluation</SectionLabel>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          A report built from evidence.
        </h2>
        <p className="text-slate-400 text-[15px] max-w-xl mx-auto">
          No fabricated percentages. Veyra&apos;s scorecard cites verbatim transcript quotes as proof of every assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Score card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "rgba(8,9,16,0.95)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Evaluation — Demo</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(250,204,21,0.1)", color: "#fbbf24", border: "1px solid rgba(250,204,21,0.2)" }}>Sample</span>
          </div>
          {scores.map(({ label, score, max, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-300">{label}</span>
                <span className="text-[11px] font-bold" style={{ color }}>{score}/{max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(score / max) * 100}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Training plan */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(8,9,16,0.95)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="pb-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your next 7 days — Demo</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(250,204,21,0.1)", color: "#fbbf24", border: "1px solid rgba(250,204,21,0.2)" }}>Sample</span>
          </div>
          {[
            { day: "Day 1", task: "Micro-lesson: Kafka offset commit guarantees", color: "#6366f1" },
            { day: "Day 2", task: "Drill: Consumer group rebalancing scenarios", color: "#8b5cf6" },
            { day: "Day 3–4", task: "Exercise: Implement idempotent consumer", color: "#06b6d4" },
            { day: "Day 5", task: "System design: Event-driven at 10M msg/day", color: "#10b981" },
            { day: "Day 7", task: "Re-interview: Distributed messaging focus", color: "#f59e0b" },
          ].map(({ day, task, color }) => (
            <div key={day} className="flex items-start gap-3">
              <span className="text-[10px] font-mono font-bold shrink-0 pt-0.5" style={{ color }}>{day}</span>
              <p className="text-[12px] text-slate-400 leading-snug">{task}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC HUMAN PRESENCE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function HumanPresenceSection({ persona }: { persona: "marcus" | "elena" }) {
  const { ref, style } = useSectionReveal();
  return (
    <section ref={ref} className="relative py-0 overflow-hidden" style={{ ...style, minHeight: "70vh", display: "flex", alignItems: "center" }}>
      {/* Full-width photo */}
      <div className="absolute inset-0">
        <Image
          src={persona === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
          alt="Veyra interviewer"
          fill
          className="object-cover object-top opacity-25"
          sizes="100vw"
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(6,7,13,0.97) 0%, rgba(6,7,13,0.7) 50%, rgba(6,7,13,0.92) 100%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-28">
        <div className="max-w-2xl space-y-6">
          <SectionLabel>Human presence</SectionLabel>
          <h2
            className="font-extrabold text-white tracking-tight leading-[1.05]"
            style={{ fontSize: "clamp(40px, 6vw, 76px)" }}
          >
            Because interviews<br />are conversations.
          </h2>
          <p className="text-[17px] text-slate-300 leading-relaxed max-w-lg">
            Veyra listens to what you say, understands the context, and decides what to ask next. Not a menu. Not a script. A real exchange.
          </p>
          <div className="pt-2">
            <PrimaryButton href="/interviews/new">
              Start your interview <Arrow />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────────────────────────

function FinalCTA({ persona }: { persona: "marcus" | "elena" }) {
  const { ref, style } = useSectionReveal();
  return (
    <section ref={ref} style={style} className="py-32 px-5 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        <BrandLogo size={44} showWordmark={false} />
        <h2
          className="font-extrabold text-white tracking-tight leading-tight"
          style={{ fontSize: "clamp(38px, 5.5vw, 72px)" }}
        >
          Your next interview<br />
          <span style={{ background: "linear-gradient(110deg, #a5b4fc 0%, #818cf8 40%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            starts here.
          </span>
        </h2>
        <p className="text-[16px] text-slate-400 max-w-md mx-auto">
          Practice like the interviewer is already in the room.
        </p>

        {/* Photo row */}
        <div className="flex justify-center gap-3 py-2">
          {(["marcus", "elena"] as const).map(p => (
            <div key={p} className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: persona === p ? "#6366f1" : "rgba(255,255,255,0.1)" }}>
                <Image
                  src={p === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
                  alt={p}
                  width={48} height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-[11px] font-bold text-indigo-300" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
            You
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton href="/signup">
            Create your account <Arrow />
          </PrimaryButton>
          <SecondaryButton href="/login">Sign in</SecondaryButton>
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({
  persona,
  onPersonaChange,
  speaking,
  loading,
  onVoiceClick,
}: {
  persona: "marcus" | "elena";
  onPersonaChange: (p: "marcus" | "elena") => void;
  speaking: boolean;
  loading: boolean;
  onVoiceClick: () => void;
}) {
  return (
    <section id="product" className="relative min-h-[100svh] flex items-center px-5 sm:px-8 lg:px-16 pt-20 pb-16 overflow-hidden">
      {/* Atmospheric glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position: "absolute", top: "15%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.09) 0%, transparent 65%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)", filter: "blur(60px)" }} />
        {/* Subtle grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* ── LEFT ── */}
        <div className="flex flex-col gap-7">
          {/* Eyebrow pill */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-indigo-300 border" style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" style={{ boxShadow: "0 0 6px #6366f1" }} />
              Realtime AI Voice Interviewer
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="font-extrabold text-white tracking-tight leading-[1.04]"
            style={{ fontSize: "clamp(42px, 6vw, 86px)" }}
          >
            Meet your<br />
            <span style={{ background: "linear-gradient(110deg, #c7d2fe 0%, #a5b4fc 35%, #818cf8 65%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AI interviewer.
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-slate-300 leading-relaxed max-w-xl"
            style={{ fontSize: "clamp(15px, 1.6vw, 18px)" }}
          >
            Real voice. Real follow-ups. Real preparation.<br className="hidden sm:inline" />
            Veyra listens to your answer, finds the weak point, and asks the next question.
          </p>

          {/* Persona toggle */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Choose your interviewer</p>
            <div className="flex gap-3 flex-wrap">
              {(["marcus", "elena"] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  data-testid={`persona-${p}`}
                  onClick={() => onPersonaChange(p)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-left"
                  style={persona === p
                    ? { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.4)" }
                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }
                  }
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={p === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
                      alt={p}
                      width={32} height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white leading-tight">{p === "marcus" ? "Marcus Vance" : "Elena Rostova"}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{p === "marcus" ? "Engineering Director" : "Principal Architect"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <PrimaryButton href="/interviews/new">
              Start Interview <Arrow />
            </PrimaryButton>
            <SecondaryButton onClick={onVoiceClick}>
              <WaveformBars active={speaking} />
              <span>{loading ? "Loading..." : speaking ? "Stop" : "Hear the voice"}</span>
            </SecondaryButton>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-5 pt-2 text-[11px] text-slate-500">
            {["Cartesia Sonic-3.6 TTS", "Ink-2 Real-time STT", "No canned questions"].map(badge => (
              <span key={badge} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" stroke="#10b981" strokeWidth="1" />
                  <path d="M4 6l1.5 1.5L8 4" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT — interviewer panel ── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Decorative rings */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: "105%", height: "105%", borderRadius: "28px", border: "1px solid rgba(99,102,241,0.08)", position: "absolute" }} />
          </div>

          <div className="relative" style={{ width: "min(460px, 92vw)" }}>
            {/* Photo frame */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "3/4",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.06)",
              }}
            >
              <Image
                src={persona === "marcus" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
                alt={persona === "marcus" ? "Marcus Vance" : "Elena Rostova"}
                fill
                className="object-cover object-top transition-opacity duration-500"
                priority
                sizes="(max-width: 768px) 92vw, 460px"
              />
              {/* Gradient overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,7,13,0.97) 0%, rgba(6,7,13,0.35) 45%, transparent 100%)" }} />

              {/* UI overlay */}
              <div className="absolute bottom-5 left-5 right-5 space-y-2">
                {/* Name card */}
                <div
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: "rgba(6,7,13,0.85)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                    style={speaking
                      ? { background: "#34d399", boxShadow: "0 0 8px #34d399" }
                      : { background: "#6366f1", boxShadow: "0 0 6px #6366f1" }
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">
                      {persona === "marcus" ? "Marcus Vance" : "Elena Rostova"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {speaking ? "Speaking..." : persona === "marcus" ? "Senior Engineering Director" : "Principal Technical Architect"}
                    </p>
                  </div>
                  <WaveformBars active={speaking} bars={7} />
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div
              className="absolute -top-4 -left-4 px-3 py-2 rounded-xl text-[11px] font-semibold"
              style={{ background: "rgba(6,7,13,0.92)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", backdropFilter: "blur(16px)" }}
            >
              Real-time voice
            </div>
            <div
              className="absolute -top-4 right-4 px-3 py-2 rounded-xl text-[11px] font-semibold"
              style={{ background: "rgba(6,7,13,0.92)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7", backdropFilter: "blur(16px)" }}
            >
              AI listening
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [persona, setPersona] = useState<"marcus" | "elena">("marcus");
  const [heroSpeaking, setHeroSpeaking] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  const heroSrcRef = useRef<AudioBufferSourceNode | null>(null);

  const handleHeroVoice = useCallback(async () => {
    if (heroSpeaking) {
      try { heroSrcRef.current?.stop(); } catch {}
      heroSrcRef.current = null;
      setHeroSpeaking(false);
      return;
    }
    setHeroLoading(true);
    const text =
      persona === "marcus"
        ? "Tell me about the most challenging distributed system you've designed. I want to understand the trade-offs you made under pressure."
        : "Walk me through a critical performance bottleneck you identified and resolved. What was your diagnostic process?";
    try {
      const src = await playCartesiaVoice(persona === "marcus" ? "male" : "female", text);
      heroSrcRef.current = src;
      if (src) {
        setHeroSpeaking(true);
        src.onended = () => { setHeroSpeaking(false); heroSrcRef.current = null; };
      }
    } catch {}
    setHeroLoading(false);
  }, [heroSpeaking, persona]);

  const handlePersonaChange = (p: "marcus" | "elena") => {
    if (heroSpeaking) {
      try { heroSrcRef.current?.stop(); } catch {}
      setHeroSpeaking(false);
    }
    setPersona(p);
  };

  useEffect(() => {
    return () => { try { heroSrcRef.current?.stop(); } catch {} };
  }, []);

  return (
    <div className="veyra-grain flex flex-col w-full overflow-x-hidden" style={{ background: "#06070d" }}>
      <HeroSection
        persona={persona}
        onPersonaChange={handlePersonaChange}
        speaking={heroSpeaking}
        loading={heroLoading}
        onVoiceClick={handleHeroVoice}
      />
      <MarqueeSection />
      <ProductVideoSection />
      <ProblemSection />
      <AdaptiveSection />
      <VoiceSection persona={persona} onPersonaChange={handlePersonaChange} />
      <ResumeSection />
      <GitHubSection />
      <BentoSection />
      <MemorySection />
      <ReportSection />
      <HumanPresenceSection persona={persona} />
      <FinalCTA persona={persona} />
    </div>
  );
}
