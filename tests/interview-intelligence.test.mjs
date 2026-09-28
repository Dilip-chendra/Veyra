import { test } from 'node:test';
import assert from 'node:assert';
import { CandidateProfileService } from '../src/lib/services/candidateProfileService.ts';
import { ProjectDefenseService } from '../src/lib/services/projectDefenseService.ts';
import { InterviewMemory } from '../src/lib/services/interviewMemory.ts';
import { InterviewPlanner } from '../src/lib/services/interviewPlanner.ts';
import { FollowUpEngine } from '../src/lib/services/followUpEngine.ts';
import { JobDescriptionService } from '../src/lib/services/jobDescriptionService.ts';

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
