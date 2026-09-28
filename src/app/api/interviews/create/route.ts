import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { JobDescriptionService } from "@/lib/services/jobDescriptionService";
import { ResumeService } from "@/lib/services/resumeService";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      role = "Senior Full Stack Engineer",
      interviewType = "TECHNICAL",
      durationMinutes = 30,
      difficulty = "ADAPTIVE",
      interviewerStyle = "PROFESSIONAL",
      interviewerName,
      interviewerTitle,
      gender,
      jobDescriptionId,
      resumeId,
      projectId,
    } = await req.json();

    const resolvedGender = gender === "male" ? "male" : "female";
    const resolvedName = interviewerName || (resolvedGender === "male" ? "Marcus Vance" : "Elena Rostova");
    const resolvedTitle =
      interviewerTitle ||
      (resolvedGender === "male"
        ? "Senior Engineering Director"
        : "VP of Engineering & Principal Technical Architect");

    // 1. Fetch real Job Description if provided
    let jdText = `Role: ${role}\nTarget seniority: Senior\nFocus: Architecture, System Design, Scalability, and Code Execution`;
    if (jobDescriptionId) {
      const realJd = await db.jobDescription.findUnique({ where: { id: jobDescriptionId } });
      if (realJd?.rawText) {
        jdText = realJd.rawText;
      }
    }

    // 2. Generate dynamic blueprint
    const parsedJD = JobDescriptionService.parseJobDescription(jdText, role);
    const blueprint = JobDescriptionService.generateBlueprint(
      parsedJD,
      durationMinutes,
      interviewerStyle,
      difficulty
    );

    (blueprint as any).interviewerGender = resolvedGender;
    (blueprint as any).interviewerName = resolvedName;
    (blueprint as any).interviewerTitle = resolvedTitle;

    // 3. Create Interview record
    const interview = await db.interview.create({
      data: {
        userId: session.userId,
        orgId: session.orgId || null,
        title: `${role} Interview with ${resolvedName}`,
        role,
        interviewType,
        durationMinutes,
        difficulty,
        interviewerStyle,
        status: "SCHEDULED",
        blueprint: JSON.stringify(blueprint),
        jobDescriptionId: jobDescriptionId || null,
        resumeId: resumeId || null,
        projectId: projectId || null,
      },
    });

    // 4. Create Interview Stages
    let firstStageId: string | null = null;
    for (let i = 0; i < blueprint.stages.length; i++) {
      const stage = blueprint.stages[i];
      const createdStage = await db.interviewStage.create({
        data: {
          interviewId: interview.id,
          name: stage.name,
          order: i + 1,
          targetMinutes: stage.targetMinutes,
          status: i === 0 ? "ACTIVE" : "PENDING",
        },
      });
      if (i === 0) firstStageId = createdStage.id;
    }

    // 5. Seed initial question in database
    await db.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        stageId: firstStageId,
        objective: "initial_introduction_and_background",
        questionText: blueprint.initialQuestion,
        difficulty: "EASY",
        followUpReason: "Standard initial question to open dialogue and welcome candidate",
        expectedEvidence: JSON.stringify(["Technical introduction", "Background overview"]),
        order: 1,
      },
    });

    // 6. Ingest resume claims into CandidateClaim table if resumeId attached
    if (resumeId) {
      const resume = await db.resume.findUnique({ where: { id: resumeId } });
      if (resume) {
        let parsedResumeData: any = {};
        try {
          parsedResumeData = JSON.parse(resume.parsedData || "{}");
        } catch {}

        const claimsToSeed = parsedResumeData.claims || [];
        for (const claimText of claimsToSeed.slice(0, 10)) {
          await db.candidateClaim.create({
            data: {
              userId: session.userId,
              interviewId: interview.id,
              claimText,
              domain: "RESUME_ACHIEVEMENT",
              source: "RESUME",
              status: "UNTESTED",
              evidenceNotes: "Extracted from candidate resume",
            },
          });
        }
      }
    }

    // 7. Log interview scheduled event
    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "INTERVIEW_SCHEDULED",
        payload: JSON.stringify({
          role,
          interviewerName: resolvedName,
          gender: resolvedGender,
          durationMinutes,
          stagesCount: blueprint.stages.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      blueprint,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create interview" }, { status: 500 });
  }
}
