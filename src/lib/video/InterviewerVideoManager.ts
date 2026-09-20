import type { BehaviorState } from "../../types/index.ts";

export interface InterviewerManifest {
  id: "marcus" | "elena";
  name: string;
  gender: "male" | "female";
  title: string;
  clips: Record<string, string[]>;
}

export interface VideoManifestData {
  marcus: InterviewerManifest;
  elena: InterviewerManifest;
}

export type VideoCategory =
  | "idle"
  | "listening"
  | "speaking"
  | "questioning"
  | "thinking"
  | "clarifying"
  | "challenging"
  | "encouraging"
  | "acknowledging"
  | "explaining"
  | "interrupting"
  | "transitioning"
  | "closing";

export class InterviewerVideoManager {
  private interviewerId: "marcus" | "elena";
  private manifest: VideoManifestData | null = null;
  private recentHistory: string[] = [];
  private readonly maxHistoryLength = 4;

  constructor(interviewerId: "marcus" | "elena" | "male" | "female" = "elena") {
    this.interviewerId = interviewerId === "marcus" || interviewerId === "male" ? "marcus" : "elena";
  }

  public setInterviewer(id: "marcus" | "elena" | "male" | "female") {
    this.interviewerId = id === "marcus" || id === "male" ? "marcus" : "elena";
    this.recentHistory = [];
  }

  public getInterviewer(): "marcus" | "elena" {
    return this.interviewerId;
  }

  public setManifest(manifest: VideoManifestData) {
    this.manifest = manifest;
  }

  /**
   * Map conversation behavior state + AI speaking flag to matched video category
   */
  public mapStateToCategory(
    state: BehaviorState,
    isAiSpeaking: boolean
  ): VideoCategory {
    if (state === "CLOSING") return "closing";
    if (state === "INTERRUPTING") return "interrupting";

    if (isAiSpeaking) {
      if (state === "CHALLENGING") return "challenging";
      if (state === "CLARIFYING") return "clarifying";
      if (state === "QUESTIONING" || state === "INTRODUCING") return "questioning";
      if (state === "CODING" || state === "REVIEWING") return "explaining";
      return "speaking";
    }

    switch (state) {
      case "LISTENING":
        // 25% chance to acknowledge candidate point while listening
        return Math.random() < 0.25 ? "acknowledging" : "listening";
      case "THINKING":
        return "thinking";
      case "ENCOURAGING":
        return "encouraging";
      case "CHALLENGING":
        return "challenging";
      case "CLARIFYING":
        return "clarifying";
      case "QUESTIONING":
        return "questioning";
      case "TRANSITIONING":
        return "transitioning";
      case "WAITING":
        return "idle";
      default:
        return "idle";
    }
  }

  /**
   * Select a video clip for the requested state, avoiding immediate repetition
   */
  public selectVideoClip(
    state: BehaviorState,
    isAiSpeaking: boolean
  ): { url: string; category: VideoCategory; preloads: string[] } {
    const category = this.mapStateToCategory(state, isAiSpeaking);
    const person = this.manifest?.[this.interviewerId];

    let availableClips = person?.clips?.[category] || [];

    // Fallback if manifest is not yet loaded
    if (availableClips.length === 0) {
      const fallbackFilename = `${category}_01.mp4`;
      availableClips = [
        `/interviewer-videos/${this.interviewerId}/${category}/${fallbackFilename}`,
      ];
    }

    // Filter out recently played clips to avoid consecutive repetitions
    const filtered = availableClips.filter((c) => !this.recentHistory.includes(c));
    const pool = filtered.length > 0 ? filtered : availableClips;

    // Pick random from pool
    const selectedUrl = pool[Math.floor(Math.random() * pool.length)];

    // Update history
    this.recentHistory.push(selectedUrl);
    if (this.recentHistory.length > this.maxHistoryLength) {
      this.recentHistory.shift();
    }

    // Preload next probable categories
    const preloads = this.getProbableNextClips(category, person);

    return {
      url: selectedUrl,
      category,
      preloads,
    };
  }

  /**
   * Determine likely next clips to preload in the background
   */
  private getProbableNextClips(
    currentCategory: VideoCategory,
    person?: InterviewerManifest
  ): string[] {
    if (!person) return [];

    let targetCategories: VideoCategory[] = [];
    if (currentCategory === "speaking" || currentCategory === "questioning") {
      targetCategories = ["listening", "thinking"];
    } else if (currentCategory === "listening") {
      targetCategories = ["thinking", "speaking", "challenging"];
    } else if (currentCategory === "thinking") {
      targetCategories = ["speaking", "questioning", "clarifying"];
    } else {
      targetCategories = ["listening", "speaking"];
    }

    const preloads: string[] = [];
    for (const cat of targetCategories) {
      const clips = person.clips?.[cat];
      if (clips && clips.length > 0) {
        preloads.push(clips[0]);
      }
    }
    return preloads;
  }
}
