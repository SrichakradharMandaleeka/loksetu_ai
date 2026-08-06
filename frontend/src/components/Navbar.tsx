import React from 'react';
import { User, UserRole } from '../types';
import { Landmark, User as UserIcon, LogOut, Shield, Award, Users, Menu, X, Bell } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'mp': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'mp': return 'Member of Parliament';
      default: return 'Citizen Voter';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-emerald-600 shadow-md">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                LOKSETU <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium tracking-normal font-sans">AI</span>
              </span>
              <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Constituency Intelligence
              </p>
            </div>
          </div>

          {/* Center Role Toggles for quick review */}
          <div className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-100 p-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <button
              onClick={() => onRoleChange('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                currentRole === 'citizen'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Citizen Mode
            </button>
            <button
              onClick={() => onRoleChange('mp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                currentRole === 'mp'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              MP Mode
            </button>
          </div>

          {/* Right Action Profile / Notification panel */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {currentUser.constituency}
                  </p>
                </div>
                <div className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getRoleBadgeColor(currentRole)}`}>
                  {getRoleName(currentRole)}
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                >
                  <UserIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
            {!currentUser && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg shadow"
                >
                  Join Loksetu
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch System Role</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onRoleChange('citizen'); setMobileMenuOpen(false); }}
              className={`p-2 text-xs font-semibold text-center rounded-lg border ${
                currentRole === 'citizen' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => { onRoleChange('mp'); setMobileMenuOpen(false); }}
              className={`p-2 text-xs font-semibold text-center rounded-lg border ${
                currentRole === 'mp' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              MP
            </button>
          </div>

          {currentUser ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.constituency}</p>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <button
                onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-sm font-semibold border border-slate-200 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-sm font-semibold bg-blue-700 text-white rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
