import React, { useState } from 'react';
import { Issue } from '../types';
import { MapPin, Info, Users, Filter, Navigation, Compass, Layers } from 'lucide-react';

interface MapComponentProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ issues, onSelectIssue }) => {
  const [selectedMarker, setSelectedMarker] = useState<Issue | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Convert real Lucknow Coordinates to SVG Space (800x480 resolution)
  const getSvgCoords = (lat: number, lng: number) => {
    // Lucknow Central Bound Coordinates
    const minLat = 26.83;
    const maxLat = 26.88;
    const minLng = 80.91;
    const maxLng = 80.98;

    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = 440 - ((lat - minLat) / (maxLat - minLat)) * 380 + 20; // Invert Y axis
    return { x, y };
  };

  const getPriorityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'; // Red
      case 'high': return '#f97316';     // Orange
      case 'medium': return '#eab308';   // Yellow
      default: return '#10b981';         // Green
    }
  };

  const getPriorityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-emerald-500';
    }
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesCat = filterCategory === 'all' || issue.category === filterCategory;
    const matchesSev = filterSeverity === 'all' || issue.aiAnalysis?.severity === filterSeverity;
    return matchesCat && matchesSev;
  });

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden">
      
      {/* Map Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <Layers className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm">
            Interactive Ward Hazard Map
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Public Health">Public Health</option>
            <option value="Roads & Transport">Roads & Transport</option>
            <option value="Power & Street Lighting">Power & Street Lighting</option>
            <option value="Education & Public Facilities">Education & Public Facilities</option>
            <option value="Environment & Forestry">Environment & Forestry</option>
            <option value="Public Safety & Security">Public Safety & Security</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Red)</option>
            <option value="high">High (Orange)</option>
            <option value="medium">Medium (Yellow)</option>
            <option value="low">Low (Green)</option>
          </select>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 bg-slate-100/50 dark:bg-slate-950/40 min-h-[400px] overflow-hidden">
        
        {/* Map Grid Elements */}
        <svg className="absolute inset-0 w-full h-full select-none" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
          
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Gomti River (Lucknow's central landmark) */}
          <path
            d="M -50,150 Q 150,130 300,240 T 650,220 Q 750,280 850,260"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="32"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M -50,150 Q 150,130 300,240 T 650,220 Q 750,280 850,260"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.2"
          />

          {/* Sector division outlines */}
          {/* Ward 12 Gomti Sector */}
          <path d="M 10,10 L 350,10 L 250,200 L 10,200 Z" fill="rgba(59, 130, 246, 0.01)" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="30" y="30" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.8">WARD 12 (GOMTI SECTOR)</text>
          
          {/* Ward 18 Aliganj Extension (Sub-sector of Ward 12/North) */}
          <path d="M 10,10 L 180,10 L 180,120 L 10,120 Z" fill="rgba(99, 102, 241, 0.02)" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="20" y="110" fill="#818cf8" fontSize="8" fontWeight="bold" letterSpacing="0.5">WARD 18 (ALIGANJ EXT)</text>

          {/* Ward 14 Central Metro */}
          <path d="M 350,10 L 780,10 L 780,180 L 400,240 L 250,200 Z" fill="rgba(16, 185, 129, 0.01)" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="450" y="30" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.8">WARD 14 (CENTRAL JUNCTION)</text>

          {/* Ward 15 Hazratganj Zone (Inner Central Area) */}
          <path d="M 350,80 L 600,80 L 550,200 L 350,200 Z" fill="rgba(236, 72, 153, 0.02)" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="370" y="100" fill="#f472b6" fontSize="8" fontWeight="bold" letterSpacing="0.5">WARD 15 (HAZRATGANJ ZONE)</text>

          {/* Ward 22 Green Meadows */}
          <path d="M 10,200 L 260,220 L 320,470 L 10,470 Z" fill="rgba(245, 158, 11, 0.01)" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="30" y="450" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.8">WARD 22 (GREEN MEADOWS)</text>

          {/* Ward 05 Chowk Heritage Sector (Historic West) */}
          <path d="M 10,220 L 150,220 L 150,380 L 10,380 Z" fill="rgba(20, 184, 166, 0.02)" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="20" y="360" fill="#2dd4bf" fontSize="8" fontWeight="bold" letterSpacing="0.5">WARD 05 (CHOWK HERITAGE)</text>

          {/* Ward 08 Industrial Estate */}
          <path d="M 260,220 L 780,180 L 780,470 L 320,470 Z" fill="rgba(239, 68, 68, 0.01)" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="520" y="450" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.8">WARD 08 (INDUSTRIAL HUB)</text>

          {/* Ward 24 Indira Nagar South (Eastern Sector) */}
          <path d="M 520,240 L 780,240 L 780,380 L 520,380 Z" fill="rgba(168, 85, 247, 0.02)" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="540" y="265" fill="#c084fc" fontSize="8" fontWeight="bold" letterSpacing="0.5">WARD 24 (INDIRA NAGAR S)</text>

          {/* National Highway Bypass Axis */}
          <path
            d="M 50,470 Q 300,320 450,200 T 750,10"
            fill="none"
            stroke="rgba(100, 116, 139, 0.25)"
            strokeWidth="6"
            strokeDasharray="10 6"
          />
          <text x="630" y="110" fill="#64748b" fontSize="8" fontWeight="bold" transform="rotate(-30, 630, 110)">NH Bypass Highway</text>
        </svg>

        {/* Real-time Glowing Interactive Markers */}
        {filteredIssues.map((issue) => {
          const { x, y } = getSvgCoords(issue.lat, issue.lng);
          const color = getPriorityColor(issue.aiAnalysis?.severity || 'medium');

          return (
            <button
              key={issue.id}
              onClick={() => {
                setSelectedMarker(issue);
                if (onSelectIssue) onSelectIssue(issue);
              }}
              style={{ left: `${(x / 800) * 100}%`, top: `${(y / 480) * 100}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 p-2 focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                {/* Ping animation */}
                <span
                  style={{ backgroundColor: color }}
                  className="absolute inline-flex h-6 w-6 rounded-full opacity-45 animate-ping"
                />
                
                {/* Real pin container */}
                <div
                  style={{ borderColor: color, backgroundColor: selectedMarker?.id === issue.id ? color : 'white' }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 transform group-hover:scale-125"
                >
                  <MapPin
                    style={{ color: selectedMarker?.id === issue.id ? 'white' : color }}
                    className="h-4.5 w-4.5"
                  />
                  
                  {/* Hover tooltip */}
                  <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-30">
                    {issue.title} (AI Priority: {issue.aiAnalysis?.priorityScore || 'N/A'})
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Compass Overlay */}
        <div className="absolute right-4 bottom-4 flex flex-col items-center p-2 rounded-xl bg-white/90 shadow border border-slate-200/50 dark:bg-slate-900/90 dark:border-slate-800 pointer-events-none">
          <Compass className="h-6 w-6 text-slate-400 dark:text-slate-500 animate-spin" style={{ animationDuration: '40s' }} />
          <span className="text-[9px] font-bold font-mono text-slate-500 mt-1 uppercase">LKO CNT</span>
        </div>

        {/* Selected Marker Detail Card overlay */}
        {selectedMarker && (
          <div className="absolute left-4 bottom-4 max-w-sm w-[calc(100%-2rem)] rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in slide-in-from-bottom-3 z-20">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-block h-2 w-2 rounded-full ${getPriorityBg(selectedMarker.aiAnalysis?.severity || 'medium')}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {selectedMarker.category} • {selectedMarker.ward}
                </span>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs mt-1.5">
              {selectedMarker.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {selectedMarker.description}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">AI PRIORITY</p>
                  <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {selectedMarker.aiAnalysis?.priorityScore || 50}/100
                  </p>
                </div>
                <div className="pl-3 border-l border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">AFFECTED</p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    ~{selectedMarker.aiAnalysis?.estimatedPeopleAffected || 150}
                  </p>
                </div>
              </div>
              {onSelectIssue && (
                <button
                  onClick={() => onSelectIssue(selectedMarker)}
                  className="text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition"
                >
                  <Info className="h-3 w-3" /> View Details
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-100 p-3.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 bg-slate-50/50">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Critical Severity (9.0+)</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>High Severity (7.5-8.9)</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>Medium Severity (5.0-7.4)</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Low Severity (&lt;5.0)</span>
        </div>
      </div>

    </div>
  );
};
