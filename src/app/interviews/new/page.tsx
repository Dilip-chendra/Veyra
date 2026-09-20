"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Clock,
  Gauge,
  User,
  ShieldCheck,
  FolderPlus,
  ExternalLink,
  ChevronRight,
  Code2,
  Layers,
  Sparkle,
  RefreshCw,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";

const STANDARD_ROLES = [
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "Software Engineer",
  "GenAI Engineer",
  "LLM Engineer",
  "AI Agent Developer",
  "Python Developer",
  "Backend Developer",
  "Data Analyst",
  "Product Manager",
  "Business Analyst",
];

export default function NewInterviewPage() {
  const router = useRouter();

  // 1. Role Selection
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState("");

  // 2. Interview Configuration
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState("ADAPTIVE");

  // 3. Interviewer Gender & Persona
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male">("female");
  const [interviewerStyle, setInterviewerStyle] = useState("PROFESSIONAL");

  // 4. Resume Management
  const [resumeMode, setResumeMode] = useState<"attach" | "paste" | "saved">("attach");
  const [uploadedResumeFile, setUploadedResumeFile] = useState<File | null>(null);
  const [pastedResumeText, setPastedResumeText] = useState("");
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [resumeProcessing, setResumeProcessing] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 5. GitHub & Projects
  const [projectMode, setProjectMode] = useState<"url" | "username" | "manual">("url");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [manualProjectDesc, setManualProjectDesc] = useState("");
  const [githubAnalyzing, setGithubAnalyzing] = useState(false);
  const [githubAnalysisData, setGithubAnalysisData] = useState<any | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  // 6. Job Description
  const [jdMode, setJdMode] = useState<"paste" | "saved">("paste");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [savedJds, setSavedJds] = useState<any[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string>("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Saved Profile Data
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.resumes && data.resumes.length > 0) {
            setSavedResumes(data.resumes);
            setSelectedResumeId(data.resumes[0].id);
          }
          if (data.profile?.targetRole) {
            if (STANDARD_ROLES.includes(data.profile.targetRole)) {
              setSelectedRole(data.profile.targetRole);
            } else {
              setIsCustomRole(true);
              setCustomRoleText(data.profile.targetRole);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Handle File Upload for Resume
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedResumeFile(file);
    setResumeProcessing(true);
    setResumeSuccessMsg(null);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume document");
      }

      setSelectedResumeId(data.resume?.id || "");
      setResumeSuccessMsg(`Resume successfully analyzed: ${file.name} (${data.claimsCount || 0} claims detected)`);
    } catch (err: any) {
      setErrorMsg(err.message || "Resume upload failed. Please try pasting the text instead.");
    } finally {
      setResumeProcessing(false);
    }
  };

  // Handle Pasted Resume Ingestion
  const handleIngestPastedResume = async () => {
    if (!pastedResumeText.trim()) return;
    setResumeProcessing(true);
    setResumeSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pastedResumeText,
          filename: "Pasted_Resume.txt",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process pasted resume");
      }

      setSelectedResumeId(data.resume?.id || "");
      setResumeSuccessMsg(`Resume text ingested successfully (${data.claimsCount || 0} claims extracted)`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not process resume text.");
    } finally {
      setResumeProcessing(false);
    }
  };

  // Handle GitHub Repo Analysis
  const handleAnalyzeGithub = async () => {
    if (!githubRepoUrl.trim()) return;
    setGithubAnalyzing(true);
    setGithubError(null);

    try {
      const urlMatch = githubRepoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (!urlMatch) {
        throw new Error("Please enter a valid GitHub repository URL (e.g. https://github.com/username/project)");
      }

      const [, owner, repo] = urlMatch;
      const res = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: githubRepoUrl, owner, repo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not analyze repository.");
      }

      setGithubAnalysisData(data.analysis);
    } catch (err: any) {
      setGithubError(err.message || "GitHub repository analysis failed.");
    } finally {
      setGithubAnalyzing(false);
    }
  };

  // Launch Live Interview
  const handleStartInterview = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const finalRole = isCustomRole ? (customRoleText.trim() || "Software Engineer") : selectedRole;
    const finalInterviewerName = interviewerGender === "male" ? "Marcus Vance" : "Elena Rostova";
    const finalInterviewerTitle = interviewerGender === "male" ? "Senior Engineering Director" : "Principal Technical Architect";

    try {
      // 1. If Job Description text provided, analyze and create JD record
      let activeJdId = selectedJdId;
      if (jdMode === "paste" && jobDescriptionText.trim()) {
        const jdRes = await fetch("/api/jobs/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText: jobDescriptionText,
            title: `${finalRole} Role`,
            style: interviewerStyle,
            difficulty,
            durationMinutes,
          }),
        });
        if (jdRes.ok) {
          const jdData = await jdRes.json();
          activeJdId = jdData.jobDescription?.id;
        }
      }

      // 2. Create Interview Session
      const res = await fetch("/api/interviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: finalRole,
          interviewType,
          durationMinutes,
          difficulty,
          interviewerStyle,
          interviewerName: finalInterviewerName,
          interviewerTitle: finalInterviewerTitle,
          gender: interviewerGender,
          resumeId: selectedResumeId || undefined,
          jobDescriptionId: activeJdId || undefined,
          projectId: githubAnalysisData?.projectId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize interview room");
      }

      // 3. Forward to Live Room
      router.push(`/interviews/${data.interviewId}/live`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not launch interview session. Please verify inputs.");
      setIsSubmitting(false);
    }
  };

  const finalRoleDisplay = isCustomRole ? (customRoleText || "Custom Role") : selectedRole;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Professional Autonomous Interview Session</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Your Interview Session</h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Provide your resume, projects, and target role. The AI interviewer synthesizes an adaptive conversational blueprint with zero pre-scripted decision trees.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-rose-950/70 border border-rose-800 rounded-2xl text-xs text-rose-200 shadow-xl">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-10">
        {/* Section 1: Target Role Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>1. Target Engineering Role</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomRole(!isCustomRole)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              {isCustomRole ? "Choose from standard roles" : "+ Enter custom role"}
            </button>
          </div>

          {!isCustomRole ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STANDARD_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedRole === r
                      ? "bg-indigo-950 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/40"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                value={customRoleText}
                onChange={(e) => setCustomRoleText(e.target.value)}
                placeholder="e.g. Staff Distributed Systems Engineer, Principal RAG Architect"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">The interviewer will dynamically customize technical questions to this exact specialty.</p>
            </div>
          )}
        </div>

        {/* Section 2: Resume Ingestion (Attach, Paste, or Saved) */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>2. Candidate Resume (Required for Deep Claim Verification)</span>
          </label>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md">
            <button
              type="button"
              onClick={() => setResumeMode("attach")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                resumeMode === "attach" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Resume</span>
            </button>
            <button
              type="button"
              onClick={() => setResumeMode("paste")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                resumeMode === "paste" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Resume</span>
            </button>
            <button
              type="button"
              onClick={() => setResumeMode("saved")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                resumeMode === "saved" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Saved ({savedResumes.length})</span>
            </button>
          </div>

          {/* Option A: Attach Resume File */}
          {resumeMode === "attach" && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-950 flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">
                    {uploadedResumeFile ? uploadedResumeFile.name : "Click or drag & drop to attach your resume"}
                  </p>
                  <p className="text-[11px] text-slate-500">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
                </div>
              </div>

              {resumeProcessing && (
                <div className="flex items-center gap-2 p-3 bg-indigo-950/50 border border-indigo-800 rounded-xl text-xs text-indigo-300 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting technical claims and competencies from resume...</span>
                </div>
              )}

              {resumeSuccessMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resumeSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Option B: Paste Resume Text */}
          {resumeMode === "paste" && (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={pastedResumeText}
                onChange={(e) => setPastedResumeText(e.target.value)}
                placeholder="Paste your resume text, work experience, or key technical bullet points here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500">Pasting text extracts claims directly into the Knowledge Model.</p>
                <button
                  type="button"
                  onClick={handleIngestPastedResume}
                  disabled={!pastedResumeText.trim() || resumeProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {resumeProcessing ? "Ingesting Claims..." : "Save & Analyze Resume Text"}
                </button>
              </div>

              {resumeSuccessMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resumeSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Option C: Use Saved Resume */}
          {resumeMode === "saved" && (
            <div className="space-y-3">
              {savedResumes.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-400">No saved resumes found in your profile yet.</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setResumeMode("attach")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                    >
                      Attach Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeMode("paste")}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Paste Resume
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedResumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedResumeId(r.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedResumeId === r.id
                          ? "bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">{r.filename}</span>
                        {selectedResumeId === r.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Uploaded on {new Date(r.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: GitHub & Projects */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <GithubIcon className="w-4 h-4 text-indigo-400" />
            <span>3. GitHub Repository / Project Defense</span>
          </label>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md">
            <button
              type="button"
              onClick={() => setProjectMode("url")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                projectMode === "url" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paste Repo URL
            </button>
            <button
              type="button"
              onClick={() => setProjectMode("username")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                projectMode === "username" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              GitHub Username
            </button>
            <button
              type="button"
              onClick={() => setProjectMode("manual")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                projectMode === "manual" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Describe Project
            </button>
          </div>

          {projectMode === "url" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repository"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeGithub}
                  disabled={!githubRepoUrl.trim() || githubAnalyzing}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${githubAnalyzing ? "animate-spin" : ""}`} />
                  <span>{githubAnalyzing ? "Inspecting..." : "Inspect Repo"}</span>
                </button>
              </div>

              {githubError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
                  {githubError}
                </div>
              )}

              {githubAnalysisData && (
                <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{githubAnalysisData.repoName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono">
                      {githubAnalysisData.primaryLanguage || "Multi-language"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{githubAnalysisData.architectureSummary}</p>
                </div>
              )}
            </div>
          )}

          {projectMode === "username" && (
            <div className="space-y-2">
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter GitHub handle (e.g. torvalds)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">The interviewer will reference public repositories associated with this handle.</p>
            </div>
          )}

          {projectMode === "manual" && (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={manualProjectDesc}
                onChange={(e) => setManualProjectDesc(e.target.value)}
                placeholder="Describe your primary architectural project: what did it do, what stack did you use, and what scale did it reach?"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Section 4: Target Job Description */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>4. Target Job Description (Optional)</span>
          </label>
          <textarea
            rows={4}
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            placeholder="Paste the job description or role requirements here. The interviewer will align the interview stages with the hiring team's rubric."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Section 5: Interviewer Persona Selection (Male vs Female Executive) */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>5. Select Photorealistic Interviewer Persona</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Female Persona: Elena Rostova */}
            <div
              onClick={() => setInterviewerGender("female")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                interviewerGender === "female"
                  ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                <img
                  src="/avatars/interviewer_female.jpg"
                  alt="Elena Rostova"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Elena Rostova</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700">Female</span>
                </div>
                <p className="text-[11px] text-slate-400">Principal Technical Architect</p>
                <p className="text-[10px] text-slate-500 leading-snug">Rigorous, balanced, architecture & edge-case inquiry.</p>
              </div>
            </div>

            {/* Male Persona: Marcus Vance */}
            <div
              onClick={() => setInterviewerGender("male")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                interviewerGender === "male"
                  ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                <img
                  src="/avatars/interviewer_male.jpg"
                  alt="Marcus Vance"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Marcus Vance</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700">Male</span>
                </div>
                <p className="text-[11px] text-slate-400">Senior Engineering Director</p>
                <p className="text-[10px] text-slate-500 leading-snug">Direct, metric-driven, system resilience & delivery depth.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Duration, Difficulty & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duration</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[15, 30, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    durationMinutes === m
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Difficulty</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {["MEDIUM", "HARD", "ADAPTIVE"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    difficulty === d
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interview Mode</span>
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="TECHNICAL">Technical Core (Arch & Fundamentals)</option>
              <option value="CODING">Live Coding (Algorithms & Execution)</option>
              <option value="SYSTEM_DESIGN">System Design (10x Traffic & Outage)</option>
              <option value="PROJECT_DEFENSE">Project Defense (GitHub Deep Probe)</option>
              <option value="PANEL">Panel (4 Multi-Agent Personas)</option>
              <option value="BEHAVIORAL">Behavioral (STAR Framework)</option>
            </select>
          </div>
        </div>

        {/* Section 7: Pre-Interview Summary & Launch Button */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span>Summary:</span>
                <span className="text-indigo-400">{finalRoleDisplay}</span>
                <span className="text-slate-600">•</span>
                <span>{durationMinutes} mins</span>
                <span className="text-slate-600">•</span>
                <span>{interviewType}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interviewer: <strong className="text-slate-200">{interviewerGender === "male" ? "Marcus Vance" : "Elena Rostova"}</strong> | Resume: <strong className="text-slate-200">{selectedResumeId ? "Attached" : "General"}</strong> | GitHub: <strong className="text-slate-200">{githubAnalysisData ? "Analyzed" : "None"}</strong>
              </p>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>{isSubmitting ? "Synthesizing Blueprint..." : "Enter Interview Room"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
