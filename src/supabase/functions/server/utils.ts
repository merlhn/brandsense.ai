import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================
// UTILITIES
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function getSupabaseClient(accessToken: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function getSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function verifyAuth(authHeader: string | undefined) {
  if (!authHeader) {
    return { error: 'Missing authorization header', user: null };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Invalid authorization header format', user: null };
  }

  try {
    const supabase = getSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { error: 'Invalid or expired token', user: null };
    }
    
    return { error: null, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Authentication failed', user: null };
  }
}

export function generateProjectId(): string {
  return crypto.randomUUID();
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateProjectData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Project name is required');
  }
  
  if (!data.market || typeof data.market !== 'string' || data.market.trim().length === 0) {
    errors.push('Market is required');
  }
  
  if (!data.language || typeof data.language !== 'string' || data.language.trim().length === 0) {
    errors.push('Language is required');
  }
  
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  if (data.industry && typeof data.industry !== 'string') {
    errors.push('Industry must be a string');
  }
  
  if (data.websiteUrl && typeof data.websiteUrl !== 'string') {
    errors.push('Website URL must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatErrorResponse(error: any, message: string = 'Internal server error') {
  console.error('Error:', error);
  return {
    error: message,
    details: error.message || 'Unknown error',
    timestamp: new Date().toISOString()
  };
}

export function logRequest(method: string, path: string, userId?: string) {
  console.log(`📡 ${method} ${path}${userId ? ` (user: ${userId})` : ''}`);
}

export function logResponse(status: number, message: string) {
  const emoji = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌';
  console.log(`${emoji} ${status} - ${message}`);
}
