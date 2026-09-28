import type { CandidateClaimData } from "../../types/index.ts";

export interface MemoryClaimRecord {
  id: string;
  claim: string;
  topic: string;
  turnIndex: number;
  timestampSeconds: number;
  status: "unverified" | "verified" | "contradicted" | "unsupported";
}

export interface TechnologyMention {
  technology: string;
  context: string;
  turnIndex: number;
  roleInProject: string; // e.g. "primary database", "cache", "framework", "messaging"
}

export interface ContradictionAlert {
  detected: boolean;
  topic: string;
  priorStatement: string;
  currentStatement: string;
  clarificationPrompt: string;
}

export interface InterviewMemoryState {
  claims: MemoryClaimRecord[];
  technologies: TechnologyMention[];
  decisions: { decision: string; justification: string; turnIndex: number }[];
  ownershipStatements: { project: string; role: string; personalScope: string }[];
  ownershipProbeStage: number;
  claimProbeMap: Record<string, number>;
  currentStage: "INTRODUCTION" | "RESUME" | "PROJECT" | "TECHNICAL" | "CODING" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "CLOSING";
  lastTopic: string;
  unresolvedGaps: string[];
  demonstratedStrengths: string[];
  askedQuestions: string[];
  usedFollowUpTypes: string[];
  usedAcknowledgements: string[];
}

export class InterviewMemory {
  private static readonly NATURAL_ACKNOWLEDGEMENTS = [
    "Got it.",
    "That makes sense.",
    "Okay, let's go deeper there.",
    "That's useful context.",
    "Let's stay with that for a moment.",
    "Understood.",
    "Fair point.",
  ];

  /**
   * Initializes or parses an existing memory state from JSON.
   */
  public static parseMemory(rawJson?: string | null): InterviewMemoryState {
    if (!rawJson) {
      return {
        claims: [],
        technologies: [],
        decisions: [],
        ownershipStatements: [],
        ownershipProbeStage: 0,
        claimProbeMap: {},
        currentStage: "INTRODUCTION",
        lastTopic: "",
        unresolvedGaps: [],
        demonstratedStrengths: [],
        askedQuestions: [],
        usedFollowUpTypes: [],
        usedAcknowledgements: [],
      };
    }
    try {
      const parsed = JSON.parse(rawJson);
      return {
        claims: parsed.claims || [],
        technologies: parsed.technologies || [],
        decisions: parsed.decisions || [],
        ownershipStatements: parsed.ownershipStatements || [],
        ownershipProbeStage: parsed.ownershipProbeStage || 0,
        claimProbeMap: parsed.claimProbeMap || {},
        currentStage: parsed.currentStage || "INTRODUCTION",
        lastTopic: parsed.lastTopic || "",
        unresolvedGaps: parsed.unresolvedGaps || [],
        demonstratedStrengths: parsed.demonstratedStrengths || [],
        askedQuestions: parsed.askedQuestions || [],
        usedFollowUpTypes: parsed.usedFollowUpTypes || [],
        usedAcknowledgements: parsed.usedAcknowledgements || [],
      };
    } catch {
      return {
        claims: [],
        technologies: [],
        decisions: [],
        ownershipStatements: [],
        ownershipProbeStage: 0,
        claimProbeMap: {},
        currentStage: "INTRODUCTION",
        lastTopic: "",
        unresolvedGaps: [],
        demonstratedStrengths: [],
        askedQuestions: [],
        usedFollowUpTypes: [],
        usedAcknowledgements: [],
      };
    }
  }

