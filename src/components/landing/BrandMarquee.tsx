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
  speedSeconds = 35,
}: {
  items: typeof ROW_ONE;
  direction?: "left" | "right";
  speedSeconds?: number;
}) {
  const [isPaused, setIsPaused] = useState(false);
  // Duplicate 4 times to ensure seamless infinite looping without gaps on ultra-wide screens
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
              className="mx-6 sm:mx-10 flex items-center justify-center opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-105 shrink-0 cursor-default"
              title={item.name}
            >
              <LogoComponent className="h-7 sm:h-8 w-auto filter drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="relative py-20 overflow-hidden bg-[#06070d] border-t border-b border-white/[0.04]">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25"
      >
        <div className="w-[800px] h-[350px] bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Fade masks on left & right */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 sm:w-48 z-10"
        style={{ background: "linear-gradient(to right, #06070d 0%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 sm:w-48 z-10"
        style={{ background: "linear-gradient(to left, #06070d 0%, transparent 100%)" }}
      />

      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-12 space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Top-Tier Engineering Ecosystem
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          BUILT FOR CANDIDATES TARGETING TOP MNCs
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
          Calibrate your system design, live coding, and architectural trade-offs against the production benchmarks of leading technology companies.
        </p>
      </div>

      {/* Two-Tier Continuous Scrolling Ticker */}
      <div className="relative space-y-4">
        {/* Row 1 — Moving Left */}
        <SeamlessMarqueeRow items={ROW_ONE} direction="left" speedSeconds={32} />

        {/* Row 2 — Moving Right */}
        <SeamlessMarqueeRow items={ROW_TWO} direction="right" speedSeconds={36} />
      </div>
    </section>
  );
}
