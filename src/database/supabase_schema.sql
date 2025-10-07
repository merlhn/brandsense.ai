-- ============================================================================
-- Brand Sense - Supabase Database Schema
-- PostgreSQL 15+ with Supabase Extensions
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Click "Run" to execute
-- 
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE (Links to Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 2. PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Brand Information
  name VARCHAR(255) NOT NULL,              -- Brand Name (e.g., "Nike")
  market VARCHAR(255) NOT NULL,            -- Location (e.g., "Turkey")
  language VARCHAR(100) NOT NULL,          -- Language (e.g., "Turkish")
  timeframe VARCHAR(50) NOT NULL,          -- e.g., "Last 3 months"
  ai_model VARCHAR(50) DEFAULT 'gpt-4o',
  description TEXT,                         -- Project description
  
  -- Optional Metadata
  industry VARCHAR(255),
  website_url VARCHAR(500),
  
  -- Data Status
  data_status VARCHAR(20) DEFAULT 'pending' CHECK (data_status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  
  -- Refresh Management (Unlimited refreshes in MVP)
  last_refresh_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_data_status ON public.projects(data_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================================================
-- 3. PROJECT_DATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Data Type
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('brand_identity', 'sentiment', 'keyword')),
  
  -- ChatGPT Response (JSON)
  data JSONB NOT NULL,
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one record per project per data type
  UNIQUE(project_id, data_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_data_project_id ON public.project_data(project_id);
CREATE INDEX IF NOT EXISTS idx_project_data_type ON public.project_data(data_type);
CREATE INDEX IF NOT EXISTS idx_project_data_jsonb ON public.project_data USING GIN(data);

-- ============================================================================
-- 4. RISK_REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.risk_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Report Content (Markdown)
  content TEXT NOT NULL,
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risk_reports_project_id ON public.risk_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_reports_generated_at ON public.risk_reports(generated_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects table policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project data policies
CREATE POLICY "Users can view own project data" ON public.project_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project data" ON public.project_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project data" ON public.project_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project data" ON public.project_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Risk reports policies
CREATE POLICY "Users can view own reports" ON public.risk_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = risk_reports.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reports" ON public.risk_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = risk_reports.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reports" ON public.risk_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = risk_reports.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Projects with all data
CREATE OR REPLACE VIEW projects_with_data AS
SELECT 
  p.*,
  json_build_object(
    'brandIdentity', (SELECT data FROM public.project_data WHERE project_id = p.id AND data_type = 'brand_identity'),
    'sentimentAnalysis', (SELECT data FROM public.project_data WHERE project_id = p.id AND data_type = 'sentiment'),
    'keywordAnalysis', (SELECT data FROM public.project_data WHERE project_id = p.id AND data_type = 'keyword')
  ) as data
FROM public.projects p;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get project with all data
CREATE OR REPLACE FUNCTION get_project_full(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'project', row_to_json(p.*),
    'data', json_build_object(
      'brandIdentity', (SELECT data FROM public.project_data WHERE project_id = project_uuid AND data_type = 'brand_identity'),
      'sentimentAnalysis', (SELECT data FROM public.project_data WHERE project_id = project_uuid AND data_type = 'sentiment'),
      'keywordAnalysis', (SELECT data FROM public.project_data WHERE project_id = project_uuid AND data_type = 'keyword')
    ),
    'riskReports', (
      SELECT json_agg(row_to_json(rr.*))
      FROM public.risk_reports rr
      WHERE rr.project_id = project_uuid
      ORDER BY rr.generated_at DESC
      LIMIT 5
    )
  ) INTO result
  FROM public.projects p
  WHERE p.id = project_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================

-- ✅ Schema is now ready!
-- ✅ Row Level Security enabled - users can only see their own data
-- ✅ Triggers configured for automatic timestamp updates
-- ✅ Linked to Supabase auth.users table
-- 
-- Next Steps:
-- 1. Update Edge Functions to use this schema
-- 2. Integrate ChatGPT API
-- 3. Update frontend to call Edge Functions