  /**
   * Updates memory based on candidate answer and extracts facts.
   */
  public static recordTurn(
    memory: InterviewMemoryState,
    turnIndex: number,
    elapsedSeconds: number,
    candidateAnswer: string,
    interviewerQuestion: string,
    followUpType: string
  ): { updatedMemory: InterviewMemoryState; contradiction: ContradictionAlert } {
    const updated = { ...memory };
    const lower = candidateAnswer.toLowerCase();

    // 1. Record asked question and follow-up type
    updated.askedQuestions.push(interviewerQuestion);
    updated.usedFollowUpTypes.push(followUpType);

    // 2. Check for Contradictions with previously stated facts
    const contradiction = this.detectContradictions(updated, candidateAnswer);

    // 3. Extract Technology Mentions with Project Role
    const techCatalog: { name: string; category: string }[] = [
      { name: "PostgreSQL", category: "database" },
      { name: "MySQL", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "Redis", category: "cache" },
      { name: "Kafka", category: "messaging" },
      { name: "RabbitMQ", category: "messaging" },
      { name: "FastAPI", category: "backend_framework" },
      { name: "Express", category: "backend_framework" },
      { name: "Django", category: "backend_framework" },
      { name: "Next.js", category: "frontend_framework" },
      { name: "React", category: "frontend_framework" },
      { name: "Docker", category: "containerization" },
      { name: "Kubernetes", category: "orchestration" },
      { name: "Pinecone", category: "vector_db" },
      { name: "Chroma", category: "vector_db" },
      { name: "Qdrant", category: "vector_db" },
    ];

    for (const tech of techCatalog) {
      const regex = new RegExp(`\\b${tech.name}\\b`, "i");
      if (regex.test(candidateAnswer)) {
        if (!updated.technologies.some(t => t.technology.toLowerCase() === tech.name.toLowerCase())) {
          updated.technologies.push({
            technology: tech.name,
            context: candidateAnswer.slice(0, 150),
            turnIndex,
            roleInProject: tech.category,
          });
        }
      }
    }

    // 4. Extract Quantified Metrics / Claims
    const metricMatch = candidateAnswer.match(/(reduced|increased|improved|scaled|cut|saved|optimized)\s+[^.!?]{10,80}(?:\d+[%xXkKM]|\$\d+)/i);
    if (metricMatch) {
      updated.claims.push({
        id: `claim_${Date.now()}_${turnIndex}`,
        claim: metricMatch[0].trim(),
        topic: "performance_metric",
        turnIndex,
        timestampSeconds: elapsedSeconds,
        status: "unverified",
      });
    }

    // 5. Extract Decisions
    if (/we chose|i decided to|our approach was to|opted for/i.test(lower)) {
      const decisionSlice = candidateAnswer.slice(0, 160);
      updated.decisions.push({
        decision: decisionSlice,
        justification: lower.includes("because") ? candidateAnswer.split(/because/i)[1]?.slice(0, 100) || "" : "",
        turnIndex,
      });
    }

    return { updatedMemory: updated, contradiction };
  }

  /**
   * Detects contradictions between current answer and earlier recorded facts.
   * Example: Candidate previously claimed PostgreSQL was primary database, now says MongoDB was primary.
   */
  public static detectContradictions(
    memory: InterviewMemoryState,
    currentAnswer: string
  ): ContradictionAlert {
    const lower = currentAnswer.toLowerCase();

    // Check database contradictions (PostgreSQL vs MongoDB vs MySQL)
    const priorDbs = memory.technologies.filter(t => t.roleInProject === "database");
    if (priorDbs.length > 0) {
      const priorPrimary = priorDbs[0].technology;
      const competingDbs = ["postgresql", "mongodb", "mysql", "dynamodb"].filter(
        db => db !== priorPrimary.toLowerCase()
      );

      const displayNames: Record<string, string> = {
        postgresql: "PostgreSQL",
        mongodb: "MongoDB",
        mysql: "MySQL",
        dynamodb: "DynamoDB",
      };

      for (const comp of competingDbs) {
        const regex = new RegExp(`\\b(our primary database|our main database|we used|our data store)\\s+(was|is)\\s+${comp}\\b`, "i");
        if (regex.test(lower)) {
          const capitalizedComp = displayNames[comp] || (comp.charAt(0).toUpperCase() + comp.slice(1));
          return {
            detected: true,
            topic: "primary_database",
            priorStatement: `Earlier you mentioned ${priorPrimary} as your database.`,
            currentStatement: `Just now you mentioned ${capitalizedComp}.`,
            clarificationPrompt: `Earlier you mentioned ${priorPrimary} as your database, and just now you mentioned ${capitalizedComp}. Can you clarify how ${priorPrimary} and ${capitalizedComp} were used together in that architecture?`,
          };
        }
      }
    }

    return {
      detected: false,
      topic: "",
      priorStatement: "",
      currentStatement: "",
      clarificationPrompt: "",
    };
  }

