"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BehaviorState, Emotion, GazeTarget, GestureType } from "@/types";
import { ShieldCheck, Activity, Volume2, Sparkles, RefreshCw } from "lucide-react";

export interface AIDigitalHumanEngineProps {
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

// ── Facial Landmark Calibration for 8K AI Portraits (1024x1024 basis) ───
interface FaceLandmarks {
  leftEye: { cx: number; cy: number; rx: number; ry: number };
  rightEye: { cx: number; cy: number; rx: number; ry: number };
  mouth: { cx: number; cy: number; rx: number; ry: number };
  skinTone: string;
  lidShadow: string;
  lipColor: string;
}

const LANDMARKS: Record<"female" | "male", FaceLandmarks> = {
  female: {
    leftEye: { cx: 430, cy: 312, rx: 28, ry: 16 },
    rightEye: { cx: 568, cy: 312, rx: 28, ry: 16 },
    mouth: { cx: 504, cy: 430, rx: 46, ry: 14 },
    skinTone: "rgb(228, 192, 172)",
    lidShadow: "rgba(90, 55, 45, 0.45)",
    lipColor: "rgb(186, 105, 105)",
  },
  male: {
    leftEye: { cx: 442, cy: 290, rx: 30, ry: 17 },
    rightEye: { cx: 582, cy: 290, rx: 30, ry: 17 },
    mouth: { cx: 515, cy: 386, rx: 50, ry: 16 },
    skinTone: "rgb(215, 174, 150)",
    lidShadow: "rgba(80, 50, 40, 0.45)",
    lipColor: "rgb(175, 100, 95)",
  },
};

export const AIDigitalHumanEngine: React.FC<AIDigitalHumanEngineProps> = ({
  gender = "female",
  interviewerName,
  interviewerTitle,
  state = "LISTENING",
  emotion = "attentive",
  gaze = "CANDIDATE",
  gesture = "small_nod",
  audioAnalyser = null,
  isAiSpeaking = false,
  className = "",
  onPersonaToggle,
  onReplayAudio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Audio frequency inspection buffer
  const audioFreqArrayRef = useRef<Uint8Array | null>(null);

  // Animation state refs (run at 60 FPS without React re-render overhead)
  const animStateRef = useRef({
    // Blinking
    blinkProgress: 0, // 0 = open, 1 = fully closed
    isBlinking: false,
    lastBlinkTime: 0,
    nextBlinkInterval: 3000,
    // Eye saccades (micro movements)
    saccadeX: 0,
    saccadeY: 0,
    lastSaccadeTime: 0,
    // Mouth articulation
    currentMouthOpen: 0,
    targetMouthOpen: 0,
    // Head & Body motion
    nodOffset: 0,
    isNodding: false,
    nodStartTime: 0,
    breathingOffset: 0,
    headTilt: 0,
  });

  const displayName =
    interviewerName || (gender === "male" ? "Marcus Vance" : "Elena Rostova");
  const displayTitle =
    interviewerTitle ||
    (gender === "male"
      ? "Senior Engineering Director"
      : "VP of Engineering & AI Architect");

  const imageSrc =
    gender === "male"
      ? "/avatars/interviewer_male.jpg"
      : "/avatars/interviewer_female.jpg";

  // Pre-load portrait image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  // Handle Audio Analyser
  useEffect(() => {
    if (audioAnalyser) {
      audioFreqArrayRef.current = new Uint8Array(audioAnalyser.frequencyBinCount);
    }
  }, [audioAnalyser]);

  // Trigger nod when gesture changes or candidate speaks
  useEffect(() => {
    if (gesture === "small_nod" && !animStateRef.current.isNodding) {
      animStateRef.current.isNodding = true;
      animStateRef.current.nodStartTime = performance.now();
    }
  }, [gesture]);

  // ── 60 FPS Canvas Digital Human Animation Loop ───────────────────────
  useEffect(() => {
    let animFrameId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img || !imageLoaded) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const lm = LANDMARKS[gender];
      const anim = animStateRef.current;

      // 1. Natural Blinking Engine
      // Human blink duration: ~130ms. Frequency: every 2.5 - 4.5s
      if (!anim.isBlinking && time - anim.lastBlinkTime > anim.nextBlinkInterval) {
        anim.isBlinking = true;
        anim.blinkProgress = 0;
        anim.lastBlinkTime = time;
        anim.nextBlinkInterval = 2400 + Math.random() * 2200;
      }

      if (anim.isBlinking) {
        // Blink runs over 130ms
        const blinkElapsed = time - anim.lastBlinkTime;
        if (blinkElapsed >= 140) {
          anim.isBlinking = false;
          anim.blinkProgress = 0;
        } else {
          // Half sine wave for smooth eyelid drop and raise
          const phase = (blinkElapsed / 140) * Math.PI;
          anim.blinkProgress = Math.sin(phase);
        }
      }

      // 2. Micro-saccades (Realistic involuntary eye gaze shifts)
      if (time - anim.lastSaccadeTime > 800 + Math.random() * 1200) {
        anim.lastSaccadeTime = time;
        // Subtle 1-2 pixel involuntary fixation tremor
        anim.saccadeX = (Math.random() - 0.5) * 2.2;
        anim.saccadeY = (Math.random() - 0.5) * 1.5;
      }

      // Gaze target offsets
      let targetGazeX = anim.saccadeX;
      let targetGazeY = anim.saccadeY;
      if (gaze === "SCREEN") {
        targetGazeX += 6;
        targetGazeY += 4;
      } else if (gaze === "UP_THINKING") {
        targetGazeX -= 5;
        targetGazeY -= 5;
      } else if (gaze === "DOWN_REFLECTING") {
        targetGazeY += 6;
      }

      // 3. Conversational Speech & Lip-Sync Articulation
      if (isAiSpeaking) {
        let speechAmplitude = 0;
        if (audioAnalyser && audioFreqArrayRef.current) {
          audioAnalyser.getByteFrequencyData(audioFreqArrayRef.current as any);
          let sum = 0;
          for (let i = 2; i < 20; i++) sum += (audioFreqArrayRef.current as any)[i];
          const avg = sum / 18;
          speechAmplitude = Math.min(1.0, avg / 120);
        } else {
          // Natural speech cadence simulation (syllabic envelope ~4.5 Hz)
          const syl1 = Math.sin(time * 0.024);
          const syl2 = Math.sin(time * 0.015);
          const rawAmp = Math.max(0, syl1 * 0.6 + syl2 * 0.4);
          speechAmplitude = rawAmp > 0.15 ? rawAmp : 0;
        }
        // Conversational jaw aperture: 3 to 8 pixels max (NEVER GAPING!)
        anim.targetMouthOpen = speechAmplitude * 7.5;
      } else {
        anim.targetMouthOpen = 0;
      }
      // Smooth interpolation for mouth movement
      anim.currentMouthOpen += (anim.targetMouthOpen - anim.currentMouthOpen) * 0.28;

      // 4. Parallax Breathing & Head Dynamics
      const breath = Math.sin(time * 0.0018) * 1.8;
      anim.breathingOffset = breath;

      // Affirmation Nod
      if (anim.isNodding) {
        const nodElapsed = time - anim.nodStartTime;
        if (nodElapsed >= 600) {
          anim.isNodding = false;
          anim.nodOffset = 0;
        } else {
          const phase = (nodElapsed / 600) * Math.PI * 2;
          anim.nodOffset = Math.sin(phase) * 3.5;
        }
      }

      // Thoughtful head tilt
      const targetHeadTilt =
        state === "THINKING" ? -0.018 : state === "QUESTIONING" ? 0.012 : 0;
      anim.headTilt += (targetHeadTilt - anim.headTilt) * 0.05;

      // ── DRAWING THE DIGITAL HUMAN ──
      ctx.save();

      // Clear & background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, cw, ch);

      // Apply subtle breathing and nodding transforms
      const totalYOffset = anim.breathingOffset + anim.nodOffset;
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(anim.headTilt);
      ctx.translate(-cw / 2, -ch / 2 + totalYOffset);

      // Draw Base 8K AI Portrait
      ctx.drawImage(img, 0, 0, cw, ch);

      // ── A. Anatomical Eyelid Blinking & Gaze Refinement ──
      if (anim.blinkProgress > 0.04) {
        // Draw natural upper eyelid closure
        const drawEyelid = (eye: { cx: number; cy: number; rx: number; ry: number }) => {
          const { cx, cy, rx, ry } = eye;
          const dropY = ry * anim.blinkProgress * 1.4;

          ctx.save();
          ctx.beginPath();
          // Eye ellipse clipping mask
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.clip();

          // Natural matching eyelid skin drape
          ctx.beginPath();
          ctx.moveTo(cx - rx, cy);
          ctx.quadraticCurveTo(cx, cy - ry + dropY * 2, cx + rx, cy);
          ctx.lineTo(cx + rx, cy - ry - 10);
          ctx.lineTo(cx - rx, cy - ry - 10);
          ctx.closePath();

          ctx.fillStyle = lm.skinTone;
          ctx.fill();

          // Natural lash shadow line
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = lm.lidShadow;
          ctx.beginPath();
          ctx.moveTo(cx - rx + 2, cy - 2 + dropY);
          ctx.quadraticCurveTo(cx, cy - ry + dropY * 1.8, cx + rx - 2, cy - 2 + dropY);
          ctx.stroke();

          ctx.restore();
        };

        drawEyelid(lm.leftEye);
        drawEyelid(lm.rightEye);
      }

      // ── B. Natural Conversational Lip & Jaw Movement ──
      if (anim.currentMouthOpen > 0.8) {
        const { cx, cy, rx, ry } = lm.mouth;
        const open = anim.currentMouthOpen;

        ctx.save();

        // 1. Subtle inner oral shadow (depth without gaping)
        ctx.beginPath();
        ctx.ellipse(cx, cy + 1, rx * 0.72, open * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45, 12, 14, 0.85)";
        ctx.fill();

        // 2. Subtle dental reflection edge
        ctx.beginPath();
        ctx.ellipse(cx, cy - open * 0.2, rx * 0.5, open * 0.35, 0, 0, Math.PI);
        ctx.fillStyle = "rgba(240, 235, 230, 0.75)";
        ctx.fill();

        // 3. Lower lip gentle articulation (drops down smoothly by `open` px)
        // We sample lower lip and shift it naturally
        const clipW = rx * 2.2;
        const clipH = ry * 2.5;
        const clipX = cx - clipW / 2;
        const clipY = cy;

        ctx.beginPath();
        ctx.ellipse(cx, cy + ry * 0.75 + open * 0.8, rx, ry * 0.85, 0, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
          img,
          clipX,
          clipY,
          clipW,
          clipH,
          clipX,
          clipY + open * 0.7,
          clipW,
          clipH
        );

        ctx.restore();
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [gender, imageLoaded, isAiSpeaking, gaze, state]);

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
      {/* 60 FPS Digital Human Canvas */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 select-none"
      />

      {/* Subtle Studio Lighting Vignette & Depth of Field */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 z-10" />

      {/* Top Left: Executive Persona HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 backdrop-blur-md bg-slate-950/85 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
            <img
              src={imageSrc}
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

      {/* Bottom Bar: Eye Contact Diagnostics & Audio Test / Replay */}
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
            title="Replay or test the interviewer's voice out loud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Replay Voice</span>
          </button>
        )}
      </div>
    </div>
  );
};
