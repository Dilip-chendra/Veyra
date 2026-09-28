"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/ui/BrandLogo";

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Waveform bars ────────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const bars = [4, 7, 11, 8, 14, 10, 6, 13, 9, 5, 12, 7, 4];
  return (
    <span
      className="inline-flex items-end gap-[2px]"
      aria-hidden="true"
      style={{ height: 20 }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: 2,
            height: active ? h : 3,
            borderRadius: 2,
            background: active ? "#818cf8" : "#4f5a8a",
            transition: active
              ? `height 0.15s ease ${i * 0.04}s`
              : "height 0.3s ease",
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function RevealSection({
  children,
  className = "",
  delay = 0,
  style: extraStyle = {},
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...extraStyle,
      }}
    >
      {children}
    </section>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/50 text-[11px] font-semibold text-indigo-300 tracking-wide">
      {children}
    </span>
  );
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function Check() {
  return (
    <svg
      className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="7.5" stroke="#34d399" strokeWidth="1" />
      <path
        d="M4.5 8.25l2.5 2.5 4.5-5"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Cross icon ───────────────────────────────────────────────────────────────
function Cross() {
  return (
    <svg
      className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="7.5" stroke="#f87171" strokeWidth="1" />
      <path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke="#f87171"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Conversation bubble ──────────────────────────────────────────────────────
function Bubble({
  speaker,
  text,
  delay = 0,
}: {
  speaker: "interviewer" | "candidate";
  text: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal(0.05);
  const isInterviewer = speaker === "interviewer";
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 ${isInterviewer ? "" : "flex-row-reverse"}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${isInterviewer ? -20 : 20}px)`,
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border ${
          isInterviewer
            ? "bg-indigo-950 border-indigo-700 text-indigo-300"
            : "bg-slate-800 border-slate-600 text-slate-300"
        }`}
      >
        {isInterviewer ? "M" : "Y"}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isInterviewer
            ? "bg-indigo-950/60 border border-indigo-800/40 text-slate-200 rounded-tl-sm"
            : "bg-slate-800/70 border border-slate-700/40 text-slate-300 rounded-tr-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [persona, setPersona] = useState<"marcus" | "elena">("marcus");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSrcRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = useCallback(() => {
    try {
      audioSrcRef.current?.stop();
    } catch {}
    audioSrcRef.current = null;
  }, []);

  const handlePersona = (p: "marcus" | "elena") => {
    if (isSpeaking) {
      stopAudio();
      setIsSpeaking(false);
    }
    setPersona(p);
    setVoiceError(null);
  };

  const handleVoicePreview = async () => {
    if (isSpeaking) {
      stopAudio();
      setIsSpeaking(false);
      return;
    }
    setVoiceError(null);

    const phrase =
      persona === "marcus"
        ? "Tell me about the most challenging distributed system you've designed. I want to understand your architectural decisions and the trade-offs you made."
        : "Walk me through a time you identified a critical performance bottleneck. What was your diagnostic process, and how did you measure the improvement?";

    setIsSpeaking(true);

    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx({ sampleRate: 44100 });
      }
      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }

      const res = await fetch("/api/cartesia/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: phrase,
          gender: persona === "marcus" ? "male" : "female",
          isPreview: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Voice synthesis failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

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

      if (chunks.length > 0) {
        const total = chunks.reduce((a, c) => a + c.length, 0);
        const combined = new Uint8Array(total);
        let off = 0;
        for (const c of chunks) {
          combined.set(c, off);
          off += c.length;
        }

        const f32 = new Float32Array(
          combined.buffer,
          0,
          Math.floor(combined.byteLength / 4)
        );
        const audioBuf = audioCtxRef.current.createBuffer(
          1,
          f32.length,
          44100
        );
        audioBuf.getChannelData(0).set(f32);

        const src = audioCtxRef.current.createBufferSource();
        src.buffer = audioBuf;
        src.connect(audioCtxRef.current.destination);
        audioSrcRef.current = src;

        src.onended = () => {
          setIsSpeaking(false);
          audioSrcRef.current = null;
        };

        src.start(0);
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
      setVoiceError("Voice preview unavailable. Check Cartesia configuration.");
    }
  };

  const isMarcus = persona === "marcus";
  const photoSrc = isMarcus
    ? "/avatars/interviewer_male.jpg"
    : "/avatars/interviewer_female.jpg";
  const interviewerName = isMarcus ? "Marcus Vance" : "Elena Rostova";
  const interviewerTitle = isMarcus
    ? "Senior Engineering Director"
    : "Principal Technical Architect";

  return (
    <div className="flex flex-col w-full overflow-x-hidden" style={{ background: "#080910" }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex items-center px-5 sm:px-8 lg:px-12 pt-24 pb-20">
        {/* Ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "5%",
              width: 560,
              height: 560,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              right: "0%",
              width: 480,
              height: 480,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <div className="flex flex-wrap gap-2">
              <Pill>Powered by Cartesia Sonic-3.6</Pill>
              <Pill>Ink-2 Real-Time STT</Pill>
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold tracking-tight text-white leading-[1.05]"
              style={{ fontSize: "clamp(44px, 6.5vw, 88px)" }}
            >
              The interview that
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(110deg, #a5b4fc 0%, #818cf8 40%, #c4b5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually prepares you.
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="text-slate-400 leading-relaxed max-w-xl"
              style={{ fontSize: "clamp(15px, 1.5vw, 18px)" }}
            >
              A human interviewer voice, adaptive intelligence, and real-time
              memory of everything you say. No canned questions. No canned
              scores. Every follow-up is earned by your last answer.
            </p>

            {/* Persona toggle */}
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Choose your interviewer
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  data-testid="persona-marcus"
                  onClick={() => handlePersona("marcus")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                    isMarcus
                      ? "bg-indigo-950/70 border-indigo-600/70 text-white"
                      : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-700">
                    <Image
                      src="/avatars/interviewer_male.jpg"
                      alt="Marcus Vance"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-tight">Marcus Vance</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Engineering Director
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="persona-elena"
                  onClick={() => handlePersona("elena")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                    !isMarcus
                      ? "bg-indigo-950/70 border-indigo-600/70 text-white"
                      : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-700">
                    <Image
                      src="/avatars/interviewer_female.jpg"
                      alt="Elena Rostova"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-tight">Elena Rostova</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Principal Architect
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/interviews/new"
                data-testid="cta-start-interview"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
                  boxShadow: "0 0 32px rgba(99,102,241,0.3)",
                }}
              >
                Start an Interview
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <button
                type="button"
                data-testid="voice-preview-btn"
                onClick={handleVoicePreview}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all ${
                  isSpeaking
                    ? "bg-indigo-950/40 border-indigo-700 text-indigo-200"
                    : "bg-slate-900/60 border-slate-700 text-slate-200 hover:border-slate-500"
                }`}
              >
                <Waveform active={isSpeaking} />
                <span>{isSpeaking ? "Stop preview" : "Hear the interviewer"}</span>
              </button>
            </div>

            {voiceError && (
              <p className="text-[11px] text-rose-400">{voiceError}</p>
            )}
          </div>

          {/* Right column — interviewer photo */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative ring */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                style={{
                  width: "95%",
                  height: "95%",
                  borderRadius: "50%",
                  border: "1px solid rgba(99,102,241,0.15)",
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: "80%",
                  height: "80%",
                  borderRadius: "50%",
                  border: "1px solid rgba(99,102,241,0.08)",
                  position: "absolute",
                }}
              />
            </div>

            <div
              className="relative"
              style={{ width: "min(440px, 90vw)", aspectRatio: "3/4" }}
            >
              {/* Photo frame */}
              <div
                className="relative w-full h-full rounded-[28px] overflow-hidden"
                style={{
                  border: "1px solid rgba(99,102,241,0.2)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)",
                }}
              >
                <Image
                  src={photoSrc}
                  alt={interviewerName}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 90vw, 440px"
                />
                {/* Bottom gradient */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "45%",
                    background:
                      "linear-gradient(to top, rgba(8,9,16,0.95) 0%, rgba(8,9,16,0.5) 60%, transparent 100%)",
                  }}
                />
                {/* Name badge */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: isSpeaking ? "#34d399" : "#818cf8",
                        boxShadow: isSpeaking
                          ? "0 0 8px #34d399"
                          : "0 0 8px #818cf8",
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {interviewerName}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {interviewerTitle}
                      </p>
                    </div>
                    {isSpeaking && (
                      <div className="ml-auto">
                        <Waveform active={true} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating status chip */}
              <div
                className="absolute -top-4 -right-4 px-3 py-1.5 rounded-xl border text-[11px] font-semibold"
                style={{
                  background: "rgba(8,9,16,0.9)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a5b4fc",
                  backdropFilter: "blur(12px)",
                }}
              >
                Real-time voice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADAPTIVE CONVERSATION ─────────────────────────────────────── */}
      <RevealSection
        className="py-24 px-5 sm:px-8 lg:px-12"
        style={{}}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Conversation demo */}
          <div
            className="rounded-3xl p-6 space-y-4"
            style={{
              background: "rgba(15,16,26,0.8)",
              border: "1px solid rgba(99,102,241,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Live Interview — System Design
              </span>
            </div>

            <Bubble speaker="interviewer" text="You mentioned you used Redis caching to reduce p99 latency. What specifically were you caching — objects, sessions, query results?" delay={0} />
            <Bubble speaker="candidate" text="We cached the API responses for user profile lookups. The hit rate was around 85%." delay={80} />
            <Bubble speaker="interviewer" text="What made a profile lookup cache-safe? User profiles can change — how did you handle invalidation when a user updated their settings?" delay={160} />
            <Bubble speaker="candidate" text="We used write-through invalidation. Any PUT to the profile endpoint flushed the key synchronously." delay={240} />
            <Bubble speaker="interviewer" text="Good. But what about race conditions between the flush and a concurrent read? Walk me through the exact sequence." delay={320} />

            {/* Indicator */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    style={{
                      animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">Marcus is analyzing your answer...</span>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">
              Adaptive conversation
            </p>
            <h2
              className="font-extrabold text-white tracking-tight leading-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              Every follow-up is earned by your last answer.
            </h2>
            <p className="text-slate-400 leading-relaxed text-[15px]">
              Veyra listens to every word and builds on it. If you mention a
              cache hit rate, the next question probes invalidation. If you say
              &ldquo;we used a load balancer,&rdquo; it asks what you personally
              configured. No pre-written question banks. No scripts.
            </p>
            <ul className="space-y-3 text-[14px]">
              {[
                "Contextual follow-ups built from your exact wording",
                "First-principles pivots when answers are vague",
                "Interruption and turn-taking like a real conversation",
                "Varied acknowledgements — not the same phrase twice",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-slate-300">
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      {/* ── MEMORY ────────────────────────────────────────────────────── */}
      <RevealSection
        className="py-24 px-5 sm:px-8 lg:px-12"
        style={{ background: "rgba(15,16,26,0.5)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-6 order-2 lg:order-1">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">
              Interview memory
            </p>
            <h2
              className="font-extrabold text-white tracking-tight leading-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              It remembers what you said 25 minutes ago.
            </h2>
            <p className="text-slate-400 leading-relaxed text-[15px]">
              Every claim you make is tracked across the full session. When you
              say &ldquo;we reduced latency by 40%&rdquo; at minute 5, Marcus
              will return to that at minute 25 — asking for the baseline, the
              benchmark, and the production measurement. Ownership is verified
              across three explicit probes.
            </p>
            <ul className="space-y-3 text-[14px]">
              {[
                "Full-session claim registry — no claim slips through",
                "3-stage ownership probe: individual vs team contribution",
                "Evidence-backed scorecard with verbatim transcript citations",
                "Contradictions flagged and re-challenged at depth",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-slate-300">
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Claim tracker visual */}
          <div
            className="rounded-3xl p-6 space-y-3 order-1 lg:order-2"
            style={{
              background: "rgba(15,16,26,0.8)",
              border: "1px solid rgba(139,92,246,0.15)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest pb-2 border-b border-slate-800/80">
              Claim Tracker — Active Session
            </p>
            {[
              { claim: '"Reduced p99 by 40%"', status: "PROBED", color: "#facc15" },
              { claim: '"Led the migration to microservices"', status: "SUPPORTED", color: "#34d399" },
              { claim: '"Owned the Kafka consumer group"', status: "UNRESOLVED", color: "#94a3b8" },
              { claim: '"We used Kubernetes for orchestration"', status: "PROBED", color: "#facc15" },
              { claim: '"Cut deployment time from 2h to 8min"', status: "SUPPORTED", color: "#34d399" },
            ].map(({ claim, status, color }, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-xl"
                style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.08)" }}
              >
                <span className="text-[12px] text-slate-300 truncate">{claim}</span>
                <span
                  className="text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full"
                  style={{
                    color,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── RESUME & JD ───────────────────────────────────────────────── */}
      <RevealSection className="py-24 px-5 sm:px-8 lg:px-12" style={{}}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">
              Resume intelligence
            </p>
            <h2
              className="font-extrabold text-white tracking-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              Your resume becomes the interview.
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed">
              Every bullet point is a probe waiting to happen. Veyra extracts
              your claims, maps them against the job description, and constructs
              the exact questions a real interviewer would ask about your
              specific background.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Resume Parsing",
                desc: "Paste, upload, or sync a saved resume. Claims are extracted and tagged for depth probing.",
                accent: "#818cf8",
              },
              {
                label: "JD Gap Mapping",
                desc: "The job description is compared against your resume. Questions target uncovered requirements first.",
                accent: "#c4b5fd",
              },
              {
                label: "Role Calibration",
                desc: "Target role and seniority level adjusts the bar. Staff engineer questions differ from senior engineer questions.",
                accent: "#a5f3fc",
              },
            ].map(({ label, desc, accent }) => (
              <div
                key={label}
                className="p-6 rounded-2xl space-y-3"
                style={{
                  background: "rgba(15,16,26,0.8)",
                  border: `1px solid ${accent}20`,
                  boxShadow: `0 0 40px ${accent}08`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: accent }} />
                </div>
                <h3 className="text-[15px] font-bold text-white">{label}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── GITHUB DEFENSE ────────────────────────────────────────────── */}
      <RevealSection
        className="py-24 px-5 sm:px-8 lg:px-12"
        style={{ background: "rgba(15,16,26,0.5)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Code block visual */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              border: "1px solid rgba(99,102,241,0.15)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ background: "rgba(15,16,26,0.95)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[11px] text-slate-500">consumer_group.py — GitHub Scan</span>
            </div>

            {/* Code */}
            <div
              className="p-5 font-mono text-[12px] leading-[1.7]"
              style={{ background: "rgba(10,11,18,0.98)" }}
            >
              <div>
                <span style={{ color: "#6272a4" }}># Line 47 — Kafka consumer group</span>
              </div>
              <div>
                <span style={{ color: "#8be9fd" }}>consumer</span>
                <span style={{ color: "#f8f8f2" }}> = KafkaConsumer(</span>
              </div>
              <div className="pl-4">
                <span style={{ color: "#f1fa8c" }}>&quot;user-events&quot;</span>
                <span style={{ color: "#f8f8f2" }}>,</span>
              </div>
              <div className="pl-4">
                <span style={{ color: "#bd93f9" }}>group_id</span>
                <span style={{ color: "#f8f8f2" }}>=</span>
                <span style={{ color: "#f1fa8c" }}>&quot;analytics-consumers&quot;</span>
              </div>
              <div>
                <span style={{ color: "#f8f8f2" }}>)</span>
              </div>
              <div className="mt-3 py-2 px-3 rounded-lg" style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.15)" }}>
                <span style={{ color: "#facc15" }}>Marcus: </span>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>
                  You set group_id here. What happens to offset commits if a consumer
                  crashes mid-partition? Walk me through your error recovery.
                </span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">
              GitHub project defense
            </p>
            <h2
              className="font-extrabold text-white tracking-tight leading-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              Your code is read before the interview starts.
            </h2>
            <p className="text-slate-400 leading-relaxed text-[15px]">
              Connect a GitHub repository or paste a URL and Veyra reads the
              actual source code. Questions are generated from your real
              implementation decisions — not generic patterns. Every
              architectural choice becomes a line of questioning.
            </p>
            <ul className="space-y-3 text-[14px]">
              {[
                "Repository scan extracts real implementation patterns",
                "Questions target your actual design decisions",
                "Defensive probing on error handling and edge cases",
                "10x traffic and failure scenario simulations",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-slate-300">
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      {/* ── INTERVIEW MODES ───────────────────────────────────────────── */}
      <RevealSection className="py-24 px-5 sm:px-8 lg:px-12" style={{}}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">
              Interview modes
            </p>
            <h2
              className="font-extrabold text-white tracking-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              Every interview type, precisely calibrated.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Behavioral",
                desc: "STAR method probed three levels deep. Ownership, impact, and lessons verified.",
                accent: "#818cf8",
              },
              {
                title: "System Design",
                desc: "Whiteboard-style architectural sessions with scale, failure, and trade-off challenges.",
                accent: "#c4b5fd",
              },
              {
                title: "Technical Deep-Dive",
                desc: "Language-specific algorithms, runtime complexity, and edge-case analysis.",
                accent: "#34d399",
              },
              {
                title: "Domain Expertise",
                desc: "ML, distributed systems, security, and platform engineering — domain tuned.",
                accent: "#f59e0b",
              },
            ].map(({ title, desc, accent }) => (
              <div
                key={title}
                className="p-5 rounded-2xl space-y-3 group hover:scale-[1.02] transition-transform"
                style={{
                  background: "rgba(15,16,26,0.8)",
                  border: `1px solid ${accent}18`,
                }}
              >
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ background: accent }}
                />
                <h3 className="text-[15px] font-bold text-white">{title}</h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── TRAINING JOURNEY ──────────────────────────────────────────── */}
      <RevealSection
        className="py-24 px-5 sm:px-8 lg:px-12"
        style={{ background: "rgba(15,16,26,0.5)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-6">
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
              Post-interview training
            </p>
            <h2
              className="font-extrabold text-white tracking-tight leading-tight"
              style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
            >
              A remediation plan built from your gaps.
            </h2>
            <p className="text-slate-400 leading-relaxed text-[15px]">
              After each session, Veyra generates a 5-component training plan
              targeting the exact areas where your answers were shallow or
              contradictory. You get specific drills, not generic advice.
            </p>
          </div>

          {/* Training steps */}
          <div className="space-y-3">
            {[
              { step: "01", title: "Micro-lesson", desc: "Targeted explanation of the concept you missed." },
              { step: "02", title: "Concept drill", desc: "Rapid-fire questions until fluency is demonstrated." },
              { step: "03", title: "Applied exercises", desc: "Real implementation tasks using your tech stack." },
              { step: "04", title: "System design challenge", desc: "A scaled architectural scenario around the gap." },
              { step: "05", title: "Re-interview", desc: "Full session re-examining the previously failed area." },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{
                  background: "rgba(15,16,26,0.8)",
                  border: "1px solid rgba(99,102,241,0.1)",
                }}
              >
                <span
                  className="text-[10px] font-mono font-bold shrink-0 pt-0.5"
                  style={{ color: "#818cf8" }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-white">{title}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── COMPARISON ────────────────────────────────────────────────── */}
      <RevealSection className="py-24 px-5 sm:px-8 lg:px-12" style={{}}>
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2
              className="font-extrabold text-white tracking-tight"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              Not another mock interview tool.
            </h2>
            <p className="text-slate-400 text-[14px]">
              The difference is the conversation, not just the features list.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Other tools */}
            <div
              className="p-7 rounded-2xl space-y-5"
              style={{
                background: "rgba(15,16,26,0.6)",
                border: "1px solid rgba(248,113,113,0.15)",
              }}
            >
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest">
                Traditional mock tools
              </p>
              <ul className="space-y-3 text-[13px] text-slate-400">
                {[
                  "Fixed question bank — same questions every session",
                  'Fabricated scores like "You scored 73%" with no evidence',
                  "Cartoon avatars or prerecorded video that cannot react",
                  "No memory of what you said 10 minutes ago",
                  "Generic tips: 'Use the STAR method'",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Cross />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Veyra */}
            <div
              className="p-7 rounded-2xl space-y-5"
              style={{
                background: "rgba(15,16,26,0.6)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 0 48px rgba(99,102,241,0.05)",
              }}
            >
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                The Veyra experience
              </p>
              <ul className="space-y-3 text-[13px] text-slate-200">
                {[
                  "Every follow-up built from your exact previous words",
                  "Evidence-backed report citing verbatim transcript quotes",
                  "Real human voice, real listening, real interruptions",
                  "Full-session memory — claims verified 20 minutes later",
                  "5-component training plan targeting your specific gaps",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <RevealSection className="py-28 px-5 sm:px-8 lg:px-12" style={{}}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <BrandLogo size={40} showWordmark={false} />
          </div>

          <h2
            className="font-extrabold text-white tracking-tight leading-tight"
            style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
          >
            Ready to face an interview
            <br />
            <span
              style={{
                background: "linear-gradient(110deg, #a5b4fc 0%, #818cf8 40%, #c4b5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              that doesn&apos;t go easy on you?
            </span>
          </h2>

          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xl mx-auto">
            Create your account, choose Marcus or Elena, attach your resume,
            and step into the room. The next follow-up question comes from what
            you just said.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] text-white transition-all hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
                boxShadow: "0 0 40px rgba(99,102,241,0.35)",
              }}
            >
              Create your account
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-[15px] text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* Pulse keyframe — tiny inline style for the typing indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0ms !important; }
        }
      `}</style>
    </div>
  );
}
