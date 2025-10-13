/**
 * Session Validation Module
 * 
 * Centralized session validation logic extracted from App.tsx.
 * Validates user sessions, syncs with backend, and determines initial screen.
 */

import { storage } from './storage';
import { API_CONFIG } from './api';
import { logger } from './logger';
import { SCREENS, type Screen } from './constants';
import type { Project } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  screen: Screen;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to validate Project object structure
 */
export function isValidProject(p: any): p is Project {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof p.id === 'string' &&
    uuidRegex.test(p.id) &&
    typeof p.name === 'string' &&
    typeof p.market === 'string' &&
    typeof p.language === 'string'
  );
}

// ============================================================================
// SESSION VALIDATION
// ============================================================================

/**
 * Validates user session on app startup
 * 
 * Flow:
 * 1. Check localStorage projects format
 * 2. Check if access token exists
 * 3. Validate token with backend
 * 4. Sync projects from backend (source of truth)
 * 5. Determine initial screen
 */
export async function validateUserSession(): Promise<ValidationResult> {
  // Step 1: Validate stored projects format
  logger.info('Starting session validation...');
  
  const isProjectsValid = storage.validateProjectsFormat();
  if (!isProjectsValid) {
    logger.cleanup('Invalid project format detected, clearing all storage');
    storage.clearAll();
    return { isValid: false, screen: SCREENS.LANDING };
  }

  // Step 2: Check access token
  const accessToken = storage.getAccessToken();
  if (!accessToken) {
    logger.info('No access token found, redirecting to landing');
    return { isValid: false, screen: SCREENS.LANDING };
  }

  // Step 3: Validate token with backend
  try {
    logger.info('Validating token with backend...');
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS.LIST}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      // Valid token - sync with backend
      const data = await response.json();
      const backendProjects: unknown = data.projects || [];
      
      return handleValidSession(backendProjects, accessToken);
    } else if (response.status === 401) {
      // Invalid/expired token
      logger.security('Invalid or expired token detected, clearing session');
      storage.clearAll();
      return { isValid: false, screen: SCREENS.LANDING };
    } else {
      // Other backend error
      logger.error(`Backend returned status ${response.status}`);
      logger.cleanup('Clearing storage due to backend error');
      storage.clearAll();
      return { isValid: false, screen: SCREENS.LANDING };
    }
  } catch (error) {
    logger.error('Session validation failed:', error);
    storage.clearAll();
    return { isValid: false, screen: SCREENS.LANDING };
  }
}

/**
 * Handles valid session with backend projects
 * Syncs projects and determines initial screen
 */
function handleValidSession(
  backendProjects: unknown,
  accessToken: string
): ValidationResult {
  // Validate projects array
  if (!Array.isArray(backendProjects)) {
    logger.error('Backend returned invalid projects data');
    storage.clearAll();
    return { isValid: false, screen: SCREENS.LANDING };
  }

  // Validate each project
  const validProjects = backendProjects.filter(isValidProject);
  if (validProjects.length !== backendProjects.length) {
    logger.warning(
      `Some projects failed validation: ${backendProjects.length - validProjects.length} invalid`
    );
  }

  // Sync with backend (source of truth)
  if (validProjects.length > 0) {
    logger.success(`Backend has ${validProjects.length} projects, syncing...`);
    
    // Clear all and restore auth
    storage.clearAllAndRestoreAuth(accessToken);
    
    // Sync projects from backend
    storage.syncProjectsFromBackend(validProjects);
    
    logger.sync('Projects synced successfully');
    return { isValid: true, screen: SCREENS.DASHBOARD };
  } else {
    // Valid session but no projects - onboarding
    logger.info('No projects found, redirecting to onboarding');
    
    storage.clearAllAndRestoreAuth(accessToken);
    
    return { isValid: true, screen: SCREENS.ONBOARDING_BRAND };
  }
}