"use client";

import React, { useEffect, useState } from "react";
import { Award, CheckCircle2, AlertCircle, Layers } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setClaims(data.claims || []);
          setSkills(data.skillAssessments || []);
        }
      });
  }, []);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-xs font-semibold text-emerald-300">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Competency Matrix</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Verified Skills & Claims</h1>
        <p className="text-xs text-slate-400">
          Skills are only marked as demonstrated when backed by concrete transcript citations.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Extracted Competency Claims</span>
        </h2>

        {claims.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-2xl border border-slate-800">
            No claims registered yet. Upload a resume to automatically populate your competency claims.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono uppercase text-slate-500">{claim.domain}</span>
                  <span className={claim.status === "VERIFIED" ? "text-emerald-400 font-bold" : "text-amber-400 font-semibold"}>
                    {claim.status}
                  </span>
                </div>
                <div className="text-slate-200 font-medium">{claim.claimText}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
