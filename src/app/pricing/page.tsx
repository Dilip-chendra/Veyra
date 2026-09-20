import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Shield } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free Tier",
      price: "$0",
      description: "For engineers seeking authentic baseline interview preparation.",
      features: [
        "3 Full AI Human Interviews / month",
        "3D WebGL Photorealistic Avatar Engine",
        "Real-time voice turn-taking and interruptions",
        "Evidence-backed scorecard reports",
        "Basic live coding with Python & JavaScript",
      ],
      cta: "Get Started Free",
      href: "/signup",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/ month",
      description: "For candidates preparing for tier-1 tech and senior engineering roles.",
      features: [
        "Unlimited AI Human Interviews",
        "All 12 Interview Modes (System Design, Coding, Stress, Defense)",
        "Deep GitHub repository AST analysis & claim testing",
        "Synchronized video/audio replay with timeline jumps",
        "Personalized 5-part gap remediation training plans",
        "Monaco live coding in 7 languages via Piston sandboxes",
      ],
      cta: "Start Pro Plan",
      href: "/signup",
      popular: true,
    },
    {
      name: "Enterprise Teams",
      price: "$199",
      period: "/ month",
      description: "For hiring organizations seeking evidence-backed candidate screening.",
      features: [
        "Custom competency rubrics & job requisition builder",
        "Multi-candidate pipeline evaluation & comparison",
        "Live stealth recruiter join & AI human handoff",
        "Multi-tenant tenant isolation with audit logs",
        "Dedicated provider configuration (OpenAI, Tavus, ElevenLabs)",
      ],
      cta: "Contact Employer Sales",
      href: "/signup",
      popular: false,
    },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Invest in Realistic Interview Scrutiny
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          No fake scores or superficial question banks. Practice across from an autonomous human interviewer that probes depth and remembers claims.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className={`rounded-3xl p-8 flex flex-col justify-between space-y-6 transition-all ${
              t.popular
                ? "bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/40 relative"
                : "bg-slate-900/60 border border-slate-800"
            }`}
          >
            {t.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow">
                Most Popular
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">{t.price}</span>
                {t.period && <span className="text-xs text-slate-400">{t.period}</span>}
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                {t.features.map((f, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={t.href}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                t.popular
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <span>{t.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
