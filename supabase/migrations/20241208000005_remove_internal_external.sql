-- ============================================
-- TASK 2.1: Remove Internal/External Project Distinction
-- ============================================

-- 1. Create Ourchother client with fixed UUID for internal projects
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

-- 2. Migrate orphaned projects (no client_id) to Ourchother
UPDATE projects
SET client_id = '00000000-0000-0000-0000-000000000001'
WHERE client_id IS NULL;

-- 3. Make client_id required (NOT NULL)
ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;

-- 4. Make type nullable (keep for future use but not required)
ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN type DROP DEFAULT;
