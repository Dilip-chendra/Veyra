"use client";

import React, { useState, useEffect, useRef } from "react";
import { BehaviorState, Emotion, GazeTarget, GestureType } from "@/types";
import { ShieldCheck, Activity, Cpu } from "lucide-react";

/* =====================================================================
   VEYRA REAL HUMAN AVATAR ENGINE
   – 100% Real High-Definition Human Video Stream with Continuous Motion
   – Seamless State Transition across Listening, Speaking, Thinking, Questioning
   – True Persona Switching (Elena Rostova <-> Marcus Vance)
   – Continuous Natural Breathing & Speech Micro-Movement
   – Audio Activity & Speaking Synchronization
   ===================================================================== */

export interface RealHumanAvatarStreamProps {
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
}

export const RealHumanAvatarStream: React.FC<RealHumanAvatarStreamProps> = ({
  gender = "female",
  interviewerName,
  interviewerTitle,
  state = "LISTENING",
  emotion = "attentive",
  gaze = "CANDIDATE",
  audioAnalyser = null,
  isAiSpeaking = false,
  className = "",
  onPersonaToggle,
}) => {
  const videoPrimaryRef = useRef<HTMLVideoElement>(null);
  const videoSecondaryRef = useRef<HTMLVideoElement>(null);
  const [activeVideoSlot, setActiveVideoSlot] = useState<"primary" | "secondary">("primary");

  const displayName = interviewerName || (gender === "male" ? "Marcus Vance" : "Elena Rostova");
  const displayTitle = interviewerTitle || (gender === "male" ? "Senior Engineering Director" : "Principal Technical Architect");

  // Determine active video source based on behavioral state
  const getVideoSrc = (g: "female" | "male", s: BehaviorState, speaking: boolean) => {
    const prefix = g === "female" ? "/avatars/videos/elena_" : "/avatars/videos/marcus_";
    if (speaking) return `${prefix}speaking.mp4`;
    if (s === "THINKING") return `${prefix}thinking.mp4`;
    if (s === "QUESTIONING" || s === "CHALLENGING" || s === "CLARIFYING") return `${prefix}questioning.mp4`;
    return `${prefix}listening.mp4`;
  };

  const currentSrc = getVideoSrc(gender, state, isAiSpeaking);
  const [activeSrc, setActiveSrc] = useState<string>(currentSrc);

  // Smooth Cross-Fade Transitions when state or gender changes
  useEffect(() => {
    if (currentSrc === activeSrc) return;

    if (activeVideoSlot === "primary") {
      if (videoSecondaryRef.current) {
        videoSecondaryRef.current.src = currentSrc;
        videoSecondaryRef.current.load();
        videoSecondaryRef.current.play().catch(() => {});
      }
      setActiveVideoSlot("secondary");
    } else {
      if (videoPrimaryRef.current) {
        videoPrimaryRef.current.src = currentSrc;
        videoPrimaryRef.current.load();
        videoPrimaryRef.current.play().catch(() => {});
      }
      setActiveVideoSlot("primary");
    }
    setActiveSrc(currentSrc);
  }, [currentSrc, activeSrc, activeVideoSlot]);

  // Ensure continuous playback
  useEffect(() => {
    const ensurePlay = () => {
      const v1 = videoPrimaryRef.current;
      const v2 = videoSecondaryRef.current;
      if (v1 && v1.paused) v1.play().catch(() => {});
      if (v2 && v2.paused && activeVideoSlot === "secondary") v2.play().catch(() => {});
    };

    ensurePlay();
    const interval = setInterval(ensurePlay, 1000);
    return () => clearInterval(interval);
  }, [gender, activeVideoSlot, activeSrc]);

  // State badge mapping
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
    <div className={`relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center ${className}`}>
      {/* Video Motion Container with Lifelike Micro-Physics */}
      <div className={`absolute inset-0 w-full h-full ${isAiSpeaking ? "animate-human-speaking" : "animate-human-breathing"}`}>
        {/* Primary Video Channel */}
        <video
          ref={videoPrimaryRef}
          src={activeVideoSlot === "primary" ? activeSrc : undefined}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
          onLoadedData={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
            activeVideoSlot === "primary" ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Secondary Video Channel for Seamless Cross-fade */}
        <video
          ref={videoSecondaryRef}
          src={activeVideoSlot === "secondary" ? activeSrc : undefined}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
          onLoadedData={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
            activeVideoSlot === "secondary" ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>

      {/* Subtle Studio Lighting Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 z-10" />

      {/* Top Left: Professional Interviewer HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 backdrop-blur-md bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
            <img
              src={gender === "male" ? "/avatars/interviewer_male.jpg" : "/avatars/interviewer_female.jpg"}
              alt={displayName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${isAiSpeaking ? "bg-emerald-400 animate-pulse" : "bg-sky-400"}`} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">{displayName}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{displayTitle}</p>
        </div>
      </div>

      {/* Top Right: State Indicator Badge & Persona Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold backdrop-blur-md flex items-center gap-2 shadow-lg ${badge.color}`}>
          <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? "bg-emerald-400 animate-ping" : "bg-current"}`} />
          <span>{badge.label}</span>
        </div>

        {onPersonaToggle && (
          <button
            onClick={onPersonaToggle}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-200 backdrop-blur-md transition-all hover:scale-105 shadow-md"
            title="Switch between Male & Female Executive Personas"
          >
            {gender === "female" ? "Switch to Marcus" : "Switch to Elena"}
          </button>
        )}
      </div>

      {/* Bottom Bar: Natural Gaze & Hardware Mode Diagnostics */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-300 font-mono">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span>Eye Contact: <strong className="text-white capitalize">{gaze.replace("_", " ").toLowerCase()}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Status: <strong className="text-emerald-400">{isAiSpeaking ? "Speaking" : "Active Listener"}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-300 font-mono">
          <Cpu className="w-3 h-3 text-indigo-400" />
          <span>Engine: <strong className="text-indigo-300">HD Human Video Stream</strong></span>
        </div>
      </div>
    </div>
  );
};
