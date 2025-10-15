import {
  Project,
  UserProfile,
  STORAGE_KEYS,
} from './types';

// ============================================================================
// PROJECT STORAGE
// ============================================================================

/**
 * Load all projects from localStorage
 */
export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    return JSON.parse(data) as Project[];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Save all projects to localStorage
 */
export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
    throw new Error('Failed to save projects to storage');
  }
}

/**
 * Load a single project by ID
 */
export function loadProject(projectId: string): Project | null {
  const projects = loadProjects();
  return projects.find(p => p.id === projectId) || null;
}

/**
 * Save or update a single project
 */
export function saveProject(project: Project): void {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  saveProjects(projects);
}

/**
 * Delete a project by ID
 */
export function deleteProject(projectId: string): void {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  saveProjects(filtered);
  
  // If deleted project was selected, clear selection
  if (getSelectedProjectId() === projectId) {
    clearSelectedProjectId();
  }
}

/**
 * Update project data status
 */
export function updateProjectStatus(
  projectId: string,
  status: Project['dataStatus'],
  error?: string
): void {
  const project = loadProject(projectId);
  if (!project) return;
  
  project.dataStatus = status;
  if (error) {
    project.error = error;
  } else {
    delete project.error;
  }
  
  saveProject(project);
}

/**
 * Update project data after refresh
 */
export function updateProjectData(
  projectId: string,
  data: Project['data']
): void {
  const project = loadProject(projectId);
  if (!project) return;
  
  project.data = data;
  project.lastRefreshAt = new Date().toISOString();
  project.dataStatus = 'ready';
  delete project.error;
  
  saveProject(project);
}

/**
 * Mark project as refreshing (no counter needed - unlimited refreshes)
 */
export function markProjectRefreshing(projectId: string): boolean {
  const project = loadProject(projectId);
  if (!project) return false;
  
  project.dataStatus = 'processing';
  project.lastRefreshAt = new Date().toISOString();
  saveProject(project);
  return true;
}

// ============================================================================
// SELECTED PROJECT
// ============================================================================

/**
 * Get selected project ID
 */
export function getSelectedProjectId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
}

/**
 * Set selected project ID
 */
export function setSelectedProjectId(projectId: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, projectId);
}

/**
 * Clear selected project ID
 */
export function clearSelectedProjectId(): void {
  localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
}

/**
 * Get selected project (convenience function)
 */
export function getSelectedProject(): Project | null {
  const projectId = getSelectedProjectId();
  if (!projectId) return null;
  return loadProject(projectId);
}

// ============================================================================
// USER PROFILE STORAGE
// ============================================================================

/**
 * Load user profile from localStorage
 */
export function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    return JSON.parse(data) as UserProfile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw new Error('Failed to save user profile to storage');
  }
}

/**
 * Clear user profile (logout)
 */
export function clearUserProfile(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}

// ============================================================================
// AUTHENTICATION STORAGE
// ============================================================================

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token);
}

/**
 * Clear access token (logout)
 */
export function clearAccessToken(): void {
  localStorage.removeItem('access_token');
}

/**
 * Get user email from localStorage
 */
export function getUserEmail(): string | null {
  return localStorage.getItem('user_email');
}

/**
 * Set user email in localStorage
 */
export function setUserEmail(email: string): void {
  localStorage.setItem('user_email', email);
}

/**
 * Get user full name from localStorage
 */
export function getUserFullName(): string | null {
  return localStorage.getItem('user_fullName');
}

/**
 * Set user full name in localStorage
 */
export function setUserFullName(fullName: string): void {
  localStorage.setItem('user_fullName', fullName);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all app data (logout or reset)
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Also clear auth tokens
  clearAccessToken();
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_fullName');
}



/**
 * Generate unique ID (UUID v4 format for Supabase compatibility)
 */
export function generateId(): string {
  // Use crypto.randomUUID() for proper UUID format
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers (generate UUID v4 manually)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if project needs refresh (> 7 days old) - unlimited refreshes
 */
export function shouldSuggestRefresh(project: Project): boolean {
  if (!project.lastRefreshAt) return false;
  
  const lastRefresh = new Date(project.lastRefreshAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= 7;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ============================================================================
// SESSION MANAGEMENT HELPERS
// ============================================================================

/**
 * Clears all storage and restores authentication token and user info
 * Used during session validation to ensure clean state
 */
export function clearAllAndRestoreAuth(accessToken: string, email?: string, fullName?: string): void {
  localStorage.clear();
  localStorage.setItem('access_token', accessToken);
  
  // Restore user info if provided
  if (email) {
    localStorage.setItem('user_email', email);
  }
  if (fullName) {
    localStorage.setItem('user_fullName', fullName);
  }
}

/**
 * Syncs projects from backend (source of truth)
 * Updates localStorage with backend project data
 */
export function syncProjectsFromBackend(projects: Project[]): void {
  if (projects.length === 0) {
    return;
  }
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, projects[0].id);
}

/**
 * Validates projects format and UUID structure
 * Returns true if projects are valid, false otherwise
 */
export function validateProjectsFormat(): boolean {
  const projectsStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!projectsStr) return true; // No projects is valid
  
  try {
    const projects = JSON.parse(projectsStr);
    if (!Array.isArray(projects)) return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    return projects.every((p: any) => 
      p &&
      typeof p === 'object' &&
      p.id && 
      typeof p.id === 'string' && 
      uuidRegex.test(p.id)
    );
  } catch (e) {
    return false;
  }
}

/**
 * Clears all storage (alias for clearAllData)
 */
export function clearAll(): void {
  localStorage.clear();
}

// ============================================================================
// UNIFIED STORAGE API
// ============================================================================

/**
 * Unified storage API object for easier imports
 */
export const storage = {
  // Projects
  getAllProjects: loadProjects,
  getProject: loadProject,
  saveProject,
  saveProjects,
  deleteProject,
  updateProjectStatus,
  updateProjectData,
  markProjectRefreshing,
  
  // Current Project
  getCurrentProject: getSelectedProject,
  setCurrentProject: (project: Project) => setSelectedProjectId(project.id),
  getCurrentProjectId: getSelectedProjectId,
  clearCurrentProject: clearSelectedProjectId,
  
  // Project Data (convenience)
  getProjectData: (projectId: string) => loadProject(projectId)?.data || null,
  
  // User Profile
  getUserProfile: loadUserProfile,
  saveUserProfile,
  clearUserProfile,
  
  // User Info
  getUserEmail,
  setUserEmail,
  getUserFullName,
  setUserFullName,
  
  // Authentication
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  
  // Session Management
  clearAllAndRestoreAuth,
  syncProjectsFromBackend,
  validateProjectsFormat,
  
  // Utilities
  clearAll,
  clearAllData,
  generateId,
  shouldSuggestRefresh,
  isValidUUID,
};
