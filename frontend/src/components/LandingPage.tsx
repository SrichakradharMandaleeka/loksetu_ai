import React from 'react';
import { Landmark, Users, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Issue, ProjectProposal } from '../types';

interface LandingPageProps {
  issues: Issue[];
  projects: ProjectProposal[];
  onStart: () => void;
  onSelectRoleDirect: (role: 'citizen' | 'mp') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  issues,
  projects,
  onStart,
  onSelectRoleDirect,
}) => {
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lk`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const totalBudgets = projects.reduce((sum, p) => sum + p.estimatedBudget, 0);

  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-bold font-mono tracking-wider">
          <Sparkles className="h-4 w-4 text-amber-500" /> AI-POWERED CONSTITUENCY INTELLIGENCE PLATFORM
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Democracy Heard. <br />
          <span className="bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text text-transparent">Actionable Work prioritized.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Loksetu AI turns citizen voice recordings and photographs into compiled, deduplicated development works. Designed to empower Members of Parliament to optimize budgets and implement projects with high transparency.
        </p>
        
        {/* Call to Actions */}
        <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Get Started & Sign In
          </button>
          <div className="text-xs text-slate-400 font-medium font-mono">or try quick modes:</div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectRoleDirect('citizen')}
              className="px-4 py-2 text-xs font-bold border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700 cursor-pointer"
            >
              Citizen Portal
            </button>
            <button
              onClick={() => onSelectRoleDirect('mp')}
              className="px-4 py-2 text-xs font-bold border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700 cursor-pointer"
            >
              MP Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-3xl bg-slate-900 p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center space-y-1 relative z-10">
          <p className="text-slate-400 text-[10px] font-bold font-mono tracking-wider uppercase">GRIEVANCES LOGGED</p>
          <p className="font-display text-3xl font-extrabold text-blue-400">{issues.length || 5}</p>
        </div>
        <div className="text-center space-y-1 border-l border-slate-800 relative z-10">
          <p className="text-slate-400 text-[10px] font-bold font-mono tracking-wider uppercase">SANCTIONED WORKS</p>
          <p className="font-display text-3xl font-extrabold text-emerald-400">{projects.length || 2}</p>
        </div>
        <div className="text-center space-y-1 border-l border-slate-800 relative z-10">
          <p className="text-slate-400 text-[10px] font-bold font-mono tracking-wider uppercase">OPTIMIZED BUDGET</p>
          <p className="font-display text-3xl font-extrabold text-indigo-400">{formatINR(totalBudgets || 53000000)}</p>
        </div>
        <div className="text-center space-y-1 border-l border-slate-800 relative z-10">
          <p className="text-slate-400 text-[10px] font-bold font-mono tracking-wider uppercase">AUDIT VALIDATION</p>
          <p className="font-display text-3xl font-extrabold text-amber-400">94% Quality</p>
        </div>
      </div>

      {/* Hackathon Problem Statement Focus Box */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/60 shadow-sm relative">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">CONSTITUENCY PROBLEM STATEMENT</span>
          <h3 className="font-display font-extrabold text-slate-800 dark:text-white text-xl sm:text-2xl leading-tight">
            "AI for Constituency Development Planning – Turning Citizen Voices into Ranked, Actionable Development Works."
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Rather than a generic complain box, Loksetu AI is designed as a deep planning portal. Every local dialect recording is translated, deduplicated, scored by gravity risk index, and mapped directly to budgetary optimizations.
          </p>
        </div>
      </div>

      {/* Pipeline Architecture */}
      <div className="space-y-8">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-center">
          The Loksetu AI Pipeline Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { step: "01", name: "Multi-Modal Report", desc: "Citizen submits text, photo, or direct native voice in local Hindi/Urdu. GPS coordinate logged." },
            { step: "02", name: "AI Categorize & Deduplicate", desc: "Gemini automatically translates dialects, detects duplicates, and assigns department tags." },
            { step: "03", name: "AI Priority Engine", desc: "Calculates score combining citizen upvotes, estimated local impact, and hazard safety rating." },
            { step: "04", name: "AI Budget Planner", desc: "MP utilizes AI optimization knapsacks to allocate funds to high-priority proposals." },
            { step: "05", name: "Citizen Verify Audit", desc: "Once complete, citizen uploads after-photos; AI analyzes comments to audit contractor quality." }
          ].map((pipeline, index) => (
            <div key={index} className="relative rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
              <span className="font-mono text-3xl font-extrabold text-blue-500/20 block mb-2">{pipeline.step}</span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">{pipeline.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{pipeline.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
