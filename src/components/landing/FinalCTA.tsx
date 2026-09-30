"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Radio, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-transparent text-white overflow-hidden border-t border-white/[0.08]">
      {/* Ambient background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none rounded-full blur-[180px] opacity-20"
        style={{ background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.6), transparent 70%)" }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        
        {/* Monolithic pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono tracking-widest uppercase mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Autonomous Calibration Engine
        </div>

        {/* Heroic Statement */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto uppercase">
          STOP REHEARSING SCRIPTS. <br />
          <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
            START DEFENDING REAL DECISIONS.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
          Calibrate your technical depth against an AI interviewer that understands your code, 
          probes your architecture, and adapts in real time.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Your Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Create Candidate Profile</span>
          </Link>
        </div>

        {/* Trust Badges Strip */}
        <div className="mt-16 pt-10 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Cartesia Sonic-3.6</p>
              <p className="text-[11px] font-mono text-slate-500">24kHz PCM Voice</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">185ms Turn Latency</p>
              <p className="text-[11px] font-mono text-slate-500">Natural Turn-Taking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Zero Scripting</p>
              <p className="text-[11px] font-mono text-slate-500">Autonomous Reasoning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Instant Diagnostics</p>
              <p className="text-[11px] font-mono text-slate-500">Post-Turn Analysis</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
