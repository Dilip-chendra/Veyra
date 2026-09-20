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
    const { rawText, title, company, durationMinutes = 30, style = "PROFESSIONAL", difficulty = "ADAPTIVE" } = await req.json();

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const parsed = JobDescriptionService.parseJobDescription(rawText, title, company);
    const blueprint = JobDescriptionService.generateBlueprint(parsed, durationMinutes, style as any, difficulty as any);

    const jd = await db.jobDescription.create({
      data: {
        userId: session.userId,
        orgId: session.orgId || null,
        title: parsed.title,
        company: parsed.company,
        rawText,
        role: parsed.role,
        seniority: parsed.seniority,
        requiredSkills: JSON.stringify(parsed.requiredSkills),
        preferredSkills: JSON.stringify(parsed.preferredSkills),
        responsibilities: JSON.stringify(parsed.responsibilities),
        technicalCompetencies: JSON.stringify(parsed.technicalCompetencies),
        behavioralCompetencies: JSON.stringify(parsed.behavioralCompetencies),
      },
    });

    return NextResponse.json({
      success: true,
      jobDescriptionId: jd.id,
      parsed,
      blueprint,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process job description" }, { status: 500 });
  }
}
