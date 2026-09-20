"use client";

import React, { useState, useEffect } from "react";
import { Plus, ArrowRight, ShieldCheck, Code, AlertCircle, CheckCircle2 } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";

export default function ProjectsPage() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/torvalds/subsurface");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.projects) setProjects(data.projects);
      });
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLatestAnalysis(data.analysis);
      setProjects((prev) => [
        { id: data.projectId, name: `${data.analysis.owner}/${data.analysis.repoName}`, description: data.analysis.description },
        ...prev,
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800/80 text-xs font-semibold text-purple-300">
          <GithubIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Real GitHub Intelligence & Project Defense</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Defense Hub</h1>
        <p className="text-xs text-slate-400">
          Ingest real GitHub repositories to analyze architecture, dependencies, and test coverage for targeted interviewer probing.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* GitHub URL Ingestion Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <GithubIcon className="w-4 h-4 text-purple-400" />
          <span>Connect Repository</span>
        </h2>

        <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">GitHub Repository URL</label>
            <input
              type="text"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-purple-600/20"
          >
            <span>{analyzing ? "Analyzing Repository AST..." : "Ingest Repository"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Latest Analysis Results */}
      {latestAnalysis && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-purple-800/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ingestion Complete: {latestAnalysis.owner}/{latestAnalysis.repoName}</span>
            </h3>
            <span className="text-xs text-purple-300 font-mono">{latestAnalysis.primaryLanguage}</span>
          </div>

          <p className="text-xs text-slate-300">{latestAnalysis.architectureSummary}</p>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-200">Generated Project Defense Probes:</div>
            <ul className="space-y-2 text-xs">
              {latestAnalysis.defenseQuestions.map((q: string, idx: number) => (
                <li key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-200">
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Connected Repos List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Repositories</h3>
        {projects.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 bg-slate-900 rounded-2xl border border-slate-800">
            No repositories connected yet.
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <GithubIcon className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold text-slate-200">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.description}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800/60 rounded-full text-[10px] font-semibold">
                Connected
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
