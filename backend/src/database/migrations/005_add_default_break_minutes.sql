-- Migration: Add default_break_minutes to users table
-- Created: 2026-05-17

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS default_break_minutes INTEGER DEFAULT 0;
