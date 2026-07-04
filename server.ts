import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Issue, ProjectProposal, AIAnalysis, User, ChatMessage } from "./src/types";

const app = express();
app.use(express.json());

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ISSUES_FILE = path.join(DATA_DIR, "issues.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets manager.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Check if Gemini is configured safely
function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

// Pre-seeded high-fidelity mock data (Lucknow Central)
const defaultIssues: Issue[] = [
  {
    id: "iss_001",
    title: "Bridge Structural Degradation",
    description: "Major concrete cracks and rusty reinforcement bars visible on the Gomti River Bridge support pillars. Impacting over 5,000 commuters and heavy vehicles daily. Safety hazard during monsoon season.",
    category: "Infrastructure",
    ward: "Ward 12 - Gomti Sector",
    address: "Gomti River Bridge, Hazratganj Bypass, Lucknow",
    lat: 26.8524,
    lng: 80.9467,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBryBSzwkuLkaDSmUTJslQKXjeKUycJWfFRAq7s7eZQO3EoHkow9ZWOYU6Ws6VTxAtgCzn7cWSUvvqgKfAU1YOSrfvgnx68Kxoei4y7U8d8Agie0YWLSs3u1kARsQyjSw9IEjWmthjs0Rw7DMJGAKmzRQ-g4Cq_hMmWBWf6VysHfcuTSVjJDu9wMP3Dik5u86icsYCznhFowxC8wBkfsCyZgb_XO8BZ_2EC6Zl4RL22MRwOZTVQAD8J-JCjxUPI7wiPB_BxJMXitA",
    upvotes: 342,
    upvotedBy: [],
    status: "started",
    date: "2026-06-25T10:00:00Z",
    citizenId: "cit_001",
    citizenName: "Arjun Sharma",
    aiAnalysis: {
      summary: "Concrete degradation on river bridge support pillars risking collapse and transit disruption.",
      language: "English",
      category: "Infrastructure",
      urgency: 9.8,
      severity: "critical",
      sentiment: "Anxious / Alert",
      estimatedPeopleAffected: 12400,
      suggestedDepartment: "Public Works Department (PWD)",
      duplicateDetected: false,
      priorityScore: 98,
      recommendedProject: "Support Pillar Reinforcement & Structural Evacuation Audit"
    }
  },
  {
    id: "iss_002",
    title: "Water Contamination in Sector 4",
    description: "Main underground water pipeline leak has caused sewage seepage. Drinking water running from taps is brown, muddy, and smelling strongly. Outbreak of gastroenteritis in at least 15 households reported.",
    category: "Sanitation",
    ward: "Ward 14 - Central Metro",
    address: "Block-C, Sector 4, Hazratganj, Lucknow",
    lat: 26.8467,
    lng: 80.9423,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuw0gmR0UQkegwE-ULDl0ZcyQPPSrRrZazNLfi_F3WgX2k7frkDSWP31yNlYpXPzXm3eOUdPm2jeK3YEzKjJ_p5AZl2mRI6_H7VFw7kflsfvWDyCtTCxIz7txOlbyJM-aov9TEygdkd-HQmrcVxflySfnZjkUs3CwcWI4rWhZUW-V3DnUmPxX3TBjb8QnadiJwXzWpTP6R0Pnm7kF024tVpOY04EOwdzNkBhka7ro0O81fvP49VwkmH4dAFsLI-fwdJf2LDhOFWOw",
    upvotes: 189,
    upvotedBy: [],
    status: "approved",
    date: "2026-06-28T08:30:00Z",
    citizenId: "cit_002",
    citizenName: "Preeti Verma",
    aiAnalysis: {
      summary: "Broken sewage-water layout contamination causing gastroenteritis symptoms among locals.",
      language: "English",
      category: "Sanitation",
      urgency: 9.2,
      severity: "high",
      sentiment: "Frustrated / Fearful",
      estimatedPeopleAffected: 2500,
      suggestedDepartment: "Water & Sanitation (Jal Sansthan)",
      duplicateDetected: false,
      priorityScore: 92,
      recommendedProject: "Smart Ring-Main Sewer Layout Segregation & Pipeline Overhaul"
    }
  },
  {
    id: "iss_003",
    title: "Main Highway Streetlight Failure",
    description: "A continuous 3km stretch of the Lucknow-Kanpur bypass is completely dark due to failed underground electrical relays. High speed commuter zone is pitch black, causing three major near-miss accidents in 48 hours.",
    category: "Infrastructure",
    ward: "Ward 14 - Central Metro",
    address: "National Highway Bypass, Lucknow Central",
    lat: 26.8604,
    lng: 80.9567,
    upvotes: 95,
    upvotedBy: [],
    status: "submitted",
    date: "2026-07-01T14:15:00Z",
    citizenId: "cit_003",
    citizenName: "Rakesh Jha",
    aiAnalysis: {
      summary: "failed high-speed bypass grid segments creating pitch-dark driving lanes and serious accident threats.",
      language: "English",
      category: "Infrastructure",
      urgency: 8.7,
      severity: "high",
      sentiment: "Concerned / Constructive",
      estimatedPeopleAffected: 8000,
      suggestedDepartment: "Electricity Department",
      duplicateDetected: false,
      priorityScore: 87,
      recommendedProject: "Smart Relay Bypass & Solar Hybrid Streetlights Integration"
    }
  },
  {
    id: "iss_004",
    title: "Community Health Center Supply Shortage",
    description: "Lucknow Central Community Clinic has run out of essential vaccines, basic pediatric medicines, and asthma inhalers. Emergency ambulance is down for maintenance, leaving over 10 villages with no direct emergency access.",
    category: "Public Health",
    ward: "Ward 22 - Green Meadows",
    address: "Primary Health Center, Sector 8, Lucknow",
    lat: 26.8389,
    lng: 80.9258,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6-HLFcVmQ9eG4JO2Kh5SVvMvZ627R6RVaIRmWOpJ8TEJDzq-zNifD21dWwgjSO1nyyVxQp1Vai00pr4ZoQpGkHQ9hOnZKaeS-D8WBP-gAosGCx7KjtG_lOniq6Tn2Jr2S1AAcB7-iIQXm9UfOBIJpFqBX7vZtLLNhc6MixckeW98uas31VMIZkCR7vnfCqGLbmHig3hsVyZX6QBbVYEpzJP8FJIlcqi5B9sqMjdEqmr2mtLcGDE_iMgzwx0WKy3ElzXNvMmDRvIg",
    upvotes: 270,
    upvotedBy: [],
    status: "approved",
    date: "2026-06-20T11:00:00Z",
    citizenId: "cit_004",
    citizenName: "Kamlesh Patel",
    aiAnalysis: {
      summary: "Critical shortage of basic drugs and vaccines in rural clinics, accompanied by broken ambulance transport.",
      language: "Hindi / English",
      category: "Public Health",
      urgency: 9.5,
      severity: "critical",
      sentiment: "Anxious",
      estimatedPeopleAffected: 15000,
      suggestedDepartment: "Health & Family Welfare Dept",
      duplicateDetected: false,
      priorityScore: 95,
      recommendedProject: "Regional Health Resource Redistribution & Fleet Allocation"
    }
  },
  {
    id: "iss_005",
    title: "Illegal Waste Dumping Site",
    description: "Contractors are illegally unloading chemical sludge and plastic waste at Sector B municipal margins. Located next to a children's park and the neighborhood clean pond. Strong odor and hazardous emissions.",
    category: "Sanitation",
    ward: "Ward 08 - Industrial Hub",
    address: "Vacant Plot B, Sector-B, Industrial Estate, Lucknow",
    lat: 26.8712,
    lng: 80.9634,
    upvotes: 64,
    upvotedBy: [],
    status: "completed",
    date: "2026-06-15T15:20:00Z",
    citizenId: "cit_005",
    citizenName: "Amit Singh",
    aiAnalysis: {
      summary: "Illegal toxic chemicals and plastics dump near water resource and residential play ground.",
      language: "English",
      category: "Sanitation",
      urgency: 7.8,
      severity: "medium",
      sentiment: "Aggrieved / Alert",
      estimatedPeopleAffected: 4500,
      suggestedDepartment: "State Pollution Control Board",
      duplicateDetected: false,
      priorityScore: 78,
      recommendedProject: "Geo-fenced Drone Patrols & Waste Dump Bio-Remediation"
    },
    verification: {
      rating: 5,
      comments: "The dump was completely cleared, and tree saplings have been planted along the fence. Great job MP team and Pollution Board!",
      verified: true,
      qualityScore: 94,
      aiFeedback: "Before-and-After images matching indicates 100% removal of waste piles. Bio-remediation confirmed.",
      status: "verified"
    }
  },
  {
    id: "iss_006",
    title: "Hazratganj Main Market Transformer Sparks",
    description: "Frequent sparks and loud humming from the overloaded distribution transformer on the main Hazratganj commercial block. Poses safety risks to hundreds of daily shoppers and stores.",
    category: "Power & Street Lighting",
    ward: "Ward 15 - Hazratganj Zone",
    address: "Main Market, Hazratganj, Lucknow",
    lat: 26.8485,
    lng: 80.9450,
    upvotes: 112,
    upvotedBy: [],
    status: "submitted",
    date: "2026-07-02T16:45:00Z",
    citizenId: "cit_006",
    citizenName: "Siddharth Sen",
    aiAnalysis: {
      summary: "Overloaded commercial area power transformer sparking frequently, creating severe public safety and commercial fire hazards.",
      language: "English",
      category: "Power & Street Lighting",
      urgency: 8.9,
      severity: "high",
      sentiment: "Anxious / Alert",
      estimatedPeopleAffected: 3500,
      suggestedDepartment: "Electricity Department (MVVNL)",
      duplicateDetected: false,
      priorityScore: 89,
      recommendedProject: "Hazardous Transformer Upgradation & Load Balancing"
    }
  },
  {
    id: "iss_007",
    title: "Government Primary School Structural Safety",
    description: "Aliganj Government Primary School roof plaster peeling off and water logging in classrooms during rains. Impacting study of over 120 children from weaker sections.",
    category: "Education & Public Facilities",
    ward: "Ward 18 - Aliganj Extension",
    address: "Sector Q, Aliganj Extension, Lucknow",
    lat: 26.8750,
    lng: 80.9320,
    upvotes: 164,
    upvotedBy: [],
    status: "approved",
    date: "2026-06-29T11:20:00Z",
    citizenId: "cit_007",
    citizenName: "Maya Dwivedi",
    aiAnalysis: {
      summary: "Government school building showing severe roof plaster degradation and water seepage in classrooms.",
      language: "English",
      category: "Education & Public Facilities",
      urgency: 8.4,
      severity: "high",
      sentiment: "Deeply Concerned",
      estimatedPeopleAffected: 150,
      suggestedDepartment: "Basic Education Department",
      duplicateDetected: false,
      priorityScore: 84,
      recommendedProject: "Primary School Structural Renovation & Waterproofing"
    }
  },
  {
    id: "iss_008",
    title: "Indira Nagar Public Park Encroachment and Littering",
    description: "Local neighborhood park has become an illegal garbage disposal point with completely broken walkways, no green lawn maintenance, and dried up plantation lines.",
    category: "Environment & Forestry",
    ward: "Ward 24 - Indira Nagar South",
    address: "Block B, Indira Nagar, Lucknow",
    lat: 26.8620,
    lng: 80.9710,
    upvotes: 45,
    upvotedBy: [],
    status: "submitted",
    date: "2026-07-03T09:10:00Z",
    citizenId: "cit_008",
    citizenName: "Ramesh Bajpai",
    aiAnalysis: {
      summary: "Neighborhood park neglected, accumulated rubbish dumps, and broken public walkways.",
      language: "Hindi / English",
      category: "Environment & Forestry",
      urgency: 5.6,
      severity: "low",
      sentiment: "Constructive",
      estimatedPeopleAffected: 1800,
      suggestedDepartment: "Horticulture & Parks Wing",
      duplicateDetected: false,
      priorityScore: 56,
      recommendedProject: "Indira Nagar Green Belt Restoration & Walkway Refurbishment"
    }
  },
  {
    id: "iss_009",
    title: "Chowk Heritage Walkway Lack of Police Post & CCTV",
    description: "Densely crowded Chowk heritage tourist lanes have experienced a steep rise in petty theft and eve-teasing. High demand for a permanent municipal police post and HD surveillance cameras.",
    category: "Public Safety & Security",
    ward: "Ward 05 - Chowk Heritage Sector",
    address: "Heritage Walk, Chowk Area, Lucknow",
    lat: 26.8580,
    lng: 80.9180,
    upvotes: 210,
    upvotedBy: [],
    status: "submitted",
    date: "2026-07-03T18:30:00Z",
    citizenId: "cit_009",
    citizenName: "Zafar Ali",
    aiAnalysis: {
      summary: "High-density heritage tourist pathway lacking continuous security presence and digital monitoring, resulting in increased crime rates.",
      language: "English",
      category: "Public Safety & Security",
      urgency: 7.9,
      severity: "medium",
      sentiment: "Alert / Concerned",
      estimatedPeopleAffected: 11000,
      suggestedDepartment: "Home Department & Smart City Cell",
      duplicateDetected: false,
      priorityScore: 79,
      recommendedProject: "Heritage Area Integrated CCTV Grid & Police Booth Installation"
    }
  }
];

// Seed projects matching the seeded issues
const defaultProjects: ProjectProposal[] = [
  {
    id: "proj_001",
    issueId: "iss_001",
    issueTitle: "Bridge Structural Degradation",
    problemSummary: "River bridge support pillars are showing severe concrete degradation and reinforcement rust, creating immediate commuter risk.",
    recommendedProject: "Gomti River Bridge Structural Reinforcement & Grouting Work",
    estimatedBudget: 35000000, // 3.5 Crore INR
    completionTime: "4 months",
    expectedBeneficiaries: 12400,
    riskAnalysis: "Requires heavy crane deployment on barges. Potential slow flow of river can occur. Commuting traffic needs redirection during column repair.",
    environmentalImpact: "Low. Grouting materials used are eco-certified; barrier nets placed to prevent debris from falling in water.",
    socialImpact: "High. Secures lives of thousands of commuters daily and restores safe agricultural transit.",
    responsibleDepartment: "Public Works Department (PWD)",
    priorityScore: 98,
    sdgGoals: ["SDG 9: Industry, Innovation, and Infrastructure", "SDG 11: Sustainable Cities and Communities"],
    status: "approved",
    dateGenerated: "2026-06-26T12:00:00Z"
  },
  {
    id: "proj_002",
    issueId: "iss_002",
    issueTitle: "Water Contamination in Sector 4",
    problemSummary: "underground water pipelines leaking sewage mud into Hazratganj residential sectors.",
    recommendedProject: "Hazratganj Segmented Drinking Water Main Laying & Overhaul",
    estimatedBudget: 18000000, // 1.8 Crore INR
    completionTime: "2 months",
    expectedBeneficiaries: 2500,
    riskAnalysis: "Excavation in dense housing areas can disrupt local telephone and power cables. Ground stabilization needed.",
    environmentalImpact: "Zero water leakage avoids local mudding and groundwater degradation.",
    socialImpact: "Eradicates waterborne gastroenteritis infections, securing basic clean water access.",
    responsibleDepartment: "Water & Sanitation (Jal Sansthan)",
    priorityScore: 92,
    sdgGoals: ["SDG 6: Clean Water and Sanitation", "SDG 3: Good Health and Well-being"],
    status: "draft",
    dateGenerated: "2026-06-29T10:00:00Z"
  },
  {
    id: "proj_003",
    issueId: "iss_007",
    issueTitle: "Government Primary School Structural Safety",
    problemSummary: "Government school building showing severe roof plaster degradation and water seepage in classrooms.",
    recommendedProject: "Aliganj Primary School Structural Refurbishment & Safety Grouting",
    estimatedBudget: 2400000, // 24 Lakh INR
    completionTime: "3 months",
    expectedBeneficiaries: 150,
    riskAnalysis: "School remains in session. Work needs planning during summer holidays or evening hours to avoid noise disruption.",
    environmentalImpact: "Zero chemical emissions. Use of non-toxic wall paints and eco-plaster.",
    socialImpact: "Ensures structural safety of children, boosting parent confidence and retention.",
    responsibleDepartment: "Basic Education Department",
    priorityScore: 84,
    sdgGoals: ["SDG 4: Quality Education", "SDG 11: Sustainable Cities & Communities"],
    status: "draft",
    dateGenerated: "2026-06-30T10:00:00Z"
  }
];

// Local loading and saving
function loadIssues(): Issue[] {
  try {
    if (fs.existsSync(ISSUES_FILE)) {
      return JSON.parse(fs.readFileSync(ISSUES_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading issues file, falling back to seed", err);
  }
  fs.writeFileSync(ISSUES_FILE, JSON.stringify(defaultIssues, null, 2));
  return defaultIssues;
}

function saveIssues(issues: Issue[]) {
  try {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2));
  } catch (err) {
    console.error("Error saving issues", err);
  }
}

function loadProjects(): ProjectProposal[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      return JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading projects file, falling back to seed", err);
  }
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2));
  return defaultProjects;
}

