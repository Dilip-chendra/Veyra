"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Play,
  ArrowRight,
  Shield,
  Video,
  Code,
  Layers,
  Users,
  CheckCircle2,
  Cpu,
  Brain,
  MessageSquare,
  BarChart3,
  FileCheck,
  Zap,
  X,
} from "lucide-react";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";

export default function LandingPage() {
  const [demoState, setDemoState] = useState<"INTRODUCING" | "LISTENING" | "QUESTIONING" | "CHALLENGING">("QUESTIONING");
  const [heroGender, setHeroGender] = useState<"female" | "male">("female");
  const [isSpeakingDemo, setIsSpeakingDemo] = useState<boolean>(false);

  const handlePlayVoiceDemo = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(
      heroGender === "female"
        ? "Welcome to Veyra. I conduct live, rigorous technical interviews with genuine conversation memory, active listening, and evidence-based scorecards. Let's begin."
        : "Hello. I'm Marcus Vance. Today we will explore your system architecture, examine edge cases under load, and verify your implementation trade-offs."
    );
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    // Pick best voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v =>
        heroGender === "female"
          ? v.name.toLowerCase().includes("jenny") || v.name.toLowerCase().includes("aria") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female")
          : v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("ryan") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male")
      );
      if (match) utterance.voice = match;
    }

    (window as any).__landingUtterance = utterance;
    utterance.onstart = () => setIsSpeakingDemo(true);
    utterance.onend = () => {
      setIsSpeakingDemo(false);
      (window as any).__landingUtterance = null;
    };
    utterance.onerror = () => {
      setIsSpeakingDemo(false);
      (window as any).__landingUtterance = null;
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeakingDemo(false);
    }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Hero Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Photorealistic Human Interviewer • Zero Cartoons</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Meet Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              AI Interviewer.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            A photorealistic human-like AI interviewer that listens, challenges, adapts, and remembers. Conducting natural voice conversations with realistic eye contact, posture, interruptions, live coding, and evidence-backed evaluation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/interviews/new"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm group"
            >
              <span>Start an Interview</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handlePlayVoiceDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Zap className={`w-4 h-4 ${isSpeakingDemo ? "text-emerald-400 animate-bounce" : "text-indigo-400"}`} />
              <span>{isSpeakingDemo ? "Speaking Voice Demo..." : "Hear Live Speech"}</span>
            </button>
          </div>

          {/* Key Truth Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Photorealistic Adult Human
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Natural Eye Contact & Blinking
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Canned Decision Trees
            </span>
          </div>
        </div>

        {/* Right Hero: Live Interactive Photorealistic Avatar Preview */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/60 to-transparent shadow-2xl">
            <div className="w-full h-[460px] sm:h-[500px] rounded-[22px] overflow-hidden bg-slate-950 flex flex-col relative">
              <AvatarCanvas
                gender={heroGender}
                state={demoState}
                emotion={demoState === "QUESTIONING" ? "curious" : demoState === "CHALLENGING" ? "skeptical" : "attentive"}
                gaze="CANDIDATE"
                gesture={demoState === "CHALLENGING" ? "posture_forward" : "small_nod"}
                interviewerName={heroGender === "female" ? "Elena Rostova" : "Marcus Vance"}
                interviewerTitle={heroGender === "female" ? "Principal Technical Architect" : "Senior Engineering Director"}
                isAiSpeaking={isSpeakingDemo}
                onPersonaToggle={() => setHeroGender(g => g === "female" ? "male" : "female")}
              />

              {/* Demo State Control Pills */}
              <div className="absolute bottom-16 left-4 right-4 z-20 flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Persona:</span>
                  <button
                    onClick={() => setHeroGender("female")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      heroGender === "female" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Elena
                  </button>
                  <button
                    onClick={() => setHeroGender("male")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      heroGender === "male" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Marcus
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {(["QUESTIONING", "LISTENING", "CHALLENGING"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDemoState(st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        demoState === st
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Real-Time Human Simulation
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sitting across from an actual interviewer.
            </p>
            <p className="text-sm text-slate-400">
              Not a canned question bank or animated cartoon. Every turn adapts dynamically to your exact words, claims, and code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Photorealistic 3D Human Avatar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                52 ARKit blendshapes driving realistic smiles, blinks, eyebrow furrows, head tilts, posture changes, and speech-driven viseme lip sync.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Memory & Claim Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mentions reducing latency at minute 5? The interviewer probes the exact benchmark and baseline at minute 25. Every claim is tested for depth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Coding & System Design</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated Monaco Editor executing Python, TypeScript, and Go via real Piston sandboxes, plus an interactive whiteboard with 10x traffic simulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Veyra vs Static Mock Sites */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Veyra Differs from Mock Interview Sites
          </h2>
          <p className="text-xs text-slate-400">Built for authentic engineering scrutiny without superficial scores.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Traditional Mock Tools</div>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Fixed static decision tree: Question 1 → answer → Question 2.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Fabricated scores like &ldquo;You scored 73%&rdquo; with no evidence.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Cartoon avatars or prerecorded videos that cannot react.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>No real memory of what you said 15 minutes earlier.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 space-y-4">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">The Veyra Experience</div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Adaptive follow-up engine probing your exact previous words.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Evidence-backed scorecard citing verbatim quotes as proof.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Natural turn-taking, bidirectional interruptions, and listening nods.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Automatic personalized 5-part training plan for identified gaps.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to experience an actual interview?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose your target role, upload your resume or job description, and step into the room.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 text-sm"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
