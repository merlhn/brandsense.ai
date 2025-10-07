# 🚀 Brand Sense - Supabase Integration Guide

## ✅ Why Supabase is Perfect for Brand Sense

**Supabase provides EVERYTHING you need:**

✅ **PostgreSQL Database** - Schema already prepared in `/database/schema.sql`  
✅ **Built-in Authentication** - JWT, email validation, session management  
✅ **Edge Functions** - Run ChatGPT API calls securely (no API key exposure)  
✅ **Real-time** - Optional WebSocket for live updates  
✅ **Row Level Security** - Multi-tenant data isolation  
✅ **TypeScript SDK** - Works perfectly with your frontend  
✅ **Free Tier** - Perfect for MVP/testing  

**Total setup time: ~30 minutes** ⚡

---

## 🎯 Quick Start (15 Minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - **Project Name:** Brand Sense
   - **Database Password:** (save this!)
   - **Region:** Choose closest to Turkey
5. Wait ~2 minutes for project creation

### Step 2: Set Up Database Schema

**Go to SQL Editor in Supabase Dashboard:**

```sql
-- Run the schema from /database/schema.sql
-- Copy and paste the ENTIRE file, then click "Run"
```

**⚠️ Important Supabase-specific modifications:**

```sql
-- Supabase already has auth.users table, so we'll link to it
-- Modify the users table to reference Supabase auth:

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own project data" ON public.project_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Similar policies for risk_reports
CREATE POLICY "Users can view own reports" ON public.risk_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = risk_reports.project_id 
      AND projects.user_id = auth.uid()
    )
  );
```

### Step 3: Get API Keys

1. Go to **Settings → API** in Supabase Dashboard
2. Copy these values:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (for Edge Functions only)
```

### Step 4: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 🔧 Frontend Integration

### 1. Create Supabase Client

Create `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // We'll generate this

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 2. Generate TypeScript Types

**In Supabase Dashboard:**

1. Go to **Settings → API Docs → TypeScript**
2. Copy the generated types
3. Save to `/lib/database.types.ts`

**Or use CLI:**
```bash
npx supabase gen types typescript --project-id "your-project-ref" > lib/database.types.ts
```

### 3. Update Authentication

Replace mock auth in `SignUp.tsx` and `SignIn.tsx`:

**SignUp.tsx:**
```typescript
import { supabase } from '../lib/supabase';

async function handleSignUp(email: string, password: string, fullName: string, company: string, position: string) {
  // 1. Validate corporate email (keep existing logic)
  if (isFreeEmailDomain(email)) {
    alert('Please use your corporate email address');
    return;
  }

  // 2. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company,
        position
      }
    }
  });

  if (authError) {
    alert(authError.message);
    return;
  }

  // 3. Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      email,
      full_name: fullName,
      company,
      position
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  // 4. Navigate to onboarding (skip email verification for MVP)
  onNavigate('onboarding-brand');
}
```

**SignIn.tsx:**
```typescript
import { supabase } from '../lib/supabase';

async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // Navigate to dashboard
  onNavigate('dashboard');
}
```

### 4. Session Management

Update `App.tsx` to handle auth state:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeScreen, setActiveScreen] = useState('signin');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setActiveScreen('dashboard');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (!session) {
        setActiveScreen('signin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... rest of component
}
```

### 5. Update Storage Layer

Modify `/lib/storage.ts` to use Supabase:

```typescript
import { supabase } from './supabase';

// Keep localStorage for local cache, but sync with Supabase

export const storage = {
  // Projects
  async saveProject(project: Project) {
    // 1. Save to Supabase
    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        user_id: (await supabase.auth.getUser()).data.user!.id,
        name: project.name,
        market: project.market,
        language: project.language,
        timeframe: project.timeframe,
        ai_model: project.aiModel,
        industry: project.industry,
        website_url: project.websiteUrl,
        data_status: project.dataStatus,
        refreshes_left: project.refreshesLeft
      });

    if (error) throw error;

    // 2. Update localStorage cache
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  async getAllProjects(): Promise<Project[]> {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      // Fallback to localStorage
      const cached = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return cached ? JSON.parse(cached) : [];
    }

    // 2. Update localStorage cache
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
    
    return data.map(mapSupabaseToProject);
  },

  // ... similar for other methods
};