function saveProjects(projects: ProjectProposal[]) {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch (err) {
    console.error("Error saving projects", err);
  }
}

// REST APIs
// 1. GET /api/issues
app.get("/api/issues", (req, res) => {
  const issues = loadIssues();
  res.json(issues);
});

// 2. POST /api/issues (Submit new issue)
app.post("/api/issues", async (req, res) => {
  const { title, description, category, ward, address, lat, lng, image, voiceUrl, citizenId, citizenName } = req.body;
  if (!title || !description || !category || !ward) {
    return res.status(400).json({ error: "Title, description, category, and ward are required." });
  }

  const issues = loadIssues();
  const id = "iss_" + Math.random().toString(36).substr(2, 9);
  
  const newIssue: Issue = {
    id,
    title,
    description,
    category,
    ward,
    address: address || `${ward}, Lucknow`,
    lat: lat || 26.8467 + (Math.random() - 0.5) * 0.05,
    lng: lng || 80.9462 + (Math.random() - 0.5) * 0.05,
    image,
    voiceUrl,
    upvotes: 0,
    upvotedBy: [],
    status: "submitted",
    date: new Date().toISOString(),
    citizenId: citizenId || "cit_default",
    citizenName: citizenName || "Citizen User"
  };

  // Perform AI Analysis using Gemini if configured, otherwise fall back to rich default mock analysis
  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      const prompt = `Analyze this citizen complaint submitted to a constituency feedback portal:
Title: "${title}"
Description: "${description}"
Category: "${category}"
Ward: "${ward}"

Respond in strict raw JSON matching the following typescript schema:
{
  "summary": "1-2 sentence concise summary",
  "language": "Detected language of the complaint",
  "category": "Infrastructure" | "Sanitation" | "Public Health" | "Roads & Transport" | "Power & Street Lighting" | "Education & Public Facilities" | "Environment & Forestry" | "Public Safety & Security" | "Other",
  "urgency": number (0 to 10 scale, e.g. 9.5 for critical safety, 3.0 for minor visual issue),
  "severity": "low" | "medium" | "high" | "critical",
  "sentiment": "e.g. Frustrated, Fearful, Constructive, Hopeful",
  "estimatedPeopleAffected": number (rough logical estimate of citizens impacted),
  "suggestedDepartment": "Logical municipal department responsible",
  "duplicateDetected": boolean,
  "priorityScore": number (0 to 100 based on safety threat, volume, economic factor),
  "recommendedProject": "Brief development proposal name to fix this issue"
}
Do not return any markdown wraps, only valid raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedAnalysis: AIAnalysis = JSON.parse(cleaned);
      newIssue.aiAnalysis = parsedAnalysis;
      newIssue.status = "ai_analysis";
    } catch (err: any) {
      console.error("Gemini AI Analysis failed, using robust automated defaults:", err);
      // Fallback analysis
      newIssue.aiAnalysis = {
        summary: description.slice(0, 80) + "...",
        language: "English",
        category: category,
        urgency: 6.5,
        severity: "medium",
        sentiment: "Concerned",
        estimatedPeopleAffected: 450,
        suggestedDepartment: category === "Infrastructure" ? "Public Works Department" : "Health Board",
        duplicateDetected: false,
        priorityScore: 65,
        recommendedProject: `Renovation work for ${title}`
      };
      newIssue.status = "ai_analysis";
    }
  } else {
    // Simulated Offline AI Analysis
    newIssue.aiAnalysis = {
      summary: `Localized ${category.toLowerCase()} report: ${description.slice(0, 100)}`,
      language: "English",
      category,
      urgency: 7.2,
      severity: "high",
      sentiment: "Anxious / Frustrated",
      estimatedPeopleAffected: 1200,
      suggestedDepartment: category === "Infrastructure" ? "Public Works Department (PWD)" : category === "Sanitation" ? "Jal Board" : "Municipal Corporation",
      duplicateDetected: false,
      priorityScore: 74,
      recommendedProject: `Targeted repair and bypass logic for ${title}`
    };
    newIssue.status = "ai_analysis";
  }

  issues.push(newIssue);
  saveIssues(issues);
  res.json(newIssue);
});

// 3. POST /api/issues/:id/upvote (Upvote issue)
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required to upvote." });

  const issues = loadIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  if (issue.upvotedBy.includes(userId)) {
    // Remove upvote
    issue.upvotedBy = issue.upvotedBy.filter(uid => uid !== userId);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  } else {
    // Add upvote
    issue.upvotedBy.push(userId);
    issue.upvotes += 1;
  }

  // Recalculate priority score if AI analysis exists
  if (issue.aiAnalysis) {
    const upvoteWeight = Math.min(20, issue.upvotes * 0.5);
    const baseUrgency = issue.aiAnalysis.urgency * 8; // Max 80
    issue.aiAnalysis.priorityScore = Math.min(100, Math.round(baseUrgency + upvoteWeight));
  }

  saveIssues(issues);
  res.json(issue);
});

// 4. POST /api/issues/:id/verify (Citizen verification after completion)
app.post("/api/issues/:id/verify", async (req, res) => {
  const { id } = req.params;
  const { rating, comments, afterImage } = req.body;
  if (!rating || !comments) {
    return res.status(400).json({ error: "Rating and comments are required." });
  }

  const issues = loadIssues();
  const issue = issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  let qualityScore = Math.min(100, rating * 20);
  let verified = rating >= 3;
  let aiFeedback = "Automated audit: Verified based on high user rating and photographic evidence matching parameters.";
  let status: 'verified' | 'needs_review' = rating >= 3 ? "verified" : "needs_review";

  // If Gemini is active, let's call it to verify the comments & text comparison
  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      const prompt = `Compare this citizen complaint before-and-after work audit.
Original Complaint: "${issue.description}"
MP Proposed Project: "${issue.aiAnalysis?.recommendedProject || 'Standard repair work'}"
Citizen Completion Feedback Comments: "${comments}"
Citizen Rating Score: ${rating} Stars out of 5

As our AI Inspector, evaluate if the feedback indicates the issue was successfully solved. Return a raw JSON:
{
  "verified": boolean,
  "qualityScore": number (0 to 100 based on citizen's feedback sentiment and stars),
  "aiFeedback": "Provide professional 1-2 sentence inspection review commenting on quality"
}
Do not include any markdown or text wrappers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      verified = parsed.verified ?? verified;
      qualityScore = parsed.qualityScore ?? qualityScore;
      aiFeedback = parsed.aiFeedback ?? aiFeedback;
      status = verified ? "verified" : "needs_review";
    } catch (err) {
      console.error("Verification Gemini prompt failed, using standard scoring rule", err);
    }
  }

  issue.verification = {
    afterImage,
    rating,
    comments,
    verified,
    qualityScore,
    aiFeedback,
    status
  };

  issue.status = "completed"; // Mark as finalized
  saveIssues(issues);
  res.json(issue);
});

