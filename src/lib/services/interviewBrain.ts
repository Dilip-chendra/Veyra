import type {
  InterviewBlueprint,
  InterviewTurnResponse,
  InterviewerStyle,
  InterviewDifficulty,
  CandidateClaimData,
} from "../../types/index.ts";
import { FollowUpEngine } from "./followUpEngine.ts";
import { BehaviorController } from "./behaviorController.ts";

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
}

export class InterviewBrain {
  public static processCandidateTurn(
    candidateAnswer: string,
    context: InterviewBrainContext
  ): InterviewTurnResponse {
    const totalDurationSeconds = Math.max(300, context.durationMinutes * 60);
    // Guarantee non-negative bounded elapsed seconds
    const safeElapsedSeconds = Math.max(0, Math.min(totalDurationSeconds, context.elapsedSeconds));
    const timeRemainingSeconds = Math.max(0, totalDurationSeconds - safeElapsedSeconds);
    const fractionRemaining = timeRemainingSeconds / totalDurationSeconds;

    const trimmed = candidateAnswer.trim();
    const lower = trimmed.toLowerCase();

    // 1. Evaluate Candidate Answer
    const lastInterviewerTurn = context.history.length > 0 
      ? context.history[context.history.length - 1].text 
      : "";

    const evaluation = FollowUpEngine.evaluateAnswer(
      lastInterviewerTurn,
      candidateAnswer,
      context.history.map(h => ({ 
        question: h.role === "interviewer" ? h.text : "", 
        answer: h.role === "candidate" ? h.text : "" 
      }))
    );

    // 2. Candidate explicitly states "I don't know" or similar uncertainty
    const isIDontKnow = /^(i\s+don'?t\s+know|not\s+sure|i'?m\s+not\s+sure|no\s+idea|i\s+have\s+no\s+clue|haven'?t\s+used\s+it|not\s+familiar)/i.test(lower);
    if (isIDontKnow) {
      const behavior = BehaviorController.computeBehavior("ENCOURAGING", context.style);
      return {
        speaker: "Interviewer",
        question: "That is completely fine — in real engineering, recognizing the boundaries of what we know is critical. Let's look at this from first principles: if you encountered this in production, what would be your initial hypothesis and how would you investigate it?",
        objective: "assess_first_principles_reasoning",
        difficulty: "MEDIUM",
        followUpReason: "Candidate expressed uncertainty; pivoting to first-principles problem solving",
        expectedEvidence: ["First-principles breakdown", "Debugging intuition", "Systematic inquiry"],
        behavior,
        turnEvaluation: {
          ...evaluation,
          depth: "shallow",
          unresolvedGaps: ["Uncertainty on previous technical topic"],
        },
        timeRemainingSeconds,
      };
    }

    // 3. Candidate gives a very brief or 1-word answer (e.g. "Yes", "I used Python", "Redis", "Sure")
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount <= 4 && !lower.includes("?")) {
      const behavior = BehaviorController.computeBehavior("QUESTIONING", context.style);
      return {
        speaker: "Interviewer",
        question: `Could you unpack that a bit more? Specifically, what part of the system or workflow did that involve, and what concrete decisions did you have to make?`,
        objective: "probe_short_answer_depth",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided an extremely concise answer; prompting for implementation depth",
        expectedEvidence: ["Concrete system context", "Implementation mechanics", "Personal ownership"],
        behavior,
        turnEvaluation: evaluation,
        timeRemainingSeconds,
      };
    }

    // 4. Candidate disagrees or advocates an alternative design/technology
    const isDisagreement = /(i\s+disagree|i\s+would\s+actually|prefer\s+to\s+use|instead\s+of|rather\s+than|better\s+approach|alternative)/i.test(lower);
    if (isDisagreement) {
      const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
      return {
        speaker: "Interviewer",
        question: "That's a fair and interesting counter-perspective. Walk me through the engineering trade-offs: under what specific traffic patterns or operational constraints does your proposed approach outperform the alternative?",
        objective: "evaluate_counter_argument_rigor",
        difficulty: "HARD",
        followUpReason: "Candidate advocated an alternative architectural design; testing trade-off defensibility",
        expectedEvidence: ["Comparative trade-offs", "Operational constraints", "Workload suitability"],
        behavior,
        turnEvaluation: evaluation,
        timeRemainingSeconds,
      };
    }

    // 5. Check for Long-Answer Interruption Condition (> 220 words)
    if (wordCount > 220) {
      const interruption = BehaviorController.getInterruptionPhrase("long_speech");
      const behavior = BehaviorController.computeBehavior("INTERRUPTING", context.style, { isInterruption: true });
      return {
        speaker: "Interviewer",
        question: `${interruption} Let's zoom in on the core implementation: what was the hardest technical challenge you encountered while building that, and how did you resolve it?`,
        objective: "contain_long_answer_and_target_tradeoff",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided an overly lengthy narrative; refocusing on specific engineering challenges",
        expectedEvidence: ["Concise articulation", "Explicit trade-off identification"],
        behavior,
        turnEvaluation: evaluation,
        timeRemainingSeconds,
      };
    }

    // 6. Natural Time Budget Transition (Only when time genuinely expires, > 95% elapsed)
    if (fractionRemaining < 0.05) {
      const behavior = BehaviorController.computeBehavior("CLOSING", context.style);
      return {
        speaker: "Interviewer",
        question: "We are reaching the end of our allotted time for today's session. You've provided great detail on your engineering background and architectural thinking. Before we wrap up and generate your comprehensive scorecard, what questions do you have for me about the team, tech stack, or engineering culture?",
        objective: "conclude_interview_and_open_floor",
        difficulty: "EASY",
        followUpReason: "Scheduled session time completed; transitioned to candidate questions and wrap-up",
        expectedEvidence: ["Candidate curiosity", "Strategic team inquiry"],
        behavior,
        turnEvaluation: evaluation,
        isStageTransition: true,
        isComplete: false, // Never force auto-end; candidate explicitly concludes
        timeRemainingSeconds,
      };
    }

    // 7. Memory & Prior Claim Cross-Reference (If candidate made claims that remain untested)
    const untestedClaims = context.candidateClaims.filter(c => c.status === "UNTESTED");
    if (untestedClaims.length > 0 && context.history.length > 4 && Math.random() > 0.65) {
      const claimToProbe = untestedClaims[0];
      const behavior = BehaviorController.computeBehavior("CHALLENGING", context.style, { isChallenging: true });
      return {
        speaker: "Interviewer",
        question: `Earlier you mentioned that you "${claimToProbe.claimText}". Walk me through how you benchmarked and measured that in production: what were the baseline numbers before and after?`,
        objective: "verify_earlier_candidate_claim",
        difficulty: "HARD",
        followUpReason: `Cross-referencing candidate claim: "${claimToProbe.claimText}" against rigorous evidence metrics`,
        expectedEvidence: ["Benchmark methodology", "Baseline comparison", "Concrete metrics"],
        behavior,
        turnEvaluation: evaluation,
        timeRemainingSeconds,
      };
    }

    // 8. Generate Adaptive Follow-Up from the Candidate's exact answer
    const priorQuestions = context.history.filter(h => h.role === "interviewer").map(h => h.text);
    const lastQuestion = priorQuestions[priorQuestions.length - 1] || "";

    const followUp = FollowUpEngine.generateFollowUp(
      lastQuestion,
      candidateAnswer,
      evaluation,
      context.difficulty,
      context.style,
      context.candidateClaims.map(c => c.claimText)
    );

    const behaviorState = followUp.isChallenging ? "CHALLENGING" : "QUESTIONING";
    const behavior = BehaviorController.computeBehavior(behaviorState, context.style, {
      isChallenging: followUp.isChallenging,
      difficulty: followUp.difficulty,
    });

    return {
      speaker: "Interviewer",
      question: followUp.followUpQuestion,
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
