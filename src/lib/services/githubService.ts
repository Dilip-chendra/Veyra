import { GitHubAnalysis } from "@/types";

export class GitHubService {
  private static parseRepoUrl(url: string): { owner: string; repo: string } | null {
    const cleaned = url.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
    const parts = cleaned.split("/");
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  }

  public static async analyzeRepository(repoUrl: string, token?: string): Promise<GitHubAnalysis> {
    const parsed = this.parseRepoUrl(repoUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub repository URL: "${repoUrl}". Please provide in format "https://github.com/owner/repo" or "owner/repo"`);
    }

    const { owner, repo } = parsed;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Veyra-AI-Interviewer",
    };

    const authToken = token || process.env.GITHUB_TOKEN;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // 1. Fetch Repo Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" was not found or is private. If it is private, configure a GitHub Personal Access Token in Settings.`);
      }
      if (repoRes.status === 403) {
        throw new Error(`GitHub API rate limit exceeded or access forbidden. Configure GITHUB_TOKEN in your environment or settings.`);
      }
      throw new Error(`GitHub API error (${repoRes.status}): ${repoRes.statusText}`);
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch Languages
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    const languages: Record<string, number> = langRes.ok ? await langRes.json() : {};
    const primaryLanguage = Object.keys(languages)[0] || repoData.language || "Unknown";

    // 3. Fetch Tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );
    let tree: { path: string; type: string; size?: number }[] = [];
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      tree = (treeData.tree || []).slice(0, 150).map((item: any) => ({
        path: item.path,
        type: item.type === "blob" ? "file" : "directory",
        size: item.size,
      }));
    }

    // 4. Fetch README
    let readme = "";
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
      }
    } catch {
      readme = "";
    }

    // 5. Detect Frameworks & Dependencies
    const detectedFrameworks: string[] = [];
    const dependencySummary: Record<string, string[]> = {};
    const testSuitesFound: string[] = [];

    // Check package.json if present
    const hasPackageJson = tree.some(t => t.path === "package.json");
    if (hasPackageJson) {
      try {
        const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          const pkgContent = JSON.parse(Buffer.from(pkgData.content, "base64").toString("utf-8"));
          const allDeps = { ...pkgContent.dependencies, ...pkgContent.devDependencies };
          dependencySummary["npm"] = Object.keys(allDeps).slice(0, 20);

          if (allDeps["next"]) detectedFrameworks.push("Next.js");
          if (allDeps["react"]) detectedFrameworks.push("React");
          if (allDeps["express"]) detectedFrameworks.push("Express");
          if (allDeps["fastify"]) detectedFrameworks.push("Fastify");
          if (allDeps["prisma"] || allDeps["@prisma/client"]) detectedFrameworks.push("Prisma ORM");
          if (allDeps["jest"] || allDeps["vitest"]) testSuitesFound.push("Jest/Vitest");
        }
      } catch {}
    }

    // Check requirements.txt or pyproject.toml
    const hasPythonReqs = tree.some(t => t.path === "requirements.txt" || t.path === "pyproject.toml");
    if (hasPythonReqs) {
      try {
        const pyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`, { headers });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          const reqText = Buffer.from(pyData.content, "base64").toString("utf-8");
          const deps = reqText.split("\n").map(l => l.trim().split("==")[0]).filter(Boolean);
          dependencySummary["pip"] = deps.slice(0, 20);

          if (deps.some(d => /fastapi/i.test(d))) detectedFrameworks.push("FastAPI");
          if (deps.some(d => /django/i.test(d))) detectedFrameworks.push("Django");
          if (deps.some(d => /torch|tensorflow/i.test(d))) detectedFrameworks.push("PyTorch/TensorFlow");
          if (deps.some(d => /pytest/i.test(d))) testSuitesFound.push("pytest");
        }
      } catch {}
    }

    // Check Docker / CI
    if (tree.some(t => t.path.toLowerCase().includes("dockerfile"))) {
      detectedFrameworks.push("Docker Containerized");
    }
    if (tree.some(t => t.path.includes(".github/workflows"))) {
      testSuitesFound.push("GitHub Actions CI/CD");
    }

    // 6. Generate Contextual Project Defense Questions
    const defenseQuestions: string[] = [];
    if (detectedFrameworks.length > 0) {
      defenseQuestions.push(`I see you used ${detectedFrameworks.slice(0, 2).join(" and ")} in this repository. What trade-offs guided that choice over other alternatives?`);
    }
    if (primaryLanguage && primaryLanguage !== "Unknown") {
      defenseQuestions.push(`In your ${primaryLanguage} codebase, walk me through how you structured error handling and asynchronous operations.`);
    }
    if (testSuitesFound.length > 0) {
      defenseQuestions.push(`I noticed you implemented ${testSuitesFound[0]}. What is your testing strategy and how do you mock external dependencies?`);
    } else {
      defenseQuestions.push(`How do you verify correctness and test regression in this repository without automated test suites?`);
    }
    defenseQuestions.push(`If traffic to this project increased by a factor of 50 tomorrow, where would the primary architectural bottlenecks appear?`);

    const architectureSummary = `${primaryLanguage} project containing ${tree.length} tracked files. Key frameworks: ${detectedFrameworks.join(", ") || "Custom architecture"}. Test coverage indicators: ${testSuitesFound.join(", ") || "None detected"}.`;

    return {
      owner,
      repoName: repo,
      description: repoData.description || "No repository description provided.",
      stars: repoData.stargazers_count || 0,
      languages,
      primaryLanguage,
      tree,
      readme: readme.slice(0, 3000), // first 3000 characters
      architectureSummary,
      dependencySummary,
      detectedFrameworks,
      testSuitesFound,
      defenseQuestions,
    };
  }
}
