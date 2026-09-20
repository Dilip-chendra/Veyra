"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Activity, Server, Clock, Cpu, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMetrics(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const overview = metrics?.overview || {};
  const providerHealth = metrics?.providerHealth || [];
  const auditEvents = metrics?.recentAuditEvents || [];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span>Platform Observability & Infrastructure Health</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin & Observability Console</h1>
        <p className="text-xs text-slate-400">
          Real-time metrics, provider latencies, execution runtimes, and audit trail.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Registered Users</div>
          <div className="text-2xl font-bold text-white font-mono">{overview.totalUsers ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Interviews</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{overview.totalInterviews ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Completed Sessions</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{overview.completedInterviews ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Completion Rate</div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{overview.completionRate || "100%"}</div>
        </div>
      </div>

      {/* Provider Health & Latencies */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Provider Health & Latency Monitor</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providerHealth.map((p: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-200">{p.provider}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {p.type} • Round-trip Latency: {p.latencyMs}ms
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Event Trail */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Recent Audit Events</span>
        </h2>
        {auditEvents.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-2xl border border-slate-800">
            No security or system audit anomalies recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {auditEvents.map((evt: any) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-indigo-400 font-bold">{evt.action}</span>
                  <div className="text-[11px] text-slate-500 font-mono">{evt.details}</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
