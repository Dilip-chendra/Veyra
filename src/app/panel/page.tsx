"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PANEL_MEMBERS } from "@/lib/services/panelService";

export default function PanelInterviewPage() {
  const router = useRouter();
  const [role, setRole] = useState("Lead AI Systems Architect");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [loading, setLoading] = useState(false);

  const handleStartPanel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          interviewType: "PANEL",
          durationMinutes,
          difficulty: "ADAPTIVE",
          interviewerStyle: "PANEL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/interviews/${data.interviewId}/live`);
    } catch (err: any) {
      alert(err.message || "Failed to start panel session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multi-Agent Panel Simulation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive & Engineering Panel</h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Sit before four distinct AI interviewers who share conversation memory, confer on unresolved topics, and probe technical depth, product impact, and engineering leadership.
        </p>
      </div>

      {/* The 4 Panel Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PANEL_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold font-mono text-sm flex items-center justify-center">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">{member.name}</div>
                <div className="text-[10px] text-slate-400">{member.title}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{member.specialty}</p>
            <div className="text-[10px] font-mono text-indigo-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Style: {member.style}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Panel Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={30}>30 Minutes (Core Panel)</option>
              <option value={45}>45 Minutes (Full Standard Panel)</option>
              <option value={60}>60 Minutes (Comprehensive Executive Panel)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Shared conversational memory across all four agents.</span>
          </div>
          <button
            onClick={handleStartPanel}
            disabled={loading}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
          >
            <span>{loading ? "Convening Panel..." : "Start Panel Interview"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
