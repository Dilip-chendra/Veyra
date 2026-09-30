"use client";

import React, { useState } from "react";

export function InterviewFlowVisualization() {
  const [activeBranch, setActiveBranch] = useState<"why" | "depth" | "evidence">("why");

  return (
    <section className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative z-10 bg-transparent">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border border-white/10 bg-white/[0.02]">
          05 / Methodological Divergence
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto uppercase">
          THE CONVEYOR BELT VS.{" "}
          <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
            DYNAMIC CROSS-EXAMINATION.
          </span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Standard practice platforms read pre-written questions off a list. Veyra branches intelligently based on the specific architectural choices and trade-offs you articulate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Old Linear Way */}
        <div className="rounded-3xl border border-red-500/15 bg-gradient-to-b from-red-950/10 to-transparent p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Rigid Linear Model (The Old Way)
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Scripted Question Conveyor</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Regardless of what you say or what depth you exhibit, the system moves mechanically down an uncalibrated checklist.
            </p>
          </div>

          {/* Linear Nodes */}
          <div className="my-8 space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-red-500/20">
            {[
              "Question 1 (Hardcoded)",
              "Candidate answers with high-scale architecture details",
              "System ignores answer details → moves to Question 2",
              "Candidate answers with vagueness",
              "System fails to challenge → moves to Question 3",
              "Generic score: 85% without cited evidence",
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-slate-300 text-xs flex-1">
                  {step}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            RESULT: ZERO OWNERSHIP VERIFICATION • ZERO ADAPTIVE SIGNAL
          </div>
        </div>

        {/* Right: Veyra Branching Engine */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-transparent p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-indigo-950/30">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Dynamic Reasoning Tree (Veyra Core)
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Contextual Follow-Up Branching</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every answer is parsed for technical claims, ownership signals, and potential failure modes, generating targeted multi-turn probes.
            </p>
          </div>

          {/* Interactive Branching Demonstration */}
          <div className="my-8 space-y-4">
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200">
              <span className="text-indigo-400 font-bold">Candidate:</span> &quot;I built a distributed ingestion pipeline using Kafka and Spark streaming to handle 50k writes/sec.&quot;
            </div>

            {/* Branch Selector Tabs */}
            <div className="flex gap-2">
              {[
                { id: "why", label: "Probe 1: Trade-Offs (Why?)" },
                { id: "depth", label: "Probe 2: Scale Failure" },
                { id: "evidence", label: "Probe 3: Ownership" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBranch(b.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-mono transition-all text-center ${
                    activeBranch === b.id
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                      : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Dynamic Branch Output */}
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="text-[10px] uppercase font-mono tracking-widest text-indigo-300">
                Generated Adaptive Probe
              </div>
              {activeBranch === "why" && (
                <p className="text-sm text-white leading-relaxed">
                  &quot;Why did you choose Spark Streaming over Flink for stateful windowing at that write volume? What was the garbage collection latency penalty under partition rebalancing?&quot;
                </p>
              )}
              {activeBranch === "depth" && (
                <p className="text-sm text-white leading-relaxed">
                  &quot;If an ingestion worker crashed mid-partition commit, how did you prevent duplicated offset processing downstream in your storage sink?&quot;
                </p>
              )}
              {activeBranch === "evidence" && (
                <p className="text-sm text-white leading-relaxed">
                  &quot;Did you author the partition key partitioning strategy yourself, or did you consume an existing team schema? Walk me through how you benchmarked the throughput.&quot;
                </p>
              )}
            </div>
          </div>

          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            OUTCOME: ACCURATE SENIORITY CALIBRATION WITH CONTEXTUAL CITATIONS
          </div>
        </div>
      </div>
    </section>
  );
}
