"use client";

import React, { useState, useEffect } from "react";

const STAGES = [
  { step: "01", word: "LISTEN", desc: "Ingests raw candidate speech via Cartesia Ink-2 streaming STT with millisecond latency." },
  { step: "02", word: "EXTRACT", desc: "Maps architecture claims, library dependencies, scale metrics, and ownership levels." },
  { step: "03", word: "CHALLENGE", desc: "Detects inconsistencies, vagueness, or unverified claims and formulates contextual probes." },
  { step: "04", word: "ADAPT", desc: "The next question pivots dynamically based on candidate reasoning rather than a fixed script." },
];

export function KineticHeadline() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % STAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-32 bg-[#06070d] border-t border-b border-white/[0.04] overflow-hidden">
      {/* Background Subtle Typography */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.02] select-none text-[18vw] font-black tracking-tighter"
      >
        ADAPT
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Giant Monolithic Statement */}
        <div className="mb-20 space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-indigo-400">
            02 / Kinetic Principles
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] max-w-4xl">
            AN INTERVIEW<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-white to-indigo-300">
              IS NOT A SCRIPT.
            </span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Conventional mock interviews use rigid question banks. Veyra operates as a live cross-examination system that listens, reasons, and probes deeper based on your answers.
          </p>
        </div>

        {/* 4-Step Interactive Progression */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STAGES.map((s, idx) => {
            const isActive = activeIdx === idx;
            return (
              <div
                key={s.word}
                onClick={() => setActiveIdx(idx)}
                className={`p-6 sm:p-8 rounded-2xl border transition-all duration-500 cursor-pointer flex flex-col justify-between h-[260px] ${
                  isActive
                    ? "border-indigo-500/50 bg-indigo-950/20 shadow-xl shadow-indigo-950/40"
                    : "border-white/[0.05] bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-6">
                    <span>{s.step}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    )}
                  </div>
                  <h3
                    className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {s.word}
                  </h3>
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
