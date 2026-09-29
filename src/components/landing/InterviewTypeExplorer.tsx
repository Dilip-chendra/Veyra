"use client";

import React, { useState } from "react";

const TYPES = [
  {
    id: "technical",
    name: "System Design",
    tagline: "High-throughput architectural trade-offs at scale.",
    previewType: "architecture",
    bullets: ["CAP theorem trade-offs", "Sharding & read replicas", "Partition recovery & caches"],
  },
  {
    id: "coding",
    name: "Live Coding",
    tagline: "Real Monaco editor execution with Piston runtime.",
    previewType: "code",
    bullets: ["Algorithmic complexity (Big-O)", "Edge-case test execution", "Memory allocation efficiency"],
  },
  {
    id: "aiml",
    name: "AI & ML Systems",
    tagline: "RAG pipelines, inference serving, and quantization.",
    previewType: "pipeline",
    bullets: ["Embedding drift detection", "Context-window compression", "GPU utilization budgeting"],
  },
  {
    id: "defense",
    name: "Project Defense",
    tagline: "Live cross-examination on your actual GitHub codebase.",
    previewType: "repository",
    bullets: ["Framework selection defense", "Concurrency primitives", "Failure recovery handling"],
  },
  {
    id: "behavioral",
    name: "Behavioral Leadership",
    tagline: "First-principles conflict resolution and cross-team trade-offs.",
    previewType: "matrix",
    bullets: ["Stakeholder prioritization", "Incident post-mortems", "Engineering trade-off rationale"],
  },
];

export function InterviewTypeExplorer() {
  const [activeType, setActiveType] = useState(TYPES[0]);

  return (
    <section id="interview-types" className="py-32 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full bg-[#06070d]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          12 / Precision Calibration
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          EVERY DISCIPLINE. PRECISELY TUNED.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Select an interview track to see how Veyra shifts its evaluation engine from whiteboard architectures to real-time coding execution.
        </p>
      </div>

      {/* Horizontal Category Selector */}
      <div className="flex gap-2 pb-4 overflow-x-auto border-b border-white/[0.08] mb-10">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveType(t)}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-tight transition-all shrink-0 cursor-pointer ${
              activeType.id === t.id
                ? "bg-white text-black font-bold shadow-lg"
                : "bg-white/[0.02] text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Dynamic Morphing Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-white/10 bg-[#0d0e17] p-6 sm:p-10 shadow-2xl">
        {/* Left Specification */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
            EVALUATION RUBRIC: {activeType.name.toUpperCase()}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{activeType.name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{activeType.tagline}</p>

          <div className="space-y-2.5 pt-2">
            {activeType.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Morphing Canvas */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-black/60 p-6 min-h-[280px] flex flex-col justify-center relative font-mono text-xs text-slate-300">
          {activeType.previewType === "architecture" && (
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2">
                <span>WHITEBOARD CANVAS #SD-401</span>
                <span className="text-emerald-400">REALTIME SYNC</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">DNS / Cloudflare</div>
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200">API Gateway</div>
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200">Sharded Store</div>
              </div>
              <div className="text-center text-[10px] text-indigo-400">
                ↓ Auto-partitioned with Raft consensus leader election
              </div>
            </div>
          )}

          {activeType.previewType === "code" && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2">
                <span>PISTON EXECUTION RUNTIME (PYTHON 3.12)</span>
                <span className="text-emerald-400">EXIT: 0 (14ms)</span>
              </div>
              <pre className="text-slate-300 text-xs">
                <span className="text-purple-400">def</span> <span className="text-blue-400">find_min_window</span>(s: str, t: str) -&gt; str:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;freq = Counter(t)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Two-pointer O(N) sliding window execution</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;return result
              </pre>
            </div>
          )}

          {activeType.previewType === "pipeline" && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2">
                <span>MODEL INFERENCE PIPELINE TRACE</span>
                <span className="text-indigo-400">P99: 18ms</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Vector Lookup (HNSW):</span><span className="text-emerald-400">4.2ms</span></div>
                <div className="flex justify-between"><span>Cross-Encoder Rerank:</span><span className="text-indigo-400">11.8ms</span></div>
                <div className="flex justify-between"><span>KV-Cache Hit Ratio:</span><span className="text-purple-400">92.4%</span></div>
              </div>
            </div>
          )}

          {activeType.previewType === "repository" && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2">
                <span>GIT COMMIT &amp; ARCHITECTURE AUDIT</span>
                <span className="text-cyan-400">7 FILES INSPECTED</span>
              </div>
              <div className="space-y-1 text-xs">
                <div>📁 src/engine/partitioner.go <span className="text-slate-500">(Custom consistent hash ring)</span></div>
                <div>📁 src/storage/wal.rs <span className="text-slate-500">(Write-ahead log buffer)</span></div>
              </div>
            </div>
          )}

          {activeType.previewType === "matrix" && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2">
                <span>BEHAVIORAL TRADEOFF MATRIX</span>
                <span className="text-yellow-400">FIRST PRINCIPLES</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div>• Ownership: Direct incident triage vs delegation</div>
                <div>• Cross-team friction: SLA alignment under production outage</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
