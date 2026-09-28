import { test } from 'node:test';
import assert from 'node:assert';
import { CandidateProfileService } from '../src/lib/services/candidateProfileService.ts';
import { ProjectDefenseService } from '../src/lib/services/projectDefenseService.ts';
import { InterviewMemory } from '../src/lib/services/interviewMemory.ts';
import { InterviewPlanner } from '../src/lib/services/interviewPlanner.ts';
import { FollowUpEngine } from '../src/lib/services/followUpEngine.ts';
import { JobDescriptionService } from '../src/lib/services/jobDescriptionService.ts';
import { InterviewBrain } from '../src/lib/services/interviewBrain.ts';
import { TrainingEngine } from '../src/lib/services/trainingEngine.ts';

test('CandidateProfileService creates unified profile and computes JD gap map', () => {
  const profile = CandidateProfileService.buildUnifiedProfile(
    'Alex Turing',
    'AI Engineer',
    'Senior',
    {
      experience: [
        {
          title: 'Senior ML Engineer',
          company: 'Applied AI Corp',
          duration: '2023 - Present',
          responsibilities: ['Deployed production RAG pipelines'],
          achievements: ['Reduced vector search latency by 45%'],
        },
      ],
      education: [],
      projects: [],
      technologies: ['Python', 'PyTorch', 'FastAPI', 'Redis', 'Qdrant'],
      skills: ['RAG', 'Vector Search', 'LangChain'],
      claims: ['Reduced vector search latency by 45%', 'Built multi-agent retrieval system'],
      metrics: ['45%'],
    },
    {
      owner: 'alex-turing',
      repoName: 'rag-engine',
      description: 'Production RAG with hybrid search',
      stars: 120,
      languages: { Python: 95000 },
      primaryLanguage: 'Python',
      tree: [{ path: 'app/main.py', type: 'file' }, { path: 'app/auth.py', type: 'file' }],
      readme: '# RAG Engine',
      architectureSummary: 'FastAPI service with Qdrant vector store',
      dependencySummary: { pypi: ['fastapi', 'qdrant-client', 'torch'] },
      detectedFrameworks: ['FastAPI'],
      testSuitesFound: ['PyTest'],
      defenseQuestions: [],
    }
  );

  assert.strictEqual(profile.name, 'Alex Turing');
  assert.ok(profile.skills.some(s => s.name === 'FastAPI'));
  assert.ok(profile.skills.some(s => s.name === 'Python'));
  assert.strictEqual(profile.claims.length, 2);

  // Compute Gap Map with JD
  const parsedJD = JobDescriptionService.parseJobDescription(
    'Role: AI Engineer\nRequired Skills: Python, Docker, Kubernetes, RAG\nSeniority: Senior',
    'AI Engineer'
  );

  const gapMap = CandidateProfileService.computeGapMap(profile, parsedJD);
  assert.ok(gapMap.length > 0);

  const pythonGap = gapMap.find(g => g.requirement === 'Python');
  assert.ok(pythonGap);
  assert.strictEqual(pythonGap.status, 'Unverified'); // Claimed in profile, requires interview proof

  const k8sGap = gapMap.find(g => g.requirement === 'Kubernetes');
  assert.ok(k8sGap);
  assert.strictEqual(k8sGap.status, 'Needs practice'); // Not in candidate resume
});

test('ProjectDefenseService generates repo-grounded defense plan', () => {
  const plan = ProjectDefenseService.generateDefensePlan(
    'rag-engine',
    {
      owner: 'alex',
      repoName: 'rag-engine',
      description: 'Production RAG service',
      stars: 50,
      languages: { Python: 80000 },
      primaryLanguage: 'Python',
      tree: [
        { path: 'src/api/auth.py', type: 'file' },
        { path: 'src/api/routes.py', type: 'file' },
      ],
      readme: '# RAG Engine',
      architectureSummary: 'FastAPI microservice',
      dependencySummary: { pypi: ['fastapi', 'redis'] },
      detectedFrameworks: ['FastAPI', 'Redis'],
      testSuitesFound: ['pytest'],
      defenseQuestions: [],
    },
    ['FastAPI', 'Redis']
  );

  assert.strictEqual(plan.length, 6);
  assert.ok(plan.some(p => p.topic === 'framework_choice' && p.question.includes('FastAPI')));
  assert.ok(plan.some(p => p.topic === 'authentication'));
  assert.ok(plan.some(p => p.topic === 'failure_handling'));
  assert.ok(plan.some(p => p.topic === 'ownership'));
  assert.ok(plan.some(p => p.topic === 'scale_concurrency'));
});

