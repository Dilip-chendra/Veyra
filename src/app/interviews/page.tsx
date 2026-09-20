"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Video, Plus, Clock, ArrowRight, Play, FileText, CheckCircle2 } from "lucide-react";

export default function InterviewsListPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/interviews/list")
      .then((r) => (r.ok ? r.json() : { interviews: [] }))
      .then((data) => setInterviews(data.interviews || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Interview Sessions</h1>
          <p className="text-xs text-slate-400">
            All past and active AI human interviews conducted under your isolated candidate account.
          </p>
        </div>

        <Link
          href="/interviews/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Interview</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading interview sessions...</div>
      ) : interviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <Video className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Interviews Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first session tailored to your target engineering role.
          </p>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            <span>Configure Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((int) => (
            <div
              key={int.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">{int.role}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      int.status === "COMPLETED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        : "bg-indigo-950 text-indigo-400 border border-indigo-800/60"
                    }`}
                  >
                    {int.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Type: <strong className="text-slate-300">{int.interviewType}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-slate-300">{int.durationMinutes} min</strong></span>
                  <span>•</span>
                  <span>Persona: <strong className="text-slate-300">{int.interviewerStyle}</strong></span>
                  <span>•</span>
                  <span>{new Date(int.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {int.status === "COMPLETED" ? (
                  <>
                    <Link
                      href={`/interviews/${int.id}/report`}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Evidence Report</span>
                    </Link>
                    <Link
                      href={`/interviews/${int.id}/replay`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Replay</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/interviews/${int.id}/live`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Enter Live Room</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
