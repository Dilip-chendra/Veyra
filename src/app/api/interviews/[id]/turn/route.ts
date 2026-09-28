import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { InterviewBrain } from "@/lib/services/interviewBrain";
import { PanelService } from "@/lib/services/panelService";
import { ProjectDefenseService } from "@/lib/services/projectDefenseService";
import { InterviewMemory } from "@/lib/services/interviewMemory";
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
    const {
      candidateAnswer,
      elapsedSeconds = 0,
      codeState,
      whiteboardState,
    } = await req.json();

    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        stages: { orderBy: { order: "asc" } },
        questions: { include: { answers: true }, orderBy: { order: "asc" } },
        claims: true,
        resume: true,
        project: { include: { repositories: true } },
        jobDescription: true,
        events: {
          where: { eventType: "MEMORY_UPDATED" },
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Tenant / User Isolation: Ensure user owns this interview or is authorized admin/employer
    if (interview.userId !== session.userId && session.role !== "ADMIN" && session.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another candidate's interview session" },
        { status: 403 }
      );
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

    // Parse Blueprint for interviewer persona
    let interviewerName = "Marcus Vance";
    try {
      const parsedBp = JSON.parse(interview.blueprint || "{}");
      if (parsedBp.interviewerName) {
        interviewerName = parsedBp.interviewerName;
      }
    } catch {}

    // Parse Project Defense items if project / repository is attached
    let projectDefenseItems: any[] = [];
    if (interview.project) {
      let techStack: string[] = [];
      try {
        techStack = JSON.parse(interview.project.techStack || "[]");
      } catch {}

      const repo = interview.project.repositories?.[0];
      const repoAnalysis = repo
        ? {
            owner: repo.owner,
            repoName: repo.repoName,
            description: interview.project.description,
            stars: 0,
            languages: JSON.parse(repo.languages || "{}"),
            primaryLanguage: Object.keys(JSON.parse(repo.languages || "{}"))[0] || "TypeScript",
            tree: [],
            readme: repo.readmeContent || "",
            architectureSummary: interview.project.architectureSummary || repo.structureSummary,
            dependencySummary: JSON.parse(repo.dependencySummary || "{}"),
            detectedFrameworks: techStack,
            testSuitesFound: [],
            defenseQuestions: [],
          }
        : null;

      projectDefenseItems = ProjectDefenseService.generateDefensePlan(
        interview.project.name,
        repoAnalysis,
        techStack
      );
    }

    // Load Memory State
    const lastMemoryPayload = interview.events?.[0]?.payload;
    const memoryState = InterviewMemory.parseMemory(lastMemoryPayload);

    let turnResponse: InterviewTurnResponse;

    if (interview.interviewType === "PANEL") {
      const nextMember = PanelService.selectNextInterviewer(interview.questions.length, candidateAnswer);
      turnResponse = PanelService.generatePanelTurn(
        nextMember,
        interview.questions.length,
        candidateAnswer,
        interview.role
      );
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
        interviewerName,
        memoryState,
        projectDefenseItems,
        codeState,
        whiteboardState,
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

    // 2. Persist any newly detected candidate claims
    if (turnResponse.turnEvaluation?.claimsDetected && turnResponse.turnEvaluation.claimsDetected.length > 0) {
      for (const claimText of turnResponse.turnEvaluation.claimsDetected) {
        if (!interview.claims.some(c => c.claimText.toLowerCase() === claimText.toLowerCase())) {
          await db.candidateClaim.create({
            data: {
              userId: session.userId,
              interviewId: interview.id,
              claimText,
              domain: "INTERVIEW_DEMONSTRATION",
              source: "INTERVIEW_ANSWER",
              status: "UNTESTED",
              evidenceNotes: `Stated live at ${elapsedSeconds} seconds`,
            },
          });

          await db.interviewEvent.create({
            data: {
              interviewId: interview.id,
              eventType: "CLAIM_DETECTED",
              payload: JSON.stringify({ claimText, timestamp: elapsedSeconds }),
            },
          });
        }
      }
    }

    // 3. Persist the newly generated question
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

    // 4. Log the interview events (Event-Sourced Memory)
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
        eventType: "ANSWER_ANALYZED",
        payload: JSON.stringify({
          evaluation: turnResponse.turnEvaluation || {},
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
          speaker: turnResponse.speaker,
        }),
      },
    });

    // Update memory event
    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "MEMORY_UPDATED",
        payload: JSON.stringify(memoryState),
      },
    });

    // 5. Update status to IN_PROGRESS if SCHEDULED
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
