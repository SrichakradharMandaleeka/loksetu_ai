import React, { useState } from 'react';
import { Issue } from '../types';
import { MapPin, Info, Compass, Layers } from 'lucide-react';

interface MapComponentProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  currentConstituency?: string;
}

const CONSTITUENCY_MAP_CONFIGS: Record<string, {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  code: string;
  landmarkName: string;
  landmarkPath: string; // SVG path d-string
  landmarkColor: string;
  wards: { name: string; d: string; textX: number; textY: number; color: string }[];
  highwayD: string;
  highwayText: string;
}> = {
  "Lucknow Central": {
    minLat: 26.82,
    maxLat: 26.89,
    minLng: 80.90,
    maxLng: 80.99,
    code: "LKO CNT",
    landmarkName: "Gomti River Segment",
    landmarkPath: "M -50,150 Q 150,130 300,240 T 650,220 Q 750,280 850,260",
    landmarkColor: "#3b82f6",
    highwayD: "M 50,470 Q 300,320 450,200 T 750,10",
    highwayText: "NH-25 Bypass Expressway",
    wards: [
      { name: "WARD 12 (GOMTI SECTOR)", d: "M 10,10 L 350,10 L 250,200 L 10,200 Z", textX: 30, textY: 30, color: "#818cf8" },
      { name: "WARD 18 (ALIGANJ EXT)", d: "M 10,10 L 180,10 L 180,120 L 10,120 Z", textX: 20, textY: 110, color: "#c084fc" },
      { name: "WARD 14 (CENTRAL JUNCTION)", d: "M 350,10 L 780,10 L 780,180 L 400,240 L 250,200 Z", textX: 450, textY: 30, color: "#2dd4bf" },
      { name: "WARD 15 (HAZRATGANJ ZONE)", d: "M 350,80 L 600,80 L 550,200 L 350,200 Z", textX: 370, textY: 100, color: "#f472b6" },
      { name: "WARD 22 (GREEN MEADOWS)", d: "M 10,200 L 260,220 L 320,470 L 10,470 Z", textX: 30, textY: 450, color: "#fbbf24" },
      { name: "WARD 05 (CHOWK HERITAGE)", d: "M 10,220 L 150,220 L 150,380 L 10,380 Z", textX: 20, textY: 360, color: "#2dd4bf" },
      { name: "WARD 08 (INDUSTRIAL HUB)", d: "M 260,220 L 780,180 L 780,470 L 320,470 Z", textX: 520, textY: 450, color: "#f87171" },
      { name: "WARD 24 (INDIRA NAGAR S)", d: "M 520,240 L 780,240 L 780,380 L 520,380 Z", textX: 540, textY: 265, color: "#c084fc" }
    ]
  },
  "Varanasi Cantt": {
    minLat: 25.28,
    maxLat: 25.35,
    minLng: 82.93,
    maxLng: 83.02,
    code: "VNS CNT",
    landmarkName: "Sacred Ganga River Flow",
    landmarkPath: "M -50,350 Q 200,320 400,220 T 700,120 Q 780,80 850,50",
    landmarkColor: "#f97316",
    highwayD: "M 10,10 Q 300,180 400,320 T 780,450",
    highwayText: "Ghat Corridor Link Road",
    wards: [
      { name: "WARD 01 (ASSI GHAT)", d: "M 10,200 L 400,200 L 300,470 L 10,470 Z", textX: 40, textY: 440, color: "#fbbf24" },
      { name: "WARD 06 (DASHASHWAMEDH)", d: "M 400,100 L 780,100 L 780,300 L 400,300 Z", textX: 450, textY: 130, color: "#f472b6" },
      { name: "WARD 10 (CANTONMENT AREA)", d: "M 10,10 L 400,10 L 400,200 L 10,200 Z", textX: 40, textY: 40, color: "#818cf8" }
    ]
  },
  "Gorakhpur Urban": {
    minLat: 26.72,
    maxLat: 26.79,
    minLng: 83.33,
    maxLng: 83.42,
    code: "GKP URB",
    landmarkName: "Ramgarh Tal Lake Basin",
    landmarkPath: "M 300,300 C 350,220 550,220 600,300 C 650,380 450,450 350,420 Z",
    landmarkColor: "#34d399",
    highwayD: "M 10,240 L 780,240",
    highwayText: "Deoria Bypass Road",
    wards: [
      { name: "WARD 02 (RAMGARH TAL BYPASS)", d: "M 200,200 L 700,200 L 700,460 L 200,460 Z", textX: 250, textY: 220, color: "#34d399" },
      { name: "WARD 04 (GOLGHAR COMM)", d: "M 10,10 L 780,10 L 780,200 L 10,200 Z", textX: 50, textY: 40, color: "#818cf8" }
    ]
  },
  "Vijayawada Central": {
    minLat: 16.47,
    maxLat: 16.54,
    minLng: 80.60,
    maxLng: 80.69,
    code: "BZA CNT",
    landmarkName: "Krishna River Front",
    landmarkPath: "M -50,400 Q 250,380 450,350 T 850,320",
    landmarkColor: "#0ea5e9",
    highwayD: "M 10,10 Q 200,150 400,240 T 780,470",
    highwayText: "MG Road Arterial Corridor",
    wards: [
      { name: "WARD 11 (BENZ CIRCLE AREA)", d: "M 400,200 L 780,200 L 780,450 L 400,450 Z", textX: 450, textY: 240, color: "#2dd4bf" },
      { name: "WARD 13 (GOVERNORPET COMM)", d: "M 10,10 L 400,10 L 400,200 L 10,200 Z", textX: 40, textY: 40, color: "#818cf8" },
      { name: "WARD 16 (GUNADALA HILL)", d: "M 400,10 L 780,10 L 780,200 L 400,200 Z", textX: 450, textY: 40, color: "#c084fc" },
      { name: "WARD 21 (MOGHALRAJPURAM)", d: "M 10,200 L 400,200 L 400,450 L 10,450 Z", textX: 40, textY: 240, color: "#fbbf24" }
    ]
  },
  "Visakhapatnam East": {
    minLat: 17.69,
    maxLat: 17.76,
    minLng: 83.27,
    maxLng: 83.36,
    code: "VTG EST",
    landmarkName: "Bay of Bengal Beachside",
    landmarkPath: "M 400,480 Q 550,250 650,150 T 850,-50",
    landmarkColor: "#3b82f6",
    highwayD: "M 10,10 L 450,470",
    highwayText: "Vizag Beach Road Hwy",
    wards: [
      { name: "WARD 20 (MVP COLONY)", d: "M 10,10 L 450,10 L 450,300 L 10,300 Z", textX: 40, textY: 40, color: "#818cf8" },
      { name: "WARD 27 (RUSHIKONDA IT)", d: "M 450,10 L 780,10 L 780,300 L 450,300 Z", textX: 480, textY: 40, color: "#2dd4bf" },
      { name: "WARD 31 (BEACH RD PROMENADE)", d: "M 10,300 L 780,300 L 780,470 L 10,470 Z", textX: 40, textY: 330, color: "#fbbf24" }
    ]
  },
  "Tirupati": {
    minLat: 13.59,
    maxLat: 13.66,
    minLng: 79.37,
    maxLng: 79.46,
    code: "TPT",
    landmarkName: "Tirumala Hills Edge",
    landmarkPath: "M -50,80 Q 200,50 400,120 T 850,90",
    landmarkColor: "#d97706",
    highwayD: "M 10,470 L 780,100",
    highwayText: "Alipiri Bypass Road",
    wards: [
      { name: "WARD 30 (ALIPIRI GATEWAY)", d: "M 10,10 L 780,10 L 780,150 L 10,150 Z", textX: 40, textY: 40, color: "#fbbf24" },
      { name: "WARD 38 (BALAJI COLONY)", d: "M 10,150 L 450,150 L 450,470 L 10,470 Z", textX: 40, textY: 180, color: "#818cf8" },
      { name: "WARD 44 (KARAKAMBADI IND)", d: "M 450,150 L 780,150 L 780,470 L 450,470 Z", textX: 480, textY: 180, color: "#f87171" }
    ]
  },
  "Guntur West": {
    minLat: 16.27,
    maxLat: 16.34,
    minLng: 80.39,
    maxLng: 80.48,
    code: "GNT WST",
    landmarkName: "Krishna Canal Segment",
    landmarkPath: "M -50,240 L 850,240",
    landmarkColor: "#2dd4bf",
    highwayD: "M 200,10 Q 300,200 400,350 T 600,470",
    highwayText: "Inner Ring Road Hwy",
    wards: [
      { name: "WARD 40 (BRODIPET RES)", d: "M 10,10 L 780,10 L 780,240 L 10,240 Z", textX: 40, textY: 40, color: "#818cf8" },
      { name: "WARD 48 (GORANTLA BYPASS)", d: "M 10,240 L 780,240 L 780,470 L 10,470 Z", textX: 40, textY: 270, color: "#2dd4bf" }
    ]
  },
  "Nellore City": {
    minLat: 14.41,
    maxLat: 14.48,
    minLng: 79.94,
    maxLng: 80.03,
    code: "NLR CTY",
    landmarkName: "Pennar River Flow",
    landmarkPath: "M -50,120 Q 200,150 450,100 T 850,130",
    landmarkColor: "#06b6d4",
    highwayD: "M 10,10 Q 300,220 400,320 T 780,450",
    highwayText: "Nellore-Kovur Bridge Bypass",
    wards: [
      { name: "WARD 50 (STONEHOUSEPET)", d: "M 10,10 L 780,10 L 780,180 L 10,180 Z", textX: 40, textY: 40, color: "#818cf8" },
      { name: "WARD 58 (KOVUR BYPASS)", d: "M 10,180 L 780,180 L 780,470 L 10,470 Z", textX: 40, textY: 210, color: "#2dd4bf" }
    ]
  }
};

