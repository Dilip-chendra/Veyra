"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle } from "lucide-react";

/* =====================================================================
   VEYRA AUDIBLE VOICE ENGINE & SPEECH CONTROLLER
   – Guaranteed audible speech output across Chrome, Edge, Safari, Firefox
   – Windows Natural Neural Voice selection (Jenny, Aria, Zira, Guy, Ryan, David)
   – V8 Garbage Collection prevention via persistent global utterance ref
   – Chrome pause/hang workaround with active speech heartbeat
   – AudioContext entrance chime and audio policy unfreezer
   – Web Speech Recognition + Microphone VAD with 1.2s silence threshold
   ===================================================================== */

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

// ── Voice priority lists ──────────────────────────────────────────────
const FEMALE_VOICE_NAMES = [
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Google UK English Female",
  "Google US English",
  "Microsoft Zira - English (United States)",
  "Microsoft Zira Desktop - English (United States)",
  "Microsoft Aria - English (United States)",
  "Samantha",
  "Victoria",
  "Karen",
  "Fiona",
  "en-US-JennyNeural",
  "en-US-AriaNeural",
  "en-GB-SoniaNeural",
];

const MALE_VOICE_NAMES = [
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Google UK English Male",
  "Microsoft David - English (United States)",
  "Microsoft David Desktop - English (United States)",
  "Microsoft Mark - English (United States)",
  "Daniel",
  "Alex",
  "Fred",
  "en-US-GuyNeural",
  "en-GB-RyanNeural",
];

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  gender: "female" | "male"
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const priorityNames = gender === "female" ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;

  // 1. Exact or partial match on priority names
  for (const preferred of priorityNames) {
    const found = voices.find(
      (v) =>
        v.name === preferred ||
        v.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (found) return found;
  }

  // 2. Positive gender keywords
  const positiveKeywords =
    gender === "female"
      ? ["jenny", "aria", "zira", "female", "samantha", "girl", "woman", "victoria", "karen", "fiona", "sonia"]
      : ["guy", "ryan", "david", "mark", "male", "daniel", "boy", "man", "alex", "fred", "george"];

  // Negative keywords to ensure opposite gender is strictly excluded
  const negativeKeywords =
    gender === "female"
      ? ["guy", "ryan", "david", "mark", "male", "daniel", "boy", "man", "alex", "fred"]
      : ["jenny", "aria", "zira", "female", "samantha", "girl", "woman", "victoria", "karen", "fiona"];

  for (const kw of positiveKeywords) {
    const match = voices.find(
      (v) => v.name.toLowerCase().includes(kw) && v.lang.startsWith("en")
    );
    if (match) return match;
  }

  // 3. Fallback: Any English voice that does NOT contain opposite gender keywords
  const safeEnVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      !negativeKeywords.some((neg) => v.name.toLowerCase().includes(neg))
  );
  if (safeEnVoice) return safeEnVoice;

  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

