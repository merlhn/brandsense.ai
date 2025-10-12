import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ============================================
// STARTUP CHECKS
// ============================================

// Verify critical environment variables on startup
console.log('🚀 Server starting up...');
console.log('📋 Environment variable check:');
console.log('  - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? '✓ Set' : '✗ MISSING');
console.log('  - SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✓ Set' : '✗ MISSING');
console.log('  - ANON_KEY:', Deno.env.get('ANON_KEY') ? '✓ Set' : '⚠ Not set (will use SERVICE_ROLE_KEY as fallback)');
console.log('  - OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? '✓ Set' : '⚠ Not set (will use demo mode)');

if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
  console.error('❌ CRITICAL: Missing required environment variables!');
  console.error('The server cannot function without SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please configure these in your Supabase Edge Function settings');
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// UTILITIES
// ============================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getSupabaseAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url || !key) {
    console.error('❌ CRITICAL: Missing required environment variables');
    console.error('SUPABASE_URL:', url ? '✓ Set' : '✗ Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', key ? '✓ Set' : '✗ Missing');
    throw new Error('Missing required Supabase environment variables');
  }
  
  return createClient(url, key);
}

function getSupabaseClient(accessToken?: string) {
  const url = Deno.env.get('SUPABASE_URL');
  // For sign-in, we can use either ANON_KEY (without SUPABASE_ prefix) or SERVICE_ROLE_KEY
  const key = Deno.env.get('ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url || !key) {
    console.error('❌ CRITICAL: Missing required environment variables for client');
    console.error('SUPABASE_URL:', url ? '✓ Set' : '✗ Missing');
    console.error('ANON_KEY:', Deno.env.get('ANON_KEY') ? '✓ Set' : '✗ Missing (fallback to SERVICE_ROLE_KEY)');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✓ Set' : '✗ Missing');
    throw new Error('Missing required Supabase environment variables');
  }
  
  return createClient(
    url,
    key,
    accessToken ? {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    } : undefined
  );
}

async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'Missing authorization header', user: null };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    return { error: 'Invalid authorization header', user: null };
  }

  const supabase = getSupabaseAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { error: 'Unauthorized', user: null };
  }

  return { error: null, user };
}

// ============================================
// HEALTH CHECK
// ============================================

app.get("/make-server-cf9a9609/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      supabaseServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      anonKey: !!Deno.env.get('ANON_KEY'),
      openaiApiKey: !!Deno.env.get('OPENAI_API_KEY'),
    }
  });
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /make-server-cf9a9609/auth/signup
 * Body: { email, password, fullName }
 */
app.post("/make-server-cf9a9609/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return c.json({ 
        error: 'Missing required fields: email, password, fullName' 
      }, 400);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return c.json({ 
        error: 'Please provide a valid email address.' 
      }, 400);
    }

    // Check if email already exists
    const supabase = getSupabaseAdminClient();
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (!checkError && existingUsers?.users) {
      const emailExists = existingUsers.users.some(
        user => user.email?.toLowerCase() === email.toLowerCase().trim()
      );
      
      if (emailExists) {
        console.log('⚠️ Sign up attempt with existing email:', email);
        return c.json({ 
          error: 'This email is already registered. Please sign in instead.' 
        }, 409); // 409 Conflict
      }
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Auto-confirm email (no verification in MVP)
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already been registered') || error.message?.includes('email_exists')) {
        return c.json({ 
          error: 'This email is already registered. Please sign in instead.' 
        }, 409);
      }
      
      return c.json({ 
        error: error.message || 'Failed to create account' 
      }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email.toLowerCase().trim(),
        full_name: fullName,
      });

    if (profileError) {
      console.error('❌ CRITICAL: Profile creation failed - Database schema may not be deployed!', profileError);
      console.error('Full error details:', JSON.stringify(profileError, null, 2));
      
      // Delete auth user if profile creation failed
      await supabase.auth.admin.deleteUser(data.user.id);
      
      return c.json({ 
        error: 'Database schema not deployed. Please run the SQL schema in Supabase Dashboard → SQL Editor. See /database/supabase_schema.sql',
        details: profileError.message || 'Unknown database error'
      }, 500);
    }

    console.log('✅ User created successfully:', data.user.email);

    return c.json({ 
      success: true,
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
      }
    });

  } catch (error) {
    console.error('Sign up endpoint error:', error);
    return c.json({ 
      error: 'Internal server error during sign up' 
    }, 500);
  }
});

