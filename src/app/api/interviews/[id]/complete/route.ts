import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { EvaluationService } from "@/lib/services/evaluationService";
import { TrainingEngine } from "@/lib/services/trainingEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: interviewId } = await params;

  try {
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: { include: { answers: true }, orderBy: { order: "asc" } },
        claims: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Tenant / User Isolation: Ensure user owns this interview or is authorized admin/employer
    if (interview.userId !== session.userId && session.role !== "ADMIN" && session.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden: You cannot complete another candidate's interview session" }, { status: 403 });
    }

    // Build history
    const history: {
      role: "interviewer" | "candidate";
      speaker: string;
      text: string;
      timestampSeconds: number;
    }[] = [];

    for (const q of interview.questions) {
      history.push({
        role: "interviewer",
        speaker: "Interviewer",
        text: q.questionText,
        timestampSeconds: 0,
      });
      for (const a of q.answers) {
        history.push({
          role: "candidate",
          speaker: "Candidate",
          text: a.transcriptText,
          timestampSeconds: a.durationSeconds,
        });
      }
    }

    // Generate evidence-backed report
    const reportData = EvaluationService.generateReport(
      interview.role,
      history,
      interview.claims.map(c => ({
        claimText: c.claimText,
        status: c.status,
        evidenceNotes: c.evidenceNotes,
      }))
    );

    // Save InterviewReport
    const report = await db.interviewReport.upsert({
      where: { interviewId: interview.id },
      update: {
        overallSummary: reportData.overallSummary,
        technicalEvidence: JSON.stringify(reportData.technicalEvidence),
        gaps: JSON.stringify(reportData.gaps),
        communicationObservations: JSON.stringify(reportData.communication),
        problemSolvingObservations: JSON.stringify(reportData.problemSolving),
        projectDepthObservations: JSON.stringify(reportData.projectDepth),
        behavioralObservations: JSON.stringify(reportData.behavioral),
        questionBreakdown: JSON.stringify(reportData.questionBreakdown),
        recommendations: JSON.stringify(reportData.recommendations),
        methodology: reportData.methodology,
        limitations: reportData.limitations,
      },
      create: {
        interviewId: interview.id,
        overallSummary: reportData.overallSummary,
        technicalEvidence: JSON.stringify(reportData.technicalEvidence),
        gaps: JSON.stringify(reportData.gaps),
        communicationObservations: JSON.stringify(reportData.communication),
        problemSolvingObservations: JSON.stringify(reportData.problemSolving),
        projectDepthObservations: JSON.stringify(reportData.projectDepth),
        behavioralObservations: JSON.stringify(reportData.behavioral),
        questionBreakdown: JSON.stringify(reportData.questionBreakdown),
        recommendations: JSON.stringify(reportData.recommendations),
        methodology: reportData.methodology,
        limitations: reportData.limitations,
      },
    });

    // Generate and save Training Plan
    const trainingData = TrainingEngine.generateTrainingPlan(interview.role, reportData.gaps);
    const plan = await db.trainingPlan.create({
      data: {
        userId: session.userId,
        interviewId: interview.id,
        title: trainingData.title,
        summary: trainingData.summary,
        targetGaps: JSON.stringify(trainingData.targetGaps),
        status: "ACTIVE",
      },
    });

    for (const ex of trainingData.exercises) {
      await db.trainingExercise.create({
        data: {
          trainingPlanId: plan.id,
          title: ex.title,
          exerciseType: ex.exerciseType,
          content: ex.content,
        },
      });
    }

    // Update interview status to COMPLETED
    await db.interview.update({
      where: { id: interview.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Log events
    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "INTERVIEW_COMPLETED",
        payload: JSON.stringify({ completedAt: new Date().toISOString() }),
      },
    });

    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "REPORT_GENERATED",
        payload: JSON.stringify({ reportId: report.id, planId: plan.id }),
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      report: reportData,
      trainingPlanId: plan.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to complete interview" }, { status: 500 });
  }
}