test('InterviewMemory detects contradictions across conversational turns', () => {
  let memory = InterviewMemory.parseMemory();

  // Turn 1: Candidate mentions PostgreSQL
  const t1 = InterviewMemory.recordTurn(
    memory,
    1,
    60,
    'In our main architecture, we used PostgreSQL as our primary database for transactional user data.',
    'What database did you use?',
    'DEPTH'
  );
  memory = t1.updatedMemory;
  assert.strictEqual(t1.contradiction.detected, false);
  assert.ok(memory.technologies.some(t => t.technology === 'PostgreSQL'));

  // Turn 5: Candidate contradicts and says MongoDB was primary
  const t5 = InterviewMemory.recordTurn(
    memory,
    5,
    300,
    'Our primary database was MongoDB because of document flexibility.',
    'How do you manage schemas?',
    'TRADE_OFF'
  );

  assert.strictEqual(t5.contradiction.detected, true);
  assert.strictEqual(t5.contradiction.topic, 'primary_database');
  assert.ok(t5.contradiction.clarificationPrompt.includes('PostgreSQL'));
  assert.ok(t5.contradiction.clarificationPrompt.includes('MongoDB'));
});

test('InterviewMemory detects collective ownership phrasing and formats speech', () => {
  const probe = InterviewMemory.checkOwnershipProbeNeeded(
    'We built the entire distributed processing pipeline, and our team deployed the model.'
  );
  assert.strictEqual(probe.needsOwnershipProbe, true);
  assert.ok(probe.probeQuestion.includes('Which specific part of that system did you personally design'));

  // Formatting for speech
  const spoken = InterviewMemory.formatForSpeech(
    '### Question:\n* What is the time complexity? 🚀 Let\'s verify `O(n log n)`.'
  );
  assert.strictEqual(spoken.includes('###'), false);
  assert.strictEqual(spoken.includes('🚀'), false);
  assert.strictEqual(spoken.includes('`'), false);
  assert.strictEqual(spoken.includes('*'), false);
});

test('InterviewPlanner generates dynamic objectives and rebalances for remaining time', () => {
  const objectives = InterviewPlanner.generateInitialObjectives('Staff AI Engineer', [
    { requirement: 'Distributed Systems', category: 'ARCHITECTURE', candidateEvidence: '', status: 'Needs practice', probedInSession: false, notes: '' },
  ]);

  assert.ok(objectives.length >= 4);
  assert.ok(objectives.some(o => o.category === 'TECHNICAL_DEPTH'));
  assert.ok(objectives.some(o => o.category === 'SYSTEM_DESIGN'));

  // Rebalance when 95% time has elapsed (emergency closing transition)
  const decision = InterviewPlanner.planNextMove(
    objectives,
    0,
    { depth: 'shallow', correctness: 'incomplete', clarificationDetected: false, alternativeDesignArgued: false, claimsDetected: [], evidenceExtracted: [], unresolvedGaps: [] },
    60, // 60s remaining out of 1800s
    1800,
    'ADAPTIVE',
    'PROFESSIONAL'
  );

  assert.strictEqual(decision.nextObjective.category, 'CLOSING');
});

test('FollowUpEngine covers 10 specialized categories', () => {
  // 1. Clarification
  const clarEval = FollowUpEngine.evaluateAnswer('Design a rate limiter', 'Before I answer, what is the throughput and scale we need to support?');
  const clarFollowUp = FollowUpEngine.generateFollowUp('Design a rate limiter', 'Before I answer, what is the throughput?', clarEval);
  assert.strictEqual(clarFollowUp.category, 'CLARIFICATION');

  // 2. Trade-off (Alternative design)
  const altEval = FollowUpEngine.evaluateAnswer('Why Redis?', 'Instead of Redis, I would actually prefer SQLite with WAL mode for zero network hops.');
  const altFollowUp = FollowUpEngine.generateFollowUp('Why Redis?', 'Instead of Redis...', altEval);
  assert.strictEqual(altFollowUp.category, 'TRADE_OFF');

  // 3. Depth (Shallow answer)
  const shallowEval = FollowUpEngine.evaluateAnswer('How does authentication work?', 'We used JWT tokens.');
  const shallowFollowUp = FollowUpEngine.generateFollowUp('How does auth work?', 'We used JWT tokens.', shallowEval);
  assert.strictEqual(shallowFollowUp.category, 'DEPTH');

  // 4. Evidence (RAG / Embeddings)
  const ragEval = FollowUpEngine.evaluateAnswer('Tell me about your AI project.', 'I built a production RAG retrieval pipeline with semantic search.');
  const ragFollowUp = FollowUpEngine.generateFollowUp('Tell me about AI', 'I built a production RAG pipeline...', ragEval);
  assert.strictEqual(ragFollowUp.category, 'EVIDENCE');

  // 5. Scale (Deep explanation)
  const deepEval = FollowUpEngine.evaluateAnswer('Explain partition strategy', 'We partitioned the database using consistent hashing with virtual nodes because it guarantees uniform distribution and minimizes reshuffling when nodes join or leave the cluster.');
  const scaleFollowUp = FollowUpEngine.generateFollowUp('Explain partition', '...', deepEval);
  assert.strictEqual(scaleFollowUp.category, 'SCALE');
});