/**
 * POST /make-server-cf9a9609/auth/signin
 * Body: { email, password }
 */
app.post("/make-server-cf9a9609/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ 
        error: 'Missing required fields: email, password' 
      }, 400);
    }

    console.log('🔐 Sign in attempt for:', email.toLowerCase().trim());

    // Sign in with Supabase Auth - use admin client for better error handling
    const supabase = getSupabaseAdminClient();
    
    // First, check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users?.users) {
      const userExists = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
      if (!userExists) {
        console.warn('⚠️ Sign in attempt for non-existent user:', email);
        return c.json({ 
          error: 'No account found with this email. Please sign up first.' 
        }, 401);
      }
      console.log('✓ User exists in Auth, attempting password validation...');
    }
    
    // Now try to sign in with the regular client
    const clientSupabase = getSupabaseClient();
    const { data, error } = await clientSupabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        return c.json({ 
          error: 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.' 
        }, 401);
      }
      
      if (error.message?.includes('Email not confirmed')) {
        return c.json({ 
          error: 'Email not confirmed. Please check your email for confirmation link.' 
        }, 401);
      }
      
      return c.json({ 
        error: error.message || 'Failed to sign in' 
      }, 401);
    }

    if (!data.session) {
      console.error('❌ No session created after sign in');
      return c.json({ error: 'Failed to create session' }, 500);
    }

    // Check if user exists in public.users table
    const adminClient = getSupabaseAdminClient();
    const { data: existingUser, error: checkError } = await adminClient
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    // If user doesn't exist in public.users, create it (recovery mechanism)
    if (checkError && checkError.code === 'PGRST116') {
      console.warn('⚠️ User exists in Auth but not in public.users - auto-recovering...');
      
      const { error: insertError } = await adminClient
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || null,
        });

      if (insertError) {
        console.error('❌ CRITICAL: Failed to auto-recover user profile:', insertError);
        return c.json({ 
          error: 'Database error. Please contact support or run database schema: /database/supabase_schema.sql',
          details: insertError.message
        }, 500);
      }
      
      console.log('✅ User profile auto-recovered successfully');
    } else if (checkError) {
      console.error('❌ Error checking user existence:', checkError);
      // Continue anyway - non-critical
    }

    // Update last login
    const { error: updateError } = await adminClient
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);

    if (updateError) {
      console.warn('⚠️ Failed to update last login (non-critical):', updateError.message);
      // Don't fail the request if this update fails
    }

    console.log('✅ User signed in successfully:', data.user.email);

    return c.json({ 
      success: true,
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
      }
    });

  } catch (error) {
    console.error('Sign in endpoint error:', error);
    return c.json({ 
      error: 'Internal server error during sign in' 
    }, 500);
  }
});

/**
 * POST /make-server-cf9a9609/auth/signout
 * Headers: Authorization: Bearer <access_token>
 */
app.post("/make-server-cf9a9609/auth/signout", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error: authError, user } = await verifyAuth(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = authHeader!.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return c.json({ error: 'Failed to sign out' }, 500);
    }

    return c.json({ success: true, message: 'Signed out successfully' });

  } catch (error) {
    console.error('Sign out endpoint error:', error);
    return c.json({ error: 'Internal server error during sign out' }, 500);
  }
});

/**
 * GET /make-server-cf9a9609/auth/session
 * Headers: Authorization: Bearer <access_token>
 */
