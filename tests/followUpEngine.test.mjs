import test from "node:test";
import assert from "node:assert/strict";
import { FollowUpEngine } from "../src/lib/services/followUpEngine.ts";

test("FollowUpEngine detects candidate asking clarification question", () => {
  const evalResult = FollowUpEngine.evaluateAnswer(
    "How would you design a rate limiter?",
    "Before I answer, could you clarify what the peak throughput is and whether we need distributed rate limiting across regions?"
  );

  assert.equal(evalResult.clarificationDetected, true, "Should detect legitimate clarification request");
  assert.equal(evalResult.correctness, "technically_arguable", "Clarification should be treated respectfully");

  const followUp = FollowUpEngine.generateFollowUp(
    "How would you design a rate limiter?",
    "Before I answer, could you clarify what the peak throughput is and whether we need distributed rate limiting across regions?",
    evalResult
  );

  assert.equal(followUp.isChallenging, false, "Should not penalize clarification with harsh challenge");
  assert.ok(followUp.followUpQuestion.includes("constraints") || followUp.followUpQuestion.includes("Assume"));
});

test("FollowUpEngine recognizes valid alternative architectural designs", () => {
  const evalResult = FollowUpEngine.evaluateAnswer(
    "Would you use MongoDB here?",
    "Instead of MongoDB, I would actually choose PostgreSQL because our query access patterns rely heavily on relational joins and transactional consistency across ledger rows."
  );

  assert.equal(evalResult.alternativeDesignArgued, true, "Should detect alternative architecture proposal");

  const followUp = FollowUpEngine.generateFollowUp(
    "Would you use MongoDB here?",
    "Instead of MongoDB, I would actually choose PostgreSQL",
    evalResult
  );

  assert.ok(followUp.followUpQuestion.includes("trade-off") || followUp.followUpQuestion.includes("challenging standard assumptions"));
});

test("FollowUpEngine probes depth when candidate answer is shallow", () => {
  const evalResult = FollowUpEngine.evaluateAnswer(
    "How does your index speed up queries?",
    "It makes it fast."
  );

  assert.equal(evalResult.depth, "shallow", "Short answer should be evaluated as shallow");

  const followUp = FollowUpEngine.generateFollowUp(
    "How does your index speed up queries?",
    "It makes it fast.",
    evalResult
  );

  assert.equal(followUp.isChallenging, true, "Should challenge shallow answers");
  assert.ok(followUp.followUpQuestion.includes("deeper") || followUp.followUpQuestion.includes("mechanics"));
});
