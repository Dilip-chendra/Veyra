"use client";

import React, { useState } from "react";
import { Download, Search, X, MessageSquare } from "lucide-react";

export interface TranscriptItem {
  id: string;
  role: "interviewer" | "candidate" | "system";
  speaker: string;
  text: string;
  timestampSeconds: number;
}

interface LiveTranscriptProps {
  transcript: TranscriptItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (!isOpen) return null;

  const filtered = transcript.filter((t) =>
    t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    const textData = transcript
      .map(
        (t) =>
          `[${Math.floor(t.timestampSeconds / 60)}:${String(t.timestampSeconds % 60).padStart(2, "0")}] ${t.speaker} (${t.role}):\n${t.text}\n`
      )
      .join("\n");
    const blob = new Blob([textData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview_transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Live Transcript</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Download Transcript"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/30">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 && (
          <div className="text-center text-xs text-slate-500 py-8">
            No spoken transcript matches found.
          </div>
        )}

        {filtered.map((item) => {
          const isInterviewer = item.role === "interviewer";
          const minutes = Math.floor(item.timestampSeconds / 60);
          const seconds = String(item.timestampSeconds % 60).padStart(2, "0");

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl text-xs space-y-1 ${
                isInterviewer
                  ? "bg-slate-800/80 border border-slate-700/60 text-slate-200"
                  : "bg-indigo-950/60 border border-indigo-800/50 text-indigo-100"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className={`font-semibold ${isInterviewer ? "text-slate-300" : "text-indigo-400"}`}>
                  {item.speaker}
                </span>
                <span className="font-mono">{minutes}:{seconds}</span>
              </div>
              <p className="leading-relaxed">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
