import type { TurnEvaluation, InterviewDifficulty, InterviewerStyle } from "../../types/index.ts";

export class FollowUpEngine {
  public static evaluateAnswer(
    question: string,
    answer: string,
    history: { question: string; answer: string }[] = []
  ): TurnEvaluation {
    const trimmed = answer.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const lower = trimmed.toLowerCase();

    // Detect candidate asking for clarification
    const clarificationDetected = /^(before I answer|could you clarify|are we assuming|what is the (scale|throughput|latency)|is this (read|write) heavy|do we need to support)/i.test(trimmed) ||
      trimmed.includes("?") && wordCount < 30;

    // Detect candidate proposing an alternative design
    const alternativeDesignArgued = /instead of|i would (actually )?(choose|recommend|opt for|prefer)|trade-off|alternative|i disagree with/i.test(trimmed);

    // Claims detected
    const claimsDetected: string[] = [];
    const claimMatches = trimmed.match(/(?:built|implemented|reduced|scaled|deployed|architected|used)\s+[^.!?]{10,80}/gi);
    if (claimMatches) {
      claimsDetected.push(...claimMatches.map(c => c.trim()).slice(0, 3));
    }

    // Depth assessment
    let depth: TurnEvaluation["depth"] = "adequate";
    if (wordCount < 18 && !clarificationDetected) {
      depth = "shallow";
    } else if (wordCount > 100 && (lower.includes("because") || lower.includes("trade-off") || lower.includes("specifically"))) {
      depth = "deep";
    } else if (wordCount > 180 && lower.includes("for example") && lower.includes("limitation")) {
      depth = "exceptional";
    }

    // Correctness assessment
    let correctness: TurnEvaluation["correctness"] = "mostly_correct";
    if (clarificationDetected || alternativeDesignArgued) {
      correctness = "technically_arguable";
    } else if (depth === "shallow" && !lower.includes("depends")) {
      correctness = "incomplete";
    } else if (depth === "deep" || depth === "exceptional") {
      correctness = "clearly_correct";
    }

    // Evidence extracted
    const evidenceExtracted: string[] = [];
    if (lower.includes("latency") || lower.includes("ms") || lower.includes("seconds")) {
      evidenceExtracted.push("Demonstrated latency awareness");
    }
    if (lower.includes("cache") || lower.includes("redis") || lower.includes("memcached")) {
      evidenceExtracted.push("Applied caching layer strategy");
    }
    if (lower.includes("index") || lower.includes("b-tree") || lower.includes("partition")) {
      evidenceExtracted.push("Database indexing and storage mechanics");
    }
    if (lower.includes("test") || lower.includes("mock") || lower.includes("benchmark")) {
      evidenceExtracted.push("Verification & testing methodology");
    }

    // Unresolved gaps
    const unresolvedGaps: string[] = [];
    if (!lower.includes("failure") && !lower.includes("error") && !lower.includes("fallback") && wordCount > 40) {
      unresolvedGaps.push("Failure modes & disaster recovery unaddressed");
    }
    if (!lower.includes("metric") && !lower.includes("monitor") && !lower.includes("alert") && wordCount > 50) {
      unresolvedGaps.push("Observability and evaluation criteria not specified");
    }

    return {
      correctness,
      depth,
      clarificationDetected,
      alternativeDesignArgued,
      claimsDetected,
      evidenceExtracted,
      unresolvedGaps,
    };
  }

