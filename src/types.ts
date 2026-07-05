export type UserRole = 'citizen' | 'mp';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  constituency: string;
  avatar?: string;
  isGuest?: boolean;
}

export type IssueStatus = 'submitted' | 'ai_analysis' | 'approved' | 'started' | 'completed';

export interface AIAnalysis {
  summary: string;
  language: string;
  category: string;
  urgency: number; // 0 to 10
  severity: 'low' | 'medium' | 'high' | 'critical';
  sentiment: string;
  estimatedPeopleAffected: number;
  suggestedDepartment: string;
  duplicateDetected: boolean;
  duplicateOfId?: string;
  priorityScore: number; // 0 to 100
  recommendedProject: string;
}

export interface VerificationData {
  afterImage?: string;
  rating: number;
  comments: string;
  verified: boolean;
  qualityScore: number;
  aiFeedback: string;
  status: 'verified' | 'needs_review';
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  ward: string;
  constituency?: string;
  address?: string;
  lat: number;
  lng: number;
  image?: string;
  video?: string;
  voiceUrl?: string;
  upvotes: number;
  upvotedBy: string[]; // User IDs
  status: IssueStatus;
  date: string;
  citizenId: string;
  citizenName: string;
  aiAnalysis?: AIAnalysis;
  verification?: VerificationData;
}

