"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Code, Layers, Video, ArrowRight, Mic, CheckCircle2 } from "lucide-react";

export default function PracticeHubPage() {
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);

  const drills = [
    {
      title: "Elevator Background Pitch",
      prompt: "Give me a concise 90-second summary of your architectural background and the most impactful project you've owned.",
      category: "Communication",
    },
    {
      title: "Distributed Cache Invalidation",
      prompt: "Walk me through how you prevent cache stampedes (thundering herds) when your primary Redis cluster restarts under peak traffic.",
      category: "System Design",
    },
    {
      title: "ACID vs BASE Trade-Off",
      prompt: "When would you deliberately select an eventually consistent NoSQL database over a PostgreSQL cluster with read replicas?",
      category: "Data Architecture",
    },
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Practice Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Verbal & Technical Drill Arenas</h1>
        <p className="text-xs text-slate-400">
          Targeted micro-drills to sharpen technical conciseness, trade-off defense, and structured STAR explanations.
        </p>
      </div>

      {/* Drill Arena */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
            {drills[activeDrillIndex].category} Drill
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Drill {activeDrillIndex + 1} of {drills.length}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <h2 className="text-base font-bold text-slate-100">{drills[activeDrillIndex].title}</h2>
          <p className="text-sm text-slate-300 italic">&ldquo;{drills[activeDrillIndex].prompt}&rdquo;</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveDrillIndex((activeDrillIndex + 1) % drills.length)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Next Drill Question
          </button>

          <Link
            href="/interviews/new"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <span>Start Full Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Arena Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/coding"
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
        >
          <Code className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live Coding Sandbox</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute algorithms in Python, TypeScript, and Go with real execution output and test cases.
          </p>
        </Link>

        <Link
          href="/system-design"
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
        >
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">System Design Canvas</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Architect distributed systems with simulated 10x traffic bursts and failovers.
          </p>
        </Link>
      </div>
    </div>
  );
}
