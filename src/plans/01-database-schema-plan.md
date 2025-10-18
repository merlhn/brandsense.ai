# Database Schema Plan - Paddle Integration

## Overview
Database schema implementation for Paddle payment system with Free and Pro subscription plans.

## Goal
Create subscription tables, usage tracking, and migration strategy for existing users.

## Database Tables

### 1. Plans Table
```sql
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_monthly INTEGER NOT NULL, -- Cents from the start
  price_annual INTEGER NOT NULL, -- Cents from the start
  max_projects INTEGER NOT NULL,
  max_refreshes INTEGER,
  dashboards JSONB NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans (cents from the start)
INSERT INTO public.plans (id, name, price_monthly, price_annual, max_projects, max_refreshes, dashboards, features) VALUES
  ('free', 'Free', 0, 0, 1, 20, '["keyword"]'::jsonb, '["1 project","20 refreshes/month","Keyword Analysis","Email support 48h"]'::jsonb),
  ('pro', 'Professional', 999, 10000, 10, NULL, '["keyword","sentiment","brand_identity"]'::jsonb, '["10 projects","Unlimited refreshes","All dashboards","Priority support 24h"]'::jsonb);
```

### 2. Subscriptions Table
```sql
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) NOT NULL REFERENCES public.plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  paddle_subscription_id VARCHAR(255),
  paddle_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
```

### 3. Usage Tracking Table
```sql
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- Changed to DATE for better timezone handling
  projects_created INTEGER DEFAULT 0,
  refreshes_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_user_month ON public.usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_projects_user_active
ON public.projects (user_id) WHERE is_archived = false;
```

### 4. Paddle Events Table
```sql
CREATE TABLE IF NOT EXISTS public.paddle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_paddle_events_type ON public.paddle_events(event_type);
CREATE INDEX idx_paddle_events_processed ON public.paddle_events(processed);
CREATE INDEX idx_paddle_events_created ON public.paddle_events(created_at DESC);
CREATE INDEX idx_paddle_events_status ON public.paddle_events(status);
```

### 5. Rate Limiting Table
```sql
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('refresh', 'daily')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_type_time
ON public.rate_limits (user_id, type, created_at DESC);
```

### 6. Update Existing Tables
```sql
-- Add subscription reference to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);

-- Add refresh tracking to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS refresh_count INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add unique constraints
ALTER TABLE public.subscriptions ADD CONSTRAINT unique_paddle_subscription_id 
UNIQUE (paddle_subscription_id) NULLS NOT DISTINCT;

-- Plans table already uses INTEGER (cents) from the start
-- No ALTER needed - designed correctly from the beginning

-- Create idempotency_keys table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idem_expires ON public.idempotency_keys(expires_at);

-- Update unique constraint for paddle_subscription_id (portable)
DROP CONSTRAINT IF EXISTS unique_paddle_subscription_id;
CREATE UNIQUE INDEX unique_paddle_subscription_id 
ON public.subscriptions (paddle_subscription_id) 
WHERE paddle_subscription_id IS NOT NULL;
```

### 7. RLS Policies
```sql
-- Subscriptions policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Usage tracking policies (COMPLETE RLS)
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_select" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_upsert" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_update" ON public.usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);
```

### 8. Database Functions
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Updated_at triggers
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_usage_updated BEFORE UPDATE ON public.usage_tracking
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function to increment project usage (SECURITY DEFINER + RLS bypass)
CREATE OR REPLACE FUNCTION increment_project_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  m DATE := date_trunc('month', (now() at time zone 'UTC'))::date;
BEGIN
  -- Set role to bypass RLS for service operations
  SET LOCAL role = 'service_role';
  
  INSERT INTO public.usage_tracking (user_id, month, projects_created, refreshes_used)
  VALUES (p_user_id, m, 1, 0)
  ON CONFLICT (user_id, month)
  DO UPDATE SET 
    projects_created = usage_tracking.projects_created + 1,
    updated_at = NOW();
END; 
$$;

-- Function to increment refresh usage (SECURITY DEFINER + RLS bypass)
CREATE OR REPLACE FUNCTION increment_refresh_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  m DATE := date_trunc('month', (now() at time zone 'UTC'))::date;
BEGIN
  -- Set role to bypass RLS for service operations
  SET LOCAL role = 'service_role';
  
  INSERT INTO public.usage_tracking (user_id, month, projects_created, refreshes_used)
  VALUES (p_user_id, m, 0, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET 
    refreshes_used = usage_tracking.refreshes_used + 1,
    updated_at = NOW();
END; 
$$;
```

## Migration Strategy

### Migration Script
```sql
-- Step 1: Create new tables (from above)
-- Step 2: Migrate existing users to Free plan
INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_start)
SELECT 
  id as user_id,
  'free' as plan_id,
  'active' as status,
  created_at as current_period_start
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions WHERE subscriptions.user_id = users.id
);

-- Step 3: Create usage tracking for existing users (DATE consistency)
-- Use JavaScript-compatible date generation
INSERT INTO public.usage_tracking (user_id, month, projects_created, refreshes_used)
SELECT 
  u.id as user_id,
  date_trunc('month', now() at time zone 'UTC')::date as month,
  (SELECT COUNT(*) FROM public.projects WHERE projects.user_id = u.id) as projects_created,
  0 as refreshes_used
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.usage_tracking 
  WHERE usage_tracking.user_id = u.id 
  AND usage_tracking.month = date_trunc('month', now() at time zone 'UTC')::date
);

-- Step 3.1: Update plans with cents pricing
INSERT INTO public.plans (id, name, price_monthly, price_annual, max_projects, max_refreshes, dashboards, features) VALUES
  ('free','Free',0,0,1,20,'["keyword"]'::jsonb,'["1 project","20 refreshes/month","Keyword Analysis","Email support 48h"]'::jsonb),
  ('pro','Professional',999,10000,10,NULL,'["keyword","sentiment","brand_identity"]'::jsonb,'["10 projects","Unlimited refreshes","All dashboards","Priority support 24h"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual;

-- Step 4: Handle users with > 1 project (grandfathering)
-- Mark excess projects as archived for Free users
UPDATE public.projects
SET is_archived = true
WHERE id IN (
  SELECT p.id
  FROM public.projects p
  INNER JOIN (
    SELECT user_id, id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
    FROM public.projects
  ) ranked ON p.id = ranked.id
  WHERE ranked.rn > 1
);

-- Step 5: Update subscription_id in users table
UPDATE public.users u
SET subscription_id = s.id
FROM public.subscriptions s
WHERE u.id = s.user_id;
```

### Rollback Script
```sql
-- Remove subscription_id from users
ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_id;

-- Remove is_archived from projects
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_archived;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.paddle_events CASCADE;
DROP TABLE IF EXISTS public.usage_tracking CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
```

## Files to Create

- `src/database/supabase_schema.sql` - Main schema file
- `src/database/migration_add_subscriptions.sql` - Migration script
- `src/database/rollback_subscriptions.sql` - Rollback script

## Timeline

- Database schema creation: 1 day
- Migration script: 0.5 day
- Testing: 0.5 day
- **Total: 2 days**

## Dependencies

- None (this is the foundation)
