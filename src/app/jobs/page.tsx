"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Sparkles, ArrowRight, CheckCircle2, Layers } from "lucide-react";

export default function JobsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Staff Cloud Systems Architect");
  const [company, setCompany] = useState("Stripe");
  const [rawText, setRawText] = useState(
    `Role: Staff Cloud Systems Architect\nCompany: Stripe\nRequirements:\n- 8+ years designing high-throughput distributed architectures\n- Deep experience with Go, Python, and PostgreSQL\n- Experience with Kafka, Redis caching, and zero-downtime database migrations\n- Strong focus on latency mitigation and disaster recovery`
  );
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, title, company }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnalysisResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to analyze JD");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterviewWithJd = async () => {
    if (!analysisResult) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: analysisResult.parsed.title,
          interviewType: "TECHNICAL",
          durationMinutes: 30,
          jobDescriptionId: analysisResult.jobDescriptionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/interviews/${data.interviewId}/live`);
    } catch (err: any) {
      alert(err.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span>Job Description Analysis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Saved Job Targets & Blueprints</h1>
        <p className="text-xs text-slate-400">
          Paste any authentic job description. Veyra extracts technical and behavioral competencies and synthesizes an interview blueprint.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Analyze Job Posting</span>
        </h2>

        <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Position Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Company Context</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Full Job Description Text</label>
            <textarea
              rows={8}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <span>{loading ? "Extracting Competencies..." : "Generate Job Blueprint"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {analysisResult && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-800/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Blueprint Synthesized for {analysisResult.parsed.title}</span>
            </h3>
            <button
              onClick={handleStartInterviewWithJd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Start Interview for this Role
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-indigo-300">Required Competencies:</div>
              <div className="text-slate-300">{analysisResult.parsed.requiredSkills.join(", ")}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-indigo-300">Technical Focus Areas:</div>
              <div className="text-slate-300">{analysisResult.parsed.technicalCompetencies.join(", ")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
