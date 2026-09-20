import type { BehaviorState, BehaviorMetadata, InterviewerStyle, Emotion, GestureType, GazeTarget } from "../../types/index.ts";

export class BehaviorController {
  public static computeBehavior(
    state: BehaviorState,
    style: InterviewerStyle = "PROFESSIONAL",
    context?: {
      isChallenging?: boolean;
      candidateSpeakingLong?: boolean;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      isInterruption?: boolean;
    }
  ): BehaviorMetadata {
    let emotion: Emotion = "neutral";
    let gaze: GazeTarget = "CANDIDATE";
    let gesture: GestureType = "none";
    let pace: "slow" | "medium" | "fast" = "medium";
    let pauseBeforeSpeechMs = 400;

    switch (state) {
      case "INTRODUCING":
        emotion = style === "FRIENDLY" ? "warm" : "neutral";
        gaze = "CANDIDATE";
        gesture = "open_hand";
        pace = "medium";
        pauseBeforeSpeechMs = 300;
        break;

      case "LISTENING":
        emotion = "attentive";
        gaze = "CANDIDATE";
        gesture = "small_nod";
        pace = "medium";
        pauseBeforeSpeechMs = 0;
        break;

      case "THINKING":
        emotion = "thoughtful";
        gaze = "UP_THINKING";
        gesture = "head_tilt";
        pace = "slow";
        pauseBeforeSpeechMs = 900;
        break;

      case "QUESTIONING":
        emotion = style === "SKEPTICAL" ? "skeptical" : "curious";
        gaze = "CANDIDATE";
        gesture = "questioning";
        pace = style === "DIRECT" ? "fast" : "medium";
        pauseBeforeSpeechMs = 600;
        break;

      case "CLARIFYING":
        emotion = "curious";
        gaze = "CANDIDATE";
        gesture = "head_tilt";
        pace = "medium";
        pauseBeforeSpeechMs = 500;
        break;

      case "CHALLENGING":
        emotion = "skeptical";
        gaze = "CANDIDATE";
        gesture = "emphasis";
        pace = "medium";
        pauseBeforeSpeechMs = 800;
        break;

      case "ENCOURAGING":
        emotion = "warm";
        gaze = "CANDIDATE";
        gesture = "deep_nod";
        pace = "medium";
        pauseBeforeSpeechMs = 400;
        break;

      case "INTERRUPTING":
        emotion = "attentive";
        gaze = "CANDIDATE";
        gesture = "posture_forward";
        pace = "fast";
        pauseBeforeSpeechMs = 150;
        break;

      case "WAITING":
        emotion = "attentive";
        gaze = "CANDIDATE";
        gesture = "small_nod";
        pace = "slow";
        pauseBeforeSpeechMs = 0;
        break;

      case "TRANSITIONING":
        emotion = "thoughtful";
        gaze = "DOWN_REFLECTING";
        gesture = "open_hand";
        pace = "medium";
        pauseBeforeSpeechMs = 700;
        break;

      case "CODING":
        emotion = "attentive";
        gaze = "SCREEN";
        gesture = "pointing";
        pace = "medium";
        pauseBeforeSpeechMs = 450;
        break;

      case "REVIEWING":
        emotion = "thoughtful";
        gaze = "SCREEN";
        gesture = "head_tilt";
        pace = "medium";
        pauseBeforeSpeechMs = 650;
        break;

      case "CLOSING":
        emotion = "warm";
        gaze = "CANDIDATE";
        gesture = "open_hand";
        pace = "medium";
        pauseBeforeSpeechMs = 500;
        break;
    }

    // Persona-specific overrides
    if (style === "SKEPTICAL" && state === "QUESTIONING") {
      emotion = "skeptical";
      gesture = "posture_forward";
      pauseBeforeSpeechMs += 200;
    } else if (style === "EXECUTIVE") {
      pace = "fast";
      pauseBeforeSpeechMs = Math.max(250, pauseBeforeSpeechMs - 200);
    } else if (style === "FRIENDLY" && state === "ENCOURAGING") {
      gesture = "deep_nod";
    }

    return {
      state,
      emotion,
      gaze,
      gesture,
      pace,
      pauseBeforeSpeechMs,
    };
  }

  public static getInterruptionPhrase(reason: "long_speech" | "claim_probe" | "clarification"): string {
    const phrases = {
      long_speech: [
        "Let me pause you there for a moment — I have the high-level picture, but let's zoom in on the specific trade-off.",
        "Hold on for a second — before we go further, let's unpack the decision you just mentioned.",
        "Excuse me for jumping in, but you touched on an important architecture decision there. Let's drill into that directly.",
      ],
      claim_probe: [
        "Let me stop you right there — you mentioned reducing latency by that margin. What was the baseline?",
        "Hold on a second — that's a significant claim. Walk me through the exact benchmark setup.",
      ],
      clarification: [
        "Take your time — what assumptions are you making about the traffic pattern before proposing that?",
        "Before you continue with the full solution, clarify how you're handling regional failures.",
      ],
    };

    const list = phrases[reason] || phrases.long_speech;
    return list[Math.floor(Math.random() * list.length)];
  }
}
