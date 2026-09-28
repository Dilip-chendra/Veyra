"use client";

import React from "react";
import { BehaviorState, Emotion, GazeTarget, GestureType } from "@/types";
import { ShieldCheck, Volume2, Activity, RefreshCw } from "lucide-react";

export interface ProfessionalHumanInterviewerProps {
  gender?: "female" | "male";
  interviewerName?: string;
  interviewerTitle?: string;
  state?: BehaviorState;
  emotion?: Emotion;
  gaze?: GazeTarget;
  gesture?: GestureType;
  audioAnalyser?: AnalyserNode | null;
  isAiSpeaking?: boolean;
  className?: string;
  onPersonaToggle?: () => void;
  onReplayAudio?: () => void;
}

/**
 * ProfessionalHumanInterviewer — Veyra v1 Executive Interviewer Presentation.
 *
 * Renders ONLY the authentic, high-resolution photograph of the interviewer:
 * - Marcus Vance: /avatars/interviewer_male.jpg
 * - Elena Rostova: /avatars/interviewer_female.jpg
 *
 * ABSOLUTE VISUAL RULES:
 * - Static high-definition photograph only
 * - ZERO facial animation, eye animation, lip animation, or SVG overlays
 * - ZERO Three.js meshes or emojis
 * - Presence and realism conveyed through Cartesia Sonic-3.6 realtime voice and adaptive intelligence
 */
export const ProfessionalHumanInterviewer: React.FC<ProfessionalHumanInterviewerProps> = ({
  gender = "female",
  interviewerName,
  interviewerTitle,
  state = "LISTENING",
  isAiSpeaking = false,
  className = "",
  onPersonaToggle,
  onReplayAudio,
}) => {
  const isMale = gender === "male";
  const photoSrc = isMale
    ? "/avatars/interviewer_male.jpg"
    : "/avatars/interviewer_female.jpg";

  const displayName =
    interviewerName || (isMale ? "Marcus Vance" : "Elena Rostova");
  const displayTitle =
    interviewerTitle ||
    (isMale
      ? "Senior Engineering Director"
      : "VP of Engineering & Principal Technical Architect");

  const badgeMap: Record<BehaviorState, { label: string; color: string }> = {
    INTRODUCING: { label: "Speaking • Welcome", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    LISTENING: { label: "Listening Intently", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    THINKING: { label: "Analyzing Response", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    QUESTIONING: { label: "Asking Question", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    CLARIFYING: { label: "Clarifying Objective", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    CHALLENGING: { label: "Probing Technical Depth", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ENCOURAGING: { label: "Affirming Competency", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    INTERRUPTING: { label: "Refocusing Discussion", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
    WAITING: { label: "Waiting for Input", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    TRANSITIONING: { label: "Transitioning Stage", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    CODING: { label: "Reviewing Code Structure", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    REVIEWING: { label: "Inspecting Implementation", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    CLOSING: { label: "Debrief & Wrap-up", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  };

  const badge = badgeMap[state] || badgeMap.LISTENING;

  return (
    <div
      className={`relative w-full h-full min-h-[440px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center ${className}`}
    >
      {/* 1. Pure High-Resolution Static Photograph — No overlays over the face */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoSrc}
        alt={displayName}
        className="w-full h-full object-cover object-top select-none pointer-events-none"
      />

      {/* 2. Professional Executive Lighting Vignette (Dark borders, clear face) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 z-10" />

      {/* 3. Top-Left Executive Persona HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 backdrop-blur-md bg-slate-950/85 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt={displayName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
              isAiSpeaking ? "bg-emerald-400 animate-pulse" : "bg-sky-400"
            }`}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">
              {displayName}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{displayTitle}</p>
        </div>
      </div>

      {/* 4. Top-Right Status Badge & Optional Persona Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md flex items-center gap-2 shadow-lg ${badge.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isAiSpeaking ? "bg-emerald-400 animate-ping" : "bg-current"
            }`}
          />
          <span>{badge.label}</span>
        </div>

        {onPersonaToggle && (
          <button
            onClick={onPersonaToggle}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-200 backdrop-blur-md transition-all hover:scale-105 shadow-md flex items-center gap-1.5"
            title="Switch between Male & Female Executive Personas"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>{isMale ? "Switch to Elena" : "Switch to Marcus"}</span>
          </button>
        )}
      </div>

      {/* 5. Bottom HUD: Realtime Audio Engine Status & Replay Control */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-300 font-mono">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span>
            Voice:{" "}
            <strong className="text-white font-sans">
              Cartesia Sonic-3.6 ({isMale ? "Clarkson" : "Morgan"})
            </strong>
          </span>
          <span className="text-slate-600">•</span>
          <span>
            Status:{" "}
            <strong className={isAiSpeaking ? "text-emerald-400" : "text-sky-400"}>
              {isAiSpeaking ? "Speaking" : "Active Listener"}
            </strong>
          </span>
        </div>

        {onReplayAudio && (
          <button
            onClick={onReplayAudio}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-500/50 text-white text-[11px] font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Replay interviewer voice out loud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Replay Voice</span>
          </button>
        )}
      </div>
    </div>
  );
};