// Helper to map Supabase row to Project type
function mapSupabaseToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    market: row.market,
    language: row.language,
    timeframe: row.timeframe,
    aiModel: row.ai_model,
    industry: row.industry,
    websiteUrl: row.website_url,
    createdAt: row.created_at,
    lastRefreshAt: row.last_refresh_at,
    dataStatus: row.data_status,
    refreshesLeft: row.refreshes_left,
    data: null, // Fetch separately from project_data table
    error: row.error_message
  };
}
```

---

## 🤖 ChatGPT Integration with Edge Functions

**Why Edge Functions?**
- ✅ API keys stay secret (server-side)
- ✅ No CORS issues
- ✅ Automatic scaling
- ✅ Built-in logging

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

### Step 2: Create Edge Function

```bash
supabase functions new analyze-brand
```

This creates `supabase/functions/analyze-brand/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  try {
    // 1. Get request body
    const { projectId, analysisType } = await req.json();

    // 2. Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Fetch project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // 4. Build ChatGPT prompt (use functions from frontend)
    const prompt = getBrandIdentityPromptJSON(
      project.name,
      project.market,
      project.language,
      project.timeframe
    );

    // 5. Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a brand analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    const openAIData = await response.json();
    const parsed = JSON.parse(openAIData.choices[0].message.content);

    // 6. Validate and store results
    validateBrandIdentityData(parsed);

    const { error: dataError } = await supabaseClient
      .from('project_data')
      .upsert({
        project_id: projectId,
        data_type: 'brand_identity',
        data: parsed
      });

    if (dataError) throw dataError;

    // 7. Update project status
    await supabaseClient
      .from('projects')
      .update({
        data_status: 'ready',
        last_refresh_at: new Date().toISOString()
      })
      .eq('id', projectId);

    // 8. Return success
    return new Response(
      JSON.stringify({
        success: true,
        data: parsed,
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Copy prompt functions from frontend /lib/api.ts
function getBrandIdentityPromptJSON(brandName: string, location: string, language: string, timeframe: string) {
  // ... (copy from frontend)
}

function validateBrandIdentityData(data: any) {
  // ... (copy validation logic from CHATGPT_RESPONSE_PARSING.md)
}
```

### Step 3: Deploy Edge Function

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-key

# Deploy function
supabase functions deploy analyze-brand
```

### Step 4: Call from Frontend

Update `/lib/api.ts`:

```typescript
import { supabase } from './supabase';

export async function analyzeProject(
  project: Project,
  analysisType: ChatGPTAnalysisRequest['analysisType'] = 'full'
): Promise<ChatGPTResponse<ProjectData>> {
  
  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('analyze-brand', {
    body: {
      projectId: project.id,
      analysisType
    }
  });

  if (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      data: null,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  return data;
}
```

---

## 🔄 Refresh Mechanism

### Database Trigger (Auto-decrement)

```sql
-- Run in Supabase SQL Editor
CREATE OR REPLACE FUNCTION decrement_refreshes()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement only if refresh was requested
  IF OLD.data_status != 'processing' AND NEW.data_status = 'processing' THEN
    NEW.refreshes_left := GREATEST(NEW.refreshes_left - 1, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_refresh
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION decrement_refreshes();
```

### Monthly Reset (Cron Job)

**Option 1: Supabase Cron (pg_cron extension)**

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule monthly reset (1st of every month at midnight)
SELECT cron.schedule(
  'reset-monthly-refreshes',
  '0 0 1 * *',
  $$UPDATE projects SET refreshes_left = 15$$
);
```

**Option 2: Edge Function + External Cron**

Use [cron-job.org](https://cron-job.org) or GitHub Actions to call:

```typescript
// supabase/functions/reset-refreshes/index.ts
serve(async (req) => {
  const supabaseClient = createClient(...);
  
  const { error } = await supabaseClient
    .from('projects')
    .update({ refreshes_left: 15 })
    .gte('last_refresh_at', new Date(new Date().setDate(1)).toISOString());

  return new Response(JSON.stringify({ success: !error }));
});
```

---

## 🔐 Corporate Email Validation

**Option 1: Database Function**

```sql
-- Run in Supabase SQL Editor
CREATE OR REPLACE FUNCTION is_corporate_email(email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  domain TEXT;
  free_domains TEXT[] := ARRAY[
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'live.com', 'aol.com', 'icloud.com', 'protonmail.com'
  ];
BEGIN
  domain := split_part(email, '@', 2);
  RETURN domain != ALL(free_domains);
END;
$$ LANGUAGE plpgsql;

-- Add constraint to users table
ALTER TABLE public.users
  ADD CONSTRAINT corporate_email_only 
  CHECK (is_corporate_email(email));
```

**Option 2: Supabase Auth Hook (Recommended)**

Create `supabase/functions/auth-hook/index.ts`:

```typescript
serve(async (req) => {
  const { type, user } = await req.json();

  if (type === 'SIGNUP') {
    const domain = user.email.split('@')[1];
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    
    if (freeDomains.includes(domain)) {
      return new Response(
        JSON.stringify({ 
          error: 'Please use your corporate email address' 
        }),
        { status: 400 }
      );
    }
  }

  return new Response(JSON.stringify({ success: true }));
});
```

Enable in Supabase Dashboard: **Authentication → Hooks → Custom SMTP**

---

## 📊 Environment Variables

Create `.env` in frontend:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: For local development
VITE_API_BASE_URL=https://xxxxx.supabase.co/functions/v1
```

---

## 🧪 Testing

### 1. Test Database

```sql
-- In Supabase SQL Editor
SELECT * FROM public.users;
SELECT * FROM public.projects;
SELECT * FROM public.project_data;
```

### 2. Test Authentication

```typescript
// In browser console
const { data, error } = await supabase.auth.signUp({
  email: 'test@company.com',
  password: 'TestPassword123'
});
console.log(data, error);
```

### 3. Test Edge Function

```bash
# Local testing
supabase functions serve analyze-brand

# Then call from frontend or curl:
curl -X POST https://xxxxx.supabase.co/functions/v1/analyze-brand \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "uuid-here", "analysisType": "brand-identity"}'
```

---

## 🚀 Deployment Checklist

### Frontend

- [ ] Add Supabase env vars to Vercel
- [ ] Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy to Vercel
- [ ] Test auth flow

### Backend (Supabase)

- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Edge Functions deployed
- [ ] OpenAI API key set as secret
- [ ] Corporate email validation enabled
- [ ] Monthly refresh reset scheduled

---

## 💰 Cost Estimate

**Supabase Free Tier (Perfect for MVP):**
- ✅ 500MB database
- ✅ 2GB file storage
- ✅ 50,000 monthly active users
- ✅ 500K Edge Function invocations
- ✅ Social OAuth providers
- ✅ 50GB bandwidth

**When you scale:**
- **Pro Plan:** $25/month
  - 8GB database
  - 100GB storage
  - 2M Edge Function invocations
  - Point-in-time recovery

**OpenAI Costs (Separate):**
- GPT-4 Turbo: ~$0.01-0.03 per analysis
- Estimated: $10-50/month for 100-500 users

---

## 🎯 Implementation Timeline

### Day 1: Setup (2-3 hours)
- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Set up RLS policies
- [ ] Get API keys
- [ ] Install Supabase client

### Day 2: Auth Integration (3-4 hours)
- [ ] Create Supabase client
- [ ] Update SignUp/SignIn components
- [ ] Add session management to App.tsx
- [ ] Test auth flow

### Day 3: Data Layer (4-5 hours)
- [ ] Update storage.ts for Supabase
- [ ] Test project CRUD operations
- [ ] Implement refresh mechanism
- [ ] Test data sync

### Day 4: ChatGPT Integration (5-6 hours)
- [ ] Create Edge Function
- [ ] Copy prompt templates
- [ ] Implement parsing logic
- [ ] Deploy Edge Function
- [ ] Test analysis flow

### Day 5: Testing & Polish (3-4 hours)
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Performance optimization
- [ ] Deploy to production

**Total: ~1 week** 🎉

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **Auth Guide:** https://supabase.com/docs/guides/auth
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript

---

## 🆚 Supabase vs Traditional Backend

| Feature | Supabase | Traditional (Node.js + PostgreSQL) |
|---------|----------|-----------------------------------|
| **Setup Time** | 30 min | 4-8 hours |
| **Auth System** | Built-in | Build from scratch |
| **Database** | Managed PostgreSQL | Self-managed |
| **API Layer** | Edge Functions | Express/FastAPI |
| **Scaling** | Automatic | Manual |
| **Cost (MVP)** | $0 (Free tier) | $20-50/month (VPS) |
| **Security** | RLS + built-in | Manual implementation |
| **TypeScript** | Auto-generated | Manual types |

**Verdict: Supabase is 10x faster to implement!** ⚡

---

## ❓ FAQ

**Q: Can I migrate from Supabase later?**  
A: Yes! It's PostgreSQL underneath. Export and import to any Postgres server.

**Q: Is Supabase production-ready?**  
A: Yes! Used by thousands of production apps. Has 99.9% uptime SLA.

**Q: What about vendor lock-in?**  
A: Minimal. Database is standard PostgreSQL. Edge Functions are Deno (open source).

**Q: Can I run Supabase locally?**  
A: Yes! `supabase start` runs everything locally with Docker.

**Q: Do I need a credit card for free tier?**  
A: No! Free tier is truly free, no card required.

---

**Ready to start? Follow the Quick Start guide above!** 🚀

**Need help? Check Supabase Discord: https://discord.supabase.com**
