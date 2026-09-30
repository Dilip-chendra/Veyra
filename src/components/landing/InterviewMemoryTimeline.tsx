"use client";

import React from "react";

export function InterviewMemoryTimeline() {
  return (
    <section className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative z-10 bg-transparent">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          11 / Multi-Turn Context Tracking
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto uppercase">
          INTERVIEW MEMORY{" "}
          <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
            ACROSS 20+ TURNS.
          </span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Veyra remembers what you said ten minutes ago. If you make a claim in Turn 2, Veyra connects it when cross-examining your system design choices in Turn 14.
        </p>
      </div>

      {/* Memory Timeline Map */}
      <div className="rounded-3xl border border-white/10 bg-black/60 p-6 sm:p-10 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Turn 02 Node */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-indigo-400 font-bold">TURN 02 • ARCHITECTURE CLAIM</span>
              <span className="text-slate-500">TIMESTAMP: 04:12</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              &quot;We chose MongoDB specifically because we needed schemaless rapid iterations and strict single-document ACID guarantees.&quot;
            </p>
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded-md inline-block">
              SIGNAL RECORDED: DATABASE_CHOICE (MONGODB)
            </div>
          </div>

          {/* Connected Bridge Line */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-2 text-indigo-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 text-center">
              12 TURNS LATER
            </span>
            <div className="w-full h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500 to-indigo-500/50 hidden lg:block" />
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          {/* Turn 14 Node */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3 relative shadow-xl shadow-indigo-950/40">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-purple-300 font-bold">TURN 14 • CONTRADICTION &amp; MEMORY PROBE</span>
              <span className="text-slate-500">TIMESTAMP: 18:45</span>
            </div>
            <p className="text-sm text-white leading-relaxed font-mono">
              &quot;In Turn 2, you stated MongoDB was chosen for rapid schemaless iteration. But you just designed a complex multi-collection distributed join schema here. Why not PostgreSQL with native JSONB?&quot;
            </p>
            <div className="text-[10px] font-mono text-indigo-300 bg-indigo-900/40 border border-indigo-400/30 px-2.5 py-1 rounded-md inline-block">
              CROSS-REFERENCE CONFIRMED: INTEGRITY VERIFIED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
