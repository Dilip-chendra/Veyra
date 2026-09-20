import test from "node:test";
import assert from "node:assert/strict";
import { ResumeService } from "../src/lib/services/resumeService.ts";
import { JobDescriptionService } from "../src/lib/services/jobDescriptionService.ts";

test("ResumeService extracts technologies and quantified metric claims", () => {
  const resumeText = `
    Senior Software Engineer at Stripe (2021 - Present)
    • Architected high-throughput payment settlement engine using Go, PostgreSQL, and Kafka.
    • Reduced model latency by 40% using Redis distributed caching.
    • Scaled system to handle 150k transactions per second.
  `;

  const parsed = ResumeService.parseResumeText(resumeText);
  assert.ok(parsed.technologies.includes("Go"));
  assert.ok(parsed.technologies.includes("PostgreSQL"));
  assert.ok(parsed.technologies.includes("Kafka"));
  assert.ok(parsed.technologies.includes("Redis"));
  assert.ok(parsed.claims.some(c => c.includes("latency by 40%")));
  assert.ok(parsed.metrics.some(m => m.includes("40%") || m.includes("150k")));
});

test("JobDescriptionService extracts competencies and generates dynamic stages", () => {
  const jdText = `
    Role: Principal Distributed Systems Engineer
    Requirements:
    - Deep mastery of microservices and system design
    - Experience with Kafka, Redis, and PostgreSQL
    - Focus on high-availability and fault tolerance
  `;

  const parsed = JobDescriptionService.parseJobDescription(jdText, "Principal Distributed Systems Engineer");
  assert.equal(parsed.title, "Principal Distributed Systems Engineer");
  assert.ok(parsed.requiredSkills.includes("Kafka") || parsed.requiredSkills.includes("PostgreSQL"));

  const blueprint = JobDescriptionService.generateBlueprint(parsed, 45, "PROFESSIONAL", "ADAPTIVE");
  assert.equal(blueprint.durationMinutes, 45);
  assert.ok(blueprint.stages.length >= 4);
  assert.ok(blueprint.initialQuestion.includes("Principal Distributed Systems Engineer"));
});
