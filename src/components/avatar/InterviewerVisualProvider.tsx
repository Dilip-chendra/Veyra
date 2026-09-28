"use client";

import React from "react";
import {
  ProfessionalHumanInterviewer,
  ProfessionalHumanInterviewerProps,
} from "./ProfessionalHumanInterviewer";

export type InterviewerVisualMode = "static_photo" | "realtime_avatar";

export interface InterviewerVisualProviderProps extends ProfessionalHumanInterviewerProps {
  /**
   * The visual provider mode.
   * Default: "static_photo" (active production mode rendering high-res authentic human photograph).
   * "realtime_avatar": reserved for genuine future real-time digital human integrations.
   */
  providerMode?: InterviewerVisualMode;
}

/**
 * InterviewerVisualProvider — Pluggable visual abstraction layer.
 *
 * Current: StaticPhotoProvider (ProfessionalHumanInterviewer)
 * Future: RealtimeAvatarProvider (architecture interface ready; brain is fully decoupled from visual presentation)
 */
export const InterviewerVisualProvider: React.FC<InterviewerVisualProviderProps> = ({
  providerMode = "static_photo",
  ...props
}) => {
  if (providerMode === "realtime_avatar") {
    // In accordance with instructions: Do not implement future avatar provider now.
    // Fall back safely to the verified StaticPhotoProvider.
    return <ProfessionalHumanInterviewer {...props} />;
  }

  // Active production provider: High-definition static executive photograph
  return <ProfessionalHumanInterviewer {...props} />;
};
