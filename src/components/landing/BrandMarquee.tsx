"use client";

import React, { useState } from "react";
import {
  GoogleLogo,
  MicrosoftLogo,
  MetaLogo,
  AppleLogo,
  AmazonLogo,
  NvidiaLogo,
  OpenAILogo,
  AnthropicLogo,
  StripeLogo,
  GitHubLogo,
  CloudflareLogo,
  DatadogLogo,
  SalesforceLogo,
  AdobeLogo,
  NetflixLogo,
  UberLogo,
  TeslaLogo,
  LinkedInLogo,
} from "./BrandLogos";

interface BrandItem {
  name: string;
  category: string;
  Logo: React.FC<{ className?: string }>;
}

const ROW_ONE: BrandItem[] = [
  { name: "Google", category: "Distributed AI", Logo: GoogleLogo },
  { name: "OpenAI", category: "Frontier Intelligence", Logo: OpenAILogo },
  { name: "NVIDIA", category: "Accelerated Compute", Logo: NvidiaLogo },
  { name: "Anthropic", category: "Safety & Reasoning", Logo: AnthropicLogo },
  { name: "Microsoft", category: "Hyperscale Cloud", Logo: MicrosoftLogo },
  { name: "Meta", category: "Open Source AI", Logo: MetaLogo },
];

const ROW_TWO: BrandItem[] = [
  { name: "Stripe", category: "Financial Infrastructure", Logo: StripeLogo },
  { name: "GitHub", category: "Code Collaboration", Logo: GitHubLogo },
  { name: "Cloudflare", category: "Global Edge Network", Logo: CloudflareLogo },
  { name: "Apple", category: "Edge Silicon", Logo: AppleLogo },
  { name: "Amazon", category: "Distributed Systems", Logo: AmazonLogo },
  { name: "Datadog", category: "Observability", Logo: DatadogLogo },
];

const ROW_THREE: BrandItem[] = [
  { name: "Tesla", category: "Realtime Autonomy", Logo: TeslaLogo },
  { name: "Netflix", category: "Streaming Architecture", Logo: NetflixLogo },
  { name: "Uber", category: "Realtime Dispatch", Logo: UberLogo },
  { name: "Salesforce", category: "Enterprise Platform", Logo: SalesforceLogo },
  { name: "Adobe", category: "Creative Compute", Logo: AdobeLogo },
  { name: "LinkedIn", category: "Professional Graph", Logo: LinkedInLogo },
];

function MarqueeRow({
  items,
  direction = "left",
  duration = 32,
  opacity = 0.85,
}: {
  items: BrandItem[];
  direction?: "left" | "right";
  duration?: number;
  opacity?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const repeated = [...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ opacity }}
    >
      <div
        className="flex gap-8 sm:gap-12 items-center w-max"
        style={{
          animation: `${direction === "left" ? "marquee-left" : "marquee-right"} ${
            isHovered ? duration * 1.8 : duration
          }s linear infinite`,
          willChange: "transform",
        }}
      >
        {repeated.map((item, idx) => {
          const LogoComponent = item.Logo;
          return (
            <div
              key={`${item.name}-${idx}`}
              className="flex items-center gap-3.5 px-5 py-3 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group shrink-0"
            >
              <div className="text-slate-400 group-hover:text-white transition-colors duration-200">
                <LogoComponent className="h-4 sm:h-5 w-auto" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-semibold text-slate-300 group-hover:text-white tracking-tight transition-colors">
                  {item.name}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">
                  {item.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="relative py-28 overflow-hidden bg-[#06070d]">
      {/* Soft Ambient Radial Backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
      >
        <div className="w-[800px] h-[350px] bg-gradient-to-r from-indigo-900/20 via-violet-900/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border border-white/10 bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          The Modern Engineering Ecosystem
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          BUILT FOR THE MODERN AI WORKFLOW
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Designed around the tools, engineering practices and technical workflows used across today&apos;s leading technology organizations.
        </p>
      </div>

      {/* 3-Tier Layered Marquee */}
      <div className="relative space-y-4">
        {/* Edge Fade Masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-48 z-20"
          style={{ background: "linear-gradient(to right, #06070d 20%, transparent 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-48 z-20"
          style={{ background: "linear-gradient(to left, #06070d 20%, transparent 100%)" }}
        />

        {/* Row 1 - Foreground */}
        <MarqueeRow items={ROW_ONE} direction="left" duration={30} opacity={1} />

        {/* Row 2 - Midground */}
        <MarqueeRow items={ROW_TWO} direction="right" duration={40} opacity={0.88} />

        {/* Row 3 - Background depth */}
        <MarqueeRow items={ROW_THREE} direction="left" duration={52} opacity={0.7} />
      </div>
    </section>
  );
}