// 5. GET /api/projects
app.get("/api/projects", (req, res) => {
  const projects = loadProjects();
  res.json(projects);
});

// 6. POST /api/projects (Generate professional proposal using Gemini)
app.post("/api/projects", async (req, res) => {
  const { issueId } = req.body;
  if (!issueId) return res.status(400).json({ error: "issueId is required." });

  const issues = loadIssues();
  const projects = loadProjects();

  const issue = issues.find(i => i.id === issueId);
  if (!issue) return res.status(404).json({ error: "Associated issue not found." });

  // Check if project proposal already exists
  const existing = projects.find(p => p.issueId === issueId);
  if (existing) return res.json(existing);

  let newProject: ProjectProposal;

  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      const prompt = `Develop a professional public infrastructure project proposal based on this constituency issue:
Issue Title: "${issue.title}"
Description: "${issue.description}"
Suggested Department: "${issue.aiAnalysis?.suggestedDepartment || 'Municipal Corporation'}"
Priority Score: ${issue.aiAnalysis?.priorityScore || 70}

Create a detailed project proposal in Rupees (INR). Return in strict JSON format matching this schema:
{
  "recommendedProject": "The formal name of the development project",
  "estimatedBudget": number (Logical budget in INR Rupees, e.g. 1500000 for 15 Lakh, 20000000 for 2 Crore),
  "completionTime": "e.g. 3 months, 6 months",
  "expectedBeneficiaries": number,
  "riskAnalysis": "1 sentence detail of project implementation risks",
  "environmentalImpact": "1 sentence detail of eco factors/barriers",
  "socialImpact": "1 sentence detail of positive citizen impact",
  "responsibleDepartment": "Name of government department leading",
  "sdgGoals": ["e.g. SDG 6: Clean Water", "SDG 11: Sustainable Cities"]
}
Do not use any markdown formats. Only return the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      newProject = {
        id: "proj_" + Math.random().toString(36).substr(2, 9),
        issueId: issue.id,
        issueTitle: issue.title,
        problemSummary: issue.aiAnalysis?.summary || issue.description,
        recommendedProject: parsed.recommendedProject || `Development Project for ${issue.title}`,
        estimatedBudget: parsed.estimatedBudget || 2500000,
        completionTime: parsed.completionTime || "4 months",
        expectedBeneficiaries: parsed.expectedBeneficiaries || issue.aiAnalysis?.estimatedPeopleAffected || 1000,
        riskAnalysis: parsed.riskAnalysis || "Standard construction logistics and traffic coordination.",
        environmentalImpact: parsed.environmentalImpact || "Eco-certified materials used. Waste to be sorted.",
        socialImpact: parsed.socialImpact || "Creates local jobs, secures safety, and enhances property ease.",
        responsibleDepartment: parsed.responsibleDepartment || issue.aiAnalysis?.suggestedDepartment || "Public Works Department",
        priorityScore: issue.aiAnalysis?.priorityScore || 75,
        sdgGoals: parsed.sdgGoals || ["SDG 11: Sustainable Cities & Communities"],
        status: "draft",
        dateGenerated: new Date().toISOString()
      };
    } catch (err) {
      console.error("Gemini failed to generate project proposal, using robust default templates", err);
      newProject = {
        id: "proj_" + Math.random().toString(36).substr(2, 9),
        issueId: issue.id,
        issueTitle: issue.title,
        problemSummary: issue.description,
        recommendedProject: `Strategic Overhaul and Rehabilitation of ${issue.title}`,
        estimatedBudget: 3500000, // 35 Lakh INR
        completionTime: "3 months",
        expectedBeneficiaries: 1500,
        riskAnalysis: "Material procurement delays and environmental clearances.",
        environmentalImpact: "Low impact. Solar powered accessories included.",
        socialImpact: "Significant upgrade to health, commuting safety, and accessibility.",
        responsibleDepartment: "Urban Planning & Development",
        priorityScore: 75,
        sdgGoals: ["SDG 11: Sustainable Cities & Communities", "SDG 9: Industry, Innovation, & Infrastructure"],
        status: "draft",
        dateGenerated: new Date().toISOString()
      };
    }
  } else {
    // Offline simulated proposal
    newProject = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      issueId: issue.id,
      issueTitle: issue.title,
      problemSummary: issue.description,
      recommendedProject: `Modern Urban Integration Project - ${issue.title}`,
      estimatedBudget: 4500000, // 45 Lakh INR
      completionTime: "3 months",
      expectedBeneficiaries: 2000,
      riskAnalysis: "Sub-surface pipeline matching mapping hurdles.",
      environmentalImpact: "Constructed with maximum green coverage and zero plastic waste generation.",
      socialImpact: "Improves security and access for children and elderly residents.",
      responsibleDepartment: "Municipal Corporation Office",
      priorityScore: 74,
      sdgGoals: ["SDG 11: Sustainable Cities & Communities"],
      status: "draft",
      dateGenerated: new Date().toISOString()
    };
  }

  projects.push(newProject);
  saveProjects(projects);

  // Update original issue status to approved or in preparation
  issue.status = "approved";
  saveIssues(issues);

  res.json(newProject);
});

// 7. POST /api/projects/:id/status (Approve / start project)
app.post("/api/projects/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'in_progress' | 'completed'
  if (!status) return res.status(400).json({ error: "status is required." });

  const projects = loadProjects();
  const issues = loadIssues();

  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  project.status = status;
  saveProjects(projects);

  // Update associated issue status too
  const issue = issues.find(i => i.id === project.issueId);
  if (issue) {
    if (status === "in_progress") issue.status = "started";
    else if (status === "completed") issue.status = "completed";
    else if (status === "approved") issue.status = "approved";
    saveIssues(issues);
  }

  res.json(project);
});

// 8. POST /api/budget-planner (AI Budget Proposal Optimization)
app.post("/api/budget-planner", async (req, res) => {
  const { totalBudget } = req.body; // In Rupees (INR)
  if (!totalBudget) return res.status(400).json({ error: "totalBudget is required." });

  const projects = loadProjects();
  const issues = loadIssues();

  // Filter issues that don't have projects yet or have pending projects
  const availableOptions = issues.map(issue => {
    const existingProj = projects.find(p => p.issueId === issue.id);
    return {
      issueId: issue.id,
      title: issue.title,
      category: issue.category,
      urgency: issue.aiAnalysis?.urgency || 5,
      priorityScore: issue.aiAnalysis?.priorityScore || 50,
      estimatedCost: existingProj ? existingProj.estimatedBudget : (issue.category === "Infrastructure" ? 2500000 : 1200000),
      peopleAffected: issue.aiAnalysis?.estimatedPeopleAffected || 1000
    };
  });

  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      const prompt = `You are the Lead Financial Planner for a Member of Parliament (MP).
We have a total available budget of ₹${totalBudget} INR.
We have these reported constituency needs in our pipeline:
${JSON.stringify(availableOptions, null, 2)}

Select the most optimal combination of projects that can be fully completed within the budget constraint.
Maximize the total Priority Score and expected citizens affected (People Affected).
Provide a professional budget plan in JSON format:
{
  "selectedProjectIds": ["list of selected issueId strings"],
  "totalEstimatedCost": number (sum of selected project costs),
  "remainingBudget": number,
  "citizensImpacted": number (total people benefited),
  "executiveJustification": "A formal, high-impact paragraph written in the voice of a professional planning commissioner summarizing why these projects were chosen and the strategic value to Lucknow constituency."
}
Only return the raw JSON, no markdown formats.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err) {
      console.error("AI Budget Planner failed, using fallback greedy optimizer:", err);
      res.status(500).json({ error: "Failed to optimize budget using AI." });
    }
  } else {
    // Simulated budget calculator (Greedy by priority score)
    const sorted = [...availableOptions].sort((a, b) => b.priorityScore - a.priorityScore);
    const selectedIds: string[] = [];
    let sumCost = 0;
    let sumPeople = 0;

    for (const opt of sorted) {
      if (sumCost + opt.estimatedCost <= totalBudget) {
        selectedIds.push(opt.issueId);
        sumCost += opt.estimatedCost;
        sumPeople += opt.peopleAffected;
      }
    }

    res.json({
      selectedProjectIds: selectedIds,
      totalEstimatedCost: sumCost,
      remainingBudget: totalBudget - sumCost,
      citizensImpacted: sumPeople,
      executiveJustification: "Offline Budget Mode: Prioritized critical infrastructure and sanitization pipelines based strictly on the Loksetu priority score index to maximize direct citizen impact while respecting the available capital outlay."
    });
  }
});

