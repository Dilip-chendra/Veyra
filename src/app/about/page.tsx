import React from "react";
import { Sparkles, Shield, Cpu, Brain, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Product Vision</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">About Veyra</h1>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white">The Core Thesis</h2>
        <p>
          Most mock interview products fail because they treat an interview as a sequence of disconnected questions: &ldquo;Question 1 → answer → Question 2 → answer.&rdquo; In reality, an interview is an interactive conversational sparring session where the interviewer listens attentively, notices hesitations, probes claims, and tests the candidate&apos;s depth under pressure.
        </p>
        <p>
          <strong>Veyra</strong> was engineered to build the closest practical web experience to sitting across from a seasoned engineering lead. By combining a 52-blendshape WebGL 3D digital human facial rig, real-time Voice Activity Detection (VAD), dynamic claim cross-referencing, and sandboxed code execution, Veyra conducts authentic technical, behavioral, and system design interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">Photorealistic Presence</h3>
          <p className="text-slate-400">
            Procedural head nods, attentive blinking, thoughtful gaze shifts, and audio-driven lip sync rendered at 60 FPS in WebGL.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Continuous Memory</h3>
          <p className="text-slate-400">
            Remembers what you said earlier in the interview and cross-references claims to verify depth and consistency.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white">Zero Fake Data</h3>
          <p className="text-slate-400">
            No dummy metrics or arbitrary scores. Every evaluation citations verbatim transcript evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
