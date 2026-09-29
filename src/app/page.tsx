import React from "react";
import { GlobalSpatialBackground } from "@/components/landing/GlobalSpatialBackground";
import { HeroExperience } from "@/components/landing/HeroExperience";
import { CinematicVideoSection } from "@/components/landing/CinematicVideoSection";
import { BrandMarquee } from "@/components/landing/BrandMarquee";
import { KineticHeadline } from "@/components/landing/KineticHeadline";
import { InterviewFlowVisualization } from "@/components/landing/InterviewFlowVisualization";
import { AdaptiveInterviewScene } from "@/components/landing/AdaptiveInterviewScene";
import { RealtimeVoiceExperience } from "@/components/landing/RealtimeVoiceExperience";
import { ResumeTransformation } from "@/components/landing/ResumeTransformation";
import { JobSkillMap } from "@/components/landing/JobSkillMap";
import { ProjectDefenseScene } from "@/components/landing/ProjectDefenseScene";
import { InterviewIntelligence3D } from "@/components/landing/InterviewIntelligence3D";
import { InterviewMemoryTimeline } from "@/components/landing/InterviewMemoryTimeline";
import { InterviewTypeExplorer } from "@/components/landing/InterviewTypeExplorer";
import { ReportPreview } from "@/components/landing/ReportPreview";
import { HumanCinematicMoment } from "@/components/landing/HumanCinematicMoment";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main className="veyra-grain relative flex flex-col w-full overflow-x-hidden bg-[#06070d] text-white">
      {/* Global 3D Spatial Constellation & Particle Background Across Entire Page */}
      <GlobalSpatialBackground />

      {/* 01. Cinematic Hero Section with Live Typing Animations & Balanced Portrait HUD */}
      <HeroExperience />

      {/* 02. Authentic Cinematic Product Video Frame (Placed 2nd) */}
      <CinematicVideoSection />

      {/* 03. Top-Tier Ecosystem Wall: Golden TRUSTED BY & Authentic MNC Logos */}
      <BrandMarquee />

      {/* 04. Kinetic Manifesto: LISTEN -> EXTRACT -> CHALLENGE -> ADAPT */}
      <KineticHeadline />

      {/* 05. Conveyor vs Dynamic Branching Architecture Comparison */}
      <InterviewFlowVisualization />

      {/* 06. Live Interactive Context-Driven Dialogue Simulation */}
      <AdaptiveInterviewScene />

      {/* 07. Realtime Cartesia Sonic-3.6 Voice Stream & Waveform Engine */}
      <RealtimeVoiceExperience />

      {/* 08. Deep Resume Transformation & Claim Extraction Engine */}
      <ResumeTransformation />

      {/* 09. Dynamic Role & Skill Calibration Map */}
      <JobSkillMap />

      {/* 10. Live Syntax-Highlighted Code & Architecture Defense */}
      <ProjectDefenseScene />

      {/* 11. Signature 3D Gyroscopic Intelligence Core (Three.js WebGL) */}
      <div id="architecture">
        <InterviewIntelligence3D />
      </div>

      {/* 12. Cross-Turn Contradiction & Memory Timeline */}
      <InterviewMemoryTimeline />

      {/* 13. Interactive Multi-Track Interview Explorer */}
      <InterviewTypeExplorer />

      {/* 14. High-Contrast Editorial Evaluation Dossier & 7-Day Growth Plan */}
      <ReportPreview />

      {/* 15. The Human Cinematic Moment: Marcus Vance & Elena Rostova */}
      <HumanCinematicMoment />

      {/* 16. Monolithic Final CTA: Calibration Launch */}
      <FinalCTA />
    </main>
  );
}
