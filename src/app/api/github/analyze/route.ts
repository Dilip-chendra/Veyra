import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { GitHubService } from "@/lib/services/githubService";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { repoUrl, token } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const analysis = await GitHubService.analyzeRepository(repoUrl, token);

    // Save project
    const project = await db.project.create({
      data: {
        userId: session.userId,
        name: `${analysis.owner}/${analysis.repoName}`,
        description: analysis.description,
        repoUrl,
        architectureSummary: analysis.architectureSummary,
        techStack: JSON.stringify(analysis.detectedFrameworks),
        claims: JSON.stringify(analysis.defenseQuestions),
      },
    });

    // Save repository details
    await db.repository.create({
      data: {
        userId: session.userId,
        projectId: project.id,
        owner: analysis.owner,
        repoName: analysis.repoName,
        languages: JSON.stringify(analysis.languages),
        structureSummary: `${analysis.tree.length} files detected`,
        readmeContent: analysis.readme,
        dependencySummary: JSON.stringify(analysis.dependencySummary),
      },
    });

    // Add claims to candidate knowledge model
    for (const defenseQ of analysis.defenseQuestions.slice(0, 3)) {
      await db.candidateClaim.create({
        data: {
          userId: session.userId,
          claimText: `Author of ${analysis.repoName} (${analysis.primaryLanguage}) implementing ${analysis.detectedFrameworks.join(", ") || "custom architecture"}`,
          domain: "PROJECT_ARCHITECTURE",
          source: "GITHUB",
          status: "UNTESTED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      analysis,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze GitHub repository" }, { status: 400 });
  }
}
