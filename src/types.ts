export type UserRole = 'citizen' | 'mp';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  constituency: string;
  avatar?: string;
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