export const MapComponent: React.FC<MapComponentProps> = ({ issues, onSelectIssue, currentConstituency }) => {
  const [selectedMarker, setSelectedMarker] = useState<Issue | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Detect active constituency to apply specialized GIS overlays
  const activeConstName = currentConstituency || issues[0]?.constituency || 'Lucknow Central';
  const config = CONSTITUENCY_MAP_CONFIGS[activeConstName] || CONSTITUENCY_MAP_CONFIGS['Lucknow Central'];

  // Convert real latitude/longitude to SVG viewport space (800x480 resolution)
  const getSvgCoords = (lat: number, lng: number) => {
    const minLat = config.minLat;
    const maxLat = config.maxLat;
    const minLng = config.minLng;
    const maxLng = config.maxLng;

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
            Interactive Ward Hazard Map — {activeConstName}
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
          
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Landmark Feature (River/Coast/Hills) */}
          {config.landmarkPath.includes('C ') || config.landmarkPath.includes('Z') ? (
            <path
              d={config.landmarkPath}
              fill={config.landmarkColor}
              opacity="0.12"
              className="animate-pulse"
              style={{ animationDuration: '8s' }}
            />
          ) : (
            <>
              <path
                d={config.landmarkPath}
                fill="none"
                stroke={config.landmarkColor}
                strokeWidth="28"
                strokeLinecap="round"
                opacity="0.22"
              />
              <path
                d={config.landmarkPath}
                fill="none"
                stroke={config.landmarkColor}
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.12"
              />
            </>
          )}

          {/* Landmark Label */}
          <text
            x={280}
            y={200}
            fill={config.landmarkColor}
            fontSize="8"
            fontWeight="bold"
            letterSpacing="1"
            className="opacity-50 select-none pointer-events-none uppercase font-mono"
          >
            {config.landmarkName}
          </text>

          {/* Dynamic Ward Outlines */}
          {config.wards.map((w, index) => (
            <g key={index}>
              <path
                d={w.d}
                fill={`${w.color}02`}
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={w.textX}
                y={w.textY}
                fill={w.color}
                fontSize="8"
                fontWeight="bold"
                letterSpacing="0.5"
                opacity="0.6"
              >
                {w.name}
              </text>
            </g>
          ))}

          {/* National Highway Bypass Axis */}
          <path
            d={config.highwayD}
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="5"
            strokeDasharray="10 5"
          />
          <text
            x={580}
            y={140}
            fill="#64748b"
            fontSize="7"
            fontWeight="bold"
            className="opacity-40"
          >
            {config.highwayText}
          </text>
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
                <span
                  style={{ backgroundColor: color }}
                  className="absolute inline-flex h-6 w-6 rounded-full opacity-45 animate-ping"
                />
                
                <div
                  style={{ borderColor: color, backgroundColor: selectedMarker?.id === issue.id ? color : 'white' }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 transform group-hover:scale-125"
                >
                  <MapPin
                    style={{ color: selectedMarker?.id === issue.id ? 'white' : color }}
                    className="h-4.5 w-4.5"
                  />
                  
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
          <span className="text-[9px] font-bold font-mono text-slate-500 mt-1 uppercase">{config.code}</span>
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
