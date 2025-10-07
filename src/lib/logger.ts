/**
 * Dev/Production-aware logging utility
 * 
 * Provides structured logging with environment awareness.
 * Development logs are verbose; production logs are minimal.
 */

// Reliable environment detection
const isDev = typeof window !== 'undefined' && 
              (window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.port !== '');

export const logger = {
  /**
   * Informational messages
   */
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`ℹ️ ${message}`, ...args);
  },
  
  /**
   * Success messages
   */
  success: (message: string, ...args: any[]) => {
    if (isDev) console.log(`✅ ${message}`, ...args);
  },
  
  /**
   * Warning messages
   */
  warning: (message: string, ...args: any[]) => {
    if (isDev) console.warn(`⚠️ ${message}`, ...args);
  },
  
  /**
   * Error messages (always logged)
   */
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  
  /**
   * Cleanup operations
   */
  cleanup: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🧹 ${message}`, ...args);
  },

  /**
   * Security-related operations
   */
  security: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🔒 ${message}`, ...args);
  },

  /**
   * Data sync operations
   */
  sync: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🔄 ${message}`, ...args);
  },
};