"use client";

import React, { useState } from "react";

const STAGES = [
  { id: "raw", title: "Raw Resume Ingestion", desc: "PDF/Markdown parsing extracting roles, tenure, and bullet claims." },
  { id: "claims", title: "Claim Extraction", desc: "Identifies architectural assertions (e.g. 'Optimized p99 query latency by 4x')." },
  { id: "verification", title: "Evidence Calibration", desc: "Constructs specific verification vectors around ownership and metrics." },
  { id: "probe", title: "Targeted Interview Strategy", desc: "Formulates questions a senior hiring manager would ask about these exact claims." },
];

export function ResumeTransformation() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full bg-[#06070d]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Narrative Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            08 / Deep Document Parsing
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]">
            YOUR RESUME BECOMES THE INTERVIEW BLUEPRINT.
          </h2>

          <p className="text-slate-400 text-base leading-relaxed">
            Every bullet point is a potential probe waiting to happen. Veyra extracts concrete technical claims, cross-checks them against the job requirements, and formulates evidence-seeking inquiries.
          </p>

          <div className="space-y-3 pt-2">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full p-4 rounded-xl text-left border transition-all ${
                  activeStep === idx
                    ? "border-indigo-500/50 bg-indigo-950/20 text-white"
                    : "border-white/[0.05] bg-white/[0.01] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-indigo-400 font-bold">STEP 0{idx + 1}</span>
                  <span className="text-slate-500">{s.id.toUpperCase()}</span>
                </div>
                <div className="text-sm font-bold text-slate-200">{s.title}</div>
                <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Transformation Right */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-black/60 p-6 sm:p-8 backdrop-blur-md relative shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-xs font-mono text-slate-500">
            <span>RESUME INTELLIGENCE PIPELINE</span>
            <span className="text-indigo-400">STATUS: CALIBRATED</span>
          </div>

          {/* Interactive Document Node Map */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Raw Candidate Resume Bullet</div>
              <p className="text-sm text-slate-300 font-mono">
                &quot;Led redesign of real-time search indexing pipeline, reducing p99 latency from 180ms to 42ms for 20M daily queries.&quot;
              </p>
            </div>

            <div className="flex justify-center text-indigo-400">
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="text-[10px] font-mono uppercase text-indigo-400 mb-1">Extracted Technical Signals</div>
                <div className="text-xs text-white space-y-1">
                  <div>• Distributed search indices</div>
                  <div>• P99 latency optimization</div>
                  <div>• High-throughput read scale</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <div className="text-[10px] font-mono uppercase text-purple-400 mb-1">Verification Vectors</div>
                <div className="text-xs text-white space-y-1">
                  <div>• Profiling tooling utilized</div>
                  <div>• Cache vs index partition strategy</div>
                  <div>• Individual ownership verification</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/40">
              <div className="text-[10px] font-mono uppercase text-indigo-300 mb-1">Veyra Follow-Up Probe</div>
              <p className="text-sm text-white font-medium">
                &quot;You cited reducing p99 from 180ms to 42ms. What profiling instrumentation did you use to isolate the tail-latency culprit, and did that reduction sacrifice consistency during concurrent updates?&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
