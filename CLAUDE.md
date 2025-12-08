# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

## Architecture

**Ourchother** is a Next.js 16 project management app with Supabase backend. It has two user interfaces:

1. **Admin Dashboard** (`/dashboard`) - Authenticated via Supabase Auth for managing projects, clients, tasks, and onboarding
2. **Client Portal** (`/project/[slug]`) - Password-protected per-project dashboards where clients view progress and complete assigned tasks

### Route Groups

- `(admin)/*` - Protected admin pages requiring Supabase session
- `(client)/*` - Public client dashboards with project-specific password auth
- `(public)/*` - Onboarding forms accessible via shared links

### Supabase Clients

- `lib/supabase/client.ts` - Browser client (use in client components)
- `lib/supabase/server.ts` - Server client with cookie handling (use in Server Components and Route Handlers)
- `lib/supabase/admin.ts` - Service role client for operations bypassing RLS (API routes only, never expose)

### Data Flow

- Projects have milestones, tasks (internal), and client_tasks (visible to clients)
- Client tasks can be marked complete by clients via the portal
- Onboarding templates generate forms that create submissions, which can be converted to projects

### Auth Flow

Admin routes are protected by middleware checking Supabase session. Client portal uses bcrypt-hashed passwords stored per-project, with auth cookie set after verification.

## Key Patterns

- API routes return `ApiResponse<T>` or `ApiListResponse<T>` from `types/index.ts`
- Use `cn()` utility from `lib/utils` for Tailwind class merging
- All types are centralized in `types/index.ts`
- UI components in `components/ui/` export from single index file
