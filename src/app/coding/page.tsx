"use client";

import React, { useState } from "react";
import { CodeEditorPane } from "@/components/coding/CodeEditorPane";
import { Sparkles, Code, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

export default function CodingArenaPage() {
  const [interviewerComment, setInterviewerComment] = useState<string | null>(
    "Welcome to the Live Coding Arena. Select a problem and language, implement your solution, and click 'Submit for Review' to receive complexity feedback."
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Piston Multi-Language Sandbox Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live Coding Arena</h1>
          <p className="text-xs text-slate-400">
            Write, compile, and execute code in isolated runtimes with automated test verification and complexity analysis.
          </p>
        </div>
      </div>

      {/* Interviewer Feedback Callout */}
      {interviewerComment && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3 text-xs text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-300">Interviewer Review: </span>
            <span className="text-slate-300">{interviewerComment}</span>
          </div>
        </div>
      )}

      {/* Editor & Execution Panel */}
      <div className="flex-1 min-h-[500px]">
        <CodeEditorPane
          onRequestCodeReview={(code, lang) => {
            fetch("/api/code/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ language: lang, code }),
            })
              .then((r) => r.json())
              .then((res) => {
                if (res?.complexityAnalysis) {
                  const ca = res.complexityAnalysis;
                  setInterviewerComment(
                    `Estimated Time Complexity: ${ca.estimatedTimeComplexity} • Space: ${ca.estimatedSpaceComplexity}. Probe: ${ca.potentialProbes[0]}`
                  );
                }
              })
              .catch(() => {});
          }}
        />
      </div>
    </div>
  );
}