  /**
   * Detects whether candidate answers with collective / passive phrasing ("we built", "we did")
   * and provides a targeted multi-turn ownership probe sequence:
   * 1. What did you personally implement?
   * 2. What was the hardest part of your contribution?
   * 3. Why did you implement it that way?
   */
  public static checkOwnershipProbeNeeded(candidateAnswer: string, stage: number = 0): {
    needsOwnershipProbe: boolean;
    probeQuestion?: string;
    nextStage: number;
  } {
    const trimmed = candidateAnswer.trim();
    const lower = trimmed.toLowerCase();
    const words = trimmed.split(/\s+/).length;

    // Trigger if candidate uses collective pronouns
    const collectiveMatches = lower.match(/\b(we built|we implemented|we designed|we created|our team|we deployed|we migrated)\b/g);
    
    if (stage === 0 && collectiveMatches && collectiveMatches.length >= 1 && words >= 3) {
      return {
        needsOwnershipProbe: true,
        probeQuestion: "You mentioned what the team built overall. Which specific part of that system did you personally design and implement?",
        nextStage: 1,
      };
    }

    if (stage === 1 && words >= 4) {
      return {
        needsOwnershipProbe: true,
        probeQuestion: "What was the hardest part of your contribution?",
        nextStage: 2,
      };
    }

    if (stage === 2 && words >= 4) {
      return {
        needsOwnershipProbe: true,
        probeQuestion: "Why did you implement it that way?",
        nextStage: 3,
      };
    }

    return { needsOwnershipProbe: false, nextStage: stage };
  }

  /**
   * 3-Stage Claim Verification Engine:
   * Probes quantified metrics (e.g. "Reduced latency by 40%"):
   * 1. How did you measure that 40%?
   * 2. What was your baseline?
   * 3. What optimization made the biggest difference?
   */
  public static checkClaimProbeNeeded(
    claim: CandidateClaimData,
    stage: number = 0
  ): {
    probeQuestion: string;
    nextStage: number;
    updatedStatus: "UNTESTED" | "PROBED" | "SUPPORTED_BY_ANSWER" | "UNRESOLVED" | "CONTRADICTORY";
  } {
    // Extract metric phrase from claimText if present
    const metricMatch = claim.claimText.match(/\d+[%xXkKM]|\$\d+/);
    const metricStr = metricMatch ? metricMatch[0] : "that improvement";

    if (stage === 0) {
      return {
        probeQuestion: `How did you measure that ${metricStr}?`,
        nextStage: 1,
        updatedStatus: "PROBED",
      };
    }

    if (stage === 1) {
      return {
        probeQuestion: "What was your baseline?",
        nextStage: 2,
        updatedStatus: "PROBED",
      };
    }

    return {
      probeQuestion: "What optimization made the biggest difference?",
      nextStage: 3,
      updatedStatus: "SUPPORTED_BY_ANSWER",
    };
  }

  /**
   * Selects a natural contextual acknowledgement phrase without robotic repetition.
   */
  public static selectAcknowledgement(memory: InterviewMemoryState, candidateAnswer: string = ""): string {
    const lower = candidateAnswer.toLowerCase();
    let preferred: string | null = null;

    if (/because|trade-off|architecture|decision|instead/i.test(lower)) {
      preferred = "That makes sense.";
    } else if (/\d+[%xXkKM]|\$\d+|latency|throughput|benchmark/i.test(lower)) {
      preferred = "That's useful context.";
    } else if (candidateAnswer.trim().split(/\s+/).length <= 4 && candidateAnswer.trim().length > 0) {
      preferred = "Okay, let's go deeper there.";
    }

    const recent = memory.usedAcknowledgements.slice(-2);
    if (preferred && !recent.includes(preferred)) {
      memory.usedAcknowledgements.push(preferred);
      return preferred;
    }

    const available = this.NATURAL_ACKNOWLEDGEMENTS.filter(a => !recent.includes(a));
    const chosen = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : this.NATURAL_ACKNOWLEDGEMENTS[0];

    memory.usedAcknowledgements.push(chosen);
    return chosen;
  }

  /**
   * Formats text for spoken voice: strips all markdown, bullets, code blocks, or emojis.
   */
  public static formatForSpeech(text: string): string {
    return text
      .replace(/[*_#`~[\]]/g, "") // Strip markdown
      .replace(/^[•\-*]\s*/gm, "") // Strip bullet markers
      .replace(/\s{2,}/g, " ") // Clean extra whitespace
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Strip all emojis
      .trim();
  }
}
