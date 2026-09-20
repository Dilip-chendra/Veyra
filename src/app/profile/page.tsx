"use client";

import React, { useEffect, useState } from "react";
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, User, Save } from "lucide-react";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");
  const [interviewGoals, setInterviewGoals] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfileData(data);
          if (data.profile) {
            setTargetRole(data.profile.targetRole || "");
            setExperienceLevel(data.profile.experienceLevel || "");
            setTargetCompanies(data.profile.targetCompanies || "");
            setInterviewGoals(data.profile.interviewGoals || "");
          }
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          targetCompanies,
          interviewGoals,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const claims = profileData?.claims || [];
  const verified = claims.filter((c: any) => c.status === "VERIFIED");
  const untested = claims.filter((c: any) => c.status === "UNTESTED");

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>Candidate Knowledge Model</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Candidate Profile & Evidence Model</h1>
        <p className="text-xs text-slate-400">
          Veyra maintains a structured model of your claims, verified competencies, and untested domains to guide dynamic interviewer questioning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profile Form */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Target Role Preferences</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Seniority</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Staff/Principal">Staff / Principal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Target Companies</label>
              <input
                type="text"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Interview Goals</label>
              <textarea
                rows={3}
                value={interviewGoals}
                onChange={(e) => setInterviewGoals(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Update Preferences"}</span>
            </button>

            {savedSuccess && (
              <div className="text-emerald-400 text-[11px] font-semibold text-center">
                ✓ Preferences updated successfully.
              </div>
            )}
          </form>
        </div>

        {/* Right 2 Cols: Claims & Verified Abilities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verified Abilities */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Abilities ({verified.length})</span>
              </h2>
              <span className="text-[10px] text-slate-500">Only marked after actual transcript proof</span>
            </div>

            {verified.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                No abilities verified yet. Complete an interview session where your answers demonstrate deep technical reasoning to verify claims.
              </div>
            ) : (
              <div className="space-y-2">
                {verified.map((v: any) => (
                  <div key={v.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-slate-200">{v.claimText}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">Status: Verified with Evidence</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Untested Claims */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Untested Claims & Unknowns ({untested.length})</span>
              </h2>
              <span className="text-[10px] text-slate-500">Targeted in upcoming interviews</span>
            </div>

            {untested.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                No untested claims logged. Upload a resume to automatically extract quantified claims.
              </div>
            ) : (
              <div className="space-y-2">
                {untested.map((u: any) => (
                  <div key={u.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono uppercase">{u.source}</span>
                      <span className="text-amber-400 font-semibold">Untested</span>
                    </div>
                    <div className="text-slate-300">{u.claimText}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
