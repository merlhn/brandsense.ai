-- ============================================================================
-- Brand Sense - Database Schema
-- PostgreSQL 15+
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 2. PROJECTS TABLE
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Brand Information
  name VARCHAR(255) NOT NULL,              -- Brand Name (e.g., "Nike")
  market VARCHAR(255) NOT NULL,            -- Location (e.g., "Turkey")
  language VARCHAR(100) NOT NULL,          -- Language (e.g., "Turkish")
  timeframe VARCHAR(50) NOT NULL,          -- e.g., "Last 3 months"
  ai_model VARCHAR(50) DEFAULT 'gpt-4o',
  
  -- Optional Metadata
  industry VARCHAR(255),
  website_url VARCHAR(500),
  
  -- Data Status
  data_status VARCHAR(20) DEFAULT 'pending' CHECK (data_status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  
  -- Refresh Management (Unlimited refreshes)
  last_refresh_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_data_status ON projects(data_status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ============================================================================
-- 3. PROJECT_DATA TABLE
-- ============================================================================

CREATE TABLE project_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
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
CREATE INDEX idx_project_data_project_id ON project_data(project_id);
CREATE INDEX idx_project_data_type ON project_data(data_type);
CREATE INDEX idx_project_data_jsonb ON project_data USING GIN(data);  -- For JSON queries

-- ============================================================================
-- 4. RISK_REPORTS TABLE
-- ============================================================================

CREATE TABLE risk_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Report Content (Markdown)
  content TEXT NOT NULL,
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_risk_reports_project_id ON risk_reports(project_id);
CREATE INDEX idx_risk_reports_generated_at ON risk_reports(generated_at DESC);

-- ============================================================================
-- 5. REFRESH_COUNTERS TABLE
-- ============================================================================

CREATE TABLE refresh_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Month tracking (format: "YYYY-MM")
  month VARCHAR(7) NOT NULL,
  
  -- Usage tracking
  refreshes_used INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one counter per user/project/month
  UNIQUE(user_id, project_id, month)
);

-- Indexes
CREATE INDEX idx_refresh_counters_user_project ON refresh_counters(user_id, project_id);
CREATE INDEX idx_refresh_counters_month ON refresh_counters(month);

-- ============================================================================
-- 6. BACKGROUND_JOBS TABLE (Optional - for job tracking)
-- ============================================================================

CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type VARCHAR(50) NOT NULL,           -- 'analyze_project' | 'generate_report'
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Job Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Metadata
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_background_jobs_project_id ON background_jobs(project_id);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_created_at ON background_jobs(created_at DESC);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refresh_counters_updated_at BEFORE UPDATE ON refresh_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (Optional - for easier queries)
-- ============================================================================

-- View: Projects with all data
CREATE VIEW projects_with_data AS
SELECT 
  p.*,
  json_build_object(
    'brandIdentity', (SELECT data FROM project_data WHERE project_id = p.id AND data_type = 'brand_identity'),
    'sentimentAnalysis', (SELECT data FROM project_data WHERE project_id = p.id AND data_type = 'sentiment'),
    'keywordAnalysis', (SELECT data FROM project_data WHERE project_id = p.id AND data_type = 'keyword')
  ) as data
FROM projects p;

-- View: User dashboard summary
CREATE VIEW user_dashboard AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.company,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT CASE WHEN p.data_status = 'ready' THEN p.id END) as projects_ready,
  COUNT(DISTINCT CASE WHEN p.data_status = 'processing' THEN p.id END) as projects_processing,
  COUNT(DISTINCT rr.id) as total_reports
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN risk_reports rr ON p.id = rr.project_id
GROUP BY u.id, u.full_name, u.company;

-- ============================================================================
-- SEED DATA (Development Only)
-- ============================================================================

-- Insert test user
-- Password: TestPassword123 (bcrypt hash)
INSERT INTO users (email, password_hash, full_name, company, position)
VALUES (
  'test@company.com',
  '$2b$10$rOZEXqOXsrpCJDQvCZ0n7eHsYh2Qj0P9F7LKXpz6WQXqFZ0n7eHsY',  -- Replace with actual bcrypt hash
  'Test User',
  'Test Company Inc.',
  'Marketing Manager'
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Reset monthly refresh counters (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_refreshes()
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET refreshes_left = 15
  WHERE DATE_TRUNC('month', last_refresh_at) < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Function: Get project with all data
CREATE OR REPLACE FUNCTION get_project_full(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'project', row_to_json(p.*),
    'data', json_build_object(
      'brandIdentity', (SELECT data FROM project_data WHERE project_id = project_uuid AND data_type = 'brand_identity'),
      'sentimentAnalysis', (SELECT data FROM project_data WHERE project_id = project_uuid AND data_type = 'sentiment'),
      'keywordAnalysis', (SELECT data FROM project_data WHERE project_id = project_uuid AND data_type = 'keyword')
    )
  ) INTO result
  FROM projects p
  WHERE p.id = project_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user can refresh project
CREATE OR REPLACE FUNCTION can_refresh_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  refreshes INT;
BEGIN
  SELECT refreshes_left INTO refreshes
  FROM projects
  WHERE id = project_uuid;
  
  RETURN refreshes > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRON JOBS (Set up with pg_cron or external scheduler)
-- ============================================================================

-- Example: Reset refreshes on 1st of every month at midnight
-- If using pg_cron:
-- SELECT cron.schedule('reset-refreshes', '0 0 1 * *', 'SELECT reset_monthly_refreshes()');

-- ============================================================================
-- PERMISSIONS (Optional - for security)
-- ============================================================================

-- Create read-only user for analytics
-- CREATE USER analytics_user WITH PASSWORD 'secure_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- ============================================================================
-- CLEANUP (Run these if you need to reset)
-- ============================================================================

-- DROP VIEW IF EXISTS user_dashboard CASCADE;
-- DROP VIEW IF EXISTS projects_with_data CASCADE;
-- DROP TABLE IF EXISTS background_jobs CASCADE;
-- DROP TABLE IF EXISTS refresh_counters CASCADE;
-- DROP TABLE IF EXISTS risk_reports CASCADE;
-- DROP TABLE IF EXISTS project_data CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP FUNCTION IF EXISTS reset_monthly_refreshes();
-- DROP FUNCTION IF EXISTS get_project_full(UUID);
-- DROP FUNCTION IF EXISTS can_refresh_project(UUID);
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Remember to create proper indexes in production
-- 2. Consider partitioning project_data table if it grows large
-- 3. Set up regular backups (pg_dump)
-- 4. Monitor query performance with pg_stat_statements
-- 5. Consider adding full-text search indexes for report content
-- 6. Use connection pooling (pgBouncer) in production

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Get user with all projects
-- SELECT u.*, json_agg(p.*) as projects
-- FROM users u
-- LEFT JOIN projects p ON u.id = p.user_id
-- WHERE u.id = 'user-uuid'
-- GROUP BY u.id;

-- Get project with all analysis data
-- SELECT * FROM get_project_full('project-uuid');

-- Check how many refreshes user has used this month
-- SELECT 
--   p.name,
--   p.refreshes_left,
--   rc.refreshes_used
-- FROM projects p
-- LEFT JOIN refresh_counters rc ON p.id = rc.project_id
-- WHERE p.user_id = 'user-uuid'
--   AND rc.month = TO_CHAR(NOW(), 'YYYY-MM');

-- Get all projects that need processing
-- SELECT * FROM projects 
-- WHERE data_status = 'pending' 
-- ORDER BY created_at ASC;
