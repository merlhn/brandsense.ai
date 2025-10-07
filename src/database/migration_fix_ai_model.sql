-- ============================================================================
-- Brand Sense - Fix AI Model Migration
-- ============================================================================
-- 
-- Problem: Some projects have ai_model='chatgpt_5' instead of 'gpt-4o'
-- Solution: Update all projects to use correct 'gpt-4o' value
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Copy this file
-- 3. Click "Run" to execute
-- 
-- ============================================================================

-- Update all projects with wrong ai_model value to 'gpt-4o'
UPDATE public.projects
SET 
  ai_model = 'gpt-4o',
  updated_at = NOW()
WHERE 
  ai_model IS NULL 
  OR ai_model = 'chatgpt_5' 
  OR ai_model = 'chatgpt-5'
  OR ai_model = 'gpt4o'
  OR ai_model = 'GPT-4o'
  OR ai_model NOT IN ('gpt-4o', 'claude', 'gemini');

-- Verify the fix
SELECT 
  id,
  name,
  ai_model,
  updated_at
FROM public.projects
ORDER BY updated_at DESC;

-- Summary
SELECT 
  ai_model,
  COUNT(*) as project_count
FROM public.projects
GROUP BY ai_model;

-- ============================================================================
-- Expected Result:
-- All projects should now have ai_model = 'gpt-4o'
-- ============================================================================
