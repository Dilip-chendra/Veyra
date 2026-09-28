import type { GitHubAnalysis } from "../../types/index.ts";

export interface ProjectDefenseItem {
  id: string;
  topic: "framework_choice" | "authentication" | "failure_handling" | "codebase_location" | "scale_concurrency" | "ownership" | "testing";
  question: string;
  reason: string;
  expectedEvidence: string[];
  targetedFileOrConcept: string;
}

export class ProjectDefenseService {
  /**
   * Generates a targeted, repo-grounded Project Defense plan from real GitHub analysis or project metadata.
   */
  public static generateDefensePlan(
    projectName: string,
    analysis?: GitHubAnalysis | null,
    techStack: string[] = []
  ): ProjectDefenseItem[] {
    const items: ProjectDefenseItem[] = [];
    const frameworks = analysis?.detectedFrameworks || techStack;
    const tree = analysis?.tree || [];
    const lang = analysis?.primaryLanguage || "TypeScript";

    // 1. Framework / Architectural Choice Defense
    const primaryFramework = frameworks[0] || (lang === "Python" ? "FastAPI" : "Express");
    items.push({
      id: "defense_framework_choice",
      topic: "framework_choice",
      question: `I see that your project uses ${primaryFramework}. Why did you choose it over other alternatives, and what trade-offs did that introduce?`,
      reason: `Verify candidate's rationale for selecting ${primaryFramework} rather than defaulting without architectural evaluation`,
      expectedEvidence: [
        "Deliberate technical justification",
        "Comparison against competing frameworks",
        "Awareness of framework strengths and limitations",
      ],
      targetedFileOrConcept: primaryFramework,
    });

    // 2. Authentication & Security
    const hasAuthFiles = tree.some(f => /auth|login|session|jwt|token|guard/i.test(f.path));
    const authTarget = hasAuthFiles ? "the authentication modules in your repository" : "your user security model";
    items.push({
      id: "defense_authentication",
      topic: "authentication",
      question: `How does authentication and authorization work in your implementation? Walk me through the security token lifecycle from login to request validation.`,
      reason: "Evaluate real-world security implementation depth and vulnerability mitigation",
      expectedEvidence: [
        "Token generation and signing mechanics (JWT / session)",
        "Protection against CSRF / XSS / token leakage",
        "Role-based access control or permission verification",
      ],
      targetedFileOrConcept: authTarget,
    });

    // 3. Failure Modes & Provider Resilience
    const dbOrCache = frameworks.find(f => /prisma|postgres|redis|mongo|mysql|sql/i.test(f)) || "your persistent data store";
    items.push({
      id: "defense_failure_handling",
      topic: "failure_handling",
      question: `What happens if ${dbOrCache} or an upstream service becomes unavailable or throws continuous timeouts? How does your application recover or degrade gracefully?`,
      reason: "Probe production resilience, circuit breaking, and exception handling",
      expectedEvidence: [
        "Graceful degradation or fallback behavior",
        "Retry logic with backoff or circuit breaking",
        "Error logging and transaction isolation",
      ],
      targetedFileOrConcept: String(dbOrCache),
    });

    // 4. Codebase Navigation & Architecture Location
    const apiFile = tree.find(f => /api|router|controller|handler|endpoint/i.test(f.path))?.path || "the main router / API gateway";
    items.push({
      id: "defense_codebase_location",
      topic: "codebase_location",
      question: `Where in the codebase is the request processing and business logic decoupled, and how did you organize your modules to maintain separation of concerns?`,
      reason: "Confirm candidate possesses intimate structural familiarity with their own repository",
      expectedEvidence: [
        "Concrete file path or module naming",
        "Clear explanation of business logic vs transport layer separation",
        "Modular decoupling",
      ],
      targetedFileOrConcept: apiFile,
    });

    // 5. Personal Ownership & Hardest Contribution
    items.push({
      id: "defense_ownership",
      topic: "ownership",
      question: `Which specific component or subsystem of ${projectName} did you personally design and implement, and what was the single hardest bug or edge case you had to solve?`,
      reason: "Distinguish personal hands-on contribution from boilerplate, team effort, or generated scaffolds",
      expectedEvidence: [
        "Explicit personal ownership boundary",
        "Detailed debugging narrative with root cause analysis",
        "Measurable resolution",
      ],
      targetedFileOrConcept: "Personal contribution boundary",
    });

    // 6. Scale & High-Concurrency Dynamics
    items.push({
      id: "defense_scale_concurrency",
      topic: "scale_concurrency",
      question: `If traffic to ${projectName} suddenly increased tenfold tomorrow, where would the system break first, and what concrete architectural changes would you make to handle that load?`,
      reason: "Test architectural intuition and capacity planning under extreme workload constraints",
      expectedEvidence: [
        "Accurate bottleneck identification (database I/O, event loop, connection pool)",
        "Horizontal scaling or asynchronous worker strategies",
        "Caching and partition methodology",
      ],
      targetedFileOrConcept: "Concurrency and throughput bottlenecks",
    });

    return items;
  }
}
