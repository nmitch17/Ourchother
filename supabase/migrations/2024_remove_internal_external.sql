-- Migration: Remove Internal/External Project Distinction
-- Run this in Supabase SQL Editor

-- 1. Create Ourchother client with fixed UUID (if not exists)
INSERT INTO clients (id, name, email, phone, company, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Ourchother',
  'internal@ourchother.com',
  NULL,
  'Ourchother',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Migrate orphaned projects to Ourchother
UPDATE projects
SET client_id = '00000000-0000-0000-0000-000000000001'
WHERE client_id IS NULL;

-- 3. Make client_id required (NOT NULL constraint)
-- Note: This will fail if there are still NULL values
ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;

-- 4. Make type nullable (keep for future use)
ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;
