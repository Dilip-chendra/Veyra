import React from "react";
import Link from "next/link";
import { Shield, Cpu } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <BrandLogo size={26} />
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              The real-time, photorealistic human-like AI interviewer. Conducting natural voice interviews with eye contact, dynamic follow-ups, memory, live coding, and evidence-backed evaluation.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Multi-tenant Tenant Isolation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> WebGL 3D Facial Rig
              </span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-200">Platform</div>
            <ul className="space-y-1.5">
              <li><Link href="/interviews/new" className="hover:text-white transition-colors">Start Interview</Link></li>
              <li><Link href="/coding" className="hover:text-white transition-colors">Live Coding Sandbox</Link></li>
              <li><Link href="/system-design" className="hover:text-white transition-colors">System Design Canvas</Link></li>
              <li><Link href="/panel" className="hover:text-white transition-colors">Panel Interviews</Link></li>
              <li><Link href="/progress" className="hover:text-white transition-colors">Progress Tracker</Link></li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-200">For Teams</div>
            <ul className="space-y-1.5">
              <li><Link href="/company" className="hover:text-white transition-colors">Employer Portal</Link></li>
              <li><Link href="/company/roles" className="hover:text-white transition-colors">Competency Rubrics</Link></li>
              <li><Link href="/company/candidates" className="hover:text-white transition-colors">Candidate Evidence</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Enterprise Pricing</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Observability & Health</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-200">Trust & Privacy</div>
            <ul className="space-y-1.5">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Veyra</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Data Retention Controls</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
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
