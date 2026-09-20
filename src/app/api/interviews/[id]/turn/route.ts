import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { InterviewBrain } from "@/lib/services/interviewBrain";
import { PanelService } from "@/lib/services/panelService";
import { InterviewTurnResponse } from "@/types";

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
    const { candidateAnswer, elapsedSeconds = 0 } = await req.json();

    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        stages: { orderBy: { order: "asc" } },
        questions: { include: { answers: true }, orderBy: { order: "asc" } },
        claims: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Build conversation history
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

    let turnResponse: InterviewTurnResponse;

    if (interview.interviewType === "PANEL") {
      const nextMember = PanelService.selectNextInterviewer(interview.questions.length, candidateAnswer);
      turnResponse = PanelService.generatePanelTurn(nextMember, interview.questions.length, candidateAnswer, interview.role);
    } else {
      turnResponse = InterviewBrain.processCandidateTurn(candidateAnswer, {
        interviewId: interview.id,
        role: interview.role,
        interviewType: interview.interviewType,
        durationMinutes: interview.durationMinutes,
        elapsedSeconds,
        currentStageIndex: interview.currentStageIndex,
        stages: interview.stages.map(s => ({
          name: s.name,
          targetMinutes: s.targetMinutes,
          objectives: [],
        })),
        candidateClaims: interview.claims.map(c => ({
          claimText: c.claimText,
          domain: c.domain,
          source: c.source as any,
          status: c.status as any,
        })),
        history,
        style: interview.interviewerStyle as any,
        difficulty: interview.difficulty as any,
      });
    }

    // 1. Persist the candidate's last answer to the most recent question
    const lastQuestion = interview.questions[interview.questions.length - 1];
    if (lastQuestion) {
      await db.interviewAnswer.create({
        data: {
          interviewId: interview.id,
          questionId: lastQuestion.id,
          transcriptText: candidateAnswer,
          durationSeconds: elapsedSeconds,
          analysis: JSON.stringify(turnResponse.turnEvaluation || {}),
        },
      });
    }

    // 2. Persist the newly generated question
    const currentStage = interview.stages[interview.currentStageIndex] || interview.stages[0];
    const newQuestion = await db.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        stageId: currentStage?.id || null,
        objective: turnResponse.objective,
        questionText: turnResponse.question,
        difficulty: turnResponse.difficulty,
        followUpReason: turnResponse.followUpReason,
        expectedEvidence: JSON.stringify(turnResponse.expectedEvidence),
        order: interview.questions.length + 1,
      },
    });

    // 3. Log the interview events
    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "CANDIDATE_FINISHED_SPEAKING",
        payload: JSON.stringify({
          answerLength: candidateAnswer.split(/\s+/).length,
          timestamp: elapsedSeconds,
        }),
      },
    });

    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "QUESTION_GENERATED",
        payload: JSON.stringify({
          questionId: newQuestion.id,
          objective: turnResponse.objective,
          behavior: turnResponse.behavior,
        }),
      },
    });

    // 4. Update status to IN_PROGRESS if SCHEDULED
    if (interview.status === "SCHEDULED") {
      await db.interview.update({
        where: { id: interview.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    return NextResponse.json(turnResponse);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process interview turn" }, { status: 500 });
  }
}
