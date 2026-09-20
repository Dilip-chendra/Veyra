"use client";

import React, { useState, useEffect } from "react";
import { FileText, Upload, Plus, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [filename, setFilename] = useState("My_Resume.txt");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.resumes) setResumes(data.resumes);
      });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setUploading(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, text: resumeText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(`Successfully parsed resume "${filename}". Extracted ${data.parsed.claims.length} claims and ${data.parsed.technologies.length} technologies.`);
      setResumes((prev) => [data, ...prev]);
      setResumeText("");
    } catch (err: any) {
      alert(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Resume Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Structured Resume Intelligence</h1>
        <p className="text-xs text-slate-400">
          Upload resumes to extract technical claims, metrics, and experience for the interviewer to verify.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" />
          <span>Ingest New Resume</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Document Title</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Resume Text / Content</label>
            <textarea
              rows={8}
              required
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste full resume text here with experience, technologies, and achievements..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
          >
            <span>{uploading ? "Extracting Intelligence..." : "Process Resume"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Ingested Resumes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ingested Resumes</h3>
        {resumes.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 bg-slate-900 rounded-2xl border border-slate-800">
            No resumes ingested yet.
          </div>
        ) : (
          resumes.map((r: any) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-slate-200">{r.filename}</div>
                  <div className="text-[11px] text-slate-500">
                    Uploaded: {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full text-[10px] font-semibold">
                Parsed & Ready
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
