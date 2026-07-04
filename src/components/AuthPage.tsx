import React, { useState } from 'react';
import { Landmark, Sparkles, User, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';

interface AuthPageProps {
  onLoginSuccess: (name: string, email: string, role: UserRole, constituency: string) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [constituency, setConstituency] = useState('Lucknow Central');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === 'register' && !name) return;

    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          await signOut(auth);
          setVerificationEmail(email);
          setShowVerificationScreen(true);
        } else {
          // On success, show role selection (transition step)
          setSelectedRole('citizen');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);
        await signOut(auth);
        setVerificationEmail(email);
        setShowVerificationScreen(true);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      if (mode === 'login') {
        setError("Email or password is incorrect");
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError("User already exists. Please sign in");
        } else {
          // If other error during signup, display nice message or custom error
          setError(err.message || "An error occurred during registration");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    const finalName = name || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || (role === 'mp' ? 'Suresh P. Singh' : 'Arjun Sharma');
    const finalEmail = auth.currentUser?.email || email || (role === 'mp' ? 'suresh.mp@sansad.in' : 'arjun.lko@gmail.com');
    onLoginSuccess(finalName, finalEmail, role, constituency);
  };

  if (showVerificationScreen) {
    return (
      <div className="max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-350">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
              Verify your Email
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-2">
              We have sent you a verification email to <span className="font-semibold text-slate-900 dark:text-white">{verificationEmail}</span>. Please verify it and log in.
            </p>
          </div>

          <button
            onClick={() => {
              setShowVerificationScreen(false);
              setMode('login');
              setError(null);
            }}
            className="w-full py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Login</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-350">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-600 shadow-md mx-auto mb-2">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            {selectedRole ? "Select System Role" : mode === 'login' ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedRole 
              ? "Choose your operational platform view to continue" 
              : "Access India's premier constituency intelligence dashboard"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-100 flex items-center gap-2 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!selectedRole ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 disabled:opacity-60"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun.lko@gmail.com"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 disabled:opacity-60"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Constituency</label>
                <select
                  value={constituency}
                  disabled={isLoading}
                  onChange={(e) => setConstituency(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 font-semibold disabled:opacity-60"
                >
                  <option value="Lucknow Central">Lucknow Central</option>
                  <option value="Varanasi Cantt">Varanasi Cantt</option>
                  <option value="New Delhi Central">New Delhi Central</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Processing..." : "Continue"}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-60"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-4">
              Select your system profile to enter the dashboard.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Citizen Card Option */}
              <button
                onClick={() => handleRoleSelection('citizen')}
                className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400 text-left w-full cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition shrink-0 dark:bg-blue-950/40">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white block">Citizen Voter View</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Report local community failures, upvote critical nearby grievances, and upload verified project results.
                  </p>
                </div>
              </button>

              {/* MP Card Option */}
              <button
                onClick={() => handleRoleSelection('mp')}
                className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-400 text-left w-full cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition shrink-0 dark:bg-emerald-950/40">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white block">MP / Gov Official Dashboard</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Access AI-ranked priority lists, run real-time knapsack budget optimizers, and compile development reports.
                  </p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setSelectedRole(null)}
              className="w-full mt-4 text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
              ← Change login details
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
