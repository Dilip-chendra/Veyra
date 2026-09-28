import { db } from '../src/lib/db.ts';
import { InterviewBrain } from '../src/lib/services/interviewBrain.ts';

async function testTurnIntelligence() {
  console.log('Testing InterviewBrain turn intelligence and continuation behavior...');

  // Mock interview context for Senior Backend Engineer
  const baseContext = {
    role: 'Senior Backend Engineer',
    style: 'PROFESSIONAL',
    difficulty: 'ADAPTIVE',
    timeRemainingSeconds: 1500,
    totalDurationSeconds: 1800,
    currentStage: {
      id: 'stg-1',
      name: 'Architecture & System Design',
      order: 1,
      targetMinutes: 15,
      status: 'ACTIVE'
    },
    stages: [],
    history: [
      {
        question: "Walk me through the most technically challenging project you've led recently.",
        answer: "I led the migration of our monolith to microservices.",
        timestampSeconds: 30
      }
    ],
    candidateClaims: [],
    weakAreas: [],
    demonstratedCompetencies: []
  };

  const testCases = [
    {
      label: 'Deep Technical Answer (Redis & 40% latency)',
      answer: 'I deployed a Redis caching layer with write-through invalidation to reduce query latency by 40 percent.',
      check: (res) => {
        console.log('Follow-up:', res.question);
        if (res.isComplete) throw new Error('Should not complete');
        if (!res.question.toLowerCase().includes('redis') && !res.question.toLowerCase().includes('cache') && !res.question.toLowerCase().includes('latency') && !res.question.toLowerCase().includes('invalidation')) {
          console.warn('Warning: Question did not reference Redis/cache directly, but question is:', res.question);
        }
      }
    },
    {
      label: 'Short Answer ("Python.")',
      answer: 'Python.',
      check: (res) => {
        console.log('Follow-up for "Python.":', res.question);
        if (res.isComplete) throw new Error('Interview should not complete on short answer');
        if (!res.question.toLowerCase().includes('unpack') && !res.question.toLowerCase().includes('specifically')) {
          throw new Error('Should prompt candidate to unpack short answer');
        }
      }
    },
    {
      label: 'One-word affirmative ("Yes.")',
      answer: 'Yes.',
      check: (res) => {
        console.log('Follow-up for "Yes.":', res.question);
        if (res.isComplete) throw new Error('Interview should not complete on "Yes."');
      }
    },
    {
      label: 'Uncertainty ("I don\'t know.")',
      answer: "I don't know.",
      check: (res) => {
        console.log('Follow-up for "I don\'t know.":', res.question);
        if (res.isComplete) throw new Error('Interview should not complete on "I don\'t know."');
        if (!res.question.toLowerCase().includes('first principles') && !res.question.toLowerCase().includes('fine')) {
          throw new Error('Should provide encouraging first-principles prompt');
        }
      }
    },
    {
      label: 'Disagreement ("I would choose PostgreSQL instead.")',
      answer: 'I would choose PostgreSQL instead because of strict ACID compliance and JSONB indexing.',
      check: (res) => {
        console.log('Follow-up for PostgreSQL choice:', res.question);
        if (res.isComplete) throw new Error('Interview should not complete');
      }
    }
  ];

  for (const tc of testCases) {
    console.log(`\n--- Test Case: ${tc.label} ---`);
    console.log(`Candidate Answer: "${tc.answer}"`);
    const res = InterviewBrain.processCandidateTurn(tc.answer, baseContext);
    tc.check(res);
    console.log(`PASS: ${tc.label} (isComplete: ${res.isComplete})`);
  }

  console.log('\nAll turn test cases passed successfully!');
}

testTurnIntelligence().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
