import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-14 text-xs text-slate-400" style={{ background: "#06070d" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3.5">
            <BrandLogo size={28} />
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              The AI Human Interviewer. Conducting natural voice interviews with adaptive questioning, multi-turn memory, real-time code verification, and evidence-backed evaluation.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Multi-tenant Isolation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Cartesia Sonic-3.6 &amp; Ink-2
              </span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Platform</div>
            <ul className="space-y-2">
              <li><Link href="/interviews/new" className="hover:text-white transition-colors">Start Interview</Link></li>
              <li><Link href="/coding" className="hover:text-white transition-colors">Live Coding Sandbox</Link></li>
              <li><Link href="/system-design" className="hover:text-white transition-colors">System Design Canvas</Link></li>
              <li><Link href="/panel" className="hover:text-white transition-colors">Panel Interviews</Link></li>
              <li><Link href="/progress" className="hover:text-white transition-colors">Progress Tracker</Link></li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">For Teams</div>
            <ul className="space-y-2">
              <li><Link href="/company" className="hover:text-white transition-colors">Employer Portal</Link></li>
              <li><Link href="/company/roles" className="hover:text-white transition-colors">Competency Rubrics</Link></li>
              <li><Link href="/company/candidates" className="hover:text-white transition-colors">Candidate Evidence</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Enterprise Pricing</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Observability &amp; Health</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Trust &amp; Privacy</div>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Veyra</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Data Retention Controls</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} Veyra Technologies Inc. All rights reserved. Zero fake data policy.</div>
          <div className="flex items-center gap-4">
            <span>Cartesia Sonic-3.6 Realtime Voice Core</span>
            <span>•</span>
            <span>Piston Sandbox Runtime</span>
            <span>•</span>
            <span>Prisma Relational Store</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