app.get("/make-server-cf9a9609/auth/session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const { error: authError, user } = await verifyAuth(authHeader);

    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    return c.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
      }
    });

  } catch (error) {
    console.error('Session endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// CHATGPT API UTILITIES
// ============================================

interface BrandIdentityData {
  bpmData: Array<{ name: string; score: number; description: string }>;
  totalBPM: number;
  toneData: Array<{ trait: string; fullName: string; score: number }>;
  brandPowerStatement: string;
  brandIdentitySummary: string;
  dominantThemes: Array<{ title: string; description: string; impact: string }>;
  coreBrandPersona: string;
  keyAssociations: string[];
}

interface SentimentAnalysisData {
  overallSummary: string;
  primarySentiments: Array<{ category: string; score: number; colorType: string; themes: string }>;
  emotionalClusters: Array<{ name: string; score: number; explanation: string }>;
  sentimentProfile: Array<{ dimension: string; score: number; trend: string; themes: string; summary: string }>;
}

interface KeywordAnalysisData {
  summary: string;
  keywords: Array<{ keyword: string; visibility: number; trend: string; tone: string; share: number; explanation: string }>;
}

async function callChatGPT(prompt: string, useDemoMode = false): Promise<any> {
  // DEMO MODE: Return mock data without consuming API quota
  if (useDemoMode) {
    console.log('🎭 DEMO MODE: Using mock ChatGPT response');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    return getMockChatGPTResponse();
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.log('⚠️ OPENAI_API_KEY not configured - falling back to demo mode');
    return getMockChatGPTResponse();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a brand analyst. Always respond with valid JSON only, no additional text.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a quota error (429) or insufficient_quota error
      if (response.status === 429 || errorText.includes('insufficient_quota')) {
        console.log('⚠️ OpenAI API quota exceeded - automatically switching to DEMO MODE');
        console.log('📝 Using mock data instead. To disable demo mode, ensure you have sufficient OpenAI API credits.');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to simulate API
        return getMockChatGPTResponse();
      }
      
      console.error('ChatGPT API error:', errorText);
      throw new Error(`ChatGPT API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in ChatGPT response');
    }

    return JSON.parse(content);
    
  } catch (error) {
    // If any network or parsing error occurs, fallback to demo mode
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      console.log('⚠️ API quota issue detected - using demo mode');
      return getMockChatGPTResponse();
    }
    throw error;
  }
}

function getMockChatGPTResponse(): any {
  // Mock data analysis response
  return {
    brandIdentity: {
      bpmData: [
        { name: "Innovation", score: 85, description: "Perceived as a forward-thinking brand" },
        { name: "Quality", score: 78, description: "Strong association with premium quality" },
        { name: "Trust", score: 82, description: "High consumer confidence" },
        { name: "Value", score: 72, description: "Good price-to-value ratio perception" },
        { name: "Reliability", score: 88, description: "Consistent performance reputation" }
      ],
      totalBPM: 405,
      toneData: [
        { trait: "Professional", fullName: "Professional", score: 90 },
        { trait: "Approachable", fullName: "Approachable", score: 75 },
        { trait: "Innovative", fullName: "Innovative", score: 85 },
        { trait: "Trustworthy", fullName: "Trustworthy", score: 88 }
      ],
      brandPowerStatement: "A trusted, innovative brand delivering reliable quality",
      brandIdentitySummary: "The brand demonstrates strong market presence with high scores in trust and reliability. Innovation perception is strong, positioning the brand well for future growth.",
      dominantThemes: [
        {
          title: "Innovation Leadership",
          description: "Consistently recognized as a market innovator",
          impact: "Drives premium positioning and attracts early adopters"
        },
        {
          title: "Quality Excellence",
          description: "Strong reputation for superior product quality",
          impact: "Enables premium pricing and builds customer loyalty"
        },
        {
          title: "Customer Trust",
          description: "High levels of consumer confidence and brand advocacy",
          impact: "Reduces acquisition costs and increases lifetime value"
        }
      ],
      coreBrandPersona: "A reliable innovator that combines cutting-edge solutions with proven quality",
      keyAssociations: ["Innovation", "Quality", "Trust", "Premium", "Reliability"]
    },
    sentimentAnalysis: {
      overallSummary: "Predominantly positive sentiment with strong emotional connections. Minor areas for improvement in customer service response times.",
      primarySentiments: [
        { category: "Positive", score: 68, colorType: "success", themes: "Product quality, innovation, reliability" },
        { category: "Neutral", score: 22, colorType: "muted", themes: "Pricing discussions, feature comparisons" },
        { category: "Negative", score: 10, colorType: "destructive", themes: "Support response times, availability" }
      ],
      emotionalClusters: [
        { name: "Delight", score: 45, explanation: "Strong positive reactions to product launches and quality" },
        { name: "Trust", score: 72, explanation: "High confidence in brand promises and delivery" },
        { name: "Frustration", score: 15, explanation: "Minor issues with customer support accessibility" }
      ],
      sentimentProfile: [
        {
          dimension: "Product Satisfaction",
          score: 82,
          trend: "stable",
          themes: "Quality, features, performance",
          summary: "Consistently high satisfaction with product offerings"
        },
        {
          dimension: "Brand Perception",
          score: 78,
          trend: "improving",
          themes: "Innovation, trust, premium",
          summary: "Positive and strengthening brand image"
        },
        {
          dimension: "Customer Experience",
          score: 68,
          trend: "stable",
          themes: "Support, accessibility, communication",
          summary: "Good but room for improvement in service delivery"
        }
      ]
    },
    keywordAnalysis: {
      summary: "Strong visibility in core categories with growing presence in emerging market segments. Brand keywords show positive sentiment alignment.",
      keywords: [
        { keyword: "innovative", visibility: 92, trend: "up", tone: "positive", share: 15, explanation: "Frequently associated with new product launches" },
        { keyword: "quality", visibility: 88, trend: "stable", tone: "positive", share: 18, explanation: "Core brand attribute consistently mentioned" },
        { keyword: "premium", visibility: 75, trend: "up", tone: "neutral", share: 12, explanation: "Price positioning discussions" },
        { keyword: "reliable", visibility: 85, trend: "stable", tone: "positive", share: 16, explanation: "Performance and consistency references" },
        { keyword: "trusted", visibility: 82, trend: "up", tone: "positive", share: 14, explanation: "Brand confidence and advocacy" },
        { keyword: "modern", visibility: 78, trend: "up", tone: "positive", share: 11, explanation: "Design and technology associations" },
        { keyword: "professional", visibility: 72, trend: "stable", tone: "positive", share: 9, explanation: "Business and enterprise context" },
        { keyword: "expensive", visibility: 45, trend: "down", tone: "negative", share: 5, explanation: "Price concern mentions declining" }
      ]
    }
  };
}

function getBrandIdentityPrompt(brandName: string, market: string, language: string): string {
  return `Analyze ${brandName}'s brand identity in ${market} (${language} language).

RESPOND WITH VALID JSON ONLY. Use this exact structure:

{
  "bpmData": [
    {"name": "Visibility", "score": 0-100, "description": "How often and prominently the brand appears across LLM-generated contexts."},
    {"name": "Consistency", "score": 0-100, "description": "How coherent its tone, values, and messaging appear across topics."},
    {"name": "Emotional Resonance", "score": 0-100, "description": "How strongly the brand evokes emotional or cultural reactions."},
    {"name": "Distinctiveness", "score": 0-100, "description": "How clearly it stands out from category-level or generic mentions."}
  ],
  "totalBPM": (average of 4 BPM scores),
  "toneData": [
    {"trait": "Innovation", "fullName": "Innovation", "score": 0-100},
    {"trait": "Trust", "fullName": "Trust / Reliability", "score": 0-100},
    {"trait": "Accessibility", "fullName": "Accessibility / Mass Appeal", "score": 0-100},
    {"trait": "Prestige", "fullName": "Prestige / Premium Feel", "score": 0-100},
    {"trait": "Activism", "fullName": "Activism / Social Responsibility", "score": 0-100},
    {"trait": "Performance", "fullName": "Performance / Technical Expertise", "score": 0-100}
  ],
  "brandPowerStatement": "Brief statement about brand power (200-300 characters)",
  "brandIdentitySummary": "Summary of brand positioning (300-400 characters, can use <strong> tags)",
  "dominantThemes": [
    {"title": "Theme 1", "description": "Description", "impact": "Very High|High|Medium"},
    {"title": "Theme 2", "description": "Description", "impact": "Very High|High|Medium"},
    {"title": "Theme 3", "description": "Description", "impact": "Very High|High|Medium"}
  ],
  "coreBrandPersona": "Description of how ChatGPT portrays the brand",
  "keyAssociations": ["association1", "association2", ... at least 10 items]
}

Analyze authentically for ${market} market context.`;
}

function getSentimentPrompt(brandName: string, market: string, language: string): string {
  return `Analyze sentiment for ${brandName} in ${market} (${language} language).

RESPOND WITH VALID JSON ONLY. Use this exact structure:

{
  "overallSummary": "Summary of overall sentiment (300-400 characters)",
  "primarySentiments": [
    {"category": "Positive", "score": 0-100, "colorType": "success", "themes": "Main positive themes"},
    {"category": "Neutral", "score": 0-100, "colorType": "primary", "themes": "Main neutral themes"},
    {"category": "Negative", "score": 0-100, "colorType": "destructive", "themes": "Main negative themes"},
    {"category": "Mixed", "score": 0-100, "colorType": "foreground", "themes": "Mixed sentiment themes"}
  ],
  "emotionalClusters": [
    {"name": "Excitement", "score": 0-100, "explanation": "Why this emotion is associated"},
    {"name": "Trust", "score": 0-100, "explanation": "Why this emotion is associated"},
    {"name": "Aspiration", "score": 0-100, "explanation": "Why this emotion is associated"}
  ],
  "sentimentProfile": [
    {"dimension": "Trust", "score": 0-100, "trend": "up|stable|down", "themes": "Key themes", "summary": "Brief summary"},
    {"dimension": "Innovation", "score": 0-100, "trend": "up|stable|down", "themes": "Key themes", "summary": "Brief summary"},
    {"dimension": "Value", "score": 0-100, "trend": "up|stable|down", "themes": "Key themes", "summary": "Brief summary"}
  ]
}

Note: primarySentiments scores should total approximately 100.`;
}

function getKeywordPrompt(brandName: string, market: string, language: string): string {
  return `Analyze keywords for ${brandName} in ${market} (${language} language).

RESPOND WITH VALID JSON ONLY. Use this exact structure:

{
  "summary": "Brief summary of keyword analysis (300-400 characters)",
  "keywords": [
    {"keyword": "keyword1", "visibility": 0-100, "trend": "up|stable|down", "tone": "Positive|Neutral|Negative", "share": 0-100, "explanation": "Why this keyword matters"},
    ... at least 10-15 keywords
  ]
}

Include diverse keywords covering: product categories, brand attributes, themes, concerns, etc.`;
}



// Background analysis function
async function analyzeBrandInBackground(
  projectId: string,
  brandName: string,
  market: string,
  language: string
) {
  const supabase = getSupabaseAdminClient();
  
  try {
    console.log(`🔄 Starting background analysis for ${brandName} in ${market}`);
    
    // Check cache first (NEW: Performance optimization)
    const cacheKey = `analysis:${brandName}:${market}:${language}`;
    const cached = await kv.get(cacheKey);
    
    if (cached) {
      console.log('🚀 Using cached analysis - instant response!');
      await kv.set(`project_data:${projectId}`, cached);
      await supabase
        .from('projects')
        .update({
          data_status: 'ready',
          last_refreshed_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      return;
    }
    
    // Check if demo mode is enabled
    const useDemoMode = Deno.env.get('DEMO_MODE') === 'true' || !Deno.env.get('OPENAI_API_KEY');
    
    if (useDemoMode) {
      console.log('🎭 DEMO MODE enabled - using mock data');
    }
    
    // Call ChatGPT for each analysis type
    const [brandIdentity, sentimentAnalysis, keywordAnalysis] = await Promise.all([
      callChatGPT(getBrandIdentityPrompt(brandName, market, language), false, useDemoMode),
      callChatGPT(getSentimentPrompt(brandName, market, language), false, useDemoMode),
      callChatGPT(getKeywordPrompt(brandName, market, language), false, useDemoMode),
    ]);
    
    // Combine all data
    const fullData = {
      brandIdentity,
      sentimentAnalysis,
      keywordAnalysis,
    };
    
    // Cache the analysis for future use (NEW: Performance optimization)
    await kv.set(cacheKey, fullData, { expireIn: 86400 }); // 24 hours
    console.log(`💾 Cached analysis for future use: ${cacheKey}`);
    
    // Store in KV store (matching GET endpoint)
    const dataKey = `project_data:${projectId}`;
    await kv.set(dataKey, fullData);
    
    console.log(`💾 Stored data in KV store with key: ${dataKey}`);
    
    // Update project status to ready
    await supabase
      .from('projects')
      .update({
        data_status: 'ready',
        last_refreshed_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    
    console.log(`✅ Background analysis complete for ${brandName}`);
    
  } catch (error) {
    console.error('❌ Background analysis failed:', error);
    
    // Update project status to error
    await supabase
      .from('projects')
      .update({
        data_status: 'error',
      })
      .eq('id', projectId);
  }
}

// ============================================
// CHATGPT API ENDPOINTS
// ============================================

// Refresh project data
app.post('/make-server-cf9a9609/projects/refresh', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ 
        code: 401,
        error: 'Missing authorization header',
        message: 'Please sign in to refresh project data' 
      }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        code: 401,
        error: 'Invalid authorization header',
        message: 'Please sign in again' 
      }, 401);
    }
    
    const supabase = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ 
        code: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again',
        details: authError?.message 
      }, 401);
    }

    const body = await c.req.json();
    const { projectId } = body;

    if (!projectId) {
      return c.json({ error: 'Missing projectId' }, 400);
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Update status to processing
    await supabase
      .from('projects')
      .update({ data_status: 'processing' })
      .eq('id', projectId);

    // Trigger analysis in background
    analyzeBrandInBackground(projectId, project.name, project.market, project.language);

    return c.json({
      success: true,
      message: 'Refresh in progress'
    });

  } catch (error) {
    console.error('Error refreshing project:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete project (hard delete)
app.delete('/make-server-cf9a9609/projects/:id', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ 
        code: 401,
        error: 'Missing authorization header',
        message: 'Please sign in to delete project' 
      }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        code: 401,
        error: 'Invalid authorization header',
        message: 'Please sign in again' 
      }, 401);
    }
    
    const supabase = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ 
        code: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again',
        details: authError?.message 
      }, 401);
    }

    const projectId = c.req.param('id');

    console.log(`🗑️ Deleting project ${projectId} for user ${user.id}`);

    // 1. First, verify project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingProject) {
      console.error(`❌ Project not found or unauthorized:`, fetchError);
      return c.json({ 
        code: 404,
        error: 'Project not found',
        message: 'Project does not exist or you do not have permission to delete it'
      }, 404);
    }

    console.log(`   Deleting project: "${existingProject.name}"`);

    // 2. Delete the project (CASCADE will automatically delete project_data and risk_reports)
    console.log(`   Database CASCADE will automatically delete:`);
    console.log(`   - All project_data records`);
    console.log(`   - All risk_reports`);
    console.log(`   - All background_jobs`);
    console.log(`   - All refresh_counters`);

    // 3. Delete the project itself
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error(`❌ Failed to delete project:`, deleteError);
      return c.json({ 
        code: 500,
        error: 'Failed to delete project', 
        details: deleteError.message,
        message: 'Database error occurred. Please try again.'
      }, 500);
    }

    console.log(`✅ Project "${existingProject.name}" deleted successfully (hard delete)`);

    return c.json({
      success: true,
      message: 'Project deleted successfully',
      projectId: projectId,
      projectName: existingProject.name
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ 
      code: 500,
      error: 'Internal server error',
      message: 'Failed to delete project. Please try again.'
    }, 500);
  }
});

// Get single project with data
app.get('/make-server-cf9a9609/projects/:id', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ 
        code: 401,
        error: 'Missing authorization header',
        message: 'Please sign in to view project' 
      }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        code: 401,
        error: 'Invalid authorization header',
        message: 'Please sign in again' 
      }, 401);
    }
    
    const supabase = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ 
        code: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again',
        details: authError?.message 
      }, 401);
    }

    const projectId = c.req.param('id');

    console.log(`📡 Fetching project ${projectId} for user ${user.id}`);

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error(`❌ Project not found: ${projectId}`, projectError);
      return c.json({ error: 'Project not found' }, 404);
    }

    console.log(`✅ Project found: ${project.name} (status: ${project.data_status})`);

    // Get project data from KV store
    const dataKey = `project_data:${projectId}`;
    const storedData = await kv.get(dataKey);

    return c.json({
      project: {
        id: project.id,
        name: project.name,
        market: project.market,
        language: project.language,
        description: project.description,
        timeframe: project.timeframe,
        data_status: project.data_status,
        last_refresh_at: project.last_refreshed_at,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      data: storedData || null
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// List all projects for user
app.get('/make-server-cf9a9609/projects', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ 
        code: 401,
        error: 'Missing authorization header',
        message: 'Please sign in to view projects' 
      }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        code: 401,
        error: 'Invalid authorization header',
        message: 'Please sign in again' 
      }, 401);
    }
    
    const supabase = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ 
        code: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again',
        details: authError?.message 
      }, 401);
    }

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return c.json({ error: 'Failed to fetch projects' }, 500);
    }

    return c.json({ projects: projects || [] });

  } catch (error) {
    console.error('Error listing projects:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new project
app.post('/make-server-cf9a9609/projects/create', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({ 
        code: 401,
        error: 'Missing authorization header',
        message: 'Please sign in to create project' 
      }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        code: 401,
        error: 'Invalid authorization header',
        message: 'Please sign in again' 
      }, 401);
    }
    
    const supabase = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ 
        code: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again',
        details: authError?.message 
      }, 401);
    }

    const body = await c.req.json();
    const { name, market, language, industry, websiteUrl, description } = body;

    // Validate required fields
    if (!name || !market || !language) {
      return c.json({ 
        error: 'Missing required fields: name, market, language' 
      }, 400);
    }

    // Validate brand name
    if (name.trim().length < 2) {
      return c.json({ 
        error: 'Brand name must be at least 2 characters' 
      }, 400);
    }

    if (name.trim().length > 100) {
      return c.json({ 
        error: 'Brand name must be less than 100 characters' 
      }, 400);
    }

    console.log(`🆕 Creating project for ${name} (user: ${user.id})`);

    // Create project in database
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        market: market.trim(),
        language: language.trim(),
        industry: industry?.trim() || null,
        website_url: websiteUrl?.trim() || null,
        description: description?.trim() || null,
        timeframe: 'Last 3 months', // Default timeframe
        ai_model: 'gpt-4o', // Default AI model
        data_status: 'processing',
      })
      .select()
      .single();

    if (createError || !project) {
      console.error('Failed to create project:', createError);
      return c.json({ 
        error: 'Failed to create project',
        details: createError?.message 
      }, 500);
    }

    console.log(`✅ Project created: ${project.id}`);
    console.log(`🚀 Starting background analysis...`);

    // Start background analysis (non-blocking)
    analyzeBrandInBackground(project.id, project.name, market, language);

    return c.json({
      success: true,
      message: 'Project created successfully. Analysis is now processing.',
      project: {
        id: project.id,
        name: project.name,
        market: project.market,
        language: project.language,
        industry: project.industry,
        websiteUrl: project.website_url,
        description: project.description,
        timeframe: project.timeframe,
        aiModel: project.ai_model,
        dataStatus: project.data_status,
        createdAt: project.created_at,
        lastRefreshAt: project.last_refreshed_at,
        data: null, // No data yet, processing
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ 
      error: 'Internal server error',
      message: 'Failed to create project. Please try again.' 
    }, 500);
  }
});

// ============================================
// FEEDBACK ENDPOINT
// ============================================

/**
 * POST /make-server-cf9a9609/feedback
 * Send user feedback via email
 */
app.post('/make-server-cf9a9609/feedback', async (c) => {
  try {
    const body = await c.req.json();
    const { feedback, rating, userEmail, userName } = body;

    if (!feedback || !rating) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (rating < 1 || rating > 10) {
      return c.json({ error: 'Rating must be between 1 and 10' }, 400);
    }

    console.log('📬 Feedback received:');
    console.log(`   From: ${userName} (${userEmail})`);
    console.log(`   Rating: ${rating}/10`);
    console.log(`   Feedback: ${feedback}`);

    // Try to send email using Resend if API key is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Brand Sense <onboarding@resend.dev>',
            to: 'omerlhn@gmail.com',
            subject: `Brand Sense Feedback - Rating: ${rating}/10`,
            html: `
              <h2>New Feedback Received</h2>
              <p><strong>From:</strong> ${userName} (${userEmail})</p>
              <p><strong>Rating:</strong> ${rating}/10</p>
              <p><strong>Feedback:</strong></p>
              <p>${feedback.replace(/\n/g, '<br>')}</p>
              <hr>
              <p style="color: #888; font-size: 12px;">Sent via Brand Sense Feedback System</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('❌ Resend API error:', errorText);
          throw new Error('Failed to send email via Resend');
        }

        console.log('✅ Email sent successfully via Resend');
        
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Continue execution - still log the feedback
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email not sent');
    }

    // Store feedback in KV store for backup
    const feedbackKey = `feedback:${Date.now()}:${userEmail}`;
    await kv.set(feedbackKey, {
      feedback,
      rating,
      userEmail,
      userName,
      timestamp: new Date().toISOString(),
    });

    return c.json({ 
      success: true,
      message: 'Feedback received successfully'
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);