"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Video,
  Code,
  Layers,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/interviews/list").then((r) => (r.ok ? r.json() : { interviews: [] })),
    ])
      .then(([profileRes, intRes]) => {
        if (profileRes) setProfileData(profileRes);
        if (intRes?.interviews) setInterviews(intRes.interviews);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const profile = profileData?.profile || {};
  const claims = profileData?.claims || [];
  const resumes = profileData?.resumes || [];
  const projects = profileData?.projects || [];
  const verifiedClaimsCount = claims.filter((c: any) => c.status === "VERIFIED").length;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/80 text-[11px] font-mono text-indigo-300">
            <span>Candidate Knowledge Model Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {profile.targetRole || "Software Engineering"} Workspace
          </h1>
          <p className="text-xs text-slate-400">
            Target Seniority: <strong className="text-slate-200">{profile.experienceLevel || "Mid-Level"}</strong> • Persona: <strong className="text-slate-200">{profile.interviewerStyle || "PROFESSIONAL"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/interviews/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Prepare New Interview</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interviews Completed</div>
          <div className="text-2xl font-bold text-white font-mono">{interviews.filter(i => i.status === "COMPLETED").length}</div>
          <div className="text-[10px] text-slate-500">Real session history</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Extracted Claims</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{claims.length}</div>
          <div className="text-[10px] text-slate-500">Tracked for depth probing</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Abilities</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{verifiedClaimsCount}</div>
          <div className="text-[10px] text-slate-500">Evidence cited in reports</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Connected Projects</div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{projects.length}</div>
          <div className="text-[10px] text-slate-500">GitHub & project defenses</div>
        </div>
      </div>

      {/* Main Grid: Recent Interviews & Candidate Knowledge Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interviews List or Honest Empty State */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Interview Sessions</span>
            </h2>
            <Link href="/interviews" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-200">No Interviews Conducted Yet</h3>
                <p className="text-xs text-slate-400">
                  Per our zero fake data policy, your dashboard shows only authentic interviews you have scheduled or completed.
                </p>
              </div>
              <Link
                href="/interviews/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20"
              >
                <span>Start Your First Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((int: any) => (
                <div
                  key={int.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{int.role}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        int.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400" : "bg-indigo-950 text-indigo-400"
                      }`}>
                        {int.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{int.interviewType}</span>
                      <span>•</span>
                      <span>{int.durationMinutes} minutes</span>
                      <span>•</span>
                      <span>{new Date(int.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {int.status === "COMPLETED" ? (
                      <Link
                        href={`/interviews/${int.id}/report`}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Evidence Report
                      </Link>
                    ) : (
                      <Link
                        href={`/interviews/${int.id}/live`}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Enter Room
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Practice Arenas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              href="/coding"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Code className="w-5 h-5 text-indigo-400" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-slate-200">Live Coding Sandbox</div>
              <p className="text-[11px] text-slate-400">
                Practice algorithms in Python, Go, and TypeScript with real Piston execution and automated test cases.
              </p>
            </Link>

            <Link
              href="/system-design"
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Layers className="w-5 h-5 text-purple-400" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-slate-200">System Design Whiteboard</div>
              <p className="text-[11px] text-slate-400">
                Design multi-tier microservices and simulate 10x traffic bursts and regional database failover.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Col: Candidate Claims & Resumes */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Knowledge Model & Claims</span>
              </h3>
              <Link href="/profile" className="text-[11px] text-indigo-400 hover:underline">Manage</Link>
            </div>

            {claims.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                Upload a resume or connect a GitHub repository to populate your claims.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {claims.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="uppercase font-mono">{c.source}</span>
                      <span className={c.status === "VERIFIED" ? "text-emerald-400 font-bold" : "text-amber-400"}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-200 line-clamp-2">{c.claimText}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link href="/resumes" className="text-slate-400 hover:text-slate-200 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{resumes.length} Resumes</span>
              </Link>
              <Link href="/projects" className="text-slate-400 hover:text-slate-200 flex items-center gap-1">
                <GithubIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{projects.length} Repos</span>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Interview Goals</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile.interviewGoals || "Practice architectural trade-offs, code execution, and quantitative benchmarking."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
