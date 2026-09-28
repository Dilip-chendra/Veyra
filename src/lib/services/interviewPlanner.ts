import type {
  InterviewDifficulty,
  InterviewerStyle,
  TurnEvaluation,
} from "../../types/index.ts";
import type { CandidateGapItem } from "./candidateProfileService.ts";
import type { ProjectDefenseItem } from "./projectDefenseService.ts";

export type InterviewStageType =
  | "INTRODUCTION"
  | "RESUME"
  | "PROJECT"
  | "TECHNICAL"
  | "CODING"
  | "SYSTEM_DESIGN"
  | "BEHAVIORAL"
  | "CLOSING";

export interface InterviewObjective {
  id: string;
  category: InterviewStageType | "TECHNICAL_DEPTH" | "PROJECT_DEFENSE" | "OWNERSHIP";
  title: string;
  targetCompetency: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "UNTESTED" | "IN_PROGRESS" | "SATISFIED" | "NEEDS_PRACTICE";
  expectedEvidence: string[];
}

export interface PlannerDecision {
  nextObjective: InterviewObjective;
  questionText: string;
  reason: string;
  expectedEvidence: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isStageTransition?: boolean;
}

export class InterviewPlanner {
  /**
   * Generates dynamic session objectives tailored to the role, candidate gaps, and project defense.
   * This is an objective roadmap, NOT a rigid Q1-Q5 static script.
   */
  public static generateInitialObjectives(
    role: string,
    gaps: CandidateGapItem[] = [],
    projectDefenseItems: ProjectDefenseItem[] = []
  ): InterviewObjective[] {
    const objectives: InterviewObjective[] = [];

    // Objective 1: Background & Personal Technical Foundation
    objectives.push({
      id: "obj_intro_foundation",
      category: "TECHNICAL_DEPTH",
      title: `Assess technical background and core engineering paradigms for ${role}`,
      targetCompetency: "Core Engineering Fundamentals",
      priority: "HIGH",
      status: "UNTESTED",
      expectedEvidence: ["Concise career overview", "Architecture familiarity", "Personal technical focus"],
    });

    // Objective 2: Project Defense / Ownership
    if (projectDefenseItems.length > 0) {
      objectives.push({
        id: "obj_project_defense",
        category: "PROJECT_DEFENSE",
        title: "Verify real-world project design, failure resilience, and personal contribution",
        targetCompetency: "Project Implementation & Defense",
        priority: "HIGH",
        status: "UNTESTED",
        expectedEvidence: projectDefenseItems[0].expectedEvidence,
      });
    }

    // Objective 3: Key JD Gap or High-Priority Competency
    const priorityGap = gaps.find(g => g.status === "Needs practice" || g.status === "Unverified");
    if (priorityGap) {
      objectives.push({
        id: `obj_gap_${priorityGap.requirement.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        category: "TECHNICAL_DEPTH",
        title: `Verify depth in ${priorityGap.requirement}`,
        targetCompetency: priorityGap.requirement,
        priority: "HIGH",
        status: "UNTESTED",
        expectedEvidence: ["Concrete system context", "Implementation mechanics", "Benchmarked trade-offs"],
      });
    } else {
      objectives.push({
        id: "obj_deep_technical",
        category: "TECHNICAL_DEPTH",
        title: "Assess deep implementation mechanics and edge-case handling",
        targetCompetency: "Advanced Implementation Depth",
        priority: "MEDIUM",
        status: "UNTESTED",
        expectedEvidence: ["Under-the-hood execution mechanics", "Concurrency or memory trade-offs"],
      });
    }

    // Objective 4: Architecture & System Design
    objectives.push({
      id: "obj_system_design",
      category: "SYSTEM_DESIGN",
      title: "Evaluate distributed system architecture and scalability trade-offs",
      targetCompetency: "System Design & Architecture",
      priority: "MEDIUM",
      status: "UNTESTED",
      expectedEvidence: ["Component decomposition", "Failure modes", "Capacity & scaling strategy"],
    });

    // Objective 5: Ownership & Production Incident Handling
    objectives.push({
      id: "obj_ownership_incident",
      category: "OWNERSHIP",
      title: "Test production debugging, root-cause analysis, and incident ownership",
      targetCompetency: "Production Ownership & Debugging",
      priority: "MEDIUM",
      status: "UNTESTED",
      expectedEvidence: ["Root cause analysis methodology", "Observability metrics", "Preventative measures"],
    });

    return objectives;
  }

  /**
   * Time-Aware & Evidence-Driven Planner: Chooses the next interview objective dynamically.
   */
  public static planNextMove(
    objectives: InterviewObjective[],
    currentObjectiveIndex: number,
    turnEvaluation: TurnEvaluation,
    timeRemainingSeconds: number,
    totalDurationSeconds: number,
    difficulty: InterviewDifficulty,
    style: InterviewerStyle
  ): {
    nextObjective: InterviewObjective;
    updatedObjectives: InterviewObjective[];
    difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  } {
    const updated = [...objectives];
    const fractionRemaining = timeRemainingSeconds / totalDurationSeconds;

    // Check if current objective is satisfied
    const current = updated[currentObjectiveIndex] || updated[0];
    if (turnEvaluation.depth === "deep" || turnEvaluation.depth === "exceptional") {
      current.status = "SATISFIED";
    } else if (turnEvaluation.depth === "shallow" && turnEvaluation.correctness === "incomplete") {
      current.status = "NEEDS_PRACTICE";
    }

    // Time-Aware Emergency Rebalance:
    // If less than 20% of time remains, skip remaining low-priority objectives and pivot to closing
    if (fractionRemaining < 0.1) {
      let closingObj = updated.find(o => o.category === "CLOSING");
      if (!closingObj) {
        closingObj = {
          id: "obj_closing",
          category: "CLOSING",
          title: "Conclude session and address candidate questions",
          targetCompetency: "Candidate Inquiry & Wrap-Up",
          priority: "HIGH",
          status: "IN_PROGRESS",
          expectedEvidence: ["Candidate questions", "Professional closing"],
        };
        updated.push(closingObj);
      }
      return {
        nextObjective: closingObj,
        updatedObjectives: updated,
        difficultyLevel: "EASY",
      };
    }

    // Normal Progression:
    // If current objective satisfied or probed >= 2 times, move to next high-priority untested objective
    const nextUntested = updated.find(o => o.status === "UNTESTED");
    const chosen = nextUntested || current;
    chosen.status = "IN_PROGRESS";

    // Adaptive Difficulty Tuning based on candidate performance
    let difficultyLevel: "EASY" | "MEDIUM" | "HARD" = "MEDIUM";
    if (difficulty === "HARD" || turnEvaluation.depth === "exceptional") {
      difficultyLevel = "HARD";
    } else if (difficulty === "EASY" || turnEvaluation.depth === "shallow") {
      difficultyLevel = "EASY";
    }

    return {
      nextObjective: chosen,
      updatedObjectives: updated,
      difficultyLevel,
    };
  }

  /**
   * Generates natural spoken transitions between interview stages.
   * Example: "We've covered your project. I'd like to move into a system-design scenario now."
   */
  public static getSpokenTransition(fromStage: string, toStage: string): string {
    if (fromStage === "PROJECT" && toStage === "SYSTEM_DESIGN") {
      return "We've covered your project. I'd like to move into a system-design scenario now.";
    }
    if (fromStage === "TECHNICAL" && toStage === "CODING") {
      return "That's great depth on the technical fundamentals. Let's switch over to the code editor for a live implementation challenge.";
    }
    if (fromStage === "CODING" && toStage === "SYSTEM_DESIGN") {
      return "Nice work on that algorithm. Let's transition back to system-level architecture.";
    }
    if (fromStage === "SYSTEM_DESIGN" && toStage === "BEHAVIORAL") {
      return "That gives me a solid picture of your architectural trade-offs. Let's shift gears to team collaboration and engineering ownership.";
    }
    if (toStage === "CLOSING") {
      return "We've covered great ground today. Before we wrap up, what questions do you have for me about our engineering stack or team culture?";
    }
    return "";
  }
}