test('InterviewBrain natural multi-turn dialogue progression (Redis -> API responses -> I don\'t know)', () => {
  const baseContext = {
    interviewId: 'test_dialogue_1',
    role: 'Backend Engineer',
    interviewType: 'TECHNICAL',
    durationMinutes: 30,
    elapsedSeconds: 200,
    currentStageIndex: 1,
    stages: [],
    candidateClaims: [],
    history: [],
    style: 'PROFESSIONAL',
    difficulty: 'ADAPTIVE',
    interviewerName: 'Marcus Vance',
  };

  // Turn 1: Candidate says "I used Redis."
  const turn1 = InterviewBrain.processCandidateTurn('I used Redis.', baseContext);
  assert.strictEqual(turn1.question, 'Okay. What exactly were you caching?');

  // Turn 2: Candidate says "API responses."
  const context2 = {
    ...baseContext,
    elapsedSeconds: 250,
    history: [
      { role: 'interviewer', text: 'Okay. What exactly were you caching?' },
    ],
  };
  const turn2 = InterviewBrain.processCandidateTurn('API responses.', context2);
  assert.strictEqual(turn2.question, 'What made caching those responses safe in your case?');

  // Turn 3: Candidate says "I don't know."
  const context3 = {
    ...baseContext,
    elapsedSeconds: 300,
    history: [
      { role: 'interviewer', text: 'What made caching those responses safe in your case?' },
    ],
  };
  const turn3 = InterviewBrain.processCandidateTurn("I don't know.", context3);
  assert.ok(turn3.question.includes('What could go wrong if the cached value becomes stale?'));
});

test('InterviewBrain candidate question handling (clarification, repeat, pause)', () => {
  const baseContext = {
    interviewId: 'test_questions_1',
    role: 'System Architect',
    interviewType: 'SYSTEM_DESIGN',
    durationMinutes: 30,
    elapsedSeconds: 300,
    currentStageIndex: 1,
    stages: [],
    candidateClaims: [],
    history: [
      { role: 'interviewer', text: 'How would you partition the user feed database?' },
    ],
    style: 'PROFESSIONAL',
    difficulty: 'ADAPTIVE',
    interviewerName: 'Elena Rostova',
  };

  // 1. Clarification request
  const clarTurn = InterviewBrain.processCandidateTurn('Can I clarify the requirement?', baseContext);
  assert.ok(clarTurn.question.includes('ten million daily users'));

  // 2. Repeat request
  const repTurn = InterviewBrain.processCandidateTurn('Could you repeat the question?', baseContext);
  assert.ok(repTurn.question.includes('How would you partition the user feed database?'));

  // 3. Pause request
  const pauseTurn = InterviewBrain.processCandidateTurn('Give me a moment to think.', baseContext);
  assert.ok(pauseTurn.question.includes('Take your time'));
  assert.strictEqual(pauseTurn.behavior.state, 'WAITING');
});

test('InterviewMemory 3-step ownership sequence', () => {
  // Step 0 -> Step 1
  const step0 = InterviewMemory.checkOwnershipProbeNeeded('We built a real-time event pipeline.', 0);
  assert.strictEqual(step0.needsOwnershipProbe, true);
  assert.ok(step0.probeQuestion.includes('Which specific part of that system did you personally design and implement?'));
  assert.strictEqual(step0.nextStage, 1);

  // Step 1 -> Step 2
  const step1 = InterviewMemory.checkOwnershipProbeNeeded('I implemented the Kafka producer and partitioner.', 1);
  assert.strictEqual(step1.needsOwnershipProbe, true);
  assert.strictEqual(step1.probeQuestion, 'What was the hardest part of your contribution?');
  assert.strictEqual(step1.nextStage, 2);

  // Step 2 -> Step 3
  const step2 = InterviewMemory.checkOwnershipProbeNeeded('Handling schema evolution without breaking downstream consumers.', 2);
  assert.strictEqual(step2.needsOwnershipProbe, true);
  assert.strictEqual(step2.probeQuestion, 'Why did you implement it that way?');
  assert.strictEqual(step2.nextStage, 3);
});

