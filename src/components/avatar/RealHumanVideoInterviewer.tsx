"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BehaviorState, Emotion, GazeTarget, GestureType } from "@/types";
import {
  InterviewerVideoManager,
  VideoManifestData,
} from "@/lib/video/InterviewerVideoManager";
import { ShieldCheck, Activity, Volume2, RefreshCw } from "lucide-react";

export interface RealHumanVideoInterviewerProps {
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

export const RealHumanVideoInterviewer: React.FC<RealHumanVideoInterviewerProps> = ({
  gender = "female",
  interviewerName,
  interviewerTitle,
  state = "LISTENING",
  emotion = "attentive",
  gaze = "CANDIDATE",
  isAiSpeaking = false,
  className = "",
  onPersonaToggle,
  onReplayAudio,
}) => {
  const interviewerId = gender === "male" ? "marcus" : "elena";

  // Dual-slot video references for seamless 0ms cross-fades
  const videoPrimaryRef = useRef<HTMLVideoElement>(null);
  const videoSecondaryRef = useRef<HTMLVideoElement>(null);
  const [activeSlot, setActiveSlot] = useState<"primary" | "secondary">("primary");

  const [currentClipUrl, setCurrentClipUrl] = useState<string>("");
  const [preloadUrls, setPreloadUrls] = useState<string[]>([]);
  const [manifestData, setManifestData] = useState<VideoManifestData | null>(null);

  const videoManagerRef = useRef<InterviewerVideoManager>(
    new InterviewerVideoManager(interviewerId)
  );

  const displayName =
    interviewerName || (gender === "male" ? "Marcus Vance" : "Elena Rostova");
  const displayTitle =
    interviewerTitle ||
    (gender === "male"
      ? "Senior Engineering Director"
      : "VP of Engineering & Principal Technical Architect");

  const portraitThumb =
    gender === "male"
      ? "/avatars/interviewer_male.jpg"
      : "/avatars/interviewer_female.jpg";

  // 1. Fetch Video Manifest on Mount
  useEffect(() => {
    let isMounted = true;
    fetch("/interviewer-videos/manifest.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VideoManifestData) => {
        if (data && isMounted) {
          setManifestData(data);
          videoManagerRef.current.setManifest(data);
          // Initial clip selection
          const initial = videoManagerRef.current.selectVideoClip("INTRODUCING", false);
          setCurrentClipUrl(initial.url);
          setPreloadUrls(initial.preloads);
        }
      })
      .catch(() => {
        // Fallback to default clip
        const fallback = `/interviewer-videos/${interviewerId}/listening/listening_01.mp4`;
        if (isMounted) setCurrentClipUrl(fallback);
      });

    return () => {
      isMounted = false;
    };
  }, [interviewerId]);

  // 2. Synchronize Interviewer identity
  useEffect(() => {
    videoManagerRef.current.setInterviewer(interviewerId);
    if (manifestData) {
      const clip = videoManagerRef.current.selectVideoClip(state, isAiSpeaking);
      setCurrentClipUrl(clip.url);
      setPreloadUrls(clip.preloads);
    }
  }, [interviewerId, manifestData]);

  // 3. React to State or Speaking Changes
  useEffect(() => {
    if (!manifestData) return;

    const nextClip = videoManagerRef.current.selectVideoClip(state, isAiSpeaking);

    // Cross-fade to next clip
    if (activeSlot === "primary") {
      const v2 = videoSecondaryRef.current;
      if (v2) {
        v2.src = nextClip.url;
        v2.load();
        v2.play()
          .then(() => {
            setActiveSlot("secondary");
          })
          .catch(() => {
            setActiveSlot("secondary");
          });
      }
    } else {
      const v1 = videoPrimaryRef.current;
      if (v1) {
        v1.src = nextClip.url;
        v1.load();
        v1.play()
          .then(() => {
            setActiveSlot("primary");
          })
          .catch(() => {
            setActiveSlot("primary");
          });
      }
    }

    setCurrentClipUrl(nextClip.url);
    setPreloadUrls(nextClip.preloads);
  }, [state, isAiSpeaking]);

  // 4. Handle Video Ended: Rotate within current state (NO AUTO-END!)
  const handleVideoEnded = useCallback(() => {
    // When a video moment finishes, smoothly chain to another clip within current state
    const nextClip = videoManagerRef.current.selectVideoClip(state, isAiSpeaking);

    if (activeSlot === "primary") {
      const v2 = videoSecondaryRef.current;
      if (v2) {
        v2.src = nextClip.url;
        v2.load();
        v2.play()
          .then(() => {
            setActiveSlot("secondary");
          })
          .catch(() => {
            setActiveSlot("secondary");
          });
      }
    } else {
      const v1 = videoPrimaryRef.current;
      if (v1) {
        v1.src = nextClip.url;
        v1.load();
        v1.play()
          .then(() => {
            setActiveSlot("primary");
          })
          .catch(() => {
            setActiveSlot("primary");
          });
      }
    }
    setCurrentClipUrl(nextClip.url);
    setPreloadUrls(nextClip.preloads);
  }, [state, isAiSpeaking, activeSlot]);

  // Ensure active video is playing
  useEffect(() => {
    const ensurePlayback = () => {
      const activeEl =
        activeSlot === "primary" ? videoPrimaryRef.current : videoSecondaryRef.current;
      if (activeEl && activeEl.paused) {
        activeEl.play().catch(() => {});
      }
    };
    ensurePlayback();
    const interval = setInterval(ensurePlayback, 1200);
    return () => clearInterval(interval);
  }, [activeSlot, currentClipUrl]);

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
    <div
      className={`relative w-full h-full min-h-[440px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center ${className}`}
    >
      {/* Primary Video Channel */}
      <video
        ref={videoPrimaryRef}
        src={currentClipUrl || undefined}
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnded}
        onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out ${
          activeSlot === "primary" ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Secondary Video Channel for 0ms Cross-Fade Transitions */}
      <video
        ref={videoSecondaryRef}
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnded}
        onCanPlay={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out ${
          activeSlot === "secondary" ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Preload Background Links */}
      <div className="hidden">
        {preloadUrls.map((url, idx) => (
          <video key={idx} src={url} preload="auto" muted />
        ))}
      </div>

      {/* Subtle Studio Lighting Vignette & Depth of Field */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 z-10" />

      {/* Top Left: Executive Persona HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 backdrop-blur-md bg-slate-950/85 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
            <img
              src={portraitThumb}
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

      {/* Top Right: Status Badge & Persona Switcher */}
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
            <span>{gender === "female" ? "Switch to Marcus" : "Switch to Elena"}</span>
          </button>
        )}
      </div>

      {/* Bottom Bar: Diagnostics & Audio Replay */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-300 font-mono">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span>
            Eye Contact:{" "}
            <strong className="text-white capitalize">
              {gaze.replace("_", " ").toLowerCase()}
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
