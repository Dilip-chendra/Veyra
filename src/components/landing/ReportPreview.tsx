"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Award, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Clock,
  ArrowRight
} from "lucide-react";

export function ReportPreview() {
  const [activeTab, setActiveTab] = useState<"transcript" | "competencies" | "roadmap">("transcript");
  const [selectedTurn, setSelectedTurn] = useState<number>(0);

  const turns = [
    {
      turnNum: "Turn 06",
      topic: "Distributed Consensus & Raft Elections",
      score: "94%",
      status: "Mastery",
      candidateQuote: "When the network splits 3-2, the two partitioned nodes increment terms but cannot achieve majority quorum. The 3-node partition continues serving writes without data divergence.",
      interviewerAssessment: "Demonstrates crisp understanding of split-brain mitigation and quorum fencing. Correctly separated leader election term semantics from log commit safety.",
      benchmarkNote: "Top 8% percentile among Staff Distributed Systems candidates."
    },
    {
      turnNum: "Turn 11",
      topic: "Kafka Offset Commit vs Exactly-Once Semantics",
      score: "78%",
      status: "Calibrated Gap",
      candidateQuote: "We used at-least-once with manual offset commits after database transaction commit, relying on idempotent consumers using unique event IDs.",
      interviewerAssessment: "Strong practical design, but did not anticipate zombie consumer state during prolonged garbage collection pauses. Recommended probing transactional producers.",
      benchmarkNote: "Action item identified for distributed transaction guarantees."
    },
    {
      turnNum: "Turn 18",
      topic: "Cache Stampede & Thundering Herd Defense",
      score: "91%",
      status: "Mastery",
      candidateQuote: "To prevent 50,000 requests from hitting Postgres on cache eviction, we paired probabilistic early expiration with distributed mutex leases using Redis Redlock.",
      interviewerAssessment: "Immediate unprompted identification of the race condition. Articulated XFetch probabilistic early refresh algorithm with exact math.",
      benchmarkNote: "Exceptional system design maturity under sudden high-concurrency spikes."
    }
  ];

  const competencies = [
    {
      name: "Distributed Systems Architecture",
      score: 92,
      trend: "+8% vs L6 Benchmark",
      highlight: "Mastery of quorum protocols, Raft election edge cases, and asynchronous commit log persistence."
    },
    {
      name: "Failure Domain & Resiliency",
      score: 88,
      trend: "+5% vs L6 Benchmark",
      highlight: "Anticipates cascading circuit breaker failures, partition recovery, and graceful degradation."
    },
    {
      name: "Concurrency & Memory Safety",
      score: 84,
      trend: "At Benchmark",
      highlight: "High proficiency in lockless queues and Tokio async runtimes; mild vulnerability in zombie worker timeouts."
    },
    {
      name: "Architectural Ownership & Tradeoffs",
      score: 86,
      trend: "+11% vs L6 Benchmark",
      highlight: "Defends trade-offs objectively without dogma. Candid about historical production outages and post-mortems."
    }
  ];

  const roadmapDays = [
    {
      day: "Days 1–2",
      title: "Zombie Worker & Fencing Token Drills",
      focus: "Distributed Concurrency",
      description: "Deep dive into Martin Kleppmann's fencing token protocol to eliminate split-brain write vulnerabilities after GC pauses.",
      badge: "Targeted Priority"
    },
    {
      day: "Days 3–4",
      title: "Transactional Outbox & 2PC Alternatives",
      focus: "Event-Driven Persistence",
      description: "Build a prototype Debezium CDC ingestion pipeline to achieve exactly-once consumer semantics without dual-write race conditions.",
      badge: "Practical Lab"
    },
    {
      day: "Days 5–6",
      title: "Tail Latency (p99.9) Optimization",
      focus: "High-Throughput IO",
      description: "Analyze kernel buffer starvation, TCP slow start, and epoll reactor models under 100k persistent WebSocket connections.",
      badge: "Deep Architecture"
    },
    {
      day: "Day 7",
      title: "Simulated 45-Min Follow-up Calibration",
      focus: "Veyra Live Simulation",
      description: "Full rehearsal with Marcus Vance specifically testing your newly implemented fencing token architecture under simulated network latency.",
      badge: "Final Validation"
    }
  ];

  return (
    <section className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-b border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-15"
        style={{ background: "radial-gradient(ellipse at center, rgba(120, 119, 198, 0.4), transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-300 text-[11px] font-mono tracking-widest uppercase mb-4">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Post-Interview Intelligence Dossier
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] uppercase">
            NOT A VAGUE PASS/FAIL SCORE. <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
              A COMPREHENSIVE TECHNICAL DIAGNOSTIC.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            Within 90 seconds of your interview concluding, Veyra synthesizes every spoken sentence, 
            maps code assertions against industry benchmarks, and synthesizes your exact 7-day preparation trajectory.
          </p>
        </div>

        {/* Editorial Paper / Contrast Dossier Card */}
        <div className="rounded-3xl bg-[#f8fafc] text-slate-900 shadow-2xl shadow-indigo-950/40 border border-slate-200/80 overflow-hidden">
          
          {/* Top Dossier Header Bar */}
          <div className="bg-slate-900 px-6 sm:px-10 py-5 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300">
                Official Calibration Dossier · Ref: #VYR-8842-ARCH
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Target Role: <strong className="text-white font-medium">Staff Distributed Systems</strong></span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline">Lead Evaluator: <strong className="text-indigo-400 font-medium">Marcus Vance</strong></span>
            </div>
          </div>

          {/* Dossier Body */}
          <div className="p-6 sm:p-10 lg:p-12">
            {/* Top Score & Summary Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
              {/* Score Dial / Pillar */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-700 uppercase tracking-wider mb-2">
                    <span>Overall Calibration</span>
                    <span className="text-emerald-700 font-bold">Recommended L6</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tight text-slate-900">87</span>
                    <span className="text-xl font-medium text-slate-600">/ 100</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-700 leading-relaxed font-sans">
                    Candidate demonstrated exceptional architectural intuition with rigorous boundary condition awareness. 
                    Recommended for Staff-level consensus and high-throughput infrastructure.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-700">
                  <span>Turn Count: 24 Turns</span>
                  <span>Audio Latency: 182ms avg</span>
                </div>
              </div>

              {/* 4 Assessment Pillars */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {competencies.map((comp) => (
                  <div key={comp.name} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-900 tracking-tight">{comp.name}</span>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {comp.score}%
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>
                      <p className="text-[12px] text-slate-700 leading-relaxed">
                        {comp.highlight}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-slate-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                      <span>{comp.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl">
                  <button
                    onClick={() => setActiveTab("transcript")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "transcript"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Verbatim Probes & Citations
                  </button>
                  <button
                    onClick={() => setActiveTab("competencies")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "competencies"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Competency Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab("roadmap")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "roadmap"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Your Next 7 Days Plan
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-700">
                  Tab: <strong className="text-slate-900 capitalize">{activeTab}</strong>
                </div>
              </div>

              {/* Tab 1: Verbatim Probes & Citations */}
              {activeTab === "transcript" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {turns.map((t, idx) => (
                      <button
                        key={t.turnNum}
                        onClick={() => setSelectedTurn(idx)}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          selectedTurn === idx
                            ? "bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600/30"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="font-bold text-slate-900">{t.turnNum}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === "Mastery" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {t.score} · {t.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 line-clamp-1">{t.topic}</p>
                      </button>
                    ))}
                  </div>

                  {/* Active Turn Details */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold">
                          {turns[selectedTurn].turnNum}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{turns[selectedTurn].topic}</h4>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified Turn Evaluation
                      </span>
                    </div>

                    <div className="space-y-4 text-sm">
                      {/* Candidate response quote */}
                      <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                          Candidate Spoken Transcript:
                        </span>
                        <p className="italic text-slate-800 leading-relaxed font-serif">
                          &ldquo;{turns[selectedTurn].candidateQuote}&rdquo;
                        </p>
                      </div>

                      {/* Evaluator notes */}
                      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                          Veyra Autonomous Reasoning & Assessment:
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {turns[selectedTurn].interviewerAssessment}
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs font-mono text-indigo-700">
                          <Target className="w-3.5 h-3.5" />
                          <span>{turns[selectedTurn].benchmarkNote}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Competency Breakdown */}
              {activeTab === "competencies" && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 mb-4">Granular Technical Matrix</h4>
                  <div className="space-y-6">
                    {competencies.map((comp) => (
                      <div key={comp.name} className="border-b border-slate-100 pb-5 last:border-b-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-bold text-slate-800">{comp.name}</span>
                          <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            Score: {comp.score} / 100
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {comp.highlight}
                        </p>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" 
                            style={{ width: `${comp.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Your Next 7 Days Plan */}
              {activeTab === "roadmap" && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Your Tailored 7-Day Sprint Curriculum</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Synthesized dynamically from the subtle gaps identified during your 24 spoken turns.
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      7-Day Calibration Plan
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roadmapDays.map((step) => (
                      <div key={step.day} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                            {step.day}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                            {step.badge}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Callout Banner */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Private evaluation dossier stored securely. Exportable as PDF or JSON for engineering teams.</span>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-md shrink-0"
              >
                <span>Generate Your Own Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </Link>
            </div>

          </div>
        </div>

        {/* Section Disclaimer / Authentic Note */}
        <p className="text-center text-xs font-mono text-slate-500 mt-6">
          SAMPLE EVALUATION DOSSIER · REAL REPORTS ARE GENERATED USING CANDIDATE-SPECIFIC CONVERSATIONAL TRANSCRIPTS & REPOSITORY TRACES
        </p>
      </div>
    </section>
  );
}
