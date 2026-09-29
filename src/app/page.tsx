import React from "react";
import { HeroExperience } from "@/components/landing/HeroExperience";
import { BrandMarquee } from "@/components/landing/BrandMarquee";
import { KineticHeadline } from "@/components/landing/KineticHeadline";
import { InterviewFlowVisualization } from "@/components/landing/InterviewFlowVisualization";
import { AdaptiveInterviewScene } from "@/components/landing/AdaptiveInterviewScene";
import { RealtimeVoiceExperience } from "@/components/landing/RealtimeVoiceExperience";
import { CinematicVideoSection } from "@/components/landing/CinematicVideoSection";
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
    <main className="veyra-grain flex flex-col w-full overflow-x-hidden bg-[#06070d] text-white">
      {/* 1. Cinematic Hero Section with 3D Spatial Mouse Parallax & Live Product HUD */}
      <HeroExperience />

      {/* 2. Ecosystem Brand Wall (Multi-Speed Logo Marquee) */}
      <BrandMarquee />

      {/* 3. Kinetic Manifesto: LISTEN -> EXTRACT -> CHALLENGE -> ADAPT */}
      <KineticHeadline />

      {/* 4. Conveyor vs Dynamic Branching Architecture Comparison */}
      <InterviewFlowVisualization />

      {/* 5. Live Interactive Context-Driven Dialogue Simulation */}
      <AdaptiveInterviewScene />

      {/* 6. Realtime Cartesia Sonic-3.6 Voice Stream & Waveform Engine */}
      <RealtimeVoiceExperience />

      {/* 7. Authentic Cinematic Product Video Frame */}
      <CinematicVideoSection />

      {/* 8. Deep Resume Transformation & Claim Extraction Engine */}
      <ResumeTransformation />

      {/* 9. Dynamic Role & Skill Calibration Map */}
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
