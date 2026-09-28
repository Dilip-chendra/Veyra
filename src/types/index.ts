export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  orgId?: string | null;
}

export type InterviewType =
  | "TECHNICAL"
  | "CODING"
  | "BEHAVIORAL"
  | "HR"
  | "HIRING_MANAGER"
  | "PROJECT_DEFENSE"
  | "SYSTEM_DESIGN"
  | "PANEL"
  | "STRESS"
  | "CASE"
  | "EXECUTIVE";

export type InterviewerStyle =
  | "FRIENDLY"
  | "PROFESSIONAL"
  | "SKEPTICAL"
  | "DIRECT"
  | "EXECUTIVE"
  | "PANEL";

export type InterviewDifficulty = "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE";

export type InterviewStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type BehaviorState =
  | "INTRODUCING"
  | "LISTENING"
  | "THINKING"
  | "QUESTIONING"
  | "CLARIFYING"
  | "CHALLENGING"
  | "ENCOURAGING"
  | "INTERRUPTING"
  | "WAITING"
  | "TRANSITIONING"
  | "CODING"
  | "REVIEWING"
  | "CLOSING";

export type GazeTarget = "CANDIDATE" | "SCREEN" | "UP_THINKING" | "DOWN_REFLECTING";

export type Emotion =
  | "neutral"
  | "curious"
  | "attentive"
  | "skeptical"
  | "warm"
  | "thoughtful"
  | "encouraging";

export type GestureType =
  | "none"
  | "small_nod"
  | "deep_nod"
  | "head_tilt"
  | "open_hand"
  | "emphasis"
  | "questioning"
  | "pointing"
  | "posture_forward"
  | "posture_back";

export interface BehaviorMetadata {
  state: BehaviorState;
  emotion: Emotion;
  gaze: GazeTarget;
  gesture: GestureType;
  pace: "slow" | "medium" | "fast";
  pauseBeforeSpeechMs: number;
}

export interface CandidateClaimData {
  id?: string;
  claimText: string;
  domain: string;
  source: "RESUME" | "GITHUB" | "INTERVIEW_ANSWER";
  status:
    | "UNTESTED"
    | "VERIFIED"
    | "CHALLENGED"
    | "UNSUPPORTED"
    | "PROBED"
    | "SUPPORTED_BY_ANSWER"
    | "UNRESOLVED"
    | "CONTRADICTORY";
  evidenceNotes?: string;
}

export interface CandidateProfileData {
  targetRole: string;
  experienceLevel: string;
  preferredLanguage: string;
  technicalDomains: string[];
  interviewerStyle: InterviewerStyle;
  targetCompanies: string;
  interviewGoals: string;
  confidenceLevel: string;
  githubHandle?: string;
  linkedinUrl?: string;
}

export interface ParsedResume {
  experience: {
    title: string;
    company: string;
    duration: string;
    responsibilities: string[];
    achievements: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    metrics?: string;
  }[];
  technologies: string[];
  skills: string[];
  claims: string[];
  metrics: string[];
  rawText?: string;
}

export interface ParsedJobDescription {
  title: string;
  company: string;
  role: string;
  seniority: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  technicalCompetencies: string[];
  behavioralCompetencies: string[];
}

export interface GitHubAnalysis {
  owner: string;
  repoName: string;
  description: string;
  stars: number;
  languages: Record<string, number>;
  primaryLanguage: string;
  tree: { path: string; type: string; size?: number }[];
  readme: string;
  architectureSummary: string;
  dependencySummary: Record<string, string[]>;
  detectedFrameworks: string[];
  testSuitesFound: string[];
  defenseQuestions: string[];
}

export interface InterviewBlueprintStage {
  name: string;
  targetMinutes: number;
  objectives: string[];
  focusAreas: string[];
}

export interface InterviewBlueprint {
  title: string;
  role: string;
  durationMinutes: number;
  difficulty: InterviewDifficulty;
  style: InterviewerStyle;
  stages: InterviewBlueprintStage[];
  initialQuestion: string;
  expectedCompetencies: string[];
}

export interface TurnEvaluation {
  correctness: "clearly_correct" | "mostly_correct" | "incomplete" | "technically_arguable" | "incorrect";
  depth: "shallow" | "adequate" | "deep" | "exceptional";
  clarificationDetected: boolean;
  alternativeDesignArgued: boolean;
  claimsDetected: string[];
  evidenceExtracted: string[];
  unresolvedGaps: string[];
}

export interface InterviewTurnResponse {
  speaker: string; // Interviewer persona name (e.g. "Sarah (AI Interviewer)" or "Marcus (Staff ML Lead)")
  question: string;
  objective: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  followUpReason: string;
  expectedEvidence: string[];
  behavior: BehaviorMetadata;
  turnEvaluation?: TurnEvaluation;
  isStageTransition?: boolean;
  isComplete?: boolean;
  timeRemainingSeconds?: number;
}

export interface CodeRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  testResults?: {
    testName: string;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }[];
}

export interface WhiteboardNode {
  id: string;
  type: "client" | "gateway" | "service" | "database" | "cache" | "queue" | "load_balancer" | "storage";
  label: string;
  x: number;
  y: number;
  config?: Record<string, string>;
}

export interface WhiteboardEdge {
  id: string;
  source: string;
  target: string;
  protocol: "https" | "grpc" | "sql" | "pubsub" | "tcp";
  label?: string;
}

export interface WhiteboardGraph {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
}

export interface QuestionBreakdownItem {
  stage: string;
  question: string;
  answerSummary: string;
  verbatimQuote: string;
  demonstratedCompetency: string;
  gapsIdentified: string;
  recommendedPractice: string;
  turnPacingSeconds: number;
}

export interface InterviewReportData {
  overallSummary: string;
  confidenceScore: number;
  technicalEvidence: {
    competency: string;
    evidenceQuote: string;
    context: string;
  }[];
  gaps: {
    area: string;
    reason: string;
    impact: string;
  }[];
  communication: {
    clarity: string;
    structure: string; // e.g. STAR, top-down
    pacingNotes: string;
  };
  problemSolving: {
    tradeoffReasoning: string;
    edgeCaseHandling: string;
    algorithmicApproach: string;
  };
  projectDepth: {
    architecturalGrasp: string;
    implementationVerification: string;
  };
  behavioral: {
    ownership: string;
    conflictOrChallenge: string;
  };
  questionBreakdown: QuestionBreakdownItem[];
  recommendations: string[];
  methodology: string;
  limitations: string;
}

export interface TrainingExerciseData {
  title: string;
  exerciseType: "CONCEPT_LESSON" | "TARGETED_DRILL" | "CODING_CHALLENGE" | "SYSTEM_DESIGN_CHALLENGE" | "RE_INTERVIEW";
  content: string;
}

export interface TrainingPlanData {
  title: string;
  summary: string;
  targetGaps: string[];
  exercises: TrainingExerciseData[];
}