// Play subtle high-tech room chime via Web Audio API to confirm speaker output
export function playWebAudioChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

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
  interviewerPace = "medium",
  interviewerGender = "female",
  onTriggerReplayRef,
}) => {
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [candidatePartialTranscript, setCandidatePartialTranscript] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechAccumulatorRef = useRef<string>("");
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const speechHeartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const voicesListRef = useRef<SpeechSynthesisVoice[]>([]);
  const lastSpokenTextRef = useRef<string | null>(null);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  // Pre-load available voices immediately
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesListRef.current = v;
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // ── 1. AudioContext + Microphone VAD Init ─────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    let micAnalyser: AnalyserNode | null = null;
    let vadFrameId: number | null = null;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        (window as any).__veyraLocalMicStream = stream;
        setMicPermissionError(null);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx({ sampleRate: 44100 });
        audioContextRef.current = ctx;

        // Mic analyser for VAD
        const micSource = ctx.createMediaStreamSource(stream);
        micAnalyser = ctx.createAnalyser();
        micAnalyser.fftSize = 256;
        micAnalyser.smoothingTimeConstant = 0.7;
        micSource.connect(micAnalyser);

        // TTS analyser
        const ttsAnalyser = ctx.createAnalyser();
        ttsAnalyser.fftSize = 256;
        ttsAnalyserRef.current = ttsAnalyser;
        onAnalyserReady?.(ttsAnalyser);

        // VAD loop
        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        let speaking = false;

        const runVAD = () => {
          if (!micAnalyser) return;
          vadFrameId = requestAnimationFrame(runVAD);
          micAnalyser.getByteFrequencyData(dataArray);

          // Focus on voice frequency range (300-3400 Hz)
          const startBin = Math.floor(300 / (ctx.sampleRate / micAnalyser.fftSize));
          const endBin = Math.floor(3400 / (ctx.sampleRate / micAnalyser.fftSize));
          let sum = 0;
          for (let i = startBin; i < endBin && i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / Math.max(1, endBin - startBin);

          if (avg > 24) {
            if (!speaking) {
              speaking = true;
              onCandidateSpeechStart?.();
              if (isAiSpeakingRef.current) {
                try {
                  window.speechSynthesis.cancel();
                } catch {}
                onInterruptionDetected?.();
              }
            }
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (speaking) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                speaking = false;
                setCandidatePartialTranscript("");
                const finalTranscript = speechAccumulatorRef.current.trim();
                speechAccumulatorRef.current = "";
                if (finalTranscript) {
                  onCandidateSpeechEnd?.(finalTranscript);
                }
                silenceTimerRef.current = null;
              }, 1200);
            }
          }
        };
        runVAD();
      } catch (err: any) {
        setMicPermissionError(
          err?.name === "NotAllowedError"
            ? "Microphone access denied. Please allow microphone permissions and refresh."
            : "Microphone unavailable. Use the keyboard input below to respond."
        );
      }
    };

    initAudio();

    // ── 2. Web Speech Recognition ───────────────────────────────────
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const text = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            speechAccumulatorRef.current += " " + text;
          } else {
            interim += text;
          }
        }
        setCandidatePartialTranscript(
          interim || speechAccumulatorRef.current.slice(-80)
        );
      };

      rec.onerror = (e: any) => {
        if (e.error === "not-allowed") {
          setMicPermissionError(
            "Microphone access denied. Please allow microphone permissions."
          );
        }
      };

      rec.onend = () => {
        try {
          rec.start();
        } catch {}
      };

      try {
        rec.start();
        recognitionRef.current = rec;
      } catch {}
    }

    return () => {
      if (vadFrameId) cancelAnimationFrame(vadFrameId);
      stream?.getTracks().forEach((t) => t.stop());
      try {
        recognitionRef.current?.stop();
      } catch {}
      try {
        audioContextRef.current?.close();
      } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // ── 3. High-Fidelity Audible TTS Playback Engine ───────────────────
  const executeSpeech = useCallback(
    (textToSpeak: string) => {
      if (!textToSpeak || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      lastSpokenTextRef.current = textToSpeak;

      try {
        // Unfreeze speech synthesis state in Chromium
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {}

      // Clean speech synthesis text (remove markdown formatting or code snippets)
      const cleanText = textToSpeak
        .replace(/```[\s\S]*?```/g, "Code example provided on screen.")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[#*_~]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";

      // Select best natural voice
      const voices =
        voicesListRef.current.length > 0
          ? voicesListRef.current
          : window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesListRef.current = voices;
      }
      const bestVoice = pickBestVoice(voices, interviewerGender);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Pacing & Delivery
      utterance.rate =
        interviewerPace === "fast" ? 1.08 : interviewerPace === "slow" ? 0.9 : 1.0;
      utterance.pitch = interviewerGender === "female" ? 1.02 : 0.94;
      utterance.volume = 1.0; // Max volume for clear audibility

      // CRITICAL FIX: Retain utterance on window to prevent V8 GC sweep mid-speech
      (window as any).__veyraSpeechUtterance = utterance;

      // Chrome Speech Heartbeat to prevent stall after ~15s
      if (speechHeartbeatRef.current) {
        clearInterval(speechHeartbeatRef.current);
      }
      speechHeartbeatRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 3500);

      utterance.onend = () => {
        if (speechHeartbeatRef.current) {
          clearInterval(speechHeartbeatRef.current);
          speechHeartbeatRef.current = null;
        }
        (window as any).__veyraSpeechUtterance = null;
        onAiSpeechEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis utterance error:", e);
        if (speechHeartbeatRef.current) {
          clearInterval(speechHeartbeatRef.current);
          speechHeartbeatRef.current = null;
        }
        (window as any).__veyraSpeechUtterance = null;
        onAiSpeechEnd?.();
      };

      // Speak utterance immediately
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("speechSynthesis.speak failed:", err);
        onAiSpeechEnd?.();
      }
    },
    [interviewerGender, interviewerPace, onAiSpeechEnd]
  );

  // Expose Replay function to parent via ref
  useEffect(() => {
    if (onTriggerReplayRef) {
      onTriggerReplayRef.current = () => {
        if (lastSpokenTextRef.current) {
          executeSpeech(lastSpokenTextRef.current);
        }
      };
    }
  }, [onTriggerReplayRef, executeSpeech]);

  // Trigger speech whenever speechTextToPlay changes
  useEffect(() => {
    if (!speechTextToPlay) return;
    executeSpeech(speechTextToPlay);

    // Note: Do NOT cancel speech on effect cleanup! Cancelling here stops speech whenever parent re-renders!
  }, [speechTextToPlay, executeSpeech]);

  return (
    <div className="flex flex-col gap-2">
      {micPermissionError && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{micPermissionError}</span>
        </div>
      )}
      {candidatePartialTranscript && (
        <div className="p-3 bg-slate-900/90 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
          <span className="font-semibold text-indigo-400">Transcribing: </span>
          &ldquo;{candidatePartialTranscript}&rdquo;
        </div>
      )}
    </div>
  );
};