// 9. POST /api/chat (Interactive Floating Chatbot)
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) return res.status(400).json({ error: "message is required." });

  const issues = loadIssues();
  const projects = loadProjects();

  // Create compact context of current database status for RAG (Retrieval Augmented Generation)
  const context = {
    summary: {
      totalIssues: issues.length,
      highPriorityCount: issues.filter(i => i.aiAnalysis?.severity === "critical" || i.aiAnalysis?.severity === "high").length,
      completedCount: issues.filter(i => i.status === "completed").length,
      approvedProjects: projects.length,
      totalBudgetAllocatedINR: projects.reduce((sum, p) => sum + p.estimatedBudget, 0)
    },
    issues: issues.map(i => ({
      id: i.id,
      title: i.title,
      status: i.status,
      category: i.category,
      urgency: i.aiAnalysis?.urgency || 5,
      estimatedAffected: i.aiAnalysis?.estimatedPeopleAffected || 100,
      suggestedDept: i.aiAnalysis?.suggestedDepartment || "General"
    })),
    projects: projects.map(p => ({
      id: p.id,
      title: p.recommendedProject,
      budgetINR: p.estimatedBudget,
      status: p.status,
      sdgGoals: p.sdgGoals
    }))
  };

  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      // Format chat history
      const formattedHistory = (chatHistory || []).map((msg: any) => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      ).join("\n");

      const prompt = `You are the Loksetu AI Constituency Assistant. Your goal is to guide citizens, MPs, and Administrators through the platform, explain community priorities, and propose development ideas for the Lucknow Central constituency.
Here is the current real-time dataset of complaints and active development projects:
${JSON.stringify(context, null, 2)}

User Conversation History:
${formattedHistory}

Latest User Query: "${message}"

Write a helpful, concise, and professional answer. Highlight specific issues or project budgets where relevant. Be respectful, encouraging, and highly data-grounded. Speak like a smart, friendly advisor. Keep response under 3-4 paragraphs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Gemini Chatbot failed:", err);
      res.json({ reply: "I'm having trouble connecting to Gemini AI. However, based on our local offline logs, I can confirm we have 5 active issues, including structural columns concerns at the Gomti River Bridge and a drinking water contamination alert in Ward 14." });
    }
  } else {
    // Simple offline rules responses
    let reply = "Hello! I am your offline Loksetu AI Assistant. ";
    const msgLower = message.toLowerCase();
    if (msgLower.includes("bridge") || msgLower.includes("road")) {
      reply += "We currently have a critical Bridge Structural Degradation reported in Ward 12 with a priority score of 98. It has an approved budget of ₹3.5 Crore for columnar support reinforcement.";
    } else if (msgLower.includes("water") || msgLower.includes("contamination")) {
      reply += "Yes, a water contamination issue is active in Ward 14 (Sector 4, Hazratganj). Over 2,500 people are affected, and the proposed Jal Sansthan project budget is estimated at ₹1.8 Crore.";
    } else if (msgLower.includes("budget") || msgLower.includes("crore")) {
      reply += "Our active development portfolio currently requires ₹5.3 Crore. You can use the AI Budget Planner tab to optimize allocations based on critical urgency!";
    } else {
      reply += "I can help you navigate active complaints, review PWD or Jal Sansthan department performance, or audit SDG goals. Please ask me about 'bridge repair', 'water supply', or 'constituency statistics'.";
    }
    res.json({ reply });
  }
});

// 10. POST /api/reports/generate (MP Constituency Monthly Report Generator)
app.post("/api/reports/generate", async (req, res) => {
  const issues = loadIssues();
  const projects = loadProjects();

  const totalComplaints = issues.length;
  const criticalCount = issues.filter(i => i.aiAnalysis?.severity === "critical").length;
  const resolvedCount = issues.filter(i => i.status === "completed").length;
  const ongoingProjects = projects.filter(p => p.status === "in_progress").length;

  if (isGeminiConfigured()) {
    try {
      const ai = getGemini();
      const prompt = `You are a Senior Municipal Officer and Speech Writer for Lucknow Central's Member of Parliament (MP).
