"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Check, Upload, Briefcase, Award } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";

const DOMAINS_LIST = [
  "Python", "JavaScript / TypeScript", "React / Next.js", "Java / Spring Boot",
  "Go / Microservices", "PostgreSQL / SQL", "Distributed Caching (Redis)",
  "Event Queues (Kafka)", "System Design & Scalability", "Machine Learning & PyTorch",
  "LLM & RAG Systems", "Cloud & Docker / Kubernetes",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [targetRole, setTargetRole] = useState("Full Stack Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Senior");
  const [preferredLanguage, setPreferredLanguage] = useState("en-US");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([
    "Python", "React / Next.js", "System Design & Scalability", "LLM & RAG Systems"
  ]);
  const [interviewerStyle, setInterviewerStyle] = useState("PROFESSIONAL");
  const [targetCompanies, setTargetCompanies] = useState("Stripe, OpenAI, Google");
  const [interviewGoals, setInterviewGoals] = useState("Master senior-level system design and claim defense.");
  const [confidenceLevel, setConfidenceLevel] = useState("High");
  const [githubHandle, setGithubHandle] = useState("");
  const [resumeUploadMode, setResumeUploadMode] = useState<"attach" | "paste">("attach");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Save Profile
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          experienceLevel,
          preferredLanguage,
          technicalDomains: selectedDomains,
          interviewerStyle,
          targetCompanies,
          interviewGoals,
          confidenceLevel,
          githubHandle,
        }),
      });

      // 2. If resume file provided, upload via FormData
      if (resumeUploadMode === "attach" && resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        await fetch("/api/resumes/upload", {
          method: "POST",
          body: formData,
        });
      } else if (resumeUploadMode === "paste" && resumeText.trim()) {
        await fetch("/api/resumes/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: "Onboarding_Resume.txt",
            text: resumeText,
          }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-indigo-400">Step {step} of 3</span>
            <h1 className="text-xl font-bold text-white">
              {step === 1 && "Target Role & Core Background"}
              {step === 2 && "Technical Domains & Interviewer Persona"}
              {step === 3 && "Resume & Project Evidence"}
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-colors ${step >= s ? "bg-indigo-500" : "bg-slate-800"}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Role & Experience */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer, Staff Backend Architect"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Entry-Level">Entry-Level (0-2 years)</option>
                  <option value="Mid-Level">Mid-Level (2-5 years)</option>
                  <option value="Senior">Senior (5-8 years)</option>
                  <option value="Staff/Principal">Staff / Principal (8+ years)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Preferred Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="de-DE">German (Deutsch)</option>
                  <option value="fr-FR">French (Français)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Companies or Industry Context (Optional)</label>
              <input
                type="text"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                placeholder="e.g. Tier-1 Cloud Infrastructure, High-Frequency Trading, GenAI Startups"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Domains & Interviewer Persona */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Technical Domains to Cover</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOMAINS_LIST.map((domain) => {
                  const isSelected = selectedDomains.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleDomain(domain)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-950 border-indigo-600 text-indigo-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="truncate">{domain}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Interviewer Persona Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "PROFESSIONAL", label: "Professional", desc: "Rigorous, structured, balanced" },
                  { id: "SKEPTICAL", label: "Skeptical", desc: "Probes claims, tests boundaries" },
                  { id: "FRIENDLY", label: "Friendly", desc: "Encouraging, conversational" },
                  { id: "EXECUTIVE", label: "Executive", desc: "High-level, concise, business impact" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setInterviewerStyle(p.id)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      interviewerStyle === p.id
                        ? "bg-indigo-950 border-indigo-600 text-indigo-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{p.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resume & Evidence */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Resume / Profile Evidence</label>
              
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-xs">
                <button
                  type="button"
                  onClick={() => setResumeUploadMode("attach")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    resumeUploadMode === "attach" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Attach File
                </button>
                <button
                  type="button"
                  onClick={() => setResumeUploadMode("paste")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    resumeUploadMode === "paste" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {resumeUploadMode === "attach" ? (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 block">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {resumeFile ? resumeFile.name : "Click to select or drag & drop resume (PDF, DOCX, TXT)"}
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-extracts technical competencies and claims</span>
                  </label>
                </div>
              ) : (
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text or key project bullet points here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">GitHub Profile Handle or Repo (Optional)</label>
              <div className="relative">
                <GithubIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  placeholder="e.g. github.com/username or username/repo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Building Knowledge Model..." : "Complete Setup & Enter Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
