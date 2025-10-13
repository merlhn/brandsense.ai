import {
  Project,
  ChatGPTAnalysisRequest,
  ChatGPTReportRequest,
  ChatGPTResponse,
  ProjectData,
} from './types';
// ============================================================================
// API CONFIGURATION
// ============================================================================

// Backend API base URL - Supabase Edge Function
const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://vtnglubfoyvfwuxxbugs.supabase.co'}/functions/v1`;

// Export API configuration for other components
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/make-server-cf9a9609/auth/signup',
      SIGNIN: '/make-server-cf9a9609/auth/signin',
      CHANGE_PASSWORD: '/make-server-cf9a9609/auth/change-password',
    },
    PROJECTS: {
      LIST: '/make-server-cf9a9609/projects',
      CREATE: '/make-server-cf9a9609/projects/create',
      GET: (id: string) => `/make-server-cf9a9609/projects/${id}`,
      REFRESH: '/make-server-cf9a9609/projects/refresh',
    },
    FEEDBACK: '/make-server-cf9a9609/feedback',
  }
};

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Get authorization headers for API requests
 */
function getAuthHeaders(accessToken?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bmdsdWJmb3l2Znd1eHhidWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzkzMjksImV4cCI6MjA3NTI1NTMyOX0.gwLdjaddi_56cL3p0IDiMb0TTJRA56B1e7d3NPmeXVQ'}`,
  };
}

/**
 * Get current user's access token from storage
 */
function getAccessToken(): string | null {
  // Try to get from localStorage (set during sign in)
  return localStorage.getItem('access_token');
}

// ============================================================================
// REQUEST BUILDERS
// ============================================================================

/**
 * Build ChatGPT analysis request from project
 */
export function buildAnalysisRequest(
  project: Project,
  analysisType: ChatGPTAnalysisRequest['analysisType'] = 'full'
): ChatGPTAnalysisRequest {
  return {
    brandName: project.name,
    location: project.market,
    language: project.language,
    timeframe: project.timeframe,
    aiModel: project.aiModel,
    analysisType,
  };
}

/**
 * Build ChatGPT risk report request
 */
export function buildRiskReportRequest(
  project: Project
): ChatGPTReportRequest {
  return {
    brandName: project.name,
    location: project.market,
    language: project.language,
    timeframe: project.timeframe,
    reportLanguage: project.language,
    dateRange: { start: '', end: '' }, // Not used anymore - using timeframe instead
  };
}

// ============================================================================
// API CALLS (Backend Integration)
// ============================================================================

/**
 * Analyze project with ChatGPT
 * This calls the backend API which then calls ChatGPT
 */
export async function analyzeProject(
  project: Project,
  analysisType: ChatGPTAnalysisRequest['analysisType'] = 'full'
): Promise<ChatGPTResponse<ProjectData>> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token - user must be signed in');
    throw new Error('User must be signed in to analyze project');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/create`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        brandName: project.name,
        market: project.market,
        language: project.language,
        timeframe: project.timeframe,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Project creation failed:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: null, // Will be populated when project is ready
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Generate risk report with ChatGPT
 */
export async function generateRiskReport(
  project: Project
): Promise<ChatGPTResponse<string>> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token - user must be signed in');
    throw new Error('User must be signed in to generate report');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        projectId: project.id,
        language: project.language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Report generation failed:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.report?.content || '',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Refresh project data (manual refresh by user)
 * UNLIMITED REFRESHES - no counter needed
 */
export async function refreshProjectData(
  project: Project,
  analysisType: ChatGPTAnalysisRequest['analysisType'] = 'full'
): Promise<ChatGPTResponse<ProjectData>> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token - user must be signed in');
    throw new Error('User must be signed in to refresh project');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        projectId: project.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Project refresh failed:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: null, // Will be updated when processing completes
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get project details (including ChatGPT analysis data)
 */
export async function getProjectDetails(projectId: string): Promise<Project | null> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token - user must be signed in');
    return null;
  }

  try {
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to fetch project:', errorData);
      return null;
    }

    const data = await response.json();

    // Transform backend response to Project type
    const { project: backendProject, data: backendData } = data;
    
    return {
      id: backendProject.id,
      name: backendProject.name,
      market: backendProject.market,
      language: backendProject.language,
      timeframe: backendProject.timeframe || 'Last 3 months',
      aiModel: 'gpt-4o',
      createdAt: backendProject.created_at,
      lastRefreshAt: backendProject.last_refreshed_at,
      dataStatus: backendProject.data_status,
      data: backendData ? {
        brandIdentity: backendData.brandIdentity,
        sentimentAnalysis: backendData.sentimentAnalysis,
        keywordAnalysis: backendData.keywordAnalysis,
      } : null,
    };
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

/**
 * Get all projects for current user
 */
export async function getAllProjects(): Promise<Project[]> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token - user must be signed in');
    return [];
  }

  try {
    
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to fetch projects:', errorData);
      return [];
    }

    const data = await response.json();

    // Transform backend projects to Project type
    return (data.projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      market: p.market,
      language: p.language,
      timeframe: p.timeframe || 'Last 3 months',
      aiModel: 'gpt-4o',
      createdAt: p.created_at,
      lastRefreshAt: p.last_refreshed_at,
      dataStatus: p.data_status,
      data: null, // Load data separately with getProjectDetails
    }));
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

// ============================================================================
// CHATGPT PROMPTS (Not needed - backend handles this)
// ============================================================================

// The backend now handles all ChatGPT prompts and API calls
// These functions are kept for reference but not used in production

/**
 * Generate Sentiment Analysis with ChatGPT
 */
export async function generateSentimentAnalysis(
  project: Project
): Promise<ChatGPTResponse<string>> {
  // Not used - backend handles this
  return {
    success: false,
    data: '',
    timestamp: new Date().toISOString(),
    error: 'Use analyzeProject instead',
  };
}

/**
 * Generate Keyword Analysis with ChatGPT
 */
export async function generateKeywordAnalysis(
  project: Project
): Promise<ChatGPTResponse<string>> {
  // Not used - backend handles this
  return {
    success: false,
    data: '',
    timestamp: new Date().toISOString(),
    error: 'Use analyzeProject instead',
  };
}

/**
 * Generate Brand Identity Analysis with ChatGPT
 */
export async function generateBrandIdentity(
  project: Project
): Promise<ChatGPTResponse<string>> {
  // Not used - backend handles this
  return {
    success: false,
    data: '',
    timestamp: new Date().toISOString(),
    error: 'Use analyzeProject instead',
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if API is available (health check)
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    // Use public anon key for health check (no auth required on backend)
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Format ChatGPT error message for user
 */
export function formatAPIError(error: string): string {
  // Common error translations
  const errorMessages: Record<string, string> = {
    'rate_limit': 'API rate limit exceeded. Please try again later.',
    'timeout': 'Request timed out. Please check your connection.',
    'invalid_request': 'Invalid request parameters.',
    'server_error': 'Server error. Please contact support.',
    'Unauthorized': 'Session expired. Please sign in again.',
    'User must be signed in': 'Please sign in to continue.',
  };
  
  return errorMessages[error] || 'An unexpected error occurred.';
}
