import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { JobDescriptionService } from "@/lib/services/jobDescriptionService";

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
    const resolvedTitle = interviewerTitle || (resolvedGender === "male" ? "Senior Engineering Director" : "VP of Engineering & Principal Technical Architect");

    // Generate dynamic blueprint
    const syntheticJD = JobDescriptionService.parseJobDescription(
      `Role: ${role}\nTarget seniority: Senior\nFocus: Architecture, System Design, Scalability, and Code Execution`,
      role
    );
    const blueprint = JobDescriptionService.generateBlueprint(
      syntheticJD,
      durationMinutes,
      interviewerStyle,
      difficulty
    );

    (blueprint as any).interviewerGender = resolvedGender;
    (blueprint as any).interviewerName = resolvedName;
    (blueprint as any).interviewerTitle = resolvedTitle;

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

    // Create Interview Stages
    for (let i = 0; i < blueprint.stages.length; i++) {
      const stage = blueprint.stages[i];
      await db.interviewStage.create({
        data: {
          interviewId: interview.id,
          name: stage.name,
          order: i + 1,
          targetMinutes: stage.targetMinutes,
          status: i === 0 ? "ACTIVE" : "PENDING",
        },
      });
    }

    // Log interview started event
    await db.interviewEvent.create({
      data: {
        interviewId: interview.id,
        eventType: "INTERVIEW_SCHEDULED",
        payload: JSON.stringify({ role, durationMinutes, stagesCount: blueprint.stages.length }),
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
