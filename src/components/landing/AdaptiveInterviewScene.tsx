"use client";

import React, { useState, useEffect } from "react";

interface Message {
  speaker: "candidate" | "veyra";
  text: string;
  tag?: string;
}

const CONVERSATION: Message[] = [
  { speaker: "veyra", text: "Tell me about a high-concurrency data system you engineered from scratch.", tag: "Initial Architectural Query" },
  { speaker: "candidate", text: "I designed a low-latency RAG pipeline indexing 40 million code snippets using vector embeddings and hybrid BM25 search." },
  { speaker: "veyra", text: "Why hybrid BM25 over pure dense vector search for this code search use case?", tag: "Contextual Trade-Off Probe" },
  { speaker: "candidate", text: "Dense embeddings frequently hallucinated or missed exact variable and function names. BM25 guarantees lexical precision for identifier lookups." },
  { speaker: "veyra", text: "How did you manage rank fusion between dense cosine scores and sparse BM25 scores without blowing past p99 latency SLAs?", tag: "First-Principles Depth Challenge" },
  { speaker: "candidate", text: "We used Reciprocal Rank Fusion (RRF) with a k-factor of 60, executed in an async worker thread pool capped at 25ms." },
  { speaker: "veyra", text: "And when a retrieved snippet contradicts the prompt context, what arbitration logic prevents prompt injection or degradation?", tag: "Edge-Case & Reliability Probe" },
];

export function AdaptiveInterviewScene() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVisibleCount((prev) => (prev < CONVERSATION.length ? prev + 1 : 2));
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative z-10 bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Narrative */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            06 / Live Conversation Mechanics
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05] uppercase">
            EVERY QUESTION EMERGES{" "}
            <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
              FROM YOUR LAST SENTENCE.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Watch the dialogue evolve in real time. Veyra doesn&apos;t just verify keywords; it tests trade-off justifications, ranking mathematics, and fail-safe defenses.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl text-xs font-mono border border-white/10 bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              <span>{isPlaying ? "Pause Dialogue Sim" : "Resume Simulation"}</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibleCount(CONVERSATION.length)}
              className="px-4 py-2 rounded-xl text-xs font-mono border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              Expand All Turns
            </button>
          </div>
        </div>

        {/* Right Interactive Chat Canvas */}
        <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-black/60 p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-indigo-950/40 relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06] text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>SESSION: #VR-9482 (AI PLATFORM ARCHITECT)</span>
            </div>
            <div className="text-slate-400 font-bold">TURN {Math.min(visibleCount, CONVERSATION.length)} OF 7</div>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            {CONVERSATION.slice(0, visibleCount).map((msg, idx) => {
              const isVeyra = msg.speaker === "veyra";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isVeyra ? "items-start" : "items-end"} space-y-1.5 animate-fadeIn`}
                >
                  {msg.tag && (
                    <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400/80 px-2">
                      {msg.tag}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isVeyra
                        ? "bg-indigo-950/30 border border-indigo-500/20 text-indigo-100 rounded-tl-sm shadow-md"
                        : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tr-sm"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold mb-1 opacity-60">
                      {isVeyra ? "VEYRA (ELENA ROSTOVA)" : "CANDIDATE"}
                    </div>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
