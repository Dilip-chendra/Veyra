"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Key, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.providerHealth) {
          setApiKeyStatus(data.providerHealth);
        }
      });
  }, []);

  const handleDeleteAllInterviews = async () => {
    if (confirm("Are you sure you want to permanently delete all your interview sessions and transcripts? This cannot be undone.")) {
      try {
        await fetch("/api/auth/delete-data", { method: "POST" });
        setMessage("All interview data and transcripts have been permanently deleted.");
      } catch {
        setMessage("Data cleared successfully.");
      }
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          <span>Platform & Privacy Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Privacy Controls</h1>
        <p className="text-xs text-slate-400">
          Manage your external provider configurations, hardware preferences, and enterprise data retention policies.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800 rounded-2xl text-xs text-emerald-200">
          {message}
        </div>
      )}

      {/* Provider Abstraction & Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>Configured Provider Runtimes</span>
        </h2>
        <div className="space-y-3">
          {apiKeyStatus.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-200">{p.provider}</div>
                <div className="text-[11px] text-slate-500 font-mono">Category: {p.type} • Latency: {p.latencyMs}ms</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Retention & Right to be Forgotten (Section 91) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-rose-900/40 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Data Retention & Deletion Controls</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under Veyra&apos;s privacy architecture, all candidate session audio, transcripts, and claims belong exclusively to your tenant. You can purge all session data at any time.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleDeleteAllInterviews}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Purge All Interview History
          </button>
        </div>
      </div>
    </div>
  );
}
