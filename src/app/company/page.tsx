"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, Users, ShieldCheck, ArrowRight, UserCheck, FileText, CheckCircle2 } from "lucide-react";

export default function CompanyPortalPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [seniority, setSeniority] = useState("Senior");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/company/roles")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setRoles(data.roles || []);
          setCandidates(data.candidates || []);
        }
      });
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setCreating(true);

    try {
      const res = await fetch("/api/company/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          department,
          seniority,
          requiredSkills: ["Distributed Systems", "Concurrency", "Database Architecture"],
          rubricCriteria: [
            { competency: "System Architecture", weight: 40, targetEvidence: "Proven trade-off justification" },
            { competency: "Failure Resilience", weight: 30, targetEvidence: "Circuit breakers and recovery" },
            { competency: "Ownership", weight: 30, targetEvidence: "Accountability for technical decisions" },
          ],
          rawJobDescription: `Role: ${newTitle}\nSeniority: ${seniority}\nDepartment: ${department}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRoles((prev) => [data.role, ...prev]);
      setNewTitle("");
    } catch (err: any) {
      alert(err.message || "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Employer B2B Platform</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Organization Hiring Portal</h1>
        <p className="text-xs text-slate-400">
          Define competency rubrics, invite candidates, review evidence-based scorecards, and join live interviews with stealth observation and AI handoff.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Active Role Requisitions</div>
          <div className="text-2xl font-bold text-white font-mono">{roles.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Candidate Pipeline</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{candidates.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Human-in-the-Loop Handoff</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">Active</div>
        </div>
      </div>

      {/* Create New Role Requisition */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>Open New Role Requisition</span>
        </h2>

        <form onSubmit={handleCreateRole} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="e.g. Senior Machine Learning Infrastructure Engineer"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200"
            >
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Staff/Principal">Staff / Principal</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <span>{creating ? "Creating..." : "Save Role Requisition"}</span>
          </button>
        </form>
      </div>

      {/* Candidate Pipeline & Scorecard Review */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Candidate Pipeline & Scorecards</h2>
        {candidates.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500 italic">
            No candidates have completed sessions under this organization yet.
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{cand.user?.name || "Candidate"}</span>
                    <span className="text-xs text-slate-400 font-mono">({cand.user?.email})</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Role: <strong className="text-slate-300">{cand.role}</strong> • Status: <strong className="text-indigo-400">{cand.status}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/interviews/${cand.id}/live`}
                    className="px-3.5 py-1.5 bg-amber-600/30 text-amber-300 border border-amber-600/60 rounded-xl text-xs font-semibold hover:bg-amber-600/50 transition-colors flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Stealth Observe / Take Over</span>
                  </Link>

                  {cand.status === "COMPLETED" && (
                    <Link
                      href={`/interviews/${cand.id}/report`}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Scorecard</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
