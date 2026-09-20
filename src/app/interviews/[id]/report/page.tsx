"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Play,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquare,
  Sparkles,
  BookOpen,
} from "lucide-react";
import jsPDF from "jspdf";

export default function InterviewReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/interviews/${id}/report-data`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setReport(data.report);
          setInterview(data.interview);
          setTrainingPlan(data.trainingPlan);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportPDF = () => {
    if (!report || !interview) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Veyra Evidence-Based Scorecard: ${interview.role}`, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()} | Duration: ${interview.durationMinutes} minutes`, 14, 28);
    doc.text(`Evaluation Methodology: Multi-dimensional transcript evidence extraction`, 14, 34);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Executive Summary:", 14, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitSummary = doc.splitTextToSize(report.overallSummary, 180);
    doc.text(splitSummary, 14, 52);

    let y = 75;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Technical Evidence Demonstrations (Verbatim Quotes):", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const evidenceList = typeof report.technicalEvidence === "string" ? JSON.parse(report.technicalEvidence) : report.technicalEvidence || [];
    evidenceList.slice(0, 4).forEach((item: any) => {
      doc.text(`• ${item.competency}: ${item.evidenceQuote}`, 14, y);
      y += 8;
    });

    doc.save(`Veyra_Report_${interview.role.replace(/\s+/g, "_")}.pdf`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ interview, report, trainingPlan }, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `Veyra_Evidence_${id}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-sm text-indigo-400 font-semibold">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Synthesizing multi-dimensional transcript evidence...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 max-w-4xl mx-auto p-12 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Scorecard Not Available</h2>
        <p className="text-xs text-slate-400">
          This session has not been concluded yet. Return to the live room to complete your interview.
        </p>
        <Link href={`/interviews/${id}/live`} className="inline-block px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white">
          Return to Room
        </Link>
      </div>
    );
  }

  const technicalEvidence = typeof report.technicalEvidence === "string" ? JSON.parse(report.technicalEvidence) : report.technicalEvidence || [];
  const gaps = typeof report.gaps === "string" ? JSON.parse(report.gaps) : report.gaps || [];
  const questions = typeof report.questionBreakdown === "string" ? JSON.parse(report.questionBreakdown) : report.questionBreakdown || [];
  const recommendations = typeof report.recommendations === "string" ? JSON.parse(report.recommendations) : report.recommendations || [];
  const comm = typeof report.communicationObservations === "string" ? JSON.parse(report.communicationObservations) : report.communicationObservations || {};
  const prob = typeof report.problemSolvingObservations === "string" ? JSON.parse(report.problemSolvingObservations) : report.problemSolvingObservations || {};

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/80 text-[11px] font-mono text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evidence Verification Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {interview?.role} Scorecard
          </h1>
          <p className="text-xs text-slate-400">
            Session ID: <strong className="text-slate-200">{id}</strong> • Mode: <strong className="text-slate-200">{interview?.interviewType}</strong> • Zero Unexplained Scores Policy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/interviews/${id}/replay`}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Replay</span>
          </Link>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Overall Assessment Summary */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Summary Findings</h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          {report.overallSummary}
        </p>
        <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
          <strong>Methodology:</strong> {report.methodology}
        </div>
      </div>

      {/* Technical Evidence vs Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demonstrated Evidence */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Technical Evidence</span>
          </h3>
          <div className="space-y-3">
            {technicalEvidence.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-bold text-slate-200">{item.competency}</div>
                <div className="text-[11px] text-emerald-300/90 font-mono italic bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40">
                  {item.evidenceQuote}
                </div>
                <div className="text-[10px] text-slate-500">{item.context}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Gaps */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Competency Gaps</span>
          </h3>
          <div className="space-y-3">
            {gaps.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-bold text-slate-200">{item.area}</div>
                <p className="text-[11px] text-slate-400">{item.reason}</p>
                <div className="text-[10px] text-amber-400/90 font-medium">Impact: {item.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* &ldquo;Why Did I Struggle?&rdquo; Actionable Diagnostics (Section 40) */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-800/40 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>Why Did I Struggle? Pattern Analysis</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {prob.tradeoffReasoning} {comm.clarity}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-indigo-900/40 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-indigo-400 font-mono">0{idx + 1}.</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Question-by-Question Breakdown & Verbatim Citations</span>
        </h3>
        <div className="space-y-4">
          {questions.map((q: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase">Question {idx + 1} • {q.stage}</span>
                <span className="text-slate-500 font-mono text-[10px]">{q.turnPacingSeconds}s response</span>
              </div>
              <div className="font-semibold text-slate-200">&ldquo;{q.question}&rdquo;</div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400 font-semibold">Answer Summary:</div>
                <div className="text-slate-300">{q.answerSummary}</div>
                <div className="text-indigo-300 font-mono text-[10px] pt-1">Citation: {q.verbatimQuote}</div>
              </div>
              <div className="flex flex-wrap gap-4 text-[11px] pt-1 border-t border-slate-900 text-slate-400">
                <span>Strength: <strong className="text-emerald-400">{q.demonstratedCompetency}</strong></span>
                <span>Recommendation: <strong className="text-slate-300">{q.recommendedPractice}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Training Plan (Section 41) */}
      {trainingPlan && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Personalized Remediation Curriculum</span>
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">
              5-Part Gap Remediation
            </span>
          </div>
          <p className="text-xs text-slate-400">{trainingPlan.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {(trainingPlan.exercises || []).map((ex: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] font-mono font-bold text-purple-400 uppercase">{ex.exerciseType.replace("_", " ")}</div>
                <div className="font-bold text-slate-200">{ex.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-3">{ex.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
