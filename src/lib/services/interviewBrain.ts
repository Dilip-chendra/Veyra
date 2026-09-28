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
    const isPauseRequest = /^(give\s+me|give\s+me\s+a|let\s+me\s+have|can\s+i\s+have)?\s*(a\s+moment|a\s+second|a\s+minute|a\s+sec|one\s+second|think\s+for\s+a\s+second|moment\s+to\s+think)/i.test(lower);
    if (isPauseRequest) {
      const behavior = BehaviorController.computeBehavior("WAITING", context.style);
      return {
        speaker: interviewerSpeaker,
        question: "Take your time. Let me know when you're ready.",
        objective: "candidate_thinking_pause",
        difficulty: "EASY",
        followUpReason: "Candidate requested thinking time; pausing courteously",
        expectedEvidence: [],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 2b. Candidate asks to clarify requirement or scale ──────────────────
    const isClarificationRequest = /(can\s+i\s+clarify|clarifying\s+question|what\s+is\s+the\s+scale|what\s+are\s+the\s+requirements|daily\s+users|how\s+many\s+users|traffic\s+scale|expected\s+volume)/i.test(lower);
    if (isClarificationRequest) {
      const behavior = BehaviorController.computeBehavior("CLARIFYING", context.style);
      const questionText = "Yes. Assume the system needs to support ten million daily users with a peak read-to-write ratio of roughly ten to one. With those parameters, how would you design the data and caching layers?";
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "clarify_system_requirements",
        difficulty: "MEDIUM",
        followUpReason: "Candidate asked to clarify requirements; provided concrete 10M daily user scale",
        expectedEvidence: ["Proactive requirement gathering", "Scale-aware design"],
        behavior,
        timeRemainingSeconds,
      };
    }

    // ── 2c. Natural Time Budget Transition (< 5% time remaining) ────────────
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

    // ── 3. Candidate states "I don't know" or uncertainty ────────────────────
    const isIDontKnow = /^(i\s+don'?t\s+know|not\s+sure|i'?m\s+not\s+sure|no\s+idea|i\s+have\s+no\s+clue|haven'?t\s+used\s+it|not\s+familiar)/i.test(lower);
    if (isIDontKnow) {
      const behavior = BehaviorController.computeBehavior("ENCOURAGING", context.style);
      let questionText = "That is completely fine — in real engineering, recognizing the boundaries of what we know is critical. Let's look at this from first principles: if you encountered this in production, what would be your initial hypothesis and how would you investigate it?";

      if (/cache|caching|redis|invalidation|safe/i.test(lastInterviewerTurn)) {
        questionText = "No problem. Let's approach it from first principles. What could go wrong if the cached value becomes stale?";
      } else if (/database|sql|postgres|mongo|acid|lock/i.test(lastInterviewerTurn)) {
        questionText = "No problem. Let's approach it from first principles: what could go wrong during concurrent updates without transactional isolation?";
      } else if (/kafka|queue|consumer|event/i.test(lastInterviewerTurn)) {
        questionText = "No problem. Let's step back to first principles: what happens if consumers cannot process events as fast as producers publish them?";
      }

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

    // ── 4. Natural Dialogue: Conversational Short Technical Answers (<= 5 words) ──
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount <= 5 && !lower.includes("?") && !(context.codeState?.code && context.codeState.code.length > 20)) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);

      // A. Candidate mentions Redis
      if (/\bredis\b/i.test(lower)) {
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech("Okay. What exactly were you caching?"),
          objective: "probe_caching_target",
          difficulty: "MEDIUM",
          followUpReason: "Candidate mentioned Redis; probing specific data entities cached",
          expectedEvidence: ["Concrete cached entity", "Cache-aside or write-through rationale"],
          behavior,
          timeRemainingSeconds,
        };
      }

      // B. Candidate follows up on what was cached (e.g. "API responses.")
      if (/what.*caching/i.test(lastInterviewerTurn) || (/cache/i.test(lastInterviewerTurn) && /response|api|session|profile|query|token/i.test(lower))) {
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech("What made caching those responses safe in your case?"),
          objective: "probe_cache_safety_and_invalidation",
          difficulty: "HARD",
          followUpReason: "Candidate specified API responses; evaluating safety and invalidation guarantees",
          expectedEvidence: ["Idempotency", "TTL strategy", "Cache invalidation on mutation"],
          behavior,
          timeRemainingSeconds,
        };
      }

      // C. Candidate mentions PostgreSQL
      if (/\b(postgresql|postgres)\b/i.test(lower)) {
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech("Understood. What was the schema and read-write profile you were serving with PostgreSQL?"),
          objective: "probe_postgres_workload",
          difficulty: "MEDIUM",
          followUpReason: "Candidate mentioned PostgreSQL; probing schema design and write profile",
          expectedEvidence: ["Read vs write ratio", "Indexing strategy"],
          behavior,
          timeRemainingSeconds,
        };
      }

      // D. Candidate mentions Kafka / messaging
      if (/\b(kafka|rabbitmq|sqs)\b/i.test(lower)) {
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech("Okay. What was your partitioning key strategy, and how did you handle consumer group rebalancing?"),
          objective: "probe_kafka_partitioning",
          difficulty: "HARD",
          followUpReason: "Candidate mentioned message streaming; probing partitioning and ordering guarantees",
          expectedEvidence: ["Partition key semantics", "At-least-once vs exactly-once handling"],
          behavior,
          timeRemainingSeconds,
        };
      }

      // General short answer probe with natural contextual acknowledgement
      const ack = InterviewMemory.selectAcknowledgement(memory, candidateAnswer);
      const questionText = `${ack} Could you unpack that a bit more? Specifically, what part of the system did that involve, and what concrete decisions did you have to make?`;
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(questionText),
        objective: "probe_short_answer_depth",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided a concise answer; prompting for implementation mechanics",
        expectedEvidence: ["Concrete system context", "Implementation mechanics", "Personal ownership"],
        behavior,
        turnEvaluation: {
          correctness: "incomplete",
          depth: "shallow",
          clarificationDetected: false,
          alternativeDesignArgued: false,
          claimsDetected: [],
          evidenceExtracted: [],
          unresolvedGaps: ["Superficial or brief response"],
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

    // ── 7. Multi-Turn Project Ownership Ladder ("we built", "our team") ──────
    const currentOwnershipStage = memory.ownershipProbeStage || 0;
    const ownershipProbe = InterviewMemory.checkOwnershipProbeNeeded(candidateAnswer, currentOwnershipStage);
    if (ownershipProbe.needsOwnershipProbe && ownershipProbe.probeQuestion) {
      memory.ownershipProbeStage = ownershipProbe.nextStage;
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      return {
        speaker: interviewerSpeaker,
        question: InterviewMemory.formatForSpeech(ownershipProbe.probeQuestion),
        objective: "verify_individual_project_ownership",
        difficulty: "MEDIUM",
        followUpReason: `Project ownership probe stage ${currentOwnershipStage + 1}: isolating individual accountability`,
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

    // ── 7b. Multi-Turn Metric Claim Verification Ladder ──────────────────────
    const metricClaims = context.candidateClaims.filter(c => /\d+[%xXkKM]|\$\d+/.test(c.claimText));
    if (metricClaims.length > 0) {
      const activeClaim = metricClaims[0];
      const claimStage = memory.claimProbeMap[activeClaim.claimText] || 0;
      if (claimStage < 3 && Math.random() > 0.45) {
        const claimProbe = InterviewMemory.checkClaimProbeNeeded(activeClaim, claimStage);
        memory.claimProbeMap[activeClaim.claimText] = claimProbe.nextStage;
        activeClaim.status = claimProbe.updatedStatus;
        const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(claimProbe.probeQuestion),
          objective: "verify_quantified_performance_claim",
          difficulty: "HARD",
          followUpReason: `Claim verification stage ${claimStage + 1} for "${activeClaim.claimText}"`,
          expectedEvidence: ["Benchmark tool and method", "Baseline numbers", "Concrete architectural optimization"],
          behavior,
          timeRemainingSeconds,
        };
      }
    }

    // ── 7c. Long-Range Memory Recall (at Turn >= 6) ──────────────────────────
    if (context.history.length >= 6 && memory.technologies.length > 0) {
      const earlyTech = memory.technologies.find(t =>
        context.history.length - t.turnIndex >= 4 &&
        !memory.askedQuestions.some(q => q.toLowerCase().includes(t.technology.toLowerCase()))
      );
      if (earlyTech && Math.random() > 0.6) {
        let questionText = `Earlier you mentioned ${earlyTech.technology}. How did you handle high-write workloads and concurrency there?`;
        if (earlyTech.roleInProject === "cache") {
          questionText = `Earlier you mentioned ${earlyTech.technology}. How did you handle cache invalidation and eviction policies under heavy load?`;
        } else if (earlyTech.roleInProject === "messaging") {
          questionText = `Earlier you mentioned ${earlyTech.technology}. What was your strategy for message ordering and dead-letter queues?`;
        }
        const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "long_range_memory_recall",
          difficulty: "MEDIUM",
          followUpReason: `Cross-referencing early statement from turn ${earlyTech.turnIndex + 1} regarding ${earlyTech.technology}`,
          expectedEvidence: ["Consistency with prior statements", "Deep workload handling"],
          behavior,
          timeRemainingSeconds,
        };
      }
    }

    // ── 8. Coding Context Integration (if candidate just ran code or is in coding mode) ───
    if (context.codeState?.code && context.codeState.code.length > 20) {
      const codeQuestions = memory.askedQuestions.filter(q => /complexity|data structure|edge case|reduce the memory|million inputs/i.test(q));
      
      if (context.codeState.hasErrors) {
        const questionText = "I see your code execution encountered a runtime error. Walk me through how you would isolate and debug that failure.";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_debugging_and_runtime_analysis",
          difficulty: "MEDIUM",
          followUpReason: "Candidate code threw execution error; testing debugging approach",
          expectedEvidence: ["Step-by-step trace", "Edge case identification", "Error handling"],
          behavior: BehaviorController.computeBehavior("QUESTIONING", context.style),
          timeRemainingSeconds,
        };
      } else if (codeQuestions.length === 0) {
        const questionText = "What is the time complexity of your solution, and what is its space complexity?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_time_complexity",
          difficulty: "MEDIUM",
          followUpReason: "Candidate code executed; analyzing Big-O time and space complexity",
          expectedEvidence: ["Big-O runtime analysis", "Big-O memory analysis"],
          behavior: BehaviorController.computeBehavior("QUESTIONING", context.style),
          timeRemainingSeconds,
        };
      } else if (codeQuestions.length === 1) {
        const questionText = "Why did you choose that data structure?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_data_structure_choice",
          difficulty: "MEDIUM",
          followUpReason: "Inquiring about data structure selection in candidate code",
          expectedEvidence: ["Data structure trade-offs", "Lookup vs insertion characteristics"],
          behavior: BehaviorController.computeBehavior("QUESTIONING", context.style),
          timeRemainingSeconds,
        };
      } else if (codeQuestions.length === 2) {
        const questionText = "What edge case are you considering?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_edge_cases",
          difficulty: "MEDIUM",
          followUpReason: "Testing boundary and edge-case handling in code",
          expectedEvidence: ["Empty inputs", "Duplicates", "Boundary limits"],
          behavior: BehaviorController.computeBehavior("QUESTIONING", context.style),
          timeRemainingSeconds,
        };
      } else if (codeQuestions.length === 3) {
        const questionText = "Can you reduce the memory usage?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_memory_optimization",
          difficulty: "HARD",
          followUpReason: "Challenging candidate to optimize space complexity in-place",
          expectedEvidence: ["In-place mutation", "Iterator vs array allocation"],
          behavior: BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true }),
          timeRemainingSeconds,
        };
      } else if (codeQuestions.length === 4) {
        const questionText = "What would happen at one million inputs?";
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "code_hyperscale_behavior",
          difficulty: "HARD",
          followUpReason: "Evaluating algorithm behavior at extreme input scale",
          expectedEvidence: ["Memory overflow risks", "External sorting or streaming needs"],
          behavior: BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true }),
          timeRemainingSeconds,
        };
      }
    }

    // ── 9. Whiteboard / System Design Context Integration ───────────────────
    if (context.whiteboardState?.nodes && context.whiteboardState.nodes.length >= 1) {
      const nodes = context.whiteboardState.nodes;
      const redisNode = nodes.find(n => /redis|cache/i.test(n.label));
      const dbNode = nodes.find(n => /db|database|postgres|mongo|sql/i.test(n.label));
      const targetNode = redisNode || dbNode || nodes[0];
      const whiteboardQuestions = memory.askedQuestions.filter(q => q.toLowerCase().includes(targetNode.label.toLowerCase()));

      if (whiteboardQuestions.length === 0) {
        const questionText = `I see you placed ${targetNode.label} here. What problem is it solving?`;
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "whiteboard_component_rationale",
          difficulty: "MEDIUM",
          followUpReason: `Inquiring about ${targetNode.label} node placed on live whiteboard`,
          expectedEvidence: ["Component necessity", "Data flow justification"],
          behavior: BehaviorController.computeBehavior("QUESTIONING", context.style),
          timeRemainingSeconds,
        };
      } else if (whiteboardQuestions.length === 1) {
        const questionText = `What happens if ${targetNode.label} goes down?`;
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "whiteboard_resilience_and_failover",
          difficulty: "HARD",
          followUpReason: `Probing failure mode of ${targetNode.label} from diagram`,
          expectedEvidence: ["Failure isolation", "Fallback strategy"],
          behavior: BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true }),
          timeRemainingSeconds,
        };
      } else if (whiteboardQuestions.length === 2) {
        const questionText = `How would you change the architecture at ten times the traffic?`;
        return {
          speaker: interviewerSpeaker,
          question: InterviewMemory.formatForSpeech(questionText),
          objective: "whiteboard_10x_scalability",
          difficulty: "HARD",
          followUpReason: "Testing 10x scalability of whiteboard architecture",
          expectedEvidence: ["Partitioning strategy", "Bottleneck mitigation"],
          behavior: BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true }),
          timeRemainingSeconds,
        };
      }
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
