// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  name: string; // Brand Name
  market: string; // Analyzed Market (Location)
  language: string; // Audience Language
  description?: string; // Project description
  timeframe: string; // Report Timeframe (e.g., "Last 3 months")
  aiModel: string; // AI Model (e.g., "GPT-4o")
  industry?: string;
  websiteUrl?: string;
  createdAt: string;
  lastRefreshAt: string | null;
  dataStatus: 'pending' | 'processing' | 'ready' | 'error';
  data: ProjectData | null;
  error?: string;
}

export interface UpdateProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}

// ============================================================================
// DASHBOARD DATA TYPES
// ============================================================================

export interface ProjectData {
  brandIdentity: BrandIdentityData | null;
  sentimentAnalysis: SentimentAnalysisData | null;
  keywordAnalysis: KeywordAnalysisData | null;
}

// Brand Identity Data
export interface BrandIdentityData {
  bpmData: BPMMetric[];
  totalBPM: number;
  toneData: ToneMetric[];
  brandPowerStatement: string;
  brandIdentitySummary: string;
  dominantThemes: DominantTheme[];
  coreBrandPersona: string;
  keyAssociations: string[];
}

export interface BPMMetric {
  name: string;
  score: number;
  description: string;
}

export interface ToneMetric {
  trait: string;
  fullName: string;
  score: number;
}

export interface DominantTheme {
  title: string;
  description: string;
  impact: string;
}

// Sentiment Analysis Data
export interface SentimentAnalysisData {
  overallSummary: string;
  primarySentiments: PrimarySentiment[];
  emotionalClusters: EmotionalCluster[];
  sentimentProfile: SentimentDimension[];
}

export interface PrimarySentiment {
  category: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  score: number;
  colorType: 'success' | 'primary' | 'destructive' | 'foreground';
  themes: string;
}

export interface EmotionalCluster {
  name: string;
  score: number;
  explanation: string;
}

export interface SentimentDimension {
  dimension: string;
  score: number;
  trend: 'up' | 'stable' | 'down';
  themes: string;
  summary: string;
}

// Keyword Analysis Data
export interface KeywordAnalysisData {
  summary: string;
  keywords: KeywordMetric[];
}

export interface KeywordMetric {
  keyword: string;
  visibility: number;
  trend: 'up' | 'stable' | 'down';
  tone: 'Positive' | 'Neutral' | 'Negative';
  share: number;
  explanation: string;
}

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface UserProfile {
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  memberSince: string;
}

// ============================================================================
// CHATGPT API REQUEST TYPES
// ============================================================================

export interface ChatGPTAnalysisRequest {
  brandName: string; // from project.name
  location: string; // from project.market
  language: string; // from project.language
  timeframe: string; // from project.timeframe
  aiModel?: string; // from project.aiModel (optional for backend)
  analysisType: 'full' | 'brand-identity' | 'sentiment' | 'keyword';
}

export interface ChatGPTReportRequest {
  brandName: string;
  location: string;
  language: string;
  timeframe: string;
  reportLanguage: 'Turkish' | 'English';
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ChatGPTResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Dashboard data
  PROJECTS: 'dashboard_projects',
  SELECTED_PROJECT_ID: 'dashboard_selectedProjectId',
  USER_PROFILE: 'user_profile',
} as const;
