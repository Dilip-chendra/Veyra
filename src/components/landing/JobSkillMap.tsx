"use client";

import React, { useState } from "react";

const SKILL_NODES = [
  { id: "rag", label: "RAG & Vector Search", priority: "HIGH", questions: 3, weight: "30%" },
  { id: "llm", label: "LLM Serving & Latency", priority: "HIGH", questions: 2, weight: "25%" },
  { id: "sys", label: "Distributed Architecture", priority: "MEDIUM", questions: 2, weight: "20%" },
  { id: "sql", label: "Relational Indexing", priority: "MEDIUM", questions: 1, weight: "15%" },
  { id: "api", label: "Async FastAPI / gRPC", priority: "STANDARD", questions: 1, weight: "10%" },
];

export function JobSkillMap() {
  const [selectedSkill, setSelectedSkill] = useState(SKILL_NODES[0]);

  return (
    <section className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full bg-[#06070d]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          09 / Role Calibration
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          JOB DESCRIPTION → TARGETED SKILL GRAPH.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Paste any job description. Veyra deconstructs the role requirements, assigns interview priority weights, and creates a customized rubric.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Skill Graph Interactive Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SKILL_NODES.map((node) => {
            const isSelected = selectedSkill.id === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedSkill(node)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/30 text-white shadow-xl shadow-indigo-950/50"
                    : "border-white/[0.06] bg-white/[0.015] text-slate-400 hover:text-white hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className={`px-2 py-0.5 rounded-full ${node.priority === "HIGH" ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-400"}`}>
                    {node.priority} PRIORITY
                  </span>
                  <span className="text-slate-500">{node.weight}</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">{node.label}</div>
                <div className="text-xs text-slate-500">{node.questions} Targeted Inquiries Configured</div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-black/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="text-[10px] font-mono uppercase text-indigo-400 mb-2">Calibrated Interview Strategy</div>
          <h3 className="text-xl font-bold text-white mb-4">{selectedSkill.label}</h3>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-slate-200">Evaluated Competencies:</span>
              <p className="text-slate-400 leading-relaxed">
                Chunking boundaries, hybrid sparse/dense indexing, query embedding caching, and GPU memory usage optimization.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
              <span className="font-bold text-indigo-300">Calibrated Question Sequence:</span>
              <p className="text-indigo-200/80 leading-relaxed">
                &quot;Walk me through your reranker latency budget. At what query length does your context window trigger pruning?&quot;
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
              <span>WEIGHT: {selectedSkill.weight} OF TOTAL RUBRIC</span>
              <span className="text-emerald-400">ACTIVE IN PLAN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
