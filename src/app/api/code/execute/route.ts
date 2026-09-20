import { NextRequest, NextResponse } from "next/server";
import { CodeExecutionService } from "@/lib/services/codeExecutionService";

export async function POST(req: NextRequest) {
  try {
    const { language = "python", code = "", stdin = "", testCases = [] } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Source code cannot be empty" }, { status: 400 });
    }

    const executionResult = await CodeExecutionService.executeCode(language, code, stdin, testCases);
    const complexityAnalysis = CodeExecutionService.analyzeComplexity(code);

    return NextResponse.json({
      ...executionResult,
      complexityAnalysis,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute code" }, { status: 500 });
  }
}
