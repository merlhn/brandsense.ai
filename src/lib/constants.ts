/**
 * Application-wide constants
 * 
 * Defines all magic strings and constant values used throughout the app.
 */

// ============================================================================
// SCREEN NAVIGATION
// ============================================================================

export const SCREENS = {
  LANDING: 'landing',
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
  FORGOT_PASSWORD: 'forgot',
  RESET_PASSWORD: 'reset',
  RESET_SUCCESS: 'reset-success',
  RESET_FAIL: 'reset-fail',
  SESSION_EXPIRED: 'session-expired',
  CREATE_PROJECT: 'create-project',
  DASHBOARD: 'dashboard',
} as const;

export type Screen = typeof SCREENS[keyof typeof SCREENS];

// ============================================================================
// DATA REFRESH
// ============================================================================

export const REFRESH_INTERVALS = {
  SUGGEST_AFTER_DAYS: 7,
} as const;

// ============================================================================
// AI MODELS
// ============================================================================

export const AI_MODELS = {
  GPT_4O: 'gpt-4o',
  // Coming soon:
  // CLAUDE: 'claude',
  // GEMINI: 'gemini',
} as const;

// ============================================================================
// TIMEFRAMES
// ============================================================================

export const TIMEFRAMES = {
  LAST_3_MONTHS: 'last_3_months',
  // Coming soon:
  // LAST_6_MONTHS: 'last_6_months',
  // LAST_YEAR: 'last_year',
} as const;

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const AUTH_TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  AUTH_ACCESS_TOKEN: 'auth_access_token',
} as const;