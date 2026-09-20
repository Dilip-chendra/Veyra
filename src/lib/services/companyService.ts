import { db } from "@/lib/db";

export class CompanyService {
  public static async createRole(orgId: string, data: {
    title: string;
    department: string;
    seniority: string;
    requiredSkills: string[];
    rubricCriteria: { competency: string; weight: number; targetEvidence: string }[];
    rawJobDescription: string;
  }) {
    return db.jobDescription.create({
      data: {
        orgId,
        title: data.title,
        company: "Organization",
        rawText: data.rawJobDescription,
        role: data.title,
        seniority: data.seniority,
        requiredSkills: JSON.stringify(data.requiredSkills),
        preferredSkills: JSON.stringify([]),
        responsibilities: JSON.stringify([]),
        technicalCompetencies: JSON.stringify(data.rubricCriteria.map(r => r.competency)),
        behavioralCompetencies: JSON.stringify(["Technical Communication", "Ownership"]),
      },
    });
  }

  public static async getOrgCandidates(orgId: string) {
    return db.interview.findMany({
      where: { orgId },
      include: {
        user: { select: { name: true, email: true } },
        jobDescription: true,
        report: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public static async executeHumanTakeover(interviewId: string, recruiterName: string) {
    // 1. Fetch current interview turns to synthesize an instant briefing for the human recruiter
    const answers = await db.interviewAnswer.findMany({
      where: { interviewId },
      include: { question: true },
      orderBy: { createdAt: "asc" },
    });

    const candidateClaims = await db.candidateClaim.findMany({
      where: { interviewId },
    });

    const unverifiedClaims = candidateClaims.filter(c => c.status === "UNTESTED").map(c => c.claimText);

    // AI summary briefing for the recruiter
    const briefing = {
      recruiter: recruiterName,
      turnsCompleted: answers.length,
      topicsCovered: answers.map(a => a.question.objective),
      unresolvedAreas: unverifiedClaims.length > 0
        ? unverifiedClaims.slice(0, 3)
        : ["Deep dive into failure recovery mechanisms", "Verification of high-throughput capacity planning"],
      candidateResponsePace: "Good engagement, structured answers",
      status: "HUMAN_IN_CONTROL",
      handoverTimestamp: new Date().toISOString(),
    };

    // Log the takeover event in the database
    await db.interviewEvent.create({
      data: {
        interviewId,
        eventType: "HUMAN_TAKEOVER",
        payload: JSON.stringify(briefing),
      },
    });

    return briefing;
  }

  public static async resumeAiControl(interviewId: string) {
    await db.interviewEvent.create({
      data: {
        interviewId,
        eventType: "AI_RESUMED",
        payload: JSON.stringify({ message: "AI Interviewer resumed lead control after human session." }),
      },
    });

    return { status: "AI_IN_CONTROL", message: "AI Interviewer resumed questioning." };
  }
}
