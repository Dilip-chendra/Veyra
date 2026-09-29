"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mic, ArrowRight, MessageSquare, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export function HumanCinematicMoment() {
  const [activePersona, setActivePersona] = useState<"marcus" | "elena">("marcus");

  const personas = {
    marcus: {
      name: "Marcus Vance",
      title: "Engineering Director",
      experience: "Ex-Staff Distributed Systems · 14 Years Production Architecture",
      image: "/avatars/interviewer_male.jpg",
      quote: "I'm not interested in reciting textbook definitions. I want to see how you reason when the network splits, your cache evaporates, and your database is down to its last thread pool.",
      probeHeader: "Live Probe · Distributed Systems Calibration",
      candidateText: "“We deployed Redis as our distributed caching layer to maintain sub-millisecond read latency for hot user sessions.”",
      genericBotReaction: "“Great! That's correct. Now for question 5: Can you explain the difference between TCP and UDP?”",
      veyraFollowUp: "“You mentioned Redis for sub-millisecond reads. But what happens during an abrupt cluster failover or cache stampede when 45,000 requests/sec simultaneously hit your unprimed Postgres replica? Walk me through how you implemented mutex leases and probabilistic early refresh to prevent cascading database starvation.”",
      keyInsight: "Direct interrogation of unstated operational assumptions rather than scripted multiple-choice validation."
    },
    elena: {
      name: "Elena Rostova",
      title: "Principal Systems Architect",
      experience: "Cloud Infrastructure & High-Throughput Data Planes · 12 Years Core Platforms",
      image: "/avatars/interviewer_female.jpg",
      quote: "True seniority isn't knowing what works when everything is green. It's knowing which guarantee breaks first when traffic increases tenfold and the disk fills up.",
      probeHeader: "Live Probe · Data Plane & Partition Tolerance",
      candidateText: "“We used Kafka with asynchronous producers and an in-memory buffer pool to sustain 200,000 event ingestions per second without blocking user threads.”",
      genericBotReaction: "“Awesome! Good explanation. Next question: What is the CAP theorem?”",
      veyraFollowUp: "“Asynchronous producers give you raw throughput, but when backpressure from the brokers kicks in and your client buffer hits its 64MB memory threshold, what is your drop policy? Did you block the producer thread or drop uncommitted writes? And how did you prevent silent data loss?”",
      keyInsight: "Probes failure thresholds and backpressure handling at production boundary conditions."
    }
  };

  const persona = personas[activePersona];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#06070d] text-white overflow-hidden border-t border-white/[0.06]">
      {/* Cinematic ambient spotlight */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] pointer-events-none rounded-full blur-[160px] opacity-20"
        style={{ background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.5), transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-mono tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Authentic Human Rigor
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
            THE DIFFERENCE HAPPENS <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              AFTER YOUR ANSWER.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Generic interview tools accept your answer and move to the next scripted question on the rubric. 
            Veyra pauses, examines the unspoken assumptions in your architecture, and asks why.
          </p>

          {/* Persona Switcher Buttons */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActivePersona("marcus")}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activePersona === "marcus"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                <Image 
                  src="/avatars/interviewer_male.jpg" 
                  alt="Marcus Vance" 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span>Marcus Vance · Engineering Director</span>
            </button>
            <button
              onClick={() => setActivePersona("elena")}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activePersona === "elena"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                <Image 
                  src="/avatars/interviewer_female.jpg" 
                  alt="Elena Rostova" 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span>Elena Rostova · Principal Architect</span>
            </button>
          </div>
        </div>

        {/* Main Stage: Cinematic Portrait & Interactive Dialogue Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Authentic Human Portrait Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-2 h-full flex flex-col justify-between shadow-2xl">
              
              {/* Photo Frame */}
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                <Image
                  src={persona.image}
                  alt={persona.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover object-top filter brightness-[0.95] contrast-[1.05]"
                  priority
                />
                
                {/* Subtle vignette & bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-transparent to-black/20" />
                
                {/* Live Active Status Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ENGAGED · REALTIME COGNITION</span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">{persona.name}</h3>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">{persona.title}</p>
                </div>
              </div>

              {/* Persona Director Philosophy */}
              <div className="p-4 sm:p-5 mt-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-serif">
                  &ldquo;{persona.quote}&rdquo;
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{persona.experience}</span>
                  <span className="text-emerald-400 font-semibold">Sonic-3.6 Active</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Contrast Dialogue Stage */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* 1. Candidate's Spoken Statement */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Candidate Response · Spoken Input</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                {persona.candidateText}
              </p>
            </div>

            {/* 2. What Standard Chatbots Do (The Flaw) */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/25 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Standard Scripted Mock Interview Platform</span>
                </div>
                <span className="text-[10px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">Static Rubric</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-200/80 italic leading-relaxed">
                {persona.genericBotReaction}
              </p>
              <p className="mt-2 text-[11px] text-rose-400/80 font-mono">
                → No understanding of production fragility. Completely missed the cache stampede vulnerability.
              </p>
            </div>

            {/* 3. What Veyra Does (The Adaptive Probe) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-black/60 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 relative">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-3">
                <div className="flex items-center gap-2 text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="font-bold">{persona.name}&apos;s Contextual Follow-Up</span>
                </div>
                <span className="text-[10px] text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded">
                  Autonomous Probe
                </span>
              </div>
              
              <p className="text-sm sm:text-base text-white font-medium leading-relaxed font-sans">
                {persona.veyraFollowUp}
              </p>

              <div className="mt-4 pt-4 border-t border-indigo-500/20 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  <strong className="text-emerald-300">Why this matters:</strong> {persona.keyInsight}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-mono">
                Experience realistic calibration with Marcus or Elena in your stack.
              </div>
              <Link
                href="/interviews/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Launch Live Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
