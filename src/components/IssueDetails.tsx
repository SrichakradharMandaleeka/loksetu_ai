import React, { useState } from 'react';
import { 
  ArrowLeft, ThumbsUp, Volume2, Sparkles, CheckCircle2, 
  Clock, Landmark, AlertTriangle, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { Issue, ProjectProposal, calculateDevelopmentImpact } from '../types';

interface IssueDetailsProps {
  issue: Issue;
  project: ProjectProposal | null;
  currentRole: 'citizen' | 'mp';
  onBack: () => void;
  onUpvote: (id: string) => void;
  onGenerateProposal: (id: string) => void;
  onVerify: (rating: number, comments: string) => void;
  submittingVerification: boolean;
}

export const IssueDetails: React.FC<IssueDetailsProps> = ({
  issue,
  project,
  currentRole,
  onBack,
  onUpvote,
  onGenerateProposal,
  onVerify,
  submittingVerification
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(rating, comments);
    setComments('');
  };

  // Get dynamic impact scores
  const impact = project ? calculateDevelopmentImpact(project) : null;

  return (
    <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: General Grievance Details & Audit Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
            
            {/* Header tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {issue.ward}
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 px-2.5 py-0.5 rounded text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {issue.category}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-50 px-2.5 py-0.5 border rounded text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                Ref: #{issue.id}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
                {issue.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono font-semibold">
                Logged on: {issue.date.split('T')[0]} by {issue.citizenName}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {issue.description}
              </p>
            </div>

            {/* Attachments (Voice/Photo) */}
            {issue.voiceUrl && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                <Volume2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">Citizen Vocal Tape Attached</span>
                  <p className="text-[10px] text-slate-500 font-medium">Vocal record has been processed and translated server-side.</p>
                </div>
              </div>
            )}

            {issue.image && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CITIZEN EVIDENCE PHOTO</span>
                <img
                  src={issue.image}
                  alt={issue.title}
                  referrerPolicy="no-referrer"
                  className="rounded-2xl w-full object-cover max-h-72 border border-slate-100"
                />
              </div>
            )}

            {/* Interaction buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => onUpvote(issue.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{issue.upvotes} Upvotes</span>
              </button>
              
              {currentRole === 'mp' && !project && (
                <button
                  onClick={() => onGenerateProposal(issue.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Sanction AI Project Proposal</span>
                </button>
              )}
            </div>
          </div>

          {/* Citizen Verification Audit Form */}
          {project && project.status === 'completed' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Citizen Quality Verification Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As a citizen, you are the auditor. Has the contractor successfully fixed this issue according to specifications? Review and rate contractor performance.
              </p>

              {issue.verification ? (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl dark:bg-emerald-950/20 dark:border-emerald-900/40 space-y-2">
                  <div className="flex justify-between font-mono font-bold text-[10px]">
                    <span className="text-emerald-700 dark:text-emerald-300">AUDIT VERIFIED</span>
                    <span className="text-rose-600">AI Quality Score: {issue.verification.qualityScore}%</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">"{issue.verification.comments}"</p>
                  <p className="text-[10px] text-slate-400 italic">Feedback: {issue.verification.aiFeedback}</p>
                </div>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Contractor Quality Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-lg transition ${star <= rating ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Your On-Site Assessment</label>
                    <textarea
                      required
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Comment on structural alignment, sanitation flow, clean water clarity..."
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingVerification}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
                  >
                    {submittingVerification ? "Running AI Audit..." : "Submit Quality Audit"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Side: AI assessment, proposal & DEVELOPMENT IMPACT SCORE breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Prioritization assessment */}
          {issue.aiAnalysis && (
            <div className="rounded-3xl border border-blue-100 bg-blue-50/20 p-6 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-4">
              <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 font-bold text-xs tracking-wider uppercase font-mono">
                <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> AI PRIORITIZATION DIAGNOSIS
              </div>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between py-1 border-b border-blue-100/50 dark:border-slate-800/80">
                  <span className="text-slate-500">Gravity Score:</span>
                  <span className="text-rose-600 font-mono font-bold">{issue.aiAnalysis.priorityScore}/100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100/50 dark:border-slate-800/80">
                  <span className="text-slate-500">Urgency Multiplier:</span>
                  <span className="text-amber-600 font-mono font-bold">{issue.aiAnalysis.urgency}/10</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100/50 dark:border-slate-800/80">
                  <span className="text-slate-500">Vulnerability Threat:</span>
                  <span className="text-indigo-600 capitalize">{issue.aiAnalysis.severity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Lives Affected:</span>
                  <span className="text-emerald-600 font-mono">{issue.aiAnalysis.estimatedPeopleAffected.toLocaleString('en-IN')} citizens</span>
                </div>
              </div>
            </div>
          )}

          {/* Development Impact Score breakdown */}
          {project && impact && (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/10 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/10 space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block font-mono">PORTFOLIO IMPACT INDEX</span>
                <h4 className="font-display font-extrabold text-slate-800 dark:text-white text-base">Development Impact Score</h4>
              </div>

              {/* Radial gauge representation */}
              <div className="relative flex justify-center items-center py-4">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="#e2e8f0" strokeWidth="6" fill="transparent" className="dark:stroke-slate-800" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * (impact.totalImpactScore / 100))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold font-mono text-emerald-600">{impact.totalImpactScore}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Score</span>
                </div>
              </div>

              {/* 6 dimensions breakdown */}
              <div className="space-y-3 pt-2 text-[11px] font-bold">
                {[
                  { name: 'Citizens Benefited', score: impact.citizensBenefitedScore },
                  { name: 'Urgency Index', score: impact.urgencyScore },
                  { name: 'Safety Impact', score: impact.safetyImpactScore },
                  { name: 'Cost Efficiency', score: impact.costEfficiencyScore },
                  { name: 'Economic Impact', score: impact.economicImpactScore },
                  { name: 'Environmental Impact', score: impact.environmentalImpactScore }
                ].map((dim, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>{dim.name}</span>
                      <span className="font-mono text-slate-800 dark:text-white">{dim.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${dim.score}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
