import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.userId },
  });

  const claims = await db.candidateClaim.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const skillAssessments = await db.skillAssessment.findMany({
    where: { userId: session.userId },
    include: { skill: true },
  });

  const resumes = await db.resume.findMany({
    where: { userId: session.userId },
    select: { id: true, filename: true, createdAt: true },
  });

  const projects = await db.project.findMany({
    where: { userId: session.userId },
  });

  return NextResponse.json({
    profile: profile || {
      targetRole: "Software Engineer",
      experienceLevel: "Mid-Level",
      preferredLanguage: "en-US",
      technicalDomains: "[]",
      interviewerStyle: "PROFESSIONAL",
      targetCompanies: "",
      interviewGoals: "",
      confidenceLevel: "Moderate",
    },
    claims,
    skillAssessments,
    resumes,
    projects,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updatedProfile = await db.candidateProfile.upsert({
    where: { userId: session.userId },
    update: {
      targetRole: body.targetRole,
      experienceLevel: body.experienceLevel,
      preferredLanguage: body.preferredLanguage || "en-US",
      technicalDomains: JSON.stringify(body.technicalDomains || []),
      interviewerStyle: body.interviewerStyle || "PROFESSIONAL",
      targetCompanies: body.targetCompanies || "",
      interviewGoals: body.interviewGoals || "",
      confidenceLevel: body.confidenceLevel || "Moderate",
      githubHandle: body.githubHandle || "",
      linkedinUrl: body.linkedinUrl || "",
    },
    create: {
      userId: session.userId,
      targetRole: body.targetRole || "Software Engineer",
      experienceLevel: body.experienceLevel || "Mid-Level",
      preferredLanguage: body.preferredLanguage || "en-US",
      technicalDomains: JSON.stringify(body.technicalDomains || []),
      interviewerStyle: body.interviewerStyle || "PROFESSIONAL",
      targetCompanies: body.targetCompanies || "",
      interviewGoals: body.interviewGoals || "",
      confidenceLevel: body.confidenceLevel || "Moderate",
      githubHandle: body.githubHandle || "",
      linkedinUrl: body.linkedinUrl || "",
    },
  });

  return NextResponse.json({ success: true, profile: updatedProfile });
}
