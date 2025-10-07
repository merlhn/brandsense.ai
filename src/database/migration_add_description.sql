-- ============================================================================
-- Migration: Add description field to projects table
-- Date: 2025-10-06
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Copy this script
-- 3. Click "Run" to execute
-- 
-- This migration adds a description field to existing projects table
-- ============================================================================

-- Add description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN description TEXT;
    RAISE NOTICE 'Description column added successfully';
  ELSE
    RAISE NOTICE 'Description column already exists';
  END IF;
END $$;
