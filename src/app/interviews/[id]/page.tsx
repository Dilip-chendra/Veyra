import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  Video,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
  ArrowRight,
  Mic,
  Camera,
  Volume2,
} from "lucide-react";

export default async function InterviewBlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const interview = await db.interview.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      jobDescription: true,
      resume: true,
      project: true,
    },
  });

  if (!interview) {
    notFound();
  }

  const blueprint = JSON.parse(interview.blueprint || "{}");

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stage Plan & Preparation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{interview.role} Blueprint</h1>
        <p className="text-xs text-slate-400">
          Duration: <strong className="text-slate-200">{interview.durationMinutes} Minutes</strong> • Mode: <strong className="text-slate-200">{interview.interviewType}</strong> • Persona: <strong className="text-slate-200">{interview.interviewerStyle}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stages Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Interview Stages & Objectives</span>
            </h2>
            <div className="space-y-3">
              {interview.stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{stage.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{stage.targetMinutes} min</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {idx === 0
                        ? "Establish candidate background and technical context."
                        : idx === 1
                        ? "Deep probe into candidate claims, architecture choices, and metrics."
                        : idx === 2
                        ? "Core technical competency, concurrency, and failure recovery."
                        : idx === 3
                        ? "System architecture scaling and boundary condition handling."
                        : "STAR ownership examples and candidate inquiries."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Hardware Checklist & Start Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Flight Checklist</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Microphone enabled for turn-taking</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Webcam enabled (optional PIP preview)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Speakers / headphones active</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/interviews/${interview.id}/live`}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-xs hover:scale-105"
              >
                <Video className="w-4 h-4" />
                <span>Enter Live Interview Room</span>
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-800/30 text-xs text-indigo-300 space-y-1">
            <div className="font-semibold text-indigo-200">Interviewer Behavior Policy</div>
            <p className="text-[11px] leading-relaxed text-indigo-300/80">
              The AI interviewer will maintain eye contact, nod while you speak, wait for you to conclude your thought, and occasionally interrupt if an answer becomes overly lengthy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