  public static generateFollowUp(
    question: string,
    answer: string,
    evaluation: TurnEvaluation,
    difficulty: InterviewDifficulty = "ADAPTIVE",
    style: InterviewerStyle = "PROFESSIONAL",
    priorClaims: string[] = []
  ): {
    followUpQuestion: string;
    objective: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    followUpReason: string;
    expectedEvidence: string[];
    isChallenging: boolean;
  } {
    const trimmed = answer.trim();
    const lower = trimmed.toLowerCase();

    // 1. Candidate asked a legitimate clarification
    if (evaluation.clarificationDetected) {
      return {
        followUpQuestion: "Good question to clarify. Assume a write-heavy workload with approximately 50,000 requests per second at peak, with p99 latency target under 50 milliseconds. With those constraints, how does that shape your architectural choice?",
        objective: "clarification_response_and_constraint_handling",
        difficulty: "MEDIUM",
        followUpReason: "Candidate correctly asked for architectural constraints before answering",
        expectedEvidence: ["Constraint acknowledgment", "Targeted architecture", "Throughput estimation"],
        isChallenging: false,
      };
    }

    // 2. Candidate proposed an alternative design or challenged interviewer assumption
    if (evaluation.alternativeDesignArgued) {
      return {
        followUpQuestion: "Fair point — challenging standard assumptions is sound engineering. Walk me through the specific trade-offs: what makes your proposed approach preferable here, and under what conditions does it break down?",
        objective: "evaluate_tradeoff_defense",
        difficulty: "HARD",
        followUpReason: "Candidate argued an alternative design; testing technical depth and boundary conditions",
        expectedEvidence: ["Trade-off analysis", "Failure threshold", "Cost vs complexity"],
        isChallenging: true,
      };
    }

    // 3. Candidate gave a shallow or hand-wavy answer
    if (evaluation.depth === "shallow") {
      return {
        followUpQuestion: `You touched on the high-level concept, but let's go a layer deeper. Walk me through the exact implementation mechanics: what happens under the hood when that executes?`,
        objective: "probe_implementation_depth",
        difficulty: "MEDIUM",
        followUpReason: "Candidate provided high-level overview without concrete implementation mechanics",
        expectedEvidence: ["Low-level mechanics", "Data flow", "Error handling"],
        isChallenging: true,
      };
    }

    // 4. Probe prior claims if mentioned (e.g. latency, scale, RAG, caching)
    if (lower.includes("rag") || lower.includes("retrieval")) {
      return {
        followUpQuestion: "In your retrieval pipeline, how do you measure retrieval quality? What embedding model did you evaluate, and how do you prevent hallucinations or stale chunk contamination?",
        objective: "test_rag_evaluation_and_chunking",
        difficulty: "HARD",
        followUpReason: "Candidate discussed RAG retrieval; probing evaluation and failure prevention",
        expectedEvidence: ["Hit rate / MRR metrics", "Chunking strategy", "Reranking"],
        isChallenging: true,
      };
    }

    if (lower.includes("redis") || lower.includes("cache")) {
      return {
        followUpQuestion: "When relying on Redis as a cache, how do you mitigate cache stampede (thundering herd) and ensure data consistency during database updates?",
        objective: "test_caching_concurrency_and_invalidation",
        difficulty: "HARD",
        followUpReason: "Candidate introduced caching layer; testing concurrency and invalidation",
        expectedEvidence: ["Mutual exclusion locks / probabilistic early expiration", "Write-through vs Cache-aside consistency"],
        isChallenging: true,
      };
    }

    if (lower.includes("kafka") || lower.includes("queue") || lower.includes("event")) {
      return {
        followUpQuestion: "With an asynchronous event queue, how do you guarantee idempotent processing and handle poison pill messages that repeatedly fail consumer processing?",
        objective: "test_event_driven_resilience",
        difficulty: "HARD",
        followUpReason: "Candidate utilized event queue; probing idempotency and dead-letter queue mechanics",
        expectedEvidence: ["Idempotency keys", "Dead letter queue (DLQ)", "At-least-once delivery handling"],
        isChallenging: true,
      };
    }

    // 5. If strong and deep, increase complexity with extreme scaling constraint
    if (evaluation.depth === "deep" || evaluation.depth === "exceptional") {
      const topic = extractCoreTopic(trimmed);
      return {
        followUpQuestion: `Strong explanation. Now let's stress-test that: suppose your ${topic} scales by 10x overnight and your primary database region suffers a complete network partition. How does your system respond, and what specific degradation or fallback behavior does the user see?`,
        objective: "stress_test_extreme_scale_and_partition",
        difficulty: "HARD",
        followUpReason: "Candidate demonstrated solid baseline competency; introducing advanced distributed failure scenario",
        expectedEvidence: ["CAP theorem trade-offs", "Failover automation", "Graceful degradation"],
        isChallenging: true,
      };
    }

    // Default adaptive follow-up — extract meaningful topic from answer
    const topic = extractCoreTopic(trimmed);
    const specificDetail = extractSpecificDetail(trimmed);

    return {
      followUpQuestion: specificDetail
        ? `You mentioned ${specificDetail} — what failure modes have you encountered with that in production, and how did your monitoring detect them before users were impacted?`
        : `What were the most significant production failure modes you observed with ${topic}, and how did your alerting or tracing identify them before they escalated?`,
      objective: "probe_production_resilience",
      difficulty: "MEDIUM",
      followUpReason: "Testing production operational readiness and observability based on candidate's specific answer",
      expectedEvidence: ["Monitoring metrics", "Alert thresholds", "Post-mortem insight"],
      isChallenging: false,
    };
  }
}

/**
 * Extracts the dominant technical topic from a candidate answer for contextual follow-up
 */
function extractCoreTopic(answer: string): string {
  const lower = answer.toLowerCase();
  const topics: [RegExp, string][] = [
    [/microservice|service mesh|istio|envoy/i, "microservices architecture"],
    [/kubernetes|k8s|helm|pod|deployment/i, "Kubernetes cluster"],
    [/docker|container|image|registry/i, "containerized deployment"],
    [/database|postgres|mysql|sql|mongo/i, "database layer"],
    [/api|rest|graphql|grpc|endpoint/i, "API layer"],
    [/auth|oauth|jwt|session|token/i, "authentication system"],
    [/ci\/?cd|pipeline|jenkins|github action|deploy/i, "deployment pipeline"],
    [/machine learning|ml|model|inference|training/i, "ML inference pipeline"],
    [/search|elastic|solr|opensearch/i, "search infrastructure"],
    [/message|pubsub|sns|sqs|rabbitmq/i, "message queue"],
    [/storage|s3|blob|gcs|file/i, "storage layer"],
    [/frontend|react|next|angular|vue/i, "frontend application"],
  ];

  for (const [pattern, label] of topics) {
    if (pattern.test(lower)) return label;
  }

  // Extract the first noun-like phrase from the answer as fallback
  const words = answer.trim().split(/\s+/).slice(0, 8).join(" ");
  return `the approach you described (${words}...)`;
}

/**
 * Extracts a specific detail the candidate mentioned (tech name, metric, method name)
 */
function extractSpecificDetail(answer: string): string | null {
  // Extract technology names, metrics, or specific methods mentioned
  const techMatch = answer.match(/\b(Redis|Kafka|Postgres|MySQL|MongoDB|DynamoDB|Cassandra|Elasticsearch|Nginx|HAProxy|gRPC|GraphQL|Terraform|Pulumi|Prometheus|Grafana|Datadog|PagerDuty|Sentry|OpenTelemetry|RabbitMQ|Celery|Airflow|dbt|Spark|Flink|Hadoop)\b/);
  if (techMatch) return techMatch[1];

  // Extract metric patterns like "99th percentile", "50ms latency", "10k RPS"
  const metricMatch = answer.match(/\b(\d+(?:\.\d+)?(?:ms|s|%|k|M|GB|TB|RPS|QPS|TPS|rpm))\b/);
  if (metricMatch) return `the ${metricMatch[1]} metric you cited`;

  return null;
}
