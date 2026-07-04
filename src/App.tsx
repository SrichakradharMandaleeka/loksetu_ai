import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { MPDashboard } from './components/MPDashboard';
import { IssueDetails } from './components/IssueDetails';
import { AIChatBot } from './components/AIChatBot';
import { Issue, ProjectProposal, User, UserRole, Notification } from './types';
import { RefreshCw } from 'lucide-react';
import { auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Navigation & Role States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [activeIssueDetail, setActiveIssueDetail] = useState<Issue | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Core Data States
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<ProjectProposal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "not_1",
      title: "New Grievance Filed",
      message: "Grievance #iss_003 'Streetlight Failure' has been successfully compiled and categorized by AI.",
      type: "info",
      date: "2s ago",
      read: false
    },
    {
      id: "not_2",
      title: "Gomti Bridge Approved",
      message: "MP authorized ₹3.5 Crore support pillars structural project proposal.",
      type: "success",
      date: "2 hours ago",
      read: false
    }
  ]);

  // Loading/Interaction States
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingIssue, setSubmittingIssue] = useState<boolean>(false);
  const [generatingProposal, setGeneratingProposal] = useState<boolean>(false);
  const [optimizingBudget, setOptimizingBudget] = useState<boolean>(false);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [submittingVerification, setSubmittingVerification] = useState<boolean>(false);

  // Load Initial Data
  useEffect(() => {
    fetchIssuesAndProjects();
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthInitialized(true);
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          signOut(auth);
          setCurrentUser(null);
          localStorage.removeItem('loksetu_user');
          return;
        }
        
        // Restore from localStorage if possible to preserve current session role & constituency
        const storedUserJson = localStorage.getItem('loksetu_user');
        if (storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser && storedUser.email === firebaseUser.email) {
              setCurrentUser(storedUser);
              setCurrentRole(storedUser.role || 'citizen');
              if (activeTab === 'landing' || activeTab === 'login' || activeTab === 'register') {
                setActiveTab(storedUser.role === 'mp' ? 'mp-dashboard' : 'citizen-dashboard');
              }
              return;
            }
          } catch (e) {
            console.error("Error reading stored user config", e);
          }
        }
        
        // Otherwise create new transient profile state for current authenticated user
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: 'citizen',
          constituency: 'Lucknow Central'
        };
        setCurrentUser(newUser);
        setCurrentRole('citizen');
        localStorage.setItem('loksetu_user', JSON.stringify(newUser));
        if (activeTab === 'landing' || activeTab === 'login' || activeTab === 'register') {
          setActiveTab('citizen-dashboard');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('loksetu_user');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const fetchIssuesAndProjects = async () => {
    setLoading(true);
    try {
      const [resIssues, resProjects] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/projects')
      ]);
      if (resIssues.ok) {
        const data = await resIssues.json();
        setIssues(data);
      }
      if (resProjects.ok) {
        const data = await resProjects.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error loading remote API data", err);
    } finally {
      setLoading(false);
    }
  };

  // Login Success handler
  const handleLoginSuccess = (name: string, email: string, role: UserRole, constituency: string) => {
    const user: User = {
      id: auth.currentUser?.uid || "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      constituency
    };
    setCurrentUser(user);
    setCurrentRole(role);
    localStorage.setItem('loksetu_user', JSON.stringify(user));
    setActiveTab(role === 'mp' ? 'mp-dashboard' : 'citizen-dashboard');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (!currentUser) {
      setActiveTab('login');
      return;
    }
    // Update current user's role
    const updatedUser = { ...currentUser, role };
    setCurrentUser(updatedUser);
    localStorage.setItem('loksetu_user', JSON.stringify(updatedUser));
    setActiveTab(role === 'mp' ? 'mp-dashboard' : 'citizen-dashboard');
    setActiveIssueDetail(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('loksetu_user');
    setActiveTab('login');
  };

  const handleSelectRoleDirect = (role: 'citizen' | 'mp') => {
    // Quick guest entry login helper for testing
    const defaultUser: User = {
      id: role === 'mp' ? 'mp_001' : 'cit_001',
      name: role === 'mp' ? 'Suresh P. Singh' : 'Arjun Sharma',
      email: role === 'mp' ? 'suresh.mp@sansad.in' : 'arjun.lko@gmail.com',
      role,
      constituency: 'Lucknow Central'
    };
    setCurrentUser(defaultUser);
    setCurrentRole(role);
    localStorage.setItem('loksetu_user', JSON.stringify(defaultUser));
    setActiveTab(role === 'mp' ? 'mp-dashboard' : 'citizen-dashboard');
  };

  // Submit Issue Grievance
  const handleReportGrievance = async (
    title: string,
    description: string,
    category: string,
    ward: string,
    address: string,
    image: string,
    voiceUrl: string
  ): Promise<Issue | null> => {
    setSubmittingIssue(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          ward,
          address: address || `${ward}, Lucknow`,
          image: image || undefined,
          voiceUrl: voiceUrl || undefined,
          citizenId: currentUser?.id || "cit_default",
          citizenName: currentUser?.name || "Citizen User"
        })
      });

      if (!response.ok) throw new Error("API failed to submit issue");
      const savedIssue = await response.json();

      // Update state
      setIssues(prev => [savedIssue, ...prev]);
      
      // Add notification
      const newNot: Notification = {
        id: "not_" + Math.random().toString(36).substr(2, 9),
        title: "AI Analysis Complete",
        message: `Report "${title}" successfully parsed. Priority score assigned.`,
        type: "success",
        date: "Just now",
        read: false
      };
      setNotifications(prev => [newNot, ...prev]);

      return savedIssue;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Upvote Issue
  const handleUpvote = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues(prev => prev.map(i => i.id === issueId ? updatedIssue : i));
        if (activeIssueDetail?.id === issueId) {
          setActiveIssueDetail(updatedIssue);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate funding proposal using Gemini
  const handleGenerateProposal = async (issueId: string) => {
    setGeneratingProposal(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId })
      });
      if (response.ok) {
        const newProj = await response.json();
        setProjects(prev => {
          if (prev.find(p => p.id === newProj.id)) return prev;
          return [...prev, newProj];
        });
        
        // Refresh local issues list to capture updated 'approved' status
        const resIssues = await fetch('/api/issues');
        if (resIssues.ok) {
          const updatedIssues = await resIssues.json();
          setIssues(updatedIssues);
          const currentDetail = updatedIssues.find((i: Issue) => i.id === issueId);
          if (currentDetail) setActiveIssueDetail(currentDetail);
        }

        // Notification
        setNotifications(prev => [
          {
            id: "not_p_" + Math.random().toString(36).substr(2, 9),
            title: "Project Generated by AI",
            message: `Proposal ready: "${newProj.recommendedProject}" - Budget: ₹${(newProj.estimatedBudget / 100000).toFixed(1)} Lakh.`,
            type: "success",
            date: "1s ago",
            read: false
          },
          ...prev
        ]);
        setActiveTab('mp-dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingProposal(false);
    }
  };

  // MP Budget Planner Optimization
  const handleOptimizeBudget = async (totalBudget: number) => {
    setOptimizingBudget(true);
    try {
      const response = await fetch('/api/budget-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalBudget })
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizingBudget(false);
    }
    return null;
  };

  // MP Monthly Report Generator
  const handleGenerateMonthlyReport = async (): Promise<string> => {
    setGeneratingReport(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return data.report;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
    return '';
  };

  // Submit citizen verification audit
  const handleSubmitVerification = async (rating: number, comments: string) => {
    if (!activeIssueDetail) return;

    setSubmittingVerification(true);
    try {
      const response = await fetch(`/api/issues/${activeIssueDetail.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comments,
          afterImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBryBSzwkuLkaDSmUTJslQKXjeKUycJWfFRAq7s7eZQO3EoHkow9ZWOYU6Ws6VTxAtgCzn7cWSUvvqgKfAU1YOSrfvgnx68Kxoei4y7U8d8Agie0YWLSs3u1kARsQyjSw9IEjWmthjs0Rw7DMJGAKmzRQ-g4Cq_hMmWBWf6VysHfcuTSVjJDu9wMP3Dik5u86icsYCznhFowxC8wBkfsCyZgb_XO8BZ_2EC6Zl4RL22MRwOZTVQAD8J-JCjxUPI7wiPB_BxJMXitA"
        })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
        setActiveIssueDetail(updatedIssue);
        
        setNotifications(prev => [
          {
            id: "not_v_" + Math.random().toString(36).substr(2, 9),
            title: "Resolution Verified by AI",
            message: `Citizen verified resolution. AI Quality Score is ${updatedIssue.verification?.qualityScore}% Quality.`,
            type: "success",
            date: "Just now",
            read: false
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVerification(false);
    }
  };

  // Approve or update project status
  const handleUpdateProjectStatus = async (projectId: string, newStatus: 'approved' | 'in_progress' | 'completed') => {
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedProj = await response.json();
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProj : p));
        
        // Reload all issues to synchronize status badges
        const resIssues = await fetch('/api/issues');
        if (resIssues.ok) {
          const updatedIssues = await resIssues.json();
          setIssues(updatedIssues);
          if (activeIssueDetail) {
            const upDet = updatedIssues.find((i: Issue) => i.id === activeIssueDetail.id);
            if (upDet) setActiveIssueDetail(upDet);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAssociatedProject = (issueId: string): ProjectProposal | null => {
    return projects.find(p => p.issueId === issueId) || null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Header Navigation */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(loading || !authInitialized) && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500 font-mono">Assembling Loksetu AI grids...</p>
          </div>
        )}

        {!loading && authInitialized && (
          <>
            {/* 1. Landing View */}
            {activeTab === 'landing' && (
              <LandingPage
                issues={issues}
                projects={projects}
                onStart={() => setActiveTab('login')}
                onSelectRoleDirect={handleSelectRoleDirect}
              />
            )}

            {/* 2. Login View */}
            {activeTab === 'login' && (
              <AuthPage
                onLoginSuccess={handleLoginSuccess}
                defaultMode="login"
              />
            )}

            {/* 3. Register View */}
            {activeTab === 'register' && (
              <AuthPage
                onLoginSuccess={handleLoginSuccess}
                defaultMode="register"
              />
            )}

            {/* 4. Citizen Dashboard View */}
            {activeTab === 'citizen-dashboard' && currentUser && (
              <CitizenDashboard
                currentUser={currentUser}
                issues={issues}
                notifications={notifications}
                onSubmitIssue={handleReportGrievance}
                onUpvote={handleUpvote}
                onViewIssueDetail={(issue) => {
                  setActiveIssueDetail(issue);
                  setActiveTab('issue-details');
                }}
                submittingIssue={submittingIssue}
              />
            )}

            {/* 5. MP Dashboard View */}
            {activeTab === 'mp-dashboard' && currentUser && (
              <MPDashboard
                currentUser={currentUser}
                issues={issues}
                projects={projects}
                notifications={notifications}
                onGenerateProposal={handleGenerateProposal}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onViewIssueDetail={(issue) => {
                  setActiveIssueDetail(issue);
                  setActiveTab('issue-details');
                }}
                onOptimizeBudget={handleOptimizeBudget}
                onGenerateMonthlyReport={handleGenerateMonthlyReport}
                generatingProposal={generatingProposal}
                optimizingBudget={optimizingBudget}
                generatingReport={generatingReport}
              />
            )}

            {/* 6. Issue Details View */}
            {activeTab === 'issue-details' && activeIssueDetail && (
              <IssueDetails
                issue={activeIssueDetail}
                project={getAssociatedProject(activeIssueDetail.id)}
                currentRole={currentRole as 'citizen' | 'mp'}
                onBack={() => {
                  setActiveTab(currentRole === 'mp' ? 'mp-dashboard' : 'citizen-dashboard');
                }}
                onUpvote={handleUpvote}
                onGenerateProposal={handleGenerateProposal}
                onVerify={handleSubmitVerification}
                submittingVerification={submittingVerification}
              />
            )}
          </>
        )}
      </main>

      {/* Floating AI chat bot strictly for governance tasks */}
      <AIChatBot />

    </div>
  );
}
