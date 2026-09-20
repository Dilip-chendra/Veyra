import type { TrainingPlanData } from "@/types";

export class TrainingEngine {
  public static generateTrainingPlan(
    role: string,
    gaps: { area: string; reason: string }[]
  ): TrainingPlanData {
    const primaryGap = gaps[0]?.area || "Quantitative Benchmarking & Failure Modes";
    const targetGaps = gaps.map(g => g.area);

    const exercises: {
      title: string;
      exerciseType: "CONCEPT_LESSON" | "TARGETED_DRILL" | "CODING_CHALLENGE" | "SYSTEM_DESIGN_CHALLENGE" | "RE_INTERVIEW";
      content: string;
    }[] = [
      {
        title: `Deep Dive Concept Lesson: Mastering ${primaryGap}`,
        exerciseType: "CONCEPT_LESSON",
        content: `### Objective\nUnderstand the architectural patterns and operational standards required for ${primaryGap} in high-throughput distributed systems.\n\n### Key Principles\n1. **Baseline Measurement**: Always quantify the 'Before' state using p50, p95, and p99 percentiles.\n2. **Failure Isolation**: Implement bulkhead patterns, circuit breakers, and bounded retries with exponential jitter.\n3. **Trade-off Matrix**: Document the explicit trade-off between consistency (CP) and availability (AP).\n\n### Study Material\nReview Chapter 3 & 8 of Designing Data-Intensive Applications on Distributed Storage and Fault Tolerance.`,
      },
      {
        title: `5 Targeted Verbal Drills: ${primaryGap}`,
        exerciseType: "TARGETED_DRILL",
        content: `Answer each of the following questions aloud within 90 seconds using the STAR/PREP framework:\n\n1. Explain how you benchmarked your most significant latency optimization.\n2. How would you prevent a cascading cache stampede if your primary Redis node restarted under peak load?\n3. What specific metrics do you track on an asynchronous message queue to detect worker starvation?\n4. Walk through your strategy for rolling schema migrations without database downtime.\n5. When would you deliberately sacrifice strict data consistency for lower read latency?`,
      },
      {
        title: "Implementation Exercise: Resilient Circuit Breaker & Retry with Jitter",
        exerciseType: "CODING_CHALLENGE",
        content: `Implement a production-grade Circuit Breaker pattern in Python or TypeScript with three states: CLOSED, OPEN, and HALF_OPEN.\n\nRequirements:\n- Track failure rate over a sliding window of 60 seconds.\n- Trip circuit if failure rate exceeds 25%.\n- After a 10-second cooldown, allow a canary probe in HALF_OPEN state.\n- Provide an exponential backoff retry wrapper with randomized full jitter.`,
      },
      {
        title: "System Design Challenge: High-Throughput Notification Dispatcher",
        exerciseType: "SYSTEM_DESIGN_CHALLENGE",
        content: `Design a multi-channel notification engine (Push, SMS, Email) handling 100,000 notifications/sec.\n\nKey Constraints:\n- Guaranteed deduplication within a 24-hour window.\n- Priority queuing (urgent transactional vs marketing bulk).\n- Rate limiting per provider API.\n- Multi-region disaster recovery.`,
      },
      {
        title: `Targeted Re-Interview Session: ${role} Focused Probe`,
        exerciseType: "RE_INTERVIEW",
        content: `A 20-minute follow-up session with a direct interviewer persona to specifically re-test: ${primaryGap}. Verification focuses on whether past implementation depth and quantitative metrics are proactively articulated.`,
      },
    ];

    return {
      title: `Personalized Mastery Plan: ${primaryGap}`,
      summary: `Tailored curriculum designed to address the specific performance gaps detected during your ${role} interview session. Completing these 5 modules systematically prepares you for senior-level scrutiny.`,
      targetGaps,
      exercises,
    };
  }
}