export interface ProjectProposal {
  id: string;
  issueId: string;
  issueTitle: string;
  problemSummary: string;
  recommendedProject: string;
  estimatedBudget: number; // in Rupees (INR)
  completionTime: string; // e.g., "6 months"
  expectedBeneficiaries: number;
  riskAnalysis: string;
  environmentalImpact: string;
  socialImpact: string;
  responsibleDepartment: string;
  priorityScore: number;
  sdgGoals: string[];
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  dateGenerated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface DevelopmentImpact {
  citizensBenefitedScore: number;
  urgencyScore: number;
  safetyImpactScore: number;
  costEfficiencyScore: number;
  economicImpactScore: number;
  environmentalImpactScore: number;
  totalImpactScore: number;
}

export function calculateDevelopmentImpact(proj: ProjectProposal): DevelopmentImpact {
  const citizensBenefitedScore = Math.min(100, Math.max(40, Math.round(50 + Math.log10(proj.expectedBeneficiaries || 100) * 10)));
  const urgencyScore = Math.min(100, Math.max(30, proj.priorityScore));
  const isHighSafety = /bridge|structural|water|contaminat|sewage|electrical|safety|hazard/i.test(proj.issueTitle + " " + proj.recommendedProject);
  const safetyImpactScore = isHighSafety ? 95 : Math.min(100, Math.max(50, Math.round(proj.priorityScore * 0.9 + 5)));
  const costPerBeneficiary = proj.estimatedBudget / (proj.expectedBeneficiaries || 1);
  const costEfficiencyScore = Math.min(100, Math.max(35, Math.round(100 - Math.min(65, Math.max(0, Math.log10(costPerBeneficiary) * 12)))));
  const hasEconomicSdg = proj.sdgGoals.some(sdg => /sdg 8|sdg 9|sdg 12/i.test(sdg));
  const economicImpactScore = hasEconomicSdg ? 90 : Math.min(100, Math.max(55, Math.round(proj.priorityScore * 0.8)));
  const isEcoFriendly = /low|zero|eco|solar|drone|bio/i.test(proj.environmentalImpact || "");
  const environmentalImpactScore = isEcoFriendly ? 92 : Math.min(100, Math.max(45, Math.round(proj.priorityScore * 0.75)));
  
  const totalImpactScore = Math.round(
    (citizensBenefitedScore * 0.20) +
    (urgencyScore * 0.20) +
    (safetyImpactScore * 0.15) +
    (costEfficiencyScore * 0.15) +
    (economicImpactScore * 0.15) +
    (environmentalImpactScore * 0.15)
  );

  return {
    citizensBenefitedScore,
    urgencyScore,
    safetyImpactScore,
    costEfficiencyScore,
    economicImpactScore,
    environmentalImpactScore,
    totalImpactScore
  };
}

export const CONSTITUENCIES = [
  // Uttar Pradesh
  { name: "Lucknow Central", state: "Uttar Pradesh", code: "LKO CNT", river: "Gomti River", bgTheme: "from-blue-600 to-indigo-400" },
  { name: "Varanasi Cantt", state: "Uttar Pradesh", code: "VNS CNT", river: "Ganga River", bgTheme: "from-orange-500 to-red-400" },
  { name: "Gorakhpur Urban", state: "Uttar Pradesh", code: "GKP URB", river: "Rapti River", bgTheme: "from-amber-500 to-red-400" },
  // Andhra Pradesh
  { name: "Vijayawada Central", state: "Andhra Pradesh", code: "BZA CNT", river: "Krishna River", bgTheme: "from-teal-600 to-cyan-400" },
  { name: "Visakhapatnam East", state: "Andhra Pradesh", code: "VTG EST", river: "Bay of Bengal (Coastline)", bgTheme: "from-blue-500 to-emerald-400" },
  { name: "Tirupati", state: "Andhra Pradesh", code: "TPT", river: "Swarnamukhi River / Tirumala Foothills", bgTheme: "from-amber-600 to-orange-400" },
  { name: "Guntur West", state: "Andhra Pradesh", code: "GNT WST", river: "Krishna Canal Segment", bgTheme: "from-purple-600 to-indigo-400" },
  { name: "Nellore City", state: "Andhra Pradesh", code: "NLR CTY", river: "Pennar River", bgTheme: "from-teal-500 to-blue-400" }
];

export const CONSTITUENCY_WARDS: Record<string, string[]> = {
  "Lucknow Central": [
    "Ward 12 - Gomti Sector",
    "Ward 14 - Central Metro",
    "Ward 22 - Green Meadows",
    "Ward 08 - Industrial Hub",
    "Ward 15 - Hazratganj Zone",
    "Ward 18 - Aliganj Extension",
    "Ward 24 - Indira Nagar South",
    "Ward 05 - Chowk Heritage Sector"
  ],
  "Varanasi Cantt": [
    "Ward 01 - Assi Ghat Sector",
    "Ward 03 - Sarnath Extension",
    "Ward 06 - Dashashwamedh Zone",
    "Ward 10 - Cantonment Area",
    "Ward 11 - Sigra Sports Block",
    "Ward 17 - Nadesar Gardens"
  ],
  "Gorakhpur Urban": [
    "Ward 02 - Ramgarh Tal Bypass",
    "Ward 04 - Golghar Commercial",
    "Ward 07 - Medical College Zone",
    "Ward 09 - Gorakhnath Sector",
    "Ward 13 - Rapti Nagar Colony"
  ],
  "Vijayawada Central": [
    "Ward 11 - Benz Circle Area",
    "Ward 13 - Governorpet Commercial",
    "Ward 16 - Gunadala Hill Colony",
    "Ward 19 - Satyanarayanapuram Sector",
    "Ward 21 - Moghalrajpuram Caves Zone",
    "Ward 26 - Labbipet Residential"
  ],
  "Visakhapatnam East": [
    "Ward 20 - MVP Colony Beachside",
    "Ward 23 - Gajuwaka Steel Sector",
    "Ward 25 - Jagadamba Commercial",
    "Ward 27 - Rushikonda IT Zone",
    "Ward 29 - Seethammadhara Block",
    "Ward 31 - Beach Road Promenade"
  ],
  "Tirupati": [
    "Ward 30 - Alipiri Temple Gateway",
    "Ward 32 - Kapila Theertham Sector",
    "Ward 35 - TU Campus Zone",
    "Ward 38 - Balaji Colony Residential",
    "Ward 41 - Tiruchanur Road Junction",
    "Ward 44 - Karakambadi Industrial Zone"
  ],
  "Guntur West": [
    "Ward 40 - Brodipet Residential",
    "Ward 42 - Arundelpet Commercial",
    "Ward 45 - Vidyanagar Education Zone",
    "Ward 48 - Gorantla Bypass Sector",
    "Ward 51 - Gujjanagundla Lake Ring",
    "Ward 53 - Lakshmipuram Hub"
  ],
  "Nellore City": [
    "Ward 50 - Stonehousepet Area",
    "Ward 52 - Podalakur Road Sector",
    "Ward 55 - Haranathapuram Residential",
    "Ward 58 - Kovur Bridge Bypass",
    "Ward 61 - Nellore Santhapet Block",
    "Ward 64 - Dargamitta Zone"
  ]
};


