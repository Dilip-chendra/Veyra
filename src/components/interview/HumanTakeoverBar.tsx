"use client";

import React, { useState } from "react";
import { UserCheck, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";

interface HumanTakeoverBarProps {
  interviewId: string;
  isHumanControl: boolean;
  onTakeoverToggled: (inControl: boolean) => void;
  unresolvedTopics?: string[];
}

export const HumanTakeoverBar: React.FC<HumanTakeoverBarProps> = ({
  interviewId,
  isHumanControl,
  onTakeoverToggled,
  unresolvedTopics = ["Production scaling metrics", "Distributed cache invalidation"],
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [briefingOpen, setBriefingOpen] = useState<boolean>(false);

  const handleTakeover = async () => {
    setLoading(true);
    try {
      const endpoint = isHumanControl ? "resume" : "takeover";
      const res = await fetch(`/api/interviews/${interviewId}/${endpoint}`, {
        method: "POST",
      });
      if (res.ok) {
        onTakeoverToggled(!isHumanControl);
        if (!isHumanControl) setBriefingOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-indigo-950 px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isHumanControl ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
        <span className="font-semibold text-slate-300">
          Recruiter Control Mode: <strong className={isHumanControl ? "text-amber-400" : "text-emerald-400"}>{isHumanControl ? "HUMAN LIVE TAKEOVER" : "AUTONOMOUS AI LEAD"}</strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isHumanControl && (
          <button
            onClick={() => setBriefingOpen(!briefingOpen)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            {briefingOpen ? "Hide AI Briefing" : "View AI Briefing"}
          </button>
        )}

        <button
          onClick={handleTakeover}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            isHumanControl
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-amber-600 hover:bg-amber-500 text-white"
          }`}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : isHumanControl ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <UserCheck className="w-3.5 h-3.5" />
          )}
          <span>{isHumanControl ? "Hand Back to AI" : "Take Over Live"}</span>
        </button>
      </div>

      {briefingOpen && isHumanControl && (
        <div className="absolute top-12 right-6 w-96 bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-2xl z-50 text-xs text-slate-200">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Briefing for Live Recruiter</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">
            The AI interviewer has yielded the floor to you. Here are key unresolved topics to probe:
          </p>
          <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-400">
            {unresolvedTopics.map((topic, idx) => (
              <li key={idx}><strong className="text-slate-200">{topic}</strong></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
