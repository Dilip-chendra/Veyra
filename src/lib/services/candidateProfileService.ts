import type {
  CandidateClaimData,
  ParsedResume,
  ParsedJobDescription,
  GitHubAnalysis,
} from "../../types/index.ts";

export type CompetencyStatus = "Demonstrated" | "Partially demonstrated" | "Unverified" | "Needs practice";

export interface CandidateGapItem {
  requirement: string;
  category: "TECHNICAL" | "ARCHITECTURE" | "PROJECT" | "BEHAVIORAL";
  candidateEvidence: string;
  status: CompetencyStatus;
  probedInSession: boolean;
  notes: string;
}

export interface CandidateUnifiedProfile {
  name: string;
  targetRole: string;
  experienceLevel: string;
  skills: { name: string; status: CompetencyStatus; evidence: string[] }[];
  experienceSummary: string[];
  projectsSummary: { name: string; description: string; tech: string[]; repoUrl?: string }[];
  claims: CandidateClaimData[];
  demonstratedKnowledge: string[];
  unverifiedAreas: string[];
  weakAreas: string[];
}

export class CandidateProfileService {
  /**
   * Builds an integrated candidate intelligence profile from parsed resume, github, and claims.
   */
  public static buildUnifiedProfile(
    name: string,
    targetRole: string,
    experienceLevel: string,
    resume?: ParsedResume | null,
    github?: GitHubAnalysis | null,
    existingClaims: CandidateClaimData[] = []
  ): CandidateUnifiedProfile {
    const skillsMap = new Map<string, { status: CompetencyStatus; evidence: string[] }>();

    // Ingest resume skills
    if (resume?.technologies) {
      for (const tech of resume.technologies) {
        skillsMap.set(tech, { status: "Unverified", evidence: ["Mentioned in candidate resume"] });
      }
    }
    if (resume?.skills) {
      for (const s of resume.skills) {
        if (!skillsMap.has(s)) {
          skillsMap.set(s, { status: "Unverified", evidence: ["Listed under skills section"] });
        }
      }
    }

    // Ingest GitHub languages and frameworks
    if (github?.primaryLanguage) {
      skillsMap.set(github.primaryLanguage, {
        status: "Unverified",
        evidence: [`Primary language in GitHub repository (${github.owner}/${github.repoName})`],
      });
    }
    if (github?.detectedFrameworks) {
      for (const fw of github.detectedFrameworks) {
        skillsMap.set(fw, {
          status: "Unverified",
          evidence: [`Detected in dependencies of repository (${github.owner}/${github.repoName})`],
        });
      }
    }

    // Deduplicate and aggregate claims
    const claims: CandidateClaimData[] = [...existingClaims];
    if (resume?.claims) {
      for (const c of resume.claims) {
        if (!claims.some(existing => existing.claimText.toLowerCase() === c.toLowerCase())) {
          claims.push({
            claimText: c,
            domain: "ENGINEERING_IMPACT",
            source: "RESUME",
            status: "UNTESTED",
            evidenceNotes: "Extracted from candidate resume",
          });
        }
      }
    }

    // Experience summary
    const experienceSummary = (resume?.experience || []).map(
      exp => `${exp.title} at ${exp.company} (${exp.duration}) - ${exp.responsibilities.slice(0, 2).join("; ")}`
    );

    // Projects summary
    const projectsSummary: { name: string; description: string; tech: string[]; repoUrl?: string }[] = (resume?.projects || []).map(p => ({
      name: p.name,
      description: p.description,
      tech: p.technologies,
    }));

    if (github?.repoName) {
      projectsSummary.unshift({
        name: github.repoName,
        description: github.description || "Connected GitHub repository",
        tech: github.detectedFrameworks.length > 0 ? github.detectedFrameworks : [github.primaryLanguage],
        repoUrl: `https://github.com/${github.owner}/${github.repoName}`,
      });
    }

    const skills = Array.from(skillsMap.entries()).map(([name, val]) => ({
      name,
      status: val.status,
      evidence: val.evidence,
    }));

    return {
      name,
      targetRole: targetRole || "Software Engineer",
      experienceLevel: experienceLevel || "Mid-Level",
      skills,
      experienceSummary,
      projectsSummary,
      claims,
      demonstratedKnowledge: [],
      unverifiedAreas: skills.map(s => s.name),
      weakAreas: [],
    };
  }

  /**
   * Builds the Job-Candidate Gap Map comparing JD requirements to Candidate Profile.
   * This is explicitly a preparation and interview-coverage tool, NOT a hiring rejection algorithm.
   */
  public static computeGapMap(
    profile: CandidateUnifiedProfile,
    jobDescription?: ParsedJobDescription | null
  ): CandidateGapItem[] {
    const gapMap: CandidateGapItem[] = [];

    if (!jobDescription) {
      // Default baseline technical competencies for role
      gapMap.push(
        {
          requirement: "System Architecture & Scalability",
          category: "ARCHITECTURE",
          candidateEvidence: profile.experienceSummary[0] || "General engineering experience",
          status: "Unverified",
          probedInSession: false,
          notes: "Evaluate architectural decisions and component trade-offs",
        },
        {
          requirement: "Implementation Depth & Clean Code",
          category: "TECHNICAL",
          candidateEvidence: profile.skills.map(s => s.name).slice(0, 5).join(", ") || "Core languages",
          status: "Unverified",
          probedInSession: false,
          notes: "Probe direct implementation mechanics and runtime efficiency",
        },
        {
          requirement: "Technical Ownership & Debugging",
          category: "PROJECT",
          candidateEvidence: profile.projectsSummary[0]?.name || "Project portfolio",
          status: "Unverified",
          probedInSession: false,
          notes: "Verify personal ownership boundary on project claims",
        }
      );
      return gapMap;
    }

    // Required skills
    for (const reqSkill of jobDescription.requiredSkills) {
      const match = profile.skills.find(s => s.name.toLowerCase() === reqSkill.toLowerCase());
      if (match) {
        gapMap.push({
          requirement: reqSkill,
          category: "TECHNICAL",
          candidateEvidence: match.evidence.join("; "),
          status: match.status,
          probedInSession: false,
          notes: `Candidate mentions ${reqSkill}; requires verification during interview dialogue`,
        });
      } else {
        gapMap.push({
          requirement: reqSkill,
          category: "TECHNICAL",
          candidateEvidence: "Not explicitly documented in candidate profile",
          status: "Needs practice",
          probedInSession: false,
          notes: `Required by job description for ${jobDescription.title}; priority candidate gap to investigate`,
        });
      }
    }

    // Technical competencies
    for (const comp of jobDescription.technicalCompetencies) {
      gapMap.push({
        requirement: comp,
        category: "ARCHITECTURE",
        candidateEvidence: profile.claims.find(c => c.claimText.toLowerCase().includes(comp.toLowerCase()))?.claimText || "Candidate background",
        status: "Unverified",
        probedInSession: false,
        notes: `Core JD competency: ${comp}. Needs deep dive inquiry`,
      });
    }

    // Behavioral competencies
    for (const b of jobDescription.behavioralCompetencies) {
      gapMap.push({
        requirement: b,
        category: "BEHAVIORAL",
        candidateEvidence: "Situational responses to be demonstrated live",
        status: "Unverified",
        probedInSession: false,
        notes: `Evaluate via real incident or team conflict example`,
      });
    }

    return gapMap;
  }
}
