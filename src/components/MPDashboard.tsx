import React, { useState } from 'react';
import { 
  Plus, Users, Award, MapPin, Bell, Sparkles, Send, 
  RefreshCw, Landmark, AlertTriangle, FileText, BarChart3, 
  DollarSign, CheckCircle2, Bot, HelpCircle, FileDown 
} from 'lucide-react';
import { Issue, ProjectProposal, User, Notification } from '../types';
import { MapComponent } from './MapComponent';
import { Charts } from './Charts';
import { AIChatBot } from './AIChatBot';

interface MPDashboardProps {
  currentUser: User;
  issues: Issue[];
  projects: ProjectProposal[];
  notifications: Notification[];
  onGenerateProposal: (issueId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: 'approved' | 'in_progress' | 'completed') => void;
  onViewIssueDetail: (issue: Issue) => void;
  onOptimizeBudget: (targetBudget: number) => Promise<any>;
  onGenerateMonthlyReport: () => Promise<string>;
  generatingProposal: boolean;
  optimizingBudget: boolean;
  generatingReport: boolean;
}

type MPSubTab = 'priority-dashboard' | 'heat-map' | 'development-planner' | 'analytics' | 'reports' | 'ai-assistant' | 'notifications';

export const MPDashboard: React.FC<MPDashboardProps> = ({
  currentUser,
  issues,
  projects,
  notifications,
  onGenerateProposal,
  onUpdateProjectStatus,
  onViewIssueDetail,
  onOptimizeBudget,
  onGenerateMonthlyReport,
  generatingProposal,
  optimizingBudget,
  generatingReport
}) => {
  const [subTab, setSubTab] = useState<MPSubTab>('priority-dashboard');

  // Budget Optimizer Form States
  const [targetBudget, setTargetBudget] = useState<number>(50000000); // 5 Crore default
  const [budgetPlan, setBudgetPlan] = useState<any>(null);

  // Monthly Report Text State
  const [monthlyReport, setMonthlyReport] = useState<string>('');

  const handleRunOptimizer = async () => {
    const data = await onOptimizeBudget(targetBudget);
    if (data) {
      setBudgetPlan(data);
    }
  };

  const handleRunReportGenerator = async () => {
    const text = await onGenerateMonthlyReport();
    if (text) {
      setMonthlyReport(text);
    }
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* 1. MP Sidebar Left (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              MP
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">{currentUser.name}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Lucknow Central MP</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {[
              { id: 'priority-dashboard', label: 'AI Priority Dashboard', icon: Landmark, count: issues.filter(i => i.status === 'submitted' || i.status === 'ai_analysis').length },
              { id: 'heat-map', label: 'Constituency Heat Map', icon: MapPin },
              { id: 'development-planner', label: 'AI Development Planner', icon: Sparkles, count: projects.length },
              { id: 'analytics', label: 'Analytics Summary', icon: BarChart3 },
              { id: 'reports', label: 'Monthly Intelligence', icon: FileText },
              { id: 'ai-assistant', label: 'AI Governance Chat', icon: Bot },
              { id: 'notifications', label: 'System Alerts', icon: Bell, count: notifications.filter(n => !n.read).length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as MPSubTab)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini Budget stats summary inside sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">PORTFOLIO FUNDING</span>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500">Allocated Budget:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">{formatINR(projects.reduce((s, p) => s + p.estimatedBudget, 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sanctioned Works:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">{projects.length} files</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Sub-View panel (9 cols) */}
      <div className="lg:col-span-9">
        
        {/* SubTab 1: AI Priority Dashboard */}
        {subTab === 'priority-dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Constituency Urgent Demands</h3>
              <span className="text-xs font-mono font-semibold text-slate-500">Ranked by Loksetu Risk Gravity Index</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {issues.map((issue) => {
                const priority = issue.aiAnalysis?.priorityScore || 50;
                const gravityColor = priority >= 90 ? 'text-red-600' : priority >= 75 ? 'text-orange-500' : 'text-yellow-600';
                
                return (
                  <div
                    key={issue.id}
                    onClick={() => onViewIssueDetail(issue)}
                    className="group border border-slate-200 rounded-2xl p-5 bg-white hover:border-emerald-300 hover:shadow-md transition cursor-pointer dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {issue.ward}
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {issue.category}
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-slate-50 px-2 py-0.5 border rounded text-slate-600 capitalize">
                            Status: {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-slate-800 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 transition text-sm">
                          {issue.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
                          {issue.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">PRIORITY SCORE</span>
                        <span className={`text-lg font-extrabold font-mono ${gravityColor}`}>{priority}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-mono font-semibold">
                      <div className="flex items-center gap-3">
                        <span>👍 {issue.upvotes} Citizens Endorsed</span>
                        <span>👥 Est. Affected: {issue.aiAnalysis?.estimatedPeopleAffected || 1000}</span>
                      </div>
                      <span className="text-emerald-600 font-bold hover:underline">Review AI Project Proposal →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SubTab 2: Heat Map */}
        {subTab === 'heat-map' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Constituency Severity GPS Grid</h3>
              <span className="text-xs font-mono font-semibold text-slate-500">Live coordinates of reported grievances</span>
            </div>
            <div className="h-[480px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <MapComponent
                issues={issues}
                onSelectIssue={onViewIssueDetail}
              />
            </div>
          </div>
        )}

        {/* SubTab 3: AI Development Planner & Budget Optimizer */}
        {subTab === 'development-planner' && (
          <div className="space-y-8">
            
            {/* 1. Integrated Budget Optimizer Panel */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-6 sm:p-8 dark:border-emerald-900/50 dark:bg-emerald-950/10 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" /> AI Budget Optimizer & knapsack Planner
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter your total available development budget. Gemini will compile the most cost-efficient and high-impact combinations of projects.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 border border-slate-200/80 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 pl-2">₹ Target Cap:</span>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-32 text-xs font-mono font-bold bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={handleRunOptimizer}
                    disabled={optimizingBudget}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {optimizingBudget ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                    <span>Optimize</span>
                  </button>
                </div>
              </div>

              {budgetPlan && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">OPTIMAL COST</span>
                      <span className="text-sm font-extrabold font-mono text-emerald-600">{formatINR(budgetPlan.totalEstimatedCost)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">REMAINING GAP</span>
                      <span className="text-sm font-extrabold font-mono text-slate-700 dark:text-slate-300">{formatINR(budgetPlan.remainingBudget)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">TOTAL BENEFICIARIES</span>
                      <span className="text-sm font-extrabold font-mono text-indigo-600">{budgetPlan.citizensImpacted.toLocaleString('en-IN')} voters</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">AI COMMISSIONER JUSTIFICATION</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic">
                      "{budgetPlan.executiveJustification}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. List of current projects */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Active Development Portfolio</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-slate-200 bg-white rounded-2xl p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          ID: {project.id}
                        </span>
                        <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white mt-1">
                          {project.recommendedProject}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{project.problemSummary}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ESTIMATED BUDGET</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-600">{formatINR(project.estimatedBudget)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-500">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">BENEFICIARIES</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{project.expectedBeneficiaries.toLocaleString('en-IN')} citizens</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">COMPLETION TIME</span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{project.completionTime}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">DEPARTMENT</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block w-full">{project.responsibleDepartment}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">STAGE</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 capitalize">{project.status}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {project.status === 'draft' && (
                        <button
                          onClick={() => onUpdateProjectStatus(project.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Approve Project
                        </button>
                      )}
                      {project.status === 'approved' && (
                        <button
                          onClick={() => onUpdateProjectStatus(project.id, 'in_progress')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Deploy Contractors
                        </button>
                      )}
                      {project.status === 'in_progress' && (
                        <button
                          onClick={() => onUpdateProjectStatus(project.id, 'completed')}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SubTab 4: Analytics Summary */}
        {subTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Constituency Performance Analytics</h3>
            <Charts issues={issues} />
          </div>
        )}

        {/* SubTab 5: Reports */}
        {subTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Monthly Speech & Intelligence Report</h3>
                <p className="text-xs text-slate-500">Generate professional constituency briefings ready for ministerial presentation.</p>
              </div>
              <button
                onClick={handleRunReportGenerator}
                disabled={generatingReport}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                {generatingReport ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Generate Intelligence Report</span>
              </button>
            </div>

            {monthlyReport ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4 font-sans text-xs text-slate-800 dark:text-slate-200 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">CONSTITUENCY UPDATE DOCUMENT</span>
                  <button
                    onClick={() => window.print()}
                    className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <FileDown className="h-3.5 w-3.5" /> Print Report
                  </button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap font-medium">
                  {monthlyReport}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Report Generated Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Click the button above to assemble live logs, priorities, and project budgets into a professional PDF briefing.</p>
              </div>
            )}
          </div>
        )}

        {/* SubTab 6: AI Assistant */}
        {subTab === 'ai-assistant' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Loksetu AI Governance Assistant</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive agent trained strictly for municipal allocations, priority analysis, and project evaluations.</p>
            </div>
            
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 h-[500px] flex flex-col relative overflow-hidden">
              <AIChatBot />
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
                  <Bot className="h-6 w-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Loksetu AI Assistant is Online</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">The chatbot is floating on the bottom right. Click the chat bubble to discuss live priorities, search projects, or verify department worklogs!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 7: Notifications */}
        {subTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">System Alerts Feed</h3>
            <div className="space-y-3.5">
              {notifications.map((not) => (
                <div key={not.id} className="flex gap-4 p-4 border border-slate-200/60 bg-white rounded-2xl dark:border-slate-800 dark:bg-slate-900">
                  <span className={`h-3.5 w-3.5 rounded-full shrink-0 mt-0.5 ${
                    not.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{not.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{not.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">{not.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
