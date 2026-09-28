"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowLeft,
  Volume2,
  Sparkles,
} from "lucide-react";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";

export default function InterviewReplayPage() {
  const params = useParams();
  const id = params?.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [currentPlayheadSeconds, setCurrentPlayheadSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/interviews/${id}/report-data`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setInterview(data.interview);
          setReport(data.report);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const questions = typeof report?.questionBreakdown === "string" ? JSON.parse(report.questionBreakdown) : report?.questionBreakdown || [];

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlayheadSeconds((prev) => {
          const next = prev + 1;
          // Determine active question
          const idx = questions.findIndex((q: any, i: number) => {
            const start = i * 45;
            const end = (i + 1) * 45;
            return next >= start && next < end;
          });
          if (idx !== -1) setActiveItemIndex(idx);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, questions]);

  const jumpToQuestion = (index: number) => {
    setActiveItemIndex(index);
    setCurrentPlayheadSeconds(index * 45);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4 animate-spin" /> Loading synchronized replay timeline...
        </div>
      </div>
    );
  }

  const currentQ = questions[activeItemIndex] || questions[0];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/interviews/${id}/report`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Scorecard</span>
          </Link>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Synchronized Session Replay: {interview?.role}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {String(Math.floor(currentPlayheadSeconds / 60)).padStart(2, "0")}:
            {String(currentPlayheadSeconds % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Replay Video Canvas */}
        <div className="space-y-4">
          <div className="h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
            <AvatarCanvas
              gender={interview?.gender || "female"}
              state={isPlaying ? "LISTENING" : "INTRODUCING"}
              emotion="attentive"
              gaze="CANDIDATE"
              gesture="small_nod"
              interviewerName={interview?.interviewerName || (interview?.gender === "male" ? "Marcus Vance" : "Elena Rostova")}
              interviewerTitle={interview?.interviewerTitle || (interview?.gender === "male" ? "Senior Engineering Director" : "Principal Technical Architect")}
            />
          </div>

          {/* Player Controls Bar */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPlayheadSeconds(0);
                  setActiveItemIndex(0);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Rewind to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Playing Segment: <strong className="text-slate-200">Question {activeItemIndex + 1} of {questions.length}</strong>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Interactive Transcript Timeline */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col h-[430px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Synchronized Question Timeline</span>
            <span className="text-[10px] text-slate-500">Click any marker to jump</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {questions.map((q: any, idx: number) => {
              const isActive = activeItemIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => jumpToQuestion(idx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/40 text-indigo-100"
                      : "bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px]">
                    <span className="font-mono font-bold uppercase text-indigo-400">Marker #{idx + 1}</span>
                    <span className="font-mono text-slate-500">{idx * 45}s</span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1">&ldquo;{q.question}&rdquo;</div>
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded">
                    Candidate: {q.answerSummary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
