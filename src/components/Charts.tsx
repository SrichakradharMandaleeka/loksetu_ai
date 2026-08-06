import React from 'react';
import { Issue } from '../types';

interface ChartsProps {
  issues: Issue[];
}

export const Charts: React.FC<ChartsProps> = ({ issues }) => {
  // 1. Process category distribution
  const categories = [
    "Infrastructure", "Sanitation", "Public Health", "Roads & Transport",
    "Power & Street Lighting", "Education & Public Facilities", "Environment & Forestry", "Public Safety & Security"
  ];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = issues.filter(i => i.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // 2. Process priority scores
  const priorityBuckets = {
    critical: issues.filter(i => (i.aiAnalysis?.priorityScore || 50) >= 90).length,
    high: issues.filter(i => (i.aiAnalysis?.priorityScore || 50) >= 75 && (i.aiAnalysis?.priorityScore || 50) < 90).length,
    medium: issues.filter(i => (i.aiAnalysis?.priorityScore || 50) >= 50 && (i.aiAnalysis?.priorityScore || 50) < 75).length,
    low: issues.filter(i => (i.aiAnalysis?.priorityScore || 50) < 50).length
  };
  const totalWithPriority = Math.max(issues.length, 1);

  // 3. Department workload
  const departments = [
    { name: "Public Works (PWD)", count: issues.filter(i => i.aiAnalysis?.suggestedDepartment?.includes("Works") || i.aiAnalysis?.suggestedDepartment?.includes("PWD")).length },
    { name: "Water Board (Jal)", count: issues.filter(i => i.aiAnalysis?.suggestedDepartment?.includes("Water") || i.aiAnalysis?.suggestedDepartment?.includes("Jal") || i.aiAnalysis?.suggestedDepartment?.includes("Sanitation")).length },
    { name: "Health Dept", count: issues.filter(i => i.aiAnalysis?.suggestedDepartment?.includes("Health") || i.aiAnalysis?.suggestedDepartment?.includes("Clinic")).length },
    { name: "Electricity Dept", count: issues.filter(i => i.aiAnalysis?.suggestedDepartment?.includes("Electr") || i.aiAnalysis?.suggestedDepartment?.includes("Power") || i.aiAnalysis?.suggestedDepartment?.includes("Lighting") || i.aiAnalysis?.suggestedDepartment?.includes("MVVNL")).length },
    { name: "Education & Parks", count: issues.filter(i => i.aiAnalysis?.suggestedDepartment?.includes("Educat") || i.aiAnalysis?.suggestedDepartment?.includes("School") || i.aiAnalysis?.suggestedDepartment?.includes("Park") || i.aiAnalysis?.suggestedDepartment?.includes("Forest") || i.aiAnalysis?.suggestedDepartment?.includes("Horticult")).length },
    { name: "Other Agencies", count: issues.filter(i => 
      !i.aiAnalysis?.suggestedDepartment?.includes("Works") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("PWD") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Water") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Jal") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Sanitation") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Health") &&
      !i.aiAnalysis?.suggestedDepartment?.includes("Electr") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Power") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Lighting") &&
      !i.aiAnalysis?.suggestedDepartment?.includes("MVVNL") &&
      !i.aiAnalysis?.suggestedDepartment?.includes("Educat") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("School") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Park") && 
      !i.aiAnalysis?.suggestedDepartment?.includes("Forest") &&
      !i.aiAnalysis?.suggestedDepartment?.includes("Horticult")
    ).length }
  ];

  const maxDeptCount = Math.max(...departments.map(d => d.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Chart 1: Categories Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 flex flex-col">
        <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider mb-4">
          Reports by Category
        </h4>
        <div className="flex-1 space-y-4">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const pct = (count / maxCategoryCount) * 100;
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                  <span className="text-slate-900 font-mono dark:text-white">{count} reports</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Priority Buckets Radial Simulation */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 flex flex-col">
        <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider mb-4">
          AI Priority Threat Ratios
        </h4>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-center items-center py-4 relative">
            {/* SVG Ring visualizer */}
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Critical ring */}
              <circle cx="64" cy="64" r="54" stroke="#f1f5f9" strokeWidth="6" fill="transparent" className="dark:stroke-slate-800" />
              <circle
                cx="64" cy="64" r="54"
                stroke="#ef4444" strokeWidth="8" fill="transparent"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * (priorityBuckets.critical / totalWithPriority))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* High ring */}
              <circle cx="64" cy="64" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" className="dark:stroke-slate-800" />
              <circle
                cx="64" cy="64" r="40"
                stroke="#f97316" strokeWidth="8" fill="transparent"
                strokeDasharray="251.32"
                strokeDashoffset={251.32 - (251.32 * (priorityBuckets.high / totalWithPriority))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Medium ring */}
              <circle cx="64" cy="64" r="26" stroke="#f1f5f9" strokeWidth="6" fill="transparent" className="dark:stroke-slate-800" />
              <circle
                cx="64" cy="64" r="26"
                stroke="#eab308" strokeWidth="8" fill="transparent"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (163.36 * (priorityBuckets.medium / totalWithPriority))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-slate-800 dark:text-white">{issues.length}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-bold border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1" />
              <span className="text-slate-600 dark:text-slate-400">Critical ({priorityBuckets.critical})</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-orange-500 mr-1" />
              <span className="text-slate-600 dark:text-slate-400">High ({priorityBuckets.high})</span>
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1" />
              <span className="text-slate-600 dark:text-slate-400">Med ({priorityBuckets.medium})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Department Workloads */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 flex flex-col col-span-1 md:col-span-2 lg:col-span-1">
        <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider mb-4">
          Agency Workload Backlogs
        </h4>
        <div className="flex-1 space-y-4">
          {departments.map((dept, idx) => {
            const pct = (dept.count / maxDeptCount) * 100;
            return (
              <div key={idx} className="flex items-center space-x-3.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-24 truncate" title={dept.name}>
                  {dept.name}
                </span>
                <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg transition-all duration-1000"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    {dept.count} cases
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
