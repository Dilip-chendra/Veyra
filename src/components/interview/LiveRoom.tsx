"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PhotorealisticAvatar } from "@/components/avatar/PhotorealisticAvatar";
import { CodeEditorPane } from "@/components/coding/CodeEditorPane";
import { SystemDesignCanvas } from "@/components/whiteboard/SystemDesignCanvas";
import { VoiceController, playWebAudioChime } from "@/components/voice/VoiceController";
import { TimerDisplay } from "./TimerDisplay";
import { LiveTranscript, TranscriptItem } from "./LiveTranscript";
import { HumanTakeoverBar } from "./HumanTakeoverBar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Code,
  Layers,
  User,
  MessageSquare,
  PhoneOff,
  Send,
  Sparkles,
  Play,
  Volume2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { BehaviorState, Emotion, GazeTarget, GestureType, InterviewTurnResponse, CodeRunResult, WhiteboardGraph } from "@/types";

interface LiveRoomProps {
  interviewId: string;
  roleTitle: string;
  durationMinutes: number;
  initialQuestion?: string;
  interviewerGender?: "female" | "male";
  interviewerName?: string;
  interviewerTitle?: string;
  isEmployerReview?: boolean;
}

export const LiveRoom: React.FC<LiveRoomProps> = ({
  interviewId,
  roleTitle,
  durationMinutes,
  initialQuestion = "Welcome. I've reviewed your background for this role. To kick off our session, walk me through the most technically challenging project you've led recently and what specific trade-offs you made.",
  interviewerGender,
  interviewerName,
  interviewerTitle,
  isEmployerReview = false,
}) => {
  const router = useRouter();

  // Mode: "avatar" | "coding" | "whiteboard" | "screen"
  const [activeMode, setActiveMode] = useState<"avatar" | "coding" | "whiteboard" | "screen">("avatar");

  // Interviewer Persona selection (strictly honor interviewerGender if provided)
  const [gender, setGender] = useState<"female" | "male">(
    interviewerGender || (interviewerName?.toLowerCase().includes("marcus") ? "male" : "female")
  );
  const currentInterviewerName = interviewerName || (gender === "male" ? "Marcus Vance" : "Elena Rostova");
  const currentInterviewerTitle = interviewerTitle || (gender === "male" ? "Senior Engineering Director" : "Principal Technical Architect");

  // Session Connection & Audio Unlocking
  const [hasStartedSession, setHasStartedSession] = useState<boolean>(false);
  const [isSessionTerminated, setIsSessionTerminated] = useState<boolean>(false);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Media states
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Avatar & Behavior states
  const [behaviorState, setBehaviorState] = useState<BehaviorState>("INTRODUCING");
  const [emotion, setEmotion] = useState<Emotion>("warm");
  const [gaze, setGaze] = useState<GazeTarget>("CANDIDATE");
  const [gesture, setGesture] = useState<GestureType>("open_hand");
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);

  // Speech & Dialog states
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [speechTextToPlay, setSpeechTextToPlay] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  // End Interview Confirmation Modal
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);

  // Transcript state
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([
    {
      id: "init",
      role: "interviewer",
      speaker: currentInterviewerName,
      text: initialQuestion,
      timestampSeconds: 0,
    },
  ]);

  // Human Takeover state
  const [isHumanInControl, setIsHumanInControl] = useState<boolean>(false);

  // Audio Replay Ref
  const triggerReplayRef = useRef<(() => void) | null>(null);

  // 1. Candidate Camera Stream
  useEffect(() => {
    let videoStream: MediaStream | null = null;
    const startCamera = async () => {
      if (isCameraActive) {
        try {
          videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (candidateVideoRef.current) {
            candidateVideoRef.current.srcObject = videoStream;
          }
        } catch {
          setIsCameraActive(false);
        }
      } else {
        if (candidateVideoRef.current && candidateVideoRef.current.srcObject) {
          const s = candidateVideoRef.current.srcObject as MediaStream;
          s.getTracks().forEach(t => t.stop());
          candidateVideoRef.current.srcObject = null;
        }
      }
    };
    startCamera();
    return () => {
      if (videoStream) videoStream.getTracks().forEach(t => t.stop());
    };
  }, [isCameraActive]);

  // 2. Screen Sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        setActiveMode("screen");
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setActiveMode("avatar");
        };
      } catch {
        setIsScreenSharing(false);
      }
    } else {
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const s = screenVideoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
      }
      setIsScreenSharing(false);
      setActiveMode("avatar");
    }
  };

  // 3. User Starts / Connects Session (Unlocks browser audio policy)
  const handleStartSession = () => {
    // Unfreeze audio engine and play chime
    playWebAudioChime();

    setHasStartedSession(true);
    sessionStartTimeRef.current = Date.now();
    setBehaviorState("INTRODUCING");
    setEmotion("warm");
    setGaze("CANDIDATE");
    setIsAiSpeaking(true);
    setSpeechTextToPlay(initialQuestion);
  };

  // 4. Process Candidate Answer & Invoke Turn API
  const handleCandidateAnswer = async (answerText: string) => {
    const trimmed = answerText.trim();
    if (!trimmed || isProcessingTurn) return;

    setIsProcessingTurn(true);
    setBehaviorState("THINKING");
    setEmotion("thoughtful");
    setGaze("UP_THINKING");

    // Compute REAL elapsed seconds since session start
    const realElapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));

    // Add candidate turn to transcript
    const candidateTurn: TranscriptItem = {
      id: String(Date.now()),
      role: "candidate",
      speaker: "Candidate",
      text: trimmed,
      timestampSeconds: realElapsedSeconds,
    };
    setTranscript(prev => [...prev, candidateTurn]);
    setTextInput("");

    try {
      const res = await fetch(`/api/interviews/${interviewId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateAnswer: trimmed,
          elapsedSeconds: realElapsedSeconds,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to evaluate turn");
      }

      const data: InterviewTurnResponse = await res.json();

      // Apply Interviewer Behavior & Speak response
      setBehaviorState(data.behavior.state);
      setEmotion(data.behavior.emotion);
      setGaze(data.behavior.gaze);
      setGesture(data.behavior.gesture);

      // Play audio after the natural thinking pause
      setTimeout(() => {
        setIsAiSpeaking(true);
        setSpeechTextToPlay(data.question);

        // Add to transcript
        setTranscript(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "interviewer",
            speaker: data.speaker || currentInterviewerName,
            text: data.question,
            timestampSeconds: realElapsedSeconds + 2,
          },
        ]);
      }, Math.min(1200, data.behavior.pauseBeforeSpeechMs || 600));

      // Note: We NEVER automatically push to /report upon speech!
      // Ending is only triggered via explicit user confirmation in handleConfirmEnd.
    } catch (err) {
      console.error(err);
      setBehaviorState("QUESTIONING");
      setEmotion("curious");
      setSpeechTextToPlay("Thank you. Let's dig deeper into that — what specific trade-offs or constraints guided your architecture?");
    } finally {
      setIsProcessingTurn(false);
    }
  };

  // Stop all local media tracks (camera, screen, mic, Cartesia TTS/STT)
  const stopAllMediaTracks = () => {
    try {
      if (candidateVideoRef.current && candidateVideoRef.current.srcObject) {
        const stream = candidateVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        candidateVideoRef.current.srcObject = null;
      }
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          try { track.stop(); } catch {}
        });
        screenVideoRef.current.srcObject = null;
      }
      if (typeof window !== "undefined") {
        const w = window as unknown as {
          __veyraLocalMicStream?: MediaStream;
          __veyraStopTTS?: () => void;
          __veyraDisconnectSTT?: () => void;
        };

        // Stop mic stream
        if (w.__veyraLocalMicStream && typeof w.__veyraLocalMicStream.getTracks === "function") {
          w.__veyraLocalMicStream.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
          w.__veyraLocalMicStream = undefined;
        }

        // Stop Cartesia TTS (audio playback)
        if (typeof w.__veyraStopTTS === "function") {
          try { w.__veyraStopTTS(); } catch {}
        }

        // Disconnect Cartesia STT WebSocket relay
        if (typeof w.__veyraDisconnectSTT === "function") {
          try { w.__veyraDisconnectSTT(); } catch {}
        }
      }
    } catch (e) {
      console.error("Error shutting down media tracks:", e);
    }
  };

  useEffect(() => {
    return () => {
      stopAllMediaTracks();
    };
  }, []);

  const handleInterruption = () => {
    setIsAiSpeaking(false);
    setSpeechTextToPlay(null);
    setBehaviorState("LISTENING");
    setEmotion("attentive");
    setGaze("CANDIDATE");
  };

  const handleConfirmEnd = async () => {
    setIsEnding(true);
    setIsSessionTerminated(true);
    stopAllMediaTracks();
    try {
      await fetch(`/api/interviews/${interviewId}/complete`, { method: "POST" });
    } catch (e) {
      console.error("Failed to complete interview:", e);
    }
    // Hard navigate to ensure browser cleanly tears down any remaining media device locks
    window.location.href = `/interviews/${interviewId}/report`;
  };

  if (isSessionTerminated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse shadow-2xl">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Interview Concluded</h2>
          <p className="text-xs text-slate-400">
            Microphone, camera, and display feeds have been cleanly released.
          </p>
          <p className="text-xs text-indigo-400 font-mono animate-pulse">
            Compiling evidence-based evaluation scorecard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Human Recruiter Takeover Bar if authorized */}
      {isEmployerReview && (
        <HumanTakeoverBar
          interviewId={interviewId}
          isHumanControl={isHumanInControl}
          onTakeoverToggled={setIsHumanInControl}
        />
      )}

      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-100 tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Veyra Live</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[280px]">{roleTitle}</span>
        </div>

        {/* Center Workspace Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: "avatar", label: "Face-to-Face", icon: User },
            { id: "coding", label: "Live Coding", icon: Code },
            { id: "whiteboard", label: "System Design", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeMode === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Timer & End Session */}
        <div className="flex items-center gap-4">
          <TimerDisplay initialMinutes={durationMinutes} onTimeExpired={() => {}} />

          <button
            onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isTranscriptOpen ? "bg-indigo-950 border-indigo-600 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Live Transcript Drawer"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowEndModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Workspace Canvas (Full width or split) */}
        <div className="flex-1 relative bg-slate-950 flex">
          {/* Mode 1: Face-to-Face Photorealistic Human Interviewer */}
          {activeMode === "avatar" && (
            <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-center items-center">
              <PhotorealisticAvatar
                gender={gender}
                interviewerName={currentInterviewerName}
                interviewerTitle={currentInterviewerTitle}
                state={behaviorState}
                emotion={emotion}
                gaze={gaze}
                gesture={gesture}
                audioAnalyser={audioAnalyser}
                isAiSpeaking={isAiSpeaking}
                onPersonaToggle={() => setGender(g => g === "female" ? "male" : "female")}
                onReplayAudio={() => triggerReplayRef.current?.()}
                className="w-full h-full max-w-5xl"
              />
            </div>
          )}

          {/* Mode 2: Live Coding Split-Screen */}
          {activeMode === "coding" && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden p-3 gap-3">
              {/* Left 4 Cols: Avatar Preview for Continuous Eye Contact */}
              <div className="lg:col-span-4 h-full flex flex-col gap-3">
                <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                  <PhotorealisticAvatar
                    gender={gender}
                    interviewerName={currentInterviewerName}
                    interviewerTitle={currentInterviewerTitle}
                    state={behaviorState}
                    emotion={emotion}
                    gaze="SCREEN"
                    gesture={gesture}
                    audioAnalyser={audioAnalyser}
                    isAiSpeaking={isAiSpeaking}
                    onReplayAudio={() => triggerReplayRef.current?.()}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Right 8 Cols: Monaco Code Editor */}
              <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <CodeEditorPane
                  onCodeExecuted={(_code: string, _lang: string, res: CodeRunResult) => {
                    handleCandidateAnswer(`I executed my code. Output: ${res.stdout || res.stderr}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* Mode 3: System Design Whiteboard */}
          {activeMode === "whiteboard" && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden p-3 gap-3">
              {/* Left 4 Cols: Avatar Preview */}
              <div className="lg:col-span-4 h-full flex flex-col gap-3">
                <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                  <PhotorealisticAvatar
                    gender={gender}
                    interviewerName={currentInterviewerName}
                    interviewerTitle={currentInterviewerTitle}
                    state={behaviorState}
                    emotion={emotion}
                    gaze="SCREEN"
                    gesture={gesture}
                    audioAnalyser={audioAnalyser}
                    isAiSpeaking={isAiSpeaking}
                    onReplayAudio={() => triggerReplayRef.current?.()}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Right 8 Cols: Whiteboard Canvas */}
              <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <SystemDesignCanvas
                  onArchitectureSubmitted={(_graph: WhiteboardGraph) => {
                    handleCandidateAnswer("I have updated and submitted my system architecture diagram.");
                  }}
                />
              </div>
            </div>
          )}

          {/* Mode 4: Screen Share Viewport */}
          {activeMode === "screen" && (
            <div className="flex-1 relative flex items-center justify-center p-4">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-2xl border border-indigo-500/50 shadow-2xl"
              />
            </div>
          )}

          {/* Candidate PIP Video (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-20 w-44 sm:w-52 aspect-video bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-2xl group transition-all hover:scale-105">
            <video
              ref={candidateVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraActive ? "hidden" : ""}`}
            />
            {!isCameraActive && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                <VideoOff className="w-5 h-5" />
                <span className="text-[10px]">Camera Disabled</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-medium">
              You
            </div>
          </div>
        </div>

        {/* Live Transcript Drawer */}
        <LiveTranscript
          isOpen={isTranscriptOpen}
          onClose={() => setIsTranscriptOpen(false)}
          transcript={transcript}
        />
      </main>

      {/* Bottom Communication & Media Control Bar */}
      <footer className="px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-4 z-20">
        {/* Left: AV Device Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMicActive(!isMicActive)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMicActive ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-rose-950 border-rose-800 text-rose-300"
            }`}
            title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isCameraActive ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-rose-950 border-rose-800 text-rose-300"
            }`}
            title={isCameraActive ? "Disable Camera" : "Enable Camera"}
          >
            {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-2.5 rounded-xl border transition-colors ${
              isScreenSharing ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}
            title="Share Screen"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Live Text / Speech Input */}
        <div className="flex-1 max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCandidateAnswer(textInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Speak naturally via microphone, or type your response here..."
              disabled={isProcessingTurn}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessingTurn}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Speaking Status Indicator & Quick Replay */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerReplayRef.current?.()}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
            title="Replay or test the interviewer's voice out loud"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Replay Voice</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
            <span>{isAiSpeaking ? "Interviewer Speaking" : isProcessingTurn ? "Analyzing Response..." : "Listening to Candidate"}</span>
          </div>
        </div>
      </footer>

      {/* Cartesia Realtime Audio & Speech Recognition HUD */}
      {hasStartedSession && (
        <div className="px-6 py-2 bg-slate-950/90 border-t border-slate-800/80 z-20">
          <VoiceController
            onCandidateSpeechEnd={handleCandidateAnswer}
            onInterruptionDetected={handleInterruption}
            isAiSpeaking={isAiSpeaking}
            onAiSpeechEnd={() => {
              setIsAiSpeaking(false);
              setSpeechTextToPlay(null);
              setBehaviorState("LISTENING");
              setEmotion("attentive");
              setGaze("CANDIDATE");
            }}
            onAnalyserReady={setAudioAnalyser}
            speechTextToPlay={speechTextToPlay}
            interviewerGender={gender}
            onTriggerReplayRef={triggerReplayRef}
          />
        </div>
      )}

      {/* Initial Autoplay Unlock Overlay (If session not started) */}
      {!hasStartedSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Your Interview Room is Ready</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet <strong className="text-slate-200">{currentInterviewerName}</strong> ({currentInterviewerTitle}). Your microphone and camera will be connected for real-time natural dialogue.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>HD Photorealistic Human Rig Active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Microphone Voice Activity Detection Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>• Role: <strong className="text-slate-200">{roleTitle}</strong></span>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Live Interview</span>
            </button>
          </div>
        </div>
      )}

      {/* End Interview Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">End this interview session?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ending will conclude the live dialogue and generate your comprehensive evidence-based scorecard and personalized remediation curriculum.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                disabled={isEnding}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Continue Interview
              </button>
              <button
                onClick={handleConfirmEnd}
                disabled={isEnding}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
              >
                {isEnding ? "Generating Report..." : "End Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
