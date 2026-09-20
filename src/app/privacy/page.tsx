import React from "react";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-xs font-semibold text-emerald-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security & Data Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy & Candidate Trust</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>1. Complete Multi-Tenant Data Isolation</span>
          </h2>
          <p>
            Every user on Veyra operates inside an isolated tenant boundary. Candidate A will never have visibility or access into Candidate B&apos;s resumes, transcripts, scores, video replays, or GitHub repository analyses. Authorization checks are enforced at both database and server middleware layers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>2. Transparent Media Permissions</span>
          </h2>
          <p>
            When you enter an interview room, your microphone and camera streams are processed locally in your browser for Voice Activity Detection (VAD) and candidate preview. No video stream is secretly recorded or sold to third parties. If you choose to share your screen, visual frames are inspected exclusively for coding or architecture context during the interview.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>3. Right to be Forgotten & Purge Controls</span>
          </h2>
          <p>
            You maintain full ownership of your interview data. From your account Settings, you can purge all transcripts, interview history, uploaded resumes, and connected GitHub repositories at any time with immediate cascading database deletion.
          </p>
        </section>
      </div>
    </div>
  );
}
