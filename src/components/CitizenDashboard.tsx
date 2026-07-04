import React, { useState } from 'react';
import { 
  Plus, Users, MapPin, Bell, User as UserIcon, ListFilter, 
  ThumbsUp, Volume2, Sparkles, Send, RefreshCw, Landmark, AlertTriangle 
} from 'lucide-react';
import { Issue, User, Notification } from '../types';
import { MapComponent } from './MapComponent';
import { VoiceRecorder } from './VoiceRecorder';

interface CitizenDashboardProps {
  currentUser: User;
  issues: Issue[];
  notifications: Notification[];
  onSubmitIssue: (title: string, desc: string, cat: string, ward: string, address: string, img: string, voice: string) => Promise<Issue | null>;
  onUpvote: (id: string) => void;
  onViewIssueDetail: (issue: Issue) => void;
  submittingIssue: boolean;
}

type CitizenSubTab = 'report' | 'my-issues' | 'status' | 'nearby' | 'notifications' | 'profile';

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  issues,
  notifications,
  onSubmitIssue,
  onUpvote,
  onViewIssueDetail,
  submittingIssue
}) => {
  const [subTab, setSubTab] = useState<CitizenSubTab>('my-issues');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [ward, setWard] = useState('Ward 12 - Gomti Sector');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  // Status Filter State
  const [selectedStatusIssue, setSelectedStatusIssue] = useState<Issue | null>(
    issues.find(i => i.citizenId === currentUser.id) || issues[0] || null
  );

  const myIssues = issues.filter(i => i.citizenId === currentUser.id);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newIssue = await onSubmitIssue(title, description, category, ward, address, imageUrl, voiceUrl);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setVoiceUrl('');

    if (newIssue) {
      // Set status issue to the new one so they can see the AI assessment immediately!
      setSelectedStatusIssue(newIssue);
      // Change subTab to 'status' as required: "Improve the AI-first experience by making the AI analysis card the primary focus after every complaint submission."
      setSubTab('status');
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'submitted': return 1;
      case 'ai_analysis': return 2;
      case 'approved': return 3;
      case 'started': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* 1. Left Nav Sidebar (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              {currentUser.name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">{currentUser.name}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.constituency}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {[
              { id: 'report', label: 'Report Issue', icon: Plus },
              { id: 'my-issues', label: 'My Issues', icon: ListFilter, count: myIssues.length },
              { id: 'status', label: 'Issue Status', icon: Landmark },
              { id: 'nearby', label: 'Nearby Issues', icon: MapPin, count: issues.length },
              { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
              { id: 'profile', label: 'Voter Profile', icon: UserIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as CitizenSubTab)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
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
      </div>

      {/* 2. Main Sub-View panel (9 cols) */}
      <div className="lg:col-span-9">
        
        {/* SubTab 1: Report Issue */}
        {subTab === 'report' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" /> File a Constituency Grievance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Voice inputs are parsed directly. Gemini will automatically translate local dialects, categorize, and deduplicate with high accuracy.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Grievance / Problem Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Concrete Cracking under Gomti River Bridge"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-semibold"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Public Health">Public Health</option>
                    <option value="Roads & Transport">Roads & Transport</option>
                    <option value="Power & Street Lighting">Power & Street Lighting</option>
                    <option value="Education & Public Facilities">Education & Public Facilities</option>
                    <option value="Environment & Forestry">Environment & Forestry</option>
                    <option value="Public Safety & Security">Public Safety & Security</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ward / Locality Group
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-semibold"
                  >
                    <option value="Ward 12 - Gomti Sector">Ward 12 - Gomti Sector</option>
                    <option value="Ward 14 - Central Metro">Ward 14 - Central Metro</option>
                    <option value="Ward 22 - Green Meadows">Ward 22 - Green Meadows</option>
                    <option value="Ward 08 - Industrial Hub">Ward 08 - Industrial Hub</option>
                    <option value="Ward 15 - Hazratganj Zone">Ward 15 - Hazratganj Zone</option>
                    <option value="Ward 18 - Aliganj Extension">Ward 18 - Aliganj Extension</option>
                    <option value="Ward 24 - Indira Nagar South">Ward 24 - Indira Nagar South</option>
                    <option value="Ward 05 - Chowk Heritage Sector">Ward 05 - Chowk Heritage Sector</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Detailed Description of Problem
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what lives are affected, the duration of failure, and safety hazards..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 leading-relaxed"
                />
              </div>

              <VoiceRecorder onRecordingComplete={(url) => setVoiceUrl(url)} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Attach Evidence Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. paste a web link of photograph"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={submittingIssue}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingIssue ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Deduplicating & Running AI Analysis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit Grievance to Loksetu AI Grid</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* SubTab 2: My Issues */}
        {subTab === 'my-issues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Your Registered Grievances</h3>
              <span className="text-xs font-mono font-bold text-slate-500">{myIssues.length} active logs</span>
            </div>

            {myIssues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4 dark:border-slate-800 dark:bg-slate-900">
                <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Issues Reported Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Report a community failure to trigger our AI prioritization grid!</p>
                </div>
                <button
                  onClick={() => setSubTab('report')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                >
                  Report First Issue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onViewIssueDetail(issue)}
                    className="group border border-slate-200 rounded-2xl p-5 bg-white hover:border-blue-300 hover:shadow-md transition cursor-pointer dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {issue.ward}
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {issue.category}
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-amber-50 px-2 py-0.5 rounded text-amber-700 capitalize">
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-slate-800 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition text-sm">
                          {issue.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
                          {issue.description}
                        </p>
                      </div>
                      {issue.image && (
                        <img
                          src={issue.image}
                          alt={issue.title}
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded-xl object-cover shrink-0"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-mono font-semibold">
                      <div className="flex items-center gap-3">
                        <span>👍 {issue.upvotes} Upvotes</span>
                        {issue.voiceUrl && <span className="text-emerald-600">🎤 Audio</span>}
                      </div>
                      {issue.aiAnalysis && (
                        <span className="text-rose-600">AI Priority Score: {issue.aiAnalysis.priorityScore}/100</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SubTab 3: Issue Status (Visual Tracker Timeline) */}
        {subTab === 'status' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Active Resolution Tracking</h3>
              <select
                value={selectedStatusIssue?.id || ''}
                onChange={(e) => setSelectedStatusIssue(issues.find(i => i.id === e.target.value) || null)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-bold"
              >
                {issues.map(i => (
                  <option key={i.id} value={i.id}>{i.title.slice(0, 32)}...</option>
                ))}
              </select>
            </div>

            {selectedStatusIssue ? (
              <div className="space-y-6">
                {/* Visual Timeline Stepper */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-8">
                  
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">LIVE STATUS MONITOR</span>
                    <h4 className="font-display font-extrabold text-lg text-slate-800 dark:text-white">{selectedStatusIssue.title}</h4>
                    <p className="text-xs text-slate-500 font-mono">Grievance Ref: #{selectedStatusIssue.id}</p>
                  </div>

                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
                    {/* Progress line */}
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 hidden md:block dark:bg-slate-800" />
                    
                    {[
                      { step: 1, label: 'Submitted', desc: 'Voter logged details' },
                      { step: 2, label: 'AI Assessed', desc: 'Category & Score assigned' },
                      { step: 3, label: 'Sanctioned', desc: 'MP approved fund' },
                      { step: 4, label: 'In Progress', desc: 'Contractors deployed' },
                      { step: 5, label: 'Completed', desc: 'Verified on-site' }
                    ].map((stepObj) => {
                      const currentIdx = getStatusStepIndex(selectedStatusIssue.status);
                      const isPast = currentIdx >= stepObj.step;
                      const isCurrent = currentIdx === stepObj.step;

                      return (
                        <div key={stepObj.step} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-1.5 text-center w-full md:w-auto">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${
                            isCurrent 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                              : isPast 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20' 
                                : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                          }`}>
                            {stepObj.step}
                          </div>
                          <div className="text-left md:text-center">
                            <p className={`text-xs font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {stepObj.label}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{stepObj.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI diagnosis overview card */}
                {selectedStatusIssue.aiAnalysis && (
                  <div className="rounded-3xl border border-blue-100 bg-blue-50/30 p-6 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold text-xs tracking-wider uppercase font-mono">
                      <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> AI DIAGNOSIS & PRIORITY REPORT
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">PRIORITY GRAVITY</span>
                        <span className="text-sm font-extrabold font-mono text-rose-600">{selectedStatusIssue.aiAnalysis.priorityScore}/100</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">URGENCY RADIAL</span>
                        <span className="text-sm font-extrabold font-mono text-amber-600">{selectedStatusIssue.aiAnalysis.urgency}/10</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">SEVERITY</span>
                        <span className="text-sm font-extrabold font-mono text-indigo-600 capitalize">{selectedStatusIssue.aiAnalysis.severity}</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">LIVES IMPACTED</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-600">{selectedStatusIssue.aiAnalysis.estimatedPeopleAffected.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">AI Executive Summary:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        "{selectedStatusIssue.aiAnalysis.summary}"
                      </p>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          Suggested Agency: {selectedStatusIssue.aiAnalysis.suggestedDepartment}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          Language: {selectedStatusIssue.aiAnalysis.language}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* SubTab 4: Nearby Issues */}
        {subTab === 'nearby' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Grievances Heat Map</h3>
              <span className="text-xs font-mono font-semibold text-slate-500">Live GPS tracking across wards</span>
            </div>
            <div className="h-[480px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <MapComponent
                issues={issues}
                onSelectIssue={onViewIssueDetail}
              />
            </div>
          </div>
        )}

        {/* SubTab 5: Notifications */}
        {subTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Alert Logs & Activity Feed</h3>
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

        {/* SubTab 6: Profile */}
        {subTab === 'profile' && (
          <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-2xl mx-auto dark:bg-blue-950/40 dark:text-blue-400">
                {currentUser.name[0]}
              </div>
              <div>
                <h4 className="font-display font-extrabold text-lg text-slate-800 dark:text-white">{currentUser.name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Voter Card Badge: #LKO_VTR_49821</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500">Registered Email:</span>
                <span className="text-slate-800 dark:text-slate-200">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500">Constituency Zone:</span>
                <span className="text-slate-800 dark:text-slate-200">{currentUser.constituency}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Constituency Role:</span>
                <span className="text-blue-700 bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold dark:text-blue-400 dark:bg-blue-950/30">
                  Citizen Voter
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
