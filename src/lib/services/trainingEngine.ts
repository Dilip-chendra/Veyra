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
        title: `10-Minute Intensive Concept Lesson: Mastering ${primaryGap}`,
        exerciseType: "CONCEPT_LESSON",
        content: `### Objective\nMaster the architectural fundamentals and operational standards required for ${primaryGap}.\n\n### Key Principles\n1. **Baseline Measurement**: Always quantify the 'Before' state using p50, p95, and p99 percentiles or recall/precision benchmarks.\n2. **Failure Isolation**: Implement bulkhead patterns, circuit breakers, and bounded retries with exponential jitter.\n3. **Trade-off Matrix**: Document the explicit trade-off between consistency (CP), availability (AP), and operational complexity.\n\n### Study Material\nReview production case studies on latency optimization, retrieval evaluation (RAGAS/TruLens), and distributed fault tolerance.`,
      },
      {
        title: `5 Targeted Oral Drill Questions: ${primaryGap}`,
        exerciseType: "TARGETED_DRILL",
        content: `Answer each of the following 5 questions aloud within 90 seconds using the STAR/PREP framework:\n\n1. How did you baseline and measure the performance of your system before applying optimizations?\n2. What metric (e.g. p99 latency, recall@k, cache hit ratio) served as your primary indicator of success?\n3. What specific failure modes or partition risks did you design against in your implementation?\n4. When would you deliberately sacrifice data consistency or freshness in favor of lower latency or higher availability?\n5. Walk through your strategy for zero-downtime migrations or model rollouts.`,
      },
      {
        title: `Implementation Exercise 1: Resilient Circuit Breaker with Exponential Jitter`,
        exerciseType: "CODING_CHALLENGE",
        content: `Implement a production-grade Circuit Breaker pattern with three states: CLOSED, OPEN, and HALF_OPEN.\n\nRequirements:\n- Track failure rate over a sliding window of 60 seconds.\n- Trip circuit if failure rate exceeds 25%.\n- After a 10-second cooldown, allow a canary probe in HALF_OPEN state.\n- Provide an exponential backoff retry wrapper with randomized full jitter.`,
      },
      {
        title: `Implementation Exercise 2: Quantitative Retrieval & Latency Benchmarking Harness`,
        exerciseType: "CODING_CHALLENGE",
        content: `Implement a lightweight benchmark runner that measures execution latency and error rates across 1,000 asynchronous concurrent requests.\n\nRequirements:\n- Output p50, p95, and p99 latency percentiles.\n- Calculate throughput (requests/second) under concurrency.\n- Detect and record timeout violations.\n- Generate a structured JSON performance report.`,
      },
      {
        title: `Mini System Design Problem: High-Throughput Notification Dispatcher`,
        exerciseType: "SYSTEM_DESIGN_CHALLENGE",
        content: `Design a multi-channel notification engine (Push, SMS, Email) handling 100,000 notifications/sec.\n\nKey Constraints:\n- Guaranteed deduplication within a 24-hour window.\n- Priority queuing (urgent transactional vs marketing bulk).\n- Rate limiting per provider API.\n- Multi-region disaster recovery.`,
      },
      {
        title: `Targeted Re-Interview Session: ${role} Focused Probe`,
        exerciseType: "RE_INTERVIEW",
        content: `A 20-minute follow-up session with a direct interviewer persona to specifically re-test: ${primaryGap}. Verification requires fresh conversational evidence: baseline benchmarks, explicit trade-offs, and personal ownership.`,
      },
    ];

    return {
      title: `Personalized Remediation Plan: ${primaryGap}`,
      summary: `Tailored curriculum addressing the performance gaps identified during your ${role} interview. Completing the 10-minute lesson, 5 questions, 2 implementation exercises, and mini design challenge prepares you for the targeted re-interview.`,
      targetGaps,
      exercises,
    };
  }
}
