import type {
  InterviewTurnResponse,
  InterviewerStyle,
  InterviewDifficulty,
  CandidateClaimData,
  TurnEvaluation,
} from "../../types/index.ts";
import { FollowUpEngine } from "./followUpEngine.ts";
import { BehaviorController } from "./behaviorController.ts";
import {
  InterviewMemory,
  type InterviewMemoryState,
} from "./interviewMemory.ts";
import type { ProjectDefenseItem } from "./projectDefenseService.ts";

export interface InterviewBrainContext {
  interviewId: string;
  role: string;
  interviewType: string;
  durationMinutes: number;
  elapsedSeconds: number;
  currentStageIndex: number;
  stages: { name: string; targetMinutes: number; objectives: string[] }[];
  candidateClaims: CandidateClaimData[];
  history: {
    role: "interviewer" | "candidate";
    speaker: string;
    text: string;
    timestampSeconds: number;
  }[];
  style: InterviewerStyle;
  difficulty: InterviewDifficulty;
  interviewerName?: string;
  memoryState?: InterviewMemoryState;
  projectDefenseItems?: ProjectDefenseItem[];
  codeState?: {
    code?: string;
    testResults?: string;
    language?: string;
    hasErrors?: boolean;
  };
  whiteboardState?: {
    nodes?: { id: string; label: string; type: string }[];
    edges?: { source: string; target: string }[];
  };
}

export class InterviewBrain {
  public static processCandidateTurn(
    candidateAnswer: string,
    context: InterviewBrainContext
  ): InterviewTurnResponse {
    const totalDurationSeconds = Math.max(300, context.durationMinutes * 60);
    const safeElapsedSeconds = Math.max(0, Math.min(totalDurationSeconds, context.elapsedSeconds));
    const timeRemainingSeconds = Math.max(0, totalDurationSeconds - safeElapsedSeconds);
    const fractionRemaining = timeRemainingSeconds / totalDurationSeconds;

    const trimmed = candidateAnswer.trim();
    const lower = trimmed.toLowerCase();
    const memory = context.memoryState || InterviewMemory.parseMemory();
    const interviewerSpeaker = context.interviewerName || "Interviewer";

    // Extract last question asked by interviewer
    const priorInterviewerTurns = context.history.filter(h => h.role === "interviewer");
    const lastInterviewerTurn = priorInterviewerTurns.length > 0
      ? priorInterviewerTurns[priorInterviewerTurns.length - 1].text
      : "";

    // ── 1. Candidate requests repeat of the previous question ──────────────
    const isRepeatRequest = /^(can\s+you|could\s+you|please)?\s*(repeat|say\s+that\s+again|pardon|what\s+was\s+the\s+question)/i.test(lower);
    if (isRepeatRequest && lastInterviewerTurn) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      const repeatSpeech = `Of course. ${lastInterviewerTurn}`;
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(repeatSpeech),
        objective: "repeat_previous_question",
        difficulty: "EASY",
        followUpReason: "Candidate asked to repeat question; repeating naturally without penalty",
        expectedEvidence: ["Attentive listening", "Targeted response"],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 2. Candidate asks for a moment to think ─────────────────────────────
    const isPauseRequest = /^(give\s+me|give\s+me\s+a|let\s+me\s+have|can\s+i\s+have)?\s*(a\s+moment|a\s+second|a\s+minute|a\s+sec|one\s+second|think\s+for\s+a\s+second)/i.test(lower);
    if (isPauseRequest) {
      const behavior = BehaviorController.computeBehavior("WAITING", context.style);
      return {
        speaker: interviewerSpeaker,
        question: "Sure, take your time.",
        objective: "candidate_thinking_pause",
        difficulty: "EASY",
        followUpReason: "Candidate requested thinking time; pausing courteously",
        expectedEvidence: [],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 3. Candidate states "I don't know" or uncertainty ────────────────────
    const isIDontKnow = /^(i\s+don'?t\s+know|not\s+sure|i'?m\s+not\s+sure|no\s+idea|i\s+have\s+no\s+clue|haven'?t\s+used\s+it|not\s+familiar)/i.test(lower);
    if (isIDontKnow) {
      const behavior = BehaviorController.computeBehavior("ENCOURAGING", context.style);
      const questionText = "That is completely fine — in real engineering, recognizing the boundaries of what we know is critical. Let's look at this from first principles: if you encountered this in production, what would be your initial hypothesis and how would you investigate it?";
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "assess_first_principles_reasoning",
        difficulty: "MEDIUM",
        followUpReason: "Candidate expressed uncertainty; pivoting to first-principles problem solving",
        expectedEvidence: ["First-principles breakdown", "Debugging intuition", "Systematic inquiry"],
        behavior,
        turnEvaluation: {
          correctness: "incomplete",
          depth: "shallow",
          clarificationDetected: false,
          alternativeDesignArgued: false,
          claimsDetected: [],
          evidenceExtracted: [],
          unresolvedGaps: ["Uncertainty on previous technical topic"],
        },
        timeRemainingSeconds,
      };
    }

    // ── 4. Candidate gives a very brief answer (<= 4 words) ─────────────────
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount <= 4 && !lower.includes("?")) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      const questionText = "Could you unpack that a bit more? Specifically, what part of the system or workflow did that involve, and what concrete decisions did you have to make?";
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "probe_short_answer_depth",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided an extremely concise answer; prompting for implementation depth",
        expectedEvidence: ["Concrete system context", "Implementation mechanics", "Personal ownership"],
        behavior,
        turnEvaluation: {
          correctness: "incomplete",
          depth: "shallow",
          clarificationDetected: false,
          alternativeDesignArgued: false,
          claimsDetected: [],
          evidenceExtracted: [],
          unresolvedGaps: ["Superficial or single-word response"],
        },
        timeRemainingSeconds,
      };
    }

