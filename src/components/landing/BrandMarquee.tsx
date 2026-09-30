"use client";

import React, { useState } from "react";
import {
  GoogleLogo,
  MicrosoftLogo,
  AmazonLogo,
  MetaLogo,
  AppleLogo,
  NvidiaLogo,
  NetflixLogo,
  OpenAILogo,
  StripeLogo,
  SpotifyLogo,
  UberLogo,
  AirbnbLogo,
  GitHubLogo,
  LinkedInLogo,
  SalesforceLogo,
  AdobeLogo,
  CiscoLogo,
  OracleLogo,
} from "./BrandLogos";
import { Sparkles, Compass, CheckCircle2, ShieldAlert } from "lucide-react";

const ROW_ONE = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
  { name: "Amazon", Logo: AmazonLogo },
  { name: "Meta", Logo: MetaLogo },
  { name: "Apple", Logo: AppleLogo },
  { name: "NVIDIA", Logo: NvidiaLogo },
  { name: "OpenAI", Logo: OpenAILogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "Netflix", Logo: NetflixLogo },
];

const ROW_TWO = [
  { name: "Spotify", Logo: SpotifyLogo },
  { name: "Uber", Logo: UberLogo },
  { name: "Airbnb", Logo: AirbnbLogo },
  { name: "GitHub", Logo: GitHubLogo },
  { name: "LinkedIn", Logo: LinkedInLogo },
  { name: "Salesforce", Logo: SalesforceLogo },
  { name: "Adobe", Logo: AdobeLogo },
  { name: "Cisco", Logo: CiscoLogo },
  { name: "Oracle", Logo: OracleLogo },
];

function SeamlessMarqueeRow({
  items,
  direction = "left",
  speedSeconds = 34,
}: {
  items: typeof ROW_ONE;
  direction?: "left" | "right";
  speedSeconds?: number;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const quadItems = [...items, ...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex items-center w-max"
        style={{
          animation: `${direction === "left" ? "marquee-left" : "marquee-right"} ${
            isPaused ? speedSeconds * 2.5 : speedSeconds
          }s linear infinite`,
          willChange: "transform",
        }}
      >
        {quadItems.map((item, idx) => {
          const LogoComponent = item.Logo;
          return (
            <div
              key={`${item.name}-${idx}`}
              className="mx-6 sm:mx-10 flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105 shrink-0 cursor-default"
              title={item.name}
            >
              <LogoComponent className="h-7 sm:h-8 w-auto filter drop-shadow-[0_2px_12px_rgba(255,255,255,0.08)]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section id="ecosystem" className="relative z-10 py-24 overflow-hidden bg-transparent border-t border-b border-white/[0.06]">
      {/* Golden & Indigo ambient glow in background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
      >
        <div className="w-[900px] h-[400px] bg-gradient-to-r from-amber-500/15 via-indigo-600/20 to-yellow-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Fade masks on left & right */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 sm:w-48 z-10"
        style={{ background: "linear-gradient(to right, rgba(6,7,13,0.85) 0%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 sm:w-48 z-10"
        style={{ background: "linear-gradient(to left, rgba(6,7,13,0.85) 0%, transparent 100%)" }}
      />

      {/* Section Header with Golden Lettering & Inspiring Copy */}
      <div className="max-w-5xl mx-auto text-center px-6 mb-14 space-y-4 relative z-10">
        
        {/* Golden Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md text-amber-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>03 / Top-Tier Ecosystem · Professional Mastery &amp; Growth</span>
        </div>

        {/* Headline with 'TRUSTED BY' in glowing golden letters */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase">
          <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
            TRUSTED BY
          </span>{" "}
          <br className="sm:hidden" />
          <span>BUILDERS AT THE WORLD&apos;S BEST COMPANIES.</span>
        </h2>

        {/* Motivating narrative on skills, communication, and learning from mistakes */}
        <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
          Engineers, system architects, and technical leaders across these industries use Veyra to refine their technical communication, 
          uncover hidden architectural blind spots, and diagnose their mistakes in safe simulations — 
          so when the real high-stakes interview begins, they speak with absolute clarity and proven confidence.
        </p>

        {/* 3 Inspiring Pillars / Surprise Value Props */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm flex items-start gap-3.5 hover:border-amber-500/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">Elevate Communication</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Transform scattered technical answers into structured, executive-level reasoning.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm flex items-start gap-3.5 hover:border-amber-500/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">Confront Mistakes Early</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Catch concurrency flaws, scale bottlenecks, and edge cases here — not in the final round.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm flex items-start gap-3.5 hover:border-amber-500/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">Turn Stumbles Into Strength</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Get turn-by-turn diagnostic breakdowns and a personalized 7-day growth trajectory.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Two-Tier Continuous Scrolling Ticker with Authentic MNC Logos */}
      <div className="relative space-y-4 pt-4">
        {/* Row 1 — Moving Left */}
        <SeamlessMarqueeRow items={ROW_ONE} direction="left" speedSeconds={34} />

        {/* Row 2 — Moving Right */}
        <SeamlessMarqueeRow items={ROW_TWO} direction="right" speedSeconds={38} />
      </div>

      {/* Motivational Footer Tagline */}
      <div className="mt-12 text-center text-xs font-mono text-slate-500 tracking-wider">
        PRACTICE WITH THE INTENSITY OF REAL PRODUCTION · GROW WITH EVERY SPOKEN TURN
      </div>
    </section>
  );
}
