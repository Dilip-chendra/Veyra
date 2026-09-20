import test from "node:test";
import assert from "node:assert/strict";
import { CodeExecutionService } from "../src/lib/services/codeExecutionService.ts";

test("CodeExecutionService analyzes static complexity and detects quadratic iteration", () => {
  const quadraticCode = `
    def find_pairs(arr):
      for i in range(len(arr)):
        for j in range(len(arr)):
          if arr[i] + arr[j] == 10:
            return True
      return False
  `;

  const analysis = CodeExecutionService.analyzeComplexity(quadraticCode);
  assert.equal(analysis.estimatedTimeComplexity, "O(N^2)");
  assert.ok(analysis.identifiedPatterns.some(p => p.includes("Nested loops")));
  assert.ok(analysis.potentialProbes[0].includes("quadratic"));
});

test("CodeExecutionService executes Javascript in fallback sandbox with test cases", async () => {
  const jsCode = `
    const a = 10;
    const b = 20;
    console.log("SUM:" + (a + b));
  `;

  const result = await CodeExecutionService.executeCode("javascript", jsCode, "", [
    { name: "Check Sum 30", input: "", expected: "SUM:30" },
  ]);

  assert.equal(result.exitCode, 0);
  assert.ok(result.stdout.includes("SUM:30"));
  assert.equal(result.testResults?.[0].passed, true);
});
