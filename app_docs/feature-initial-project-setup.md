# Ourchother - Initial Project Setup

**ADW ID:** N/A (Initial Setup)
**Date:** 2025-12-08
**Specification:** specs/ourchother-prd.md, specs/ourchother-architecture.md

## Overview

Ourchother is a Next.js 16 project management application with Supabase backend. It features an admin dashboard for managing projects, clients, tasks, and onboarding, plus a client portal where clients can view project progress and complete assigned tasks.

## What Was Built

- **Admin Dashboard** (`/dashboard`) - Stats, inbox, deadlines, and project overview
- **Projects Management** (`/projects`) - Full CRUD with milestones, tasks, and client tasks
- **Client Portal** (`/project/[slug]`) - Password-protected per-project dashboards
- **Onboarding System** (`/onboarding`) - Dynamic forms for client intake
- **Public Onboarding Forms** (`/onboard/[template]/[id]`) - Shareable intake forms
- **Authentication** - Supabase Auth for admin, bcrypt passwords for client portal
- **18 API Routes** - Complete REST API for all entities

## Technical Implementation

### Files Modified

- `src/app/(admin)/*`: Admin dashboard pages
- `src/app/(client)/*`: Client portal pages
- `src/app/(public)/*`: Public onboarding forms
- `src/app/api/*`: REST API endpoints
- `src/components/*`: UI, admin, client, and form components
- `src/lib/*`: Supabase clients and utilities
- `src/proxy.ts`: Next.js 16 proxy (replaces middleware.ts)
- `src/types/index.ts`: Centralized TypeScript types

### Key Changes

- Next.js 16 with Turbopack and App Router
- Supabase for database, auth, and file storage
- Three Supabase clients: browser, server, and admin (service role)
- Route groups: (admin), (client), (public) for auth separation
- `proxy.ts` for lightweight auth checks at network boundary

## How to Use

1. Clone the repository
2. Run `bun install` to install dependencies
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
4. Run Supabase migrations from `supabase/migrations/`
5. Run `bun dev` to start the development server
6. Login at `/login` with your Supabase user

## Configuration

Environment variables required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_JWT_SECRET=random-32-char-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

- Admin: Login at `/login`, access `/dashboard`
- Projects: Create, edit, and manage at `/projects`
- Client Portal: Access at `/project/{slug}` with project password
- Onboarding: Submit forms at `/onboard/web-design/{id}`

## Notes

- Phase 1 (Core MVP) is complete
- Phase 2 (Remove Internal/External distinction) is pending
- Finances, Documents, and Inbox features are partially implemented
- See `specs/ourchother-tasks.md` for detailed task status
