-- Migration: Add default start/end times and locations to users table
-- Created: 2026-05-17

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS default_start_time TIME,
  ADD COLUMN IF NOT EXISTS default_end_time TIME,
  ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;
