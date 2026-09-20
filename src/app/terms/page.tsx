import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective: September 2026</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Platform Scope & Purpose</h2>
          <p>
            Veyra provides autonomous, real-time AI human interviewer simulation for technical practice and organizational candidate evaluation assistance. The platform is designed to provide actionable evidence and structured feedback.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Permitted Use</h2>
          <p>
            You agree to use Veyra in compliance with all applicable laws. You shall not attempt to reverse engineer the 3D WebGL engine, inject adversarial prompts through resumes or repositories, or overload the sandboxed code execution cluster.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Zero Fake Data Commitment</h2>
          <p>
            Veyra commits to presenting honest evaluation metrics. We do not generate arbitrary single-number ratings without citing verbatim transcript evidence.
          </p>
        </section>
      </div>
    </div>
  );
}
