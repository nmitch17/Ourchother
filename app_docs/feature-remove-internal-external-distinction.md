# Remove Internal/External Project Distinction

**ADW ID:** N/A
**Date:** 2024-12-09
**Specification:** specs/ourchother-tasks.md (Task 2.1)

## Overview

This feature removes the artificial internal/external project type distinction from the Ourchother project management system. Instead of categorizing projects by a `type` field, all projects now require a client. Internal work is represented by a special "Ourchother" client with a fixed UUID, making the data model simpler and more consistent.

## What Was Built

- Reserved "Ourchother" client with fixed UUID `00000000-0000-0000-0000-000000000001` for internal projects
- Migration to update schema and migrate orphaned projects
- Updated TypeScript types making `client_id` required and `type` optional
- Updated project forms to always require client selection
- Updated project list/detail pages to derive internal/external status from `client_id`

## Technical Implementation

### Files Modified

- `src/types/index.ts`: Added `OURCHOTHER_CLIENT_ID` constant, made `client_id` required (non-nullable), made `type` optional
- `src/app/(admin)/projects/new/page.tsx`: Removed type selector, made client selection required with validation
- `src/app/api/projects/route.ts`: Added validation that `client_id` is required for project creation
- `src/app/(admin)/projects/page.tsx`: Updated filters to use `client_id` for internal/external distinction
- `src/app/(admin)/projects/[id]/page.tsx`: Updated type display to derive from `client_id`
- `supabase/migrations/2024_remove_internal_external.sql`: Database migration for schema changes
- `scripts/run-migration.ts`: TypeScript script to run migration via Supabase client

### Key Changes

- **Constant for Ourchother client**: `OURCHOTHER_CLIENT_ID = '00000000-0000-0000-0000-000000000001'` provides a consistent reference
- **Client dropdown sorting**: Ourchother appears at top with "(Internal)" label for easy selection
- **Project filtering**: Uses `client_id` query params (`client_id` or `exclude_client_id`) instead of `type` field
- **Badge display**: Shows "Internal" or "Client" badge based on whether `client_id === OURCHOTHER_CLIENT_ID`

## How to Use

1. **Creating a new project**: Select a client from the dropdown (required). For internal projects, select "Ourchother (Internal)" which appears at the top.

2. **Filtering projects**: Use the "All Projects" / "Client Projects" / "Internal (Ourchother)" dropdown to filter the project list.

3. **Identifying project type**: Look at the badge next to the project name - "Internal" for Ourchother projects, "Client" for external projects.

## Configuration

### OURCHOTHER_CLIENT_ID Constant

The constant is defined in `src/types/index.ts`:

```typescript
export const OURCHOTHER_CLIENT_ID = '00000000-0000-0000-0000-000000000001'
```

Import this constant when you need to:
- Check if a project is internal: `project.client_id === OURCHOTHER_CLIENT_ID`
- Filter for internal projects: `client_id: OURCHOTHER_CLIENT_ID`
- Filter for external projects: `exclude_client_id: OURCHOTHER_CLIENT_ID`

## Running the Migration

### Option 1: TypeScript Script (Recommended)

```bash
source .env.local && npx tsx scripts/run-migration.ts
```

This creates the Ourchother client and migrates orphaned projects. Schema changes (ALTER TABLE) must still be run manually.

### Option 2: Supabase SQL Editor

Run the contents of `supabase/migrations/2024_remove_internal_external.sql`:

```sql
-- Create Ourchother client
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

-- Migrate orphaned projects
UPDATE projects
SET client_id = '00000000-0000-0000-0000-000000000001'
WHERE client_id IS NULL;

-- Make client_id required
ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;

-- Make type nullable
ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;
```

## Testing

1. **Create project without client**: Should show validation error "Please select a client"
2. **Create internal project**: Select "Ourchother (Internal)" from dropdown, project should show "Internal" badge
3. **Create external project**: Select any other client, project should show "Client" badge
4. **Filter projects**: Use the client type filter to verify filtering works correctly
5. **API validation**: POST to `/api/projects` without `client_id` should return 400 error

## Notes

- The `type` field is kept in the schema (nullable) for potential future use but is not actively used
- Existing projects without a `client_id` are automatically migrated to Ourchother
- The Ourchother client uses a well-known UUID to ensure consistency across environments
