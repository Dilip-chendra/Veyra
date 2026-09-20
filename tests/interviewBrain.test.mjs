import test from "node:test";
import assert from "node:assert/strict";
import { InterviewBrain } from "../src/lib/services/interviewBrain.ts";
import { BehaviorController } from "../src/lib/services/behaviorController.ts";

test("InterviewBrain handles normal candidate answer with adaptive question", () => {
  const context = {
    interviewId: "test_int_1",
    role: "Senior Distributed Systems Engineer",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 300,
    currentStageIndex: 1,
    stages: [
      { name: "Intro", targetMinutes: 5, objectives: [] },
      { name: "Technical Core", targetMinutes: 15, objectives: [] },
      { name: "Closing", targetMinutes: 10, objectives: [] },
    ],
    candidateClaims: [],
    history: [
      {
        role: "interviewer",
        speaker: "Interviewer",
        text: "How did you design your caching layer?",
        timestampSeconds: 280,
      },
    ],
    style: "PROFESSIONAL",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn(
    "We used Redis in a cache-aside pattern to reduce database read pressure because our read-to-write ratio was roughly 20:1.",
    context
  );

  assert.ok(response.question.length > 10, "Question should be non-empty");
  assert.ok(response.behavior, "Behavior metadata should be present");
  assert.equal(typeof response.behavior.state, "string");
  assert.ok(response.expectedEvidence.length > 0, "Expected evidence should be provided");
});

test("InterviewBrain triggers interruption on overly lengthy narrative", () => {
  const longAnswer = "We started with a monolith architecture. ".repeat(50); // > 250 words
  const context = {
    interviewId: "test_int_2",
    role: "Software Engineer",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 400,
    currentStageIndex: 0,
    stages: [
      { name: "Intro", targetMinutes: 5, objectives: [] },
      { name: "Technical", targetMinutes: 20, objectives: [] },
      { name: "Closing", targetMinutes: 5, objectives: [] },
    ],
    candidateClaims: [],
    history: [],
    style: "DIRECT",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn(longAnswer, context);
  assert.equal(response.behavior.state, "INTERRUPTING", "Should trigger INTERRUPTING state on long speech");
  assert.ok(response.followUpReason.includes("lengthy narrative"), "Should note lengthy narrative reason");
});

test("InterviewBrain gracefully transitions to closing when time is almost exhausted", () => {
  const context = {
    interviewId: "test_int_3",
    role: "Software Engineer",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 1750, // < 2 minutes left out of 30 min (1800s)
    currentStageIndex: 1,
    stages: [{ name: "Technical", targetMinutes: 30, objectives: [] }],
    candidateClaims: [],
    history: [],
    style: "PROFESSIONAL",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn("Yes, that was our approach.", context);
  assert.equal(response.behavior.state, "CLOSING", "Should transition to CLOSING when out of time");
  assert.ok(response.question.includes("wrap up") || response.question.includes("questions for me"));
});

test("InterviewBrain probes depth on very short answer instead of ending", () => {
  const context = {
    interviewId: "test_int_4",
    role: "Backend Engineer",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 200,
    currentStageIndex: 0,
    stages: [{ name: "Technical", targetMinutes: 30, objectives: [] }],
    candidateClaims: [],
    history: [],
    style: "PROFESSIONAL",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn("I used Python.", context);
  assert.notEqual(response.isComplete, true, "Interview must not end on short answer");
  assert.ok(response.question.toLowerCase().includes("unpack") || response.question.toLowerCase().includes("specifically"), "Should ask to unpack or specify");
});

test("InterviewBrain pivots gracefully to first principles when candidate says 'I don't know'", () => {
  const context = {
    interviewId: "test_int_5",
    role: "ML Engineer",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 250,
    currentStageIndex: 0,
    stages: [{ name: "Technical", targetMinutes: 30, objectives: [] }],
    candidateClaims: [],
    history: [],
    style: "PROFESSIONAL",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn("I don't know.", context);
  assert.notEqual(response.isComplete, true, "Interview must not end on 'I don't know'");
  assert.equal(response.behavior.state, "ENCOURAGING", "Should be encouraging");
  assert.ok(response.question.includes("first principles"), "Should pivot to first principles");
});

test("InterviewBrain evaluates architectural trade-offs when candidate disagrees", () => {
  const context = {
    interviewId: "test_int_6",
    role: "Principal Architect",
    interviewType: "TECHNICAL",
    durationMinutes: 30,
    elapsedSeconds: 350,
    currentStageIndex: 0,
    stages: [{ name: "Technical", targetMinutes: 30, objectives: [] }],
    candidateClaims: [],
    history: [],
    style: "PROFESSIONAL",
    difficulty: "ADAPTIVE",
  };

  const response = InterviewBrain.processCandidateTurn("I would actually choose PostgreSQL instead of MongoDB here.", context);
  assert.notEqual(response.isComplete, true, "Interview must not end on disagreement");
  assert.equal(response.behavior.state, "CHALLENGING", "Should engage challenging state");
  assert.ok(response.question.toLowerCase().includes("trade-offs"), "Should ask for trade-offs");
});
