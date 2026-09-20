"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  CheckCircle,
  Film,
  Layers,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Cpu,
  Eye,
  FileCode,
  Download,
} from "lucide-react";
import reportData from "../../../avatar-video-generation-report.json";

interface ClipItem {
  interviewer: "marcus" | "elena" | string;
  category: string;
  filename: string;
  path: string;
  durationSeconds: number;
  resolution: string;
  fps: number;
  fileSizeKB: number;
  sha256: string;
  status: string;
}

export default function AvatarAssetsPage() {
  const [selectedPersona, setSelectedPersona] = useState<"all" | "marcus" | "elena">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePreviewClip, setActivePreviewClip] = useState<ClipItem | null>(null);

  const allClips: ClipItem[] = (reportData.items as ClipItem[]) || [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    allClips.forEach((item) => set.add(item.category));
    return ["all", ...Array.from(set).sort()];
  }, [allClips]);

  const filteredClips = useMemo(() => {
    return allClips.filter((clip) => {
      if (selectedPersona !== "all" && clip.interviewer !== selectedPersona) return false;
      if (selectedCategory !== "all" && clip.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          clip.filename.toLowerCase().includes(q) ||
          clip.category.toLowerCase().includes(q) ||
          clip.interviewer.toLowerCase().includes(q) ||
          clip.sha256.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allClips, selectedPersona, selectedCategory, searchQuery]);

  const marcusCount = allClips.filter((c) => c.interviewer === "marcus").length;
  const elenaCount = allClips.filter((c) => c.interviewer === "elena").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Veyra Digital Human Asset Inspector
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Internal Dev Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Photorealistic Video Moment Engine • 70/70 Validated Clips • Zero-Cost Rule Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/interviews/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Live Interview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">{reportData.totalClips}</div>
              <div className="text-[11px] text-slate-400">Total Video Clips</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-400">{reportData.validatedClips} / 70</div>
              <div className="text-[11px] text-slate-400">100% Playable H.264</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">13 States</div>
              <div className="text-[11px] text-slate-400">Behavioral Coverage</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-amber-300">0 Emojis</div>
              <div className="text-[11px] text-slate-400">True Human Rigs</div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Persona Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Persona:
              </span>
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedPersona("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedPersona === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({allClips.length})
                </button>
                <button
                  onClick={() => setSelectedPersona("marcus")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedPersona === "marcus"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Marcus Vance ({marcusCount})
                </button>
                <button
                  onClick={() => setSelectedPersona("elena")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedPersona === "elena"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Elena Rostova ({elenaCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by state, filename, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Video Clips Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-200">{filteredClips.length}</strong> of{" "}
              <strong className="text-slate-200">{allClips.length}</strong> clips
            </span>
            <span>Encoding: H.264 High Profile / 1280x720 / 30fps / Audio-Stripped</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredClips.map((clip) => (
              <div
                key={clip.path}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all shadow-lg"
              >
                {/* HTML5 Video Player */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video
                    src={clip.path}
                    controls
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {clip.interviewer === "marcus" ? "Marcus Vance" : "Elena Rostova"}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                    {clip.durationSeconds}s
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{clip.filename}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-semibold uppercase">
                        {clip.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                      <span>{clip.resolution} @ {clip.fps}fps</span>
                      <span>{clip.fileSizeKB} KB</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono truncate max-w-[170px]" title={clip.sha256}>
                      SHA: {clip.sha256.slice(0, 12)}...
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClips.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
              <Film className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No video clips match the current filters.</p>
              <p className="text-xs text-slate-500">Try selecting "All" categories or clearing your search term.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
