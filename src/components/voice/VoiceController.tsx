"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { useCartesiaTTS } from "@/hooks/useCartesiaTTS";
import { useCartesiaSTT } from "@/hooks/useCartesiaSTT";

/**
 * VoiceController — Cartesia-powered voice engine.
 *
 * TTS: Cartesia Sonic-3.6 (via /api/cartesia/tts server proxy)
 * STT: Cartesia Ink-2 (via /api/cartesia/stt-relay WebSocket proxy)
 *
 * NO browser SpeechSynthesis.
 * NO browser SpeechRecognition.
 * NO fallback to fake voice.
 */

interface VoiceControllerProps {
  onCandidateSpeechStart?: () => void;
  onCandidateSpeechEnd?: (transcript: string) => void;
  onInterruptionDetected?: () => void;
  isAiSpeaking?: boolean;
  onAiSpeechEnd?: () => void;
  onAnalyserReady?: (analyser: AnalyserNode) => void;
  speechTextToPlay?: string | null;
  interviewerPace?: "slow" | "medium" | "fast";
  interviewerGender?: "female" | "male";
  onTriggerReplayRef?: React.MutableRefObject<(() => void) | null>;
}

export function playWebAudioChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {}
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  onCandidateSpeechStart,
  onCandidateSpeechEnd,
  onInterruptionDetected,
  isAiSpeaking = false,
  onAiSpeechEnd,
  onAnalyserReady,
  speechTextToPlay = null,
  interviewerGender = "female",
  onTriggerReplayRef,
}) => {
  const [micError, setMicError] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const lastSpokenTextRef = useRef<string | null>(null);
  const isAiSpeakingRef = useRef(isAiSpeaking);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  // ── Cartesia TTS ──────────────────────────────────────────────────────
  const { speak, stop: stopTTS, isPlaying: isTtsPlaying, status: ttsStatus, error: ttsHookError } = useCartesiaTTS(
    useCallback(() => {
      onAiSpeechEnd?.();
    }, [onAiSpeechEnd])
  );

  // Sync TTS errors to state
  useEffect(() => {
    if (ttsHookError) {
      setTtsError(ttsHookError);
    } else {
      setTtsError(null);
    }
  }, [ttsHookError]);

  // Expose TTS stop for cleanup (interview end, interruption)
  // Expose via window so LiveRoom can call it directly on session end
  useEffect(() => {
    (window as unknown as { __veyraStopTTS?: () => void }).__veyraStopTTS = stopTTS;
    return () => {
      delete (window as unknown as { __veyraStopTTS?: () => void }).__veyraStopTTS;
    };
  }, [stopTTS]);

  // ── Cartesia STT ──────────────────────────────────────────────────────
  const {
    connect: connectSTT,
    disconnect: disconnectSTT,
    isListening,
    partialTranscript,
    error: sttError,
    status: sttStatus,
  } = useCartesiaSTT({
    isAiSpeaking,
    onTurnStart: useCallback(() => {
      onCandidateSpeechStart?.();
      // If AI is speaking, stop it immediately (interruption)
      if (isAiSpeakingRef.current) {
        stopTTS();
        onInterruptionDetected?.();
      }
    }, [onCandidateSpeechStart, stopTTS, onInterruptionDetected]),
    onTranscriptUpdate: useCallback((partial: string) => {
      // partial updates can be shown in the UI if needed
      // (LiveRoom subscribes via transcript state updates from onCandidateSpeechEnd)
    }, []),
    onTurnEnd: useCallback((finalTranscript: string) => {
      if (finalTranscript.trim()) {
        onCandidateSpeechEnd?.(finalTranscript.trim());
      }
    }, [onCandidateSpeechEnd]),
    onInterruption: useCallback(() => {
      onInterruptionDetected?.();
    }, [onInterruptionDetected]),
  });

  // Sync STT errors
  useEffect(() => {
    if (sttError) setMicError(sttError);
    else setMicError(null);
  }, [sttError]);

  // Expose STT disconnect for cleanup
  useEffect(() => {
    (window as unknown as { __veyraDisconnectSTT?: () => void }).__veyraDisconnectSTT = disconnectSTT;
    return () => {
      delete (window as unknown as { __veyraDisconnectSTT?: () => void }).__veyraDisconnectSTT;
    };
  }, [disconnectSTT]);

  // ── Auto-connect STT when component mounts ────────────────────────────
  useEffect(() => {
    connectSTT();
    // STT stays connected throughout the interview — disconnect is handled on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Expose AudioAnalyser for avatar visual waveform ───────────────────
  // (Cartesia plays through AudioContext — we can tap the destination for analysis)
  // For now, analyser is not critical for the photo-based avatar, so we skip it

  // ── Play speech when speechTextToPlay changes ─────────────────────────
  useEffect(() => {
    if (!speechTextToPlay) return;
    lastSpokenTextRef.current = speechTextToPlay;
    speak(speechTextToPlay, interviewerGender);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechTextToPlay]);

  // ── Expose Replay function ────────────────────────────────────────────
  useEffect(() => {
    if (onTriggerReplayRef) {
      onTriggerReplayRef.current = () => {
        if (lastSpokenTextRef.current) {
          speak(lastSpokenTextRef.current, interviewerGender);
        }
      };
    }
  }, [onTriggerReplayRef, speak, interviewerGender]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {/* TTS Error — no fallback, show real error */}
      {ttsError && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            <strong>Voice error:</strong> {ttsError}
          </span>
        </div>
      )}

      {/* STT / Mic Error */}
      {micError && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{micError}</span>
        </div>
      )}

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
        {/* STT status */}
        <div className="flex items-center gap-1.5">
          {sttStatus === "connecting" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Connecting mic…</span>
            </>
          )}
          {sttStatus === "ready" && (
            <>
              <Mic className="w-3 h-3 text-sky-400" />
              <span className="text-sky-300">Mic ready</span>
            </>
          )}
          {isListening && (
            <>
              <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300">Listening…</span>
            </>
          )}
          {(sttStatus === "error" || sttStatus === "disconnected") && !micError && (
            <>
              <MicOff className="w-3 h-3 text-rose-400" />
              <span className="text-rose-300">Mic unavailable</span>
            </>
          )}
        </div>

        {/* TTS status */}
        {isTtsPlaying && (
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300">Speaking…</span>
          </div>
        )}
        {ttsStatus === "loading" && (
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
            <span>Generating voice…</span>
          </div>
        )}
      </div>

      {/* Partial transcript */}
      {partialTranscript && (
        <div className="p-3 bg-slate-900/90 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
          <span className="font-semibold text-indigo-400">You: </span>
          &ldquo;{partialTranscript}&rdquo;
        </div>
      )}
    </div>
  );
};