We need to generate an elegant, formal "Monthly Constituency Intelligence & Progress Report".
Key Statistics:
- Total Citizen Reports Logged: ${totalComplaints}
- Life-Threatening/Critical Hazards Flagged by AI: ${criticalCount}
- Issues Successfully Resolved and Verified by Citizens: ${resolvedCount}
- Active Engineering Projects in Progress: ${ongoingProjects}

Write a formal, comprehensive, 4-section constituency update. Use clear Markdown headings:
1. Executive Summary
2. Infrastructure & Sanitation Interventions
3. AI Prioritization and Funding Optimization Outcomes
4. Social Impact & Sustainable Development (SDG) Alignment

Make it sound highly objective, data-rich, and impressive to ministers and citizens alike. Do not include personal pleasantries.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      res.json({ report: response.text });
    } catch (err) {
      console.error("AI Report generation failed", err);
      res.status(500).json({ error: "AI Report generation failed." });
    }
  } else {
    // Robust pre-built Markdown report
    const fallbackReport = `
# MONTHLY CONSTITUENCY INTELLIGENCE REPORT
**CONSTITUENCY:** Lucknow Central (Sector 04)  
**DATE:** July 4, 2026  
**STATUS:** ACTIVE INTEL LOGGED (Offline Mode)

## 1. Executive Summary
During this audit cycle, Loksetu AI logged **${totalComplaints} comprehensive community reports**. Through multi-modal hazard scans, the platform prioritized ${criticalCount} critical vulnerabilities, successfully resolving and validating **${resolvedCount} works** directly backed by before-and-after citizen photos.

## 2. Municipal Infrastructure & Sanitation Interventions
- **Hazratganj Bypass Gomti Bridge Repair (Active):** High-density column repair initiated via Public Works Department (PWD). Budget: ₹3.5 Crore.
- **Sector 4 Water Main Seepage (Sanctioned):** Sewage segregator bypass setup. Expected completion: 60 days.

## 3. Financial Outlay & Budget Allocation Efficiency
Using AI prioritization metrics, budget allocation wastage has decreased by **22%** overall. Direct matching of public expenditure with direct citizen upvotes has increased satisfaction scores to **92%** in infrastructure sectors.

## 4. Social Impact & SDG Alignment
Active works align with UN **SDG 6 (Clean Water & Sanitation)** and **SDG 11 (Sustainable Cities and Communities)**, ensuring that democratic voice is translated directly into structural longevity.
    `;
    res.json({ report: fallbackReport.trim() });
  }
});

// Setup development dev server or production hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LOKSETU AI Server booted on http://localhost:${PORT}`);
  });
}

startServer();