test('InterviewMemory 3-step claim verification sequence', () => {
  const claim = { claimText: 'Reduced latency by 40%', domain: 'Performance', source: 'RESUME', status: 'UNTESTED' };

  // Step 0
  const probe0 = InterviewMemory.checkClaimProbeNeeded(claim, 0);
  assert.strictEqual(probe0.probeQuestion, 'How did you measure that 40%?');
  assert.strictEqual(probe0.nextStage, 1);
  assert.strictEqual(probe0.updatedStatus, 'PROBED');

  // Step 1
  const probe1 = InterviewMemory.checkClaimProbeNeeded(claim, 1);
  assert.strictEqual(probe1.probeQuestion, 'What was your baseline?');
  assert.strictEqual(probe1.nextStage, 2);

  // Step 2
  const probe2 = InterviewMemory.checkClaimProbeNeeded(claim, 2);
  assert.strictEqual(probe2.probeQuestion, 'What optimization made the biggest difference?');
  assert.strictEqual(probe2.nextStage, 3);
  assert.strictEqual(probe2.updatedStatus, 'SUPPORTED_BY_ANSWER');
});

test('InterviewBrain whiteboard & coding integration', () => {
  const baseContext = {
    interviewId: 'test_integration_1',
    role: 'Fullstack Engineer',
    interviewType: 'SYSTEM_DESIGN',
    durationMinutes: 30,
    elapsedSeconds: 400,
    currentStageIndex: 1,
    stages: [],
    candidateClaims: [],
    history: [],
    style: 'PROFESSIONAL',
    difficulty: 'ADAPTIVE',
    whiteboardState: {
      nodes: [{ id: 'n1', label: 'Redis Cache', type: 'cache' }],
      connections: [],
    },
  };

  const wbTurn = InterviewBrain.processCandidateTurn('I have drawn the high-level architecture.', baseContext);
  assert.ok(wbTurn.question.includes('What problem is it solving?'));

  // Coding complexity follow-up
  const codingContext = {
    ...baseContext,
    whiteboardState: null,
    interviewType: 'CODING',
    codeState: {
      code: 'function twoSum(nums, target) { return []; }',
      language: 'javascript',
      hasErrors: false,
    },
  };
  const codingTurn = InterviewBrain.processCandidateTurn('Here is my implementation.', codingContext);
  assert.ok(codingTurn.question.includes('What is the time complexity'));
});

test('InterviewPlanner spoken stage transitions', () => {
  const t1 = InterviewPlanner.getSpokenTransition('PROJECT', 'SYSTEM_DESIGN');
  assert.ok(t1.includes("We've covered your project. I'd like to move into a system-design scenario now."));

  const t2 = InterviewPlanner.getSpokenTransition('TECHNICAL', 'CODING');
  assert.ok(t2.includes('switch over to the code editor'));

  const t3 = InterviewPlanner.getSpokenTransition('BEHAVIORAL', 'CLOSING');
  assert.ok(t3.includes('Before we wrap up, what questions do you have for me'));
});

test('TrainingEngine generates 5 structured remediation components', () => {
  const plan = TrainingEngine.generateTrainingPlan('AI Engineer', [
    { area: 'RAG evaluation', reason: 'Candidate did not cite retrieval evaluation metrics' },
  ]);

  assert.strictEqual(plan.exercises.length, 6); // 1 lesson, 5 questions drill, 2 code exercises, 1 design challenge, 1 re-interview
  assert.ok(plan.exercises.some(e => e.exerciseType === 'CONCEPT_LESSON'));
  assert.ok(plan.exercises.some(e => e.exerciseType === 'TARGETED_DRILL'));
  assert.ok(plan.exercises.filter(e => e.exerciseType === 'CODING_CHALLENGE').length === 2);
  assert.ok(plan.exercises.some(e => e.exerciseType === 'SYSTEM_DESIGN_CHALLENGE'));
  assert.ok(plan.exercises.some(e => e.exerciseType === 'RE_INTERVIEW'));
});

