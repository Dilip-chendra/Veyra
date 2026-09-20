"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Send, CheckCircle2, XCircle, Clock, Terminal } from "lucide-react";
import { CodeRunResult } from "@/types";

interface CodeEditorPaneProps {
  onCodeExecuted?: (code: string, language: string, result: CodeRunResult) => void;
  onRequestCodeReview?: (code: string, language: string) => void;
  className?: string;
}

const STARTER_CODE: Record<string, string> = {
  python: `def two_sum(nums, target):
    """
    Find indices of the two numbers that add up to target.
    Time Complexity target: O(N)
    """
    seen = {}
    for i, num in enumerate(nums):
      complement = target - num
      if complement in seen:
        return [seen[complement], i]
      seen[num] = i
    return []

# Test execution
print(two_sum([2, 7, 11, 15], 9))
print(two_sum([3, 2, 4], 6))
`,
  javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 2, 4], 6));
`,
  typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
  go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    m := make(map[int]int)
    for i, n := range nums {
        diff := target - n
        if idx, ok := m[diff]; ok {
            return []int{idx, i}
        }
        m[n] = i
    }
    return nil
}

func main() {
    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))
}
`,
};

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  onCodeExecuted,
  onRequestCodeReview,
  className = "",
}) => {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(STARTER_CODE.python);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<CodeRunResult | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || "// Write your solution here\n");
    setOutputResult(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          stdin: "",
          testCases: [
            { name: "Sample Target 9", input: "[2, 7, 11, 15], 9", expected: "[0, 1]" },
            { name: "Sample Target 6", input: "[3, 2, 4], 6", expected: "[1, 2]" },
          ],
        }),
      });

      const data: CodeRunResult = await res.json();
      setOutputResult(data);
      if (onCodeExecuted) {
        onCodeExecuted(code, language, data);
      }
    } catch (err) {
      setOutputResult({
        stdout: "",
        stderr: "Failed to connect to execution sandbox.",
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReviewCode = () => {
    if (onRequestCodeReview) {
      onRequestCodeReview(code, language);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top Bar: Language Picker & Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Language:</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="python">Python 3.10</option>
            <option value="javascript">JavaScript (Node 18)</option>
            <option value="typescript">TypeScript 5.0</option>
            <option value="go">Go 1.16</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(STARTER_CODE[language] || "")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset to starter problem"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>

          <button
            onClick={handleReviewCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 min-h-[280px]">
        <Editor
          height="100%"
          language={language === "python" ? "python" : language === "typescript" ? "typescript" : language === "go" ? "go" : "javascript"}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Output Console / Test Results */}
      <div className="h-44 bg-slate-900 border-t border-slate-800 flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300">Execution Output</span>
          </div>
          {outputResult && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {outputResult.executionTimeMs} ms
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${outputResult.exitCode === 0 ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}>
                Exit Code {outputResult.exitCode}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
          {!outputResult && !isRunning && (
            <div className="text-slate-500 italic">Click &quot;Run Code&quot; to execute your solution against the live Piston runtime.</div>
          )}

          {isRunning && (
            <div className="text-indigo-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              Compiling and executing in isolated sandbox...
            </div>
          )}

          {outputResult && (
            <>
              {outputResult.stdout && (
                <div className="whitespace-pre-wrap">{outputResult.stdout}</div>
              )}
              {outputResult.stderr && (
                <div className="text-rose-400 whitespace-pre-wrap">{outputResult.stderr}</div>
              )}
              {outputResult.testResults && outputResult.testResults.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400">TEST CASES:</div>
                  {outputResult.testResults.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        {tc.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{tc.testName}</span>
                      </div>
                      <span className="text-slate-400 font-mono">Expected: {tc.expected}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
