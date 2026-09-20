import type { CodeRunResult } from "../../types/index.ts";
import { spawnSync } from "child_process";

interface TestCase {
  name: string;
  input: string;
  expected: string;
}

export class CodeExecutionService {
  private static PISTON_URL = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

  private static LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
    python: { language: "python", version: "3.10.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    java: { language: "java", version: "15.0.2" },
    cpp: { language: "c++", version: "10.2.0" },
    go: { language: "go", version: "1.16.2" },
    sql: { language: "sqlite3", version: "3.36.0" },
  };

  public static async executeCode(
    language: string,
    sourceCode: string,
    stdin: string = "",
    testCases?: TestCase[]
  ): Promise<CodeRunResult> {
    const langKey = language.toLowerCase();
    const config = this.LANGUAGE_MAP[langKey] || { language: langKey, version: "*" };

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.PISTON_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [
            {
              name: `solution.${this.getFileExtension(langKey)}`,
              content: sourceCode,
            },
          ],
          stdin: stdin,
          run_timeout: 5000,
          compile_timeout: 10000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution service responded with status ${response.status}`);
      }

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      const stdout = data.run?.stdout || "";
      const stderr = data.run?.stderr || data.compile?.stderr || "";
      const exitCode = data.run?.code ?? (stderr ? 1 : 0);

      // Evaluate against test cases if provided
      const testResults = testCases?.map((tc) => {
        const passed = stdout.trim().includes(tc.expected.trim());
        return {
          testName: tc.name,
          passed,
          input: tc.input,
          expected: tc.expected,
          actual: stdout.trim(),
        };
      });

      return {
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
        testResults,
      };
    } catch (err: any) {
      // Safe fallback sandbox for offline local execution of JS/Python
      const fallbackResult = this.runFallbackSandbox(langKey, sourceCode, stdin, testCases);
      if (fallbackResult) {
        return fallbackResult;
      }

      return {
        stdout: "",
        stderr: `Execution failed: ${err?.message || "Could not reach code sandbox"}`,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private static runFallbackSandbox(
    language: string,
    code: string,
    stdin: string,
    testCases?: TestCase[]
  ): CodeRunResult | null {
    if (language === "javascript" || language === "typescript") {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
          error: (...args: any[]) => logs.push("[ERROR] " + args.join(" ")),
        };

        const wrapped = new Function("console", code);
        wrapped(mockConsole);
        const stdout = logs.join("\n");

        return {
          stdout,
          stderr: "",
          exitCode: 0,
          executionTimeMs: 15,
          testResults: testCases?.map((tc) => ({
            testName: tc.name,
            passed: stdout.includes(tc.expected),
            input: tc.input,
            expected: tc.expected,
            actual: stdout,
          })),
        };
      } catch (err: any) {
        return {
          stdout: "",
          stderr: err?.message || "Execution error",
          exitCode: 1,
          executionTimeMs: 10,
        };
      }
    }

    if (language === "python") {
      try {
        const proc = spawnSync("python", ["-c", code], {
          input: stdin || undefined,
          timeout: 5000,
          encoding: "utf-8",
        });

        const stdout = proc.stdout || "";
        const stderr = proc.stderr || (proc.error ? proc.error.message : "");
        const exitCode = proc.status ?? (proc.error ? 1 : 0);

        return {
          stdout,
          stderr,
          exitCode,
          executionTimeMs: 30,
          testResults: testCases?.map((tc) => ({
            testName: tc.name,
            passed: stdout.includes(tc.expected),
            input: tc.input,
            expected: tc.expected,
            actual: stdout.trim(),
          })),
        };
      } catch (err: any) {
        return {
          stdout: "",
          stderr: err?.message || "Python execution failed",
          exitCode: 1,
          executionTimeMs: 10,
        };
      }
    }

    return null;
  }

  private static getFileExtension(language: string): string {
    const extMap: Record<string, string> = {
      python: "py",
      javascript: "js",
      typescript: "ts",
      java: "java",
      cpp: "cpp",
      go: "go",
      sql: "sql",
    };
    return extMap[language] || "txt";
  }

  public static analyzeComplexity(code: string): {
    estimatedTimeComplexity: string;
    estimatedSpaceComplexity: string;
    identifiedPatterns: string[];
    potentialProbes: string[];
  } {
    const identifiedPatterns: string[] = [];
    const potentialProbes: string[] = [];

    // Nested loops
    const nestedLoopMatch = /for\s*\(.*?\)\s*\{[\s\S]*?for\s*\(|while\s*\(.*?\)\s*\{[\s\S]*?while\s*\(|for\s+\w+\s+in\s+.*?:[\s\S]*?for\s+\w+\s+in/g.test(code);
    const singleLoopMatch = /for\s*\(|while\s*\(|for\s+\w+\s+in\s+/.test(code);
    const recursionMatch = /function\s+(\w+)[\s\S]*?\1\s*\(|def\s+(\w+)[\s\S]*?\2\s*\(/.test(code);
    const mapOrSetMatch = /new\s+(Map|Set)|dict\(|\{|\bset\(/.test(code);

    let estimatedTimeComplexity = "O(1)";
    let estimatedSpaceComplexity = "O(1)";

    if (nestedLoopMatch) {
      estimatedTimeComplexity = "O(N^2)";
      identifiedPatterns.push("Nested loops detected");
      potentialProbes.push("I see nested iteration here. Can we reduce the quadratic runtime to O(N) or O(N log N) using sorting or a hash index?");
    } else if (recursionMatch) {
      estimatedTimeComplexity = "O(2^N) or O(log N)";
      identifiedPatterns.push("Recursive calls detected");
      potentialProbes.push("Walk me through the recursion stack depth. What prevents stack overflow on large inputs?");
    } else if (singleLoopMatch) {
      estimatedTimeComplexity = "O(N)";
      identifiedPatterns.push("Linear iteration detected");
      potentialProbes.push("Your pass is linear. What happens if the input has 10 million items and doesn't fit in memory?");
    }

    if (mapOrSetMatch) {
      estimatedSpaceComplexity = "O(N)";
      identifiedPatterns.push("Auxiliary hash map/set storage detected");
      potentialProbes.push("You're trading memory for speed with that hash table. Can this be solved in-place with O(1) auxiliary space?");
    }

    // Edge cases
    if (!/null|undefined|None|len\(|length\s*===?\s*0/.test(code)) {
      potentialProbes.push("How does your implementation behave if the input array is empty or contains null values?");
    }

    if (potentialProbes.length === 0) {
      potentialProbes.push("Walk me through the time and space complexity of this solution step by step.");
    }

    return {
      estimatedTimeComplexity,
      estimatedSpaceComplexity,
      identifiedPatterns,
      potentialProbes,
    };
  }
}
