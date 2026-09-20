import { InterviewTurnResponse, BehaviorMetadata } from "@/types";
import { BehaviorController } from "./behaviorController";

export interface PanelMember {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  specialty: string;
  style: "DIRECT" | "SKEPTICAL" | "FRIENDLY" | "PROFESSIONAL";
}

export const PANEL_MEMBERS: PanelMember[] = [
  {
    id: "em",
    name: "Marcus Vance",
    title: "Engineering Manager",
    avatarColor: "emerald",
    specialty: "System architecture, trade-offs, engineering leadership",
    style: "PROFESSIONAL",
  },
  {
    id: "ml",
    name: "Dr. Elena Rostova",
    title: "Staff ML & Systems Engineer",
    avatarColor: "indigo",
    specialty: "Low-latency inference, model evaluation, distributed training",
    style: "SKEPTICAL",
  },
  {
    id: "pm",
    name: "Priya Patel",
    title: "Principal Product Manager",
    avatarColor: "amber",
    specialty: "Customer impact, metric definition, prioritization under ambiguity",
    style: "FRIENDLY",
  },
  {
    id: "recruiter",
    name: "David Chen",
    title: "Talent Partner & Hiring Lead",
    avatarColor: "rose",
    specialty: "Behavioral ownership, cross-functional collaboration, team dynamics",
    style: "FRIENDLY",
  },
];

export class PanelService {
  public static selectNextInterviewer(
    turnIndex: number,
    candidateAnswer: string
  ): PanelMember {
    const lower = candidateAnswer.toLowerCase();

    // Context-driven speaker selection
    if (lower.includes("model") || lower.includes("embedding") || lower.includes("rag") || lower.includes("ml")) {
      return PANEL_MEMBERS[1]; // Elena (ML)
    }
    if (lower.includes("user") || lower.includes("product") || lower.includes("requirement") || lower.includes("business")) {
      return PANEL_MEMBERS[2]; // Priya (Product)
    }
    if (lower.includes("team") || lower.includes("conflict") || lower.includes("stakeholder")) {
      return PANEL_MEMBERS[3]; // David (Recruiter)
    }

    // Default round-robin distribution
    return PANEL_MEMBERS[turnIndex % PANEL_MEMBERS.length];
  }

  public static generatePanelTurn(
    member: PanelMember,
    turnIndex: number,
    candidateAnswer: string,
    role: string
  ): InterviewTurnResponse {
    let question = "";
    let objective = "";
    let expectedEvidence: string[] = [];

    switch (member.id) {
      case "em":
        question = `[${member.name} - ${member.title}]: "Looking at the overall architecture for this ${role} role, when services fail intermittently, how do you manage service degradation without impacting client SLA?"`;
        objective = "evaluate_graceful_degradation_and_sla";
        expectedEvidence = ["Circuit breaking", "Fallback defaults", "SLA monitoring"];
        break;

      case "ml":
        question = `[${member.name} - ${member.title}]: "Building on Marcus's point — if we incorporate an inference model into that workflow, how do you handle tail latency and model drift in real time?"`;
        objective = "test_inference_p99_and_drift_detection";
        expectedEvidence = ["p99 latency mitigation", "Data drift monitoring", "Canary deployment"];
        break;

      case "pm":
        question = `[${member.name} - ${member.title}]: "That makes technical sense. From a user experience perspective, when that degradation occurs, how do we communicate system status to prevent customer churn?"`;
        objective = "assess_user_centric_engineering_mindset";
        expectedEvidence = ["Clear user messaging", "Feature toggles", "Impact minimization"];
        break;

      case "recruiter":
        question = `[${member.name} - ${member.title}]: "Tell us about a time you had a technical disagreement with a peer or manager regarding an architectural choice. How was the consensus reached?"`;
        objective = "star_conflict_resolution_and_ownership";
        expectedEvidence = ["Objective criteria", "Blameless consensus", "Commitment to team decisions"];
        break;
    }

    const behavior: BehaviorMetadata = BehaviorController.computeBehavior(
      "QUESTIONING",
      member.style
    );

    return {
      speaker: `${member.name} (${member.title})`,
      question,
      objective,
      difficulty: member.style === "SKEPTICAL" ? "HARD" : "MEDIUM",
      followUpReason: `Panel member ${member.name} probing ${member.specialty}`,
      expectedEvidence,
      behavior,
    };
  }
}