    // ── 5. Contradiction Detection against Interview Memory ──────────────────
    const contradictionAlert = InterviewMemory.detectContradictions(memory, candidateAnswer);
    if (contradictionAlert.detected) {
      const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(contradictionAlert.clarificationPrompt),
        objective: "clarify_statement_contradiction",
        difficulty: "HARD",
        followUpReason: `Detected contradiction regarding ${contradictionAlert.topic}; seeking respectful clarification`,
        expectedEvidence: ["Reconciliation of conflicting statements", "Architectural clarification"],
        behavior,
        turnEvaluation: {
          correctness: "technically_arguable",
          depth: "adequate",
          clarificationDetected: false,
          alternativeDesignArgued: false,
          claimsDetected: [],
          evidenceExtracted: [],
          unresolvedGaps: ["Contradictory architectural claims"],
        },
        timeRemainingSeconds,
      };
    }

    // ── 6. Candidate disagrees or advocates an alternative design ───────────
    const isDisagreement = /(i\s+disagree|i\s+would\s+actually|prefer\s+to\s+use|instead\s+of|rather\s+than|better\s+approach|alternative)/i.test(lower);
    if (isDisagreement) {
      const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
      const questionText = "Fair point — challenging standard assumptions is sound engineering. Walk me through the specific trade-offs: what makes your proposed approach preferable here, and under what conditions does it break down?";
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "evaluate_counter_argument_rigor",
        difficulty: "HARD",
        followUpReason: "Candidate advocated an alternative architectural design; testing trade-off defensibility",
        expectedEvidence: ["Comparative trade-offs", "Operational constraints", "Workload suitability"],
        behavior,
        turnEvaluation: {
          correctness: "technically_arguable",
          depth: "deep",
          clarificationDetected: false,
          alternativeDesignArgued: true,
          claimsDetected: [],
          evidenceExtracted: ["Alternative architectural evaluation"],
          unresolvedGaps: [],
        },
        timeRemainingSeconds,
      };
    }

    // ── 7. Project Ownership Probing ("we built", "our team") ───────────────
    const ownershipProbe = InterviewMemory.checkOwnershipProbeNeeded(candidateAnswer);
    if (ownershipProbe.needsOwnershipProbe && ownershipProbe.probeQuestion && Math.random() > 0.4) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(ownershipProbe.probeQuestion),
        objective: "verify_individual_project_ownership",
        difficulty: "MEDIUM",
        followUpReason: "Candidate answered with collective team pronouns; isolating personal contributions",
        expectedEvidence: ["Individual ownership boundary", "Personal debugging resolution"],
        behavior,
        turnEvaluation: {
          correctness: "mostly_correct",
          depth: "adequate",
          clarificationDetected: false,
          alternativeDesignArgued: false,
          claimsDetected: [],
          evidenceExtracted: ["Team project context"],
          unresolvedGaps: ["Individual contribution scope unverified"],
        },
        timeRemainingSeconds,
      };
    }

    // ── 8. Coding Context Integration (if candidate just ran code) ───────────
    if (context.codeState?.code && context.codeState.code.length > 20) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      if (context.codeState.hasErrors) {
        const questionText = "I see your code execution encountered an error. Walk me through how you would isolate and debug that runtime failure.";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_debugging_and_runtime_analysis",
          difficulty: "MEDIUM",
          followUpReason: "Candidate code threw execution error; testing debugging approach",
          expectedEvidence: ["Step-by-step trace", "Edge case identification", "Error handling"],
          behavior,
          timeRemainingSeconds,
        };
      } else {
        const questionText = "Your code passes the basic test cases. What is the Big-O time and space complexity of your implementation, and could we optimize space further?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_complexity_and_optimization",
          difficulty: "MEDIUM",
          followUpReason: "Candidate code executed successfully; probing time and space complexity",
          expectedEvidence: ["Accurate Big-O analysis", "Space optimization reasoning"],
          behavior,
          timeRemainingSeconds,
        };
      }
    }

    // ── 9. Whiteboard / System Design Context Integration ───────────────────
    if (context.whiteboardState?.nodes && context.whiteboardState.nodes.length >= 2 && context.interviewType === "SYSTEM_DESIGN") {
      const nodes = context.whiteboardState.nodes;
      const cacheOrDb = nodes.find(n => n.type === "cache" || n.type === "database") || nodes[0];
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      const questionText = `I see ${cacheOrDb.label} in your architectural diagram. Walk me through your data flow: what happens when that node fails or experiences network latency?`;
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "whiteboard_architecture_resilience",
        difficulty: "HARD",
        followUpReason: "Testing architectural resilience directly from candidate's live diagram nodes",
        expectedEvidence: ["Component failure modes", "Circuit breaking", "Degraded user experience"],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 10. Long-Answer Interruption Condition (> 220 words) ────────────────
    if (wordCount > 220) {
      const interruption = BehaviorController.getInterruptionPhrase("long_speech");
      const behavior = BehaviorController.computeBehavior("INTERRUPTING", context.style, { isInterruption: true });
      const questionText = `${interruption} Let's zoom in on the core implementation: what was the hardest technical challenge you encountered while building that, and how did you resolve it?`;
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "contain_long_answer_and_target_tradeoff",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided an overly lengthy narrative; refocusing on specific engineering challenges",
        expectedEvidence: ["Concise articulation", "Explicit trade-off identification"],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 11. Natural Time Budget Transition (< 5% time remaining) ────────────
    if (fractionRemaining < 0.05) {
      const behavior = BehaviorController.computeBehavior("CLOSING", context.style);
      const questionText = "We are reaching the end of our allotted time for today's session. You've provided great detail on your engineering background and architectural thinking. Before we wrap up and generate your comprehensive scorecard, what questions do you have for me about the team, tech stack, or engineering culture?";
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "conclude_interview_and_open_floor",
        difficulty: "EASY",
        followUpReason: "Scheduled session time completed; transitioned to candidate questions and wrap-up",
        expectedEvidence: ["Candidate curiosity", "Strategic team inquiry"],
        behavior,
        isStageTransition: true,
        isComplete: false,
        timeRemainingSeconds,
      };
    }

    // ── 12. Evaluate Answer & Generate Contextual Follow-Up ─────────────────
    const evaluation = FollowUpEngine.evaluateAnswer(
      lastInterviewerTurn,
      candidateAnswer,
      context.history.map(h => ({
        question: h.role === "interviewer" ? h.text : "",
        answer: h.role === "candidate" ? h.text : "",
      }))
    );

    // ── 13. GitHub Project Defense Question Check ───────────────────────────
    if (context.projectDefenseItems && context.projectDefenseItems.length > 0 && Math.random() > 0.5) {
      const unaskedDefense = context.projectDefenseItems.find(
        p => !memory.askedQuestions.some(q => q.toLowerCase().includes(p.targetedFileOrConcept.toLowerCase()))
      );
      if (unaskedDefense) {
        const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(unaskedDefense.question),
          objective: unaskedDefense.topic,
          difficulty: "HARD",
          followUpReason: unaskedDefense.reason,
          expectedEvidence: unaskedDefense.expectedEvidence,
          behavior,
          turnEvaluation: evaluation,
          timeRemainingSeconds,
        };
      }
    }

    // ── 14. Standard Adaptive Follow-Up ─────────────────────────────────────
    const followUp = FollowUpEngine.generateFollowUp(
      lastInterviewerTurn,
      candidateAnswer,
      evaluation,
      context.difficulty,
      context.style,
      context.candidateClaims.map(c => c.claimText)
    );

    // Record turn in memory
    InterviewMemory.recordTurn(
      memory,
      context.history.length,
      safeElapsedSeconds,
      candidateAnswer,
      followUp.followUpQuestion,
      followUp.category
    );

    const behaviorState = followUp.isChallenging ? "CHALLENGING" : "QUESTIONING";
    const behavior = BehaviorController.computeBehavior(behaviorState, context.style, {
      isChallenging: followUp.isChallenging,
      difficulty: followUp.difficulty,
    });

    return {
      speaker: interviewerSpeaker,
      question: InterviewMemory.formatForSpeech(followUp.followUpQuestion),
      objective: followUp.objective,
      difficulty: followUp.difficulty,
      followUpReason: followUp.followUpReason,
      expectedEvidence: followUp.expectedEvidence,
      behavior,
      turnEvaluation: evaluation,
      timeRemainingSeconds,
    };
  }
}
