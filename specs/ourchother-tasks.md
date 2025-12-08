# Ourchother Implementation Tasks

**Based on:** PRD v1.0, Architecture Doc v1.0
**Target Developer Level:** Junior Developer
**Estimated Total Time:** 2-3 weeks

---

## How to Use This Document

This document provides step-by-step instructions for building the Ourchother platform. Each task includes:

1. **What to build** - Clear description of the feature
2. **Where to put it** - Exact file paths
3. **How to build it** - Code patterns and examples
4. **How to test it** - Verification steps

**Rules for Junior Developers:**
- Complete tasks in order within each phase
- Test each feature before moving to the next
- Commit after completing each numbered section
- Ask for help if stuck for more than 30 minutes

---

## Phase 0: Project Setup (Day 1)

### [x] 0.1 Initialize Next.js Project

**What:** Create a new Next.js 14 project with TypeScript and Tailwind CSS.

**Steps:**
```bash
# In the ourchother directory
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# When prompted:
# - Would you like to use TypeScript? Yes
# - Would you like to use ESLint? Yes
# - Would you like to use Tailwind CSS? Yes
# - Would you like to use `src/` directory? Yes
# - Would you like to use App Router? Yes
# - Would you like to customize the default import alias? Yes (@/*)
```

**Test:** Run `npm run dev` and visit http://localhost:3000 - you should see the Next.js default page.

---

### [x] 0.2 Install Dependencies

**What:** Install all required packages for the project.

**Steps:**
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr bcryptjs jsonwebtoken nanoid slugify date-fns clsx tailwind-merge

# Dev dependencies for TypeScript types
npm install -D @types/bcryptjs @types/jsonwebtoken
```

**Add css.gg icons:** Open `src/app/globals.css` and add at the top:
```css
@import 'https://unpkg.com/css.gg/icons/all.css';
```

**Test:** Run `npm run build` - it should complete without errors.

---

### [x] 0.3 Create Environment Variables

**What:** Set up environment variables for Supabase and JWT.

**Steps:**

1. Create file `.env.local` in project root:
```env
# Supabase - Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Client Dashboard JWT Secret - Generate a random 32+ character string
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CLIENT_JWT_SECRET=your-secret-key-here-at-least-32-characters

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Create file `.env.example` (for team reference):
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_JWT_SECRET=
NEXT_PUBLIC_APP_URL=
```

3. Add `.env.local` to `.gitignore` if not already there.

**Test:** The app should still run with `npm run dev`.

---

### [x] 0.4 Set Up Supabase Database

**What:** Create all database tables, enums, indexes, triggers, RLS policies, and seed data.

**Status:** COMPLETE - All tables exist and are functional

**Option A: Run via Supabase MCP (Recommended)**

Use Claude Code with the Supabase MCP to execute the migrations directly.

**Option B: Manual via Supabase Dashboard**

1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and run each SQL block below in order

---

#### Step 1: Create Tables and Enums

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- CLIENTS
-- ============================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_clients_email on clients(email);

-- ============================================
-- PROJECTS
-- ============================================
create type project_type as enum ('internal', 'external');
create type project_status as enum ('pending', 'active', 'on_hold', 'completed', 'cancelled');

create table projects (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  client_id uuid references clients(id) on delete set null,
  type project_type not null default 'external',
  status project_status not null default 'pending',
  description text,
  deliverables jsonb default '[]'::jsonb,
  start_date date,
  target_end_date date,
  dashboard_password text,
  project_value decimal(10,2),
  is_recurring boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_slug on projects(slug);
create index idx_projects_client on projects(client_id);
create index idx_projects_status on projects(status);

-- ============================================
-- MILESTONES
-- ============================================
create type milestone_status as enum ('upcoming', 'in_progress', 'complete', 'blocked');

create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  status milestone_status not null default 'upcoming',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_milestones_project on milestones(project_id);

-- ============================================
-- TASKS
-- ============================================
create type task_status as enum ('todo', 'in_progress', 'complete', 'blocked');

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  due_date date,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tasks_project on tasks(project_id);
create index idx_tasks_milestone on tasks(milestone_id);

-- ============================================
-- CLIENT TASKS
-- ============================================
create type client_task_priority as enum ('high', 'medium', 'low');
create type client_task_status as enum ('pending', 'completed', 'blocked');

create table client_tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  priority client_task_priority not null default 'medium',
  status client_task_status not null default 'pending',
  status_note text,
  due_date date,
  links jsonb default '[]'::jsonb,
  files jsonb default '[]'::jsonb,
  completed_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_client_tasks_project on client_tasks(project_id);
create index idx_client_tasks_status on client_tasks(status);
create index idx_client_tasks_priority on client_tasks(priority);

-- ============================================
-- ONBOARDING TEMPLATES
-- ============================================
create table onboarding_templates (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ONBOARDING SUBMISSIONS
-- ============================================
create type submission_status as enum ('pending', 'reviewed', 'converted');

create table onboarding_submissions (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references onboarding_templates(id) on delete restrict,
  project_id uuid references projects(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  files jsonb default '[]'::jsonb,
  status submission_status not null default 'pending',
  submitted_at timestamptz default now()
);

create index idx_submissions_template on onboarding_submissions(template_id);
create index idx_submissions_status on onboarding_submissions(status);

-- ============================================
-- TRANSACTIONS
-- ============================================
create type transaction_type as enum ('income', 'expense');

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  type transaction_type not null,
  amount decimal(10,2) not null,
  date date not null,
  description text,
  category text,
  project_id uuid references projects(id) on delete set null,
  source text,
  vendor text,
  created_at timestamptz default now()
);

create index idx_transactions_date on transactions(date);
create index idx_transactions_project on transactions(project_id);
create index idx_transactions_type on transactions(type);

-- ============================================
-- RECURRING REVENUE
-- ============================================
create type revenue_frequency as enum ('monthly', 'annual');

create table recurring_revenue (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  amount decimal(10,2) not null,
  frequency revenue_frequency not null default 'monthly',
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- DOCUMENTS
-- ============================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  path text unique not null,
  title text not null,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_documents_path on documents(path);
create index idx_documents_project on documents(project_id);
```

---

#### Step 2: Create Updated_At Trigger

```sql
-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();

create trigger milestones_updated_at before update on milestones
  for each row execute function update_updated_at();

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create trigger client_tasks_updated_at before update on client_tasks
  for each row execute function update_updated_at();

create trigger onboarding_templates_updated_at before update on onboarding_templates
  for each row execute function update_updated_at();

create trigger documents_updated_at before update on documents
  for each row execute function update_updated_at();
```

---

#### Step 3: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table clients enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table tasks enable row level security;
alter table client_tasks enable row level security;
alter table onboarding_templates enable row level security;
alter table onboarding_submissions enable row level security;
alter table transactions enable row level security;
alter table recurring_revenue enable row level security;
alter table documents enable row level security;

-- Admin policy: Full access for authenticated users
create policy "Admin full access" on clients
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on projects
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on milestones
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on tasks
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on client_tasks
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on onboarding_templates
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on onboarding_submissions
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on transactions
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on recurring_revenue
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on documents
  for all using (auth.role() = 'authenticated');

-- Public: Insert onboarding submissions (anyone can submit)
create policy "Public can submit onboarding" on onboarding_submissions
  for insert with check (true);

-- Public: Read active onboarding templates
create policy "Public can read active templates" on onboarding_templates
  for select using (is_active = true);
```

---

#### Step 4: Seed Data (Web Design Template)

```sql
insert into onboarding_templates (slug, name, description, fields) values (
  'web-design',
  'Web Design Project',
  'Onboarding form for website design and build projects',
  '[
    {"name": "client_name", "label": "Your Name", "type": "text", "required": true},
    {"name": "email", "label": "Email Address", "type": "email", "required": true},
    {"name": "phone", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "company", "label": "Company/Business Name", "type": "text", "required": false},
    {"name": "project_name", "label": "Project Name", "type": "text", "required": true},
    {"name": "project_type", "label": "Project Type", "type": "select", "required": true, "options": ["Website Design", "Website Build", "Design + Build", "Other"]},
    {"name": "platform", "label": "Platform Preference", "type": "select", "required": false, "options": ["Squarespace", "WordPress", "Webflow", "Custom", "No Preference", "Other"]},
    {"name": "target_date", "label": "Target Launch Date", "type": "date", "required": true},
    {"name": "budget", "label": "Budget Range", "type": "select", "required": true, "options": ["Under $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000+"]},
    {"name": "description", "label": "Project Description", "type": "textarea", "required": true, "placeholder": "Tell us about your project, goals, and any specific requirements..."},
    {"name": "inspiration_links", "label": "Inspiration Links", "type": "url_list", "required": false, "placeholder": "Paste URLs of websites you like..."},
    {"name": "inspiration_files", "label": "Inspiration Images", "type": "file", "required": false, "accept": "image/*", "multiple": true},
    {"name": "brand_assets", "label": "Brand Assets (logo, colors, fonts)", "type": "file", "required": false, "accept": "image/*,.pdf,.zip", "multiple": true},
    {"name": "notes", "label": "Additional Notes", "type": "textarea", "required": false}
  ]'::jsonb
);
```

---

#### Step 5: Create Storage Buckets (Manual in Dashboard)

1. Go to Storage in Supabase dashboard
2. Create bucket `files` (set to private)
3. Create bucket `docs` (set to private)
4. For `files` bucket, add policy for public uploads:
   - Policy name: "Allow public uploads to onboarding"
   - Target roles: Leave empty (allows anon)
   - FOR INSERT WITH CHECK: `bucket_id = 'files' AND (storage.foldername(name))[1] = 'onboarding'`

---

#### Step 6: Create Admin User (Manual in Dashboard)

1. Go to Authentication → Users
2. Click "Add user"
3. Enter your email and a secure password
4. This will be your admin login

---

**Test:** Go to Table Editor and verify you can see all 10 tables:
- [x] clients
- [x] projects
- [x] milestones
- [x] tasks
- [x] client_tasks
- [x] onboarding_templates
- [x] onboarding_submissions
- [x] transactions
- [x] recurring_revenue
- [x] documents

---

### [x] 0.5 Create Project Directory Structure

**What:** Set up the folder structure for the app.

**Steps:**

Create the following folders and files:

```
src/
├── app/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   │   └── [id]/
│   │   ├── clients/
│   │   │   └── [id]/
│   │   ├── onboarding/
│   │   │   ├── templates/
│   │   │   │   └── [slug]/
│   │   │   └── submissions/
│   │   │       └── [id]/
│   │   ├── finances/
│   │   │   └── transactions/
│   │   ├── docs/
│   │   ├── inbox/
│   │   └── layout.tsx
│   ├── (client)/
│   │   ├── project/
│   │   │   └── [slug]/
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── onboard/
│   │   │   └── [template]/
│   │   │       └── [id]/
│   │   └── layout.tsx
│   ├── login/
│   └── api/
│       ├── auth/
│       ├── projects/
│       │   └── [id]/
│       ├── clients/
│       │   └── [id]/
│       ├── milestones/
│       │   └── [id]/
│       ├── tasks/
│       │   └── [id]/
│       ├── client-tasks/
│       │   └── [id]/
│       ├── onboarding/
│       │   ├── templates/
│       │   │   └── [slug]/
│       │   ├── submissions/
│       │   │   └── [id]/
│       │   └── upload/
│       ├── transactions/
│       │   └── [id]/
│       ├── recurring/
│       │   └── [id]/
│       ├── documents/
│       │   └── [id]/
│       ├── inbox/
│       │   └── [type]/
│       │       └── [id]/
│       └── client-dashboard/
│           ├── auth/
│           └── [slug]/
│               └── tasks/
│                   └── [id]/
├── components/
│   ├── ui/
│   ├── admin/
│   ├── client/
│   ├── forms/
│   └── editor/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── hooks/
└── types/
```

**Quick way to create folders:**
```bash
# Run from project root
mkdir -p src/app/\(admin\)/{dashboard,projects/\[id\],clients/\[id\],onboarding/{templates/\[slug\],submissions/\[id\]},finances/transactions,docs,inbox}
mkdir -p src/app/\(client\)/project/\[slug\]
mkdir -p src/app/\(public\)/onboard/\[template\]/\[id\]
mkdir -p src/app/login
mkdir -p src/app/api/{auth,projects/\[id\],clients/\[id\],milestones/\[id\],tasks/\[id\],client-tasks/\[id\]}
mkdir -p src/app/api/onboarding/{templates/\[slug\],submissions/\[id\],upload}
mkdir -p src/app/api/{transactions/\[id\],recurring/\[id\],documents/\[id\]}
mkdir -p src/app/api/inbox/\[type\]/\[id\]
mkdir -p src/app/api/client-dashboard/{auth,\[slug\]/tasks/\[id\]}
mkdir -p src/components/{ui,admin,client,forms,editor}
mkdir -p src/lib/{supabase,utils,hooks}
mkdir -p src/types
```

---

### [x] 0.6 Create Supabase Client Files

**What:** Set up Supabase client utilities for browser and server.

**File: `src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/lib/supabase/server.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies in edge/server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies in edge/server components
          }
        },
      },
    }
  )
}
```

**File: `src/lib/supabase/admin.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'

// Use this for server-side operations that need full access
// NEVER expose this to the client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

**Test:** No errors in the code editor, files save properly.

---

### [x] 0.7 Create Utility Functions

**What:** Set up helper functions used throughout the app.

**File: `src/lib/utils/index.ts`**
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'
import slugify from 'slugify'
import { format, formatDistanceToNow } from 'date-fns'

// Combine Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate short unique IDs (for URLs)
const nanoid6 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)
const nanoid3 = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 3)

export function generateId(length: 6 | 3 = 6): string {
  return length === 6 ? nanoid6() : nanoid3()
}

// Generate URL-safe slugs from text
export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true })
}

// Generate dashboard password like "project-name-x7k"
export function generateDashboardPassword(projectSlug: string): string {
  return `${projectSlug}-${nanoid3()}`
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format dates for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

// Format relative time like "2 hours ago"
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}
```

**File: `src/lib/utils/password.ts`**
```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.CLIENT_JWT_SECRET!

// Hash a password for storage
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify a password against its hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate a JWT token for client dashboard sessions
export function generateClientToken(projectId: string): string {
  return jwt.sign({ projectId }, JWT_SECRET, { expiresIn: '7d' })
}

// Verify and decode a client token
export function verifyClientToken(token: string): { projectId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { projectId: string }
  } catch {
    return null
  }
}
```

**Test:** Create a simple test file or add a console.log in one of the functions and call it.

---

### [x] 0.8 Create TypeScript Types

**What:** Define all the TypeScript types for the application.

**File: `src/types/index.ts`**
```typescript
// ============================================
// ENUMS
// ============================================
export type ProjectType = 'internal' | 'external'
export type ProjectStatus = 'pending' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type MilestoneStatus = 'upcoming' | 'in_progress' | 'complete' | 'blocked'
export type TaskStatus = 'todo' | 'in_progress' | 'complete' | 'blocked'
export type ClientTaskPriority = 'high' | 'medium' | 'low'
export type ClientTaskStatus = 'pending' | 'completed' | 'blocked'
export type SubmissionStatus = 'pending' | 'reviewed' | 'converted'
export type TransactionType = 'income' | 'expense'
export type RevenueFrequency = 'monthly' | 'annual'

// ============================================
// DATABASE MODELS
// ============================================
export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  slug: string
  name: string
  client_id: string | null
  type: ProjectType
  status: ProjectStatus
  description: string | null
  deliverables: string[] // JSON array
  start_date: string | null
  target_end_date: string | null
  dashboard_password: string | null
  project_value: number | null
  is_recurring: boolean
  created_at: string
  updated_at: string
  // Relationships (populated when needed)
  client?: Client
  milestones?: Milestone[]
  tasks?: Task[]
  client_tasks?: ClientTask[]
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  description: string | null
  due_date: string | null
  status: MilestoneStatus
  sort_order: number
  created_at: string
  updated_at: string
  // Relationships
  tasks?: Task[]
}

export interface Task {
  id: string
  project_id: string
  milestone_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ClientTaskLink {
  label: string
  url: string
}

export interface ClientTask {
  id: string
  project_id: string
  title: string
  description: string | null
  priority: ClientTaskPriority
  status: ClientTaskStatus
  status_note: string | null
  due_date: string | null
  links: ClientTaskLink[] // JSON array
  files: string[] // Storage paths
  completed_at: string | null
  acknowledged_at: string | null
  created_at: string
  updated_at: string
}

export interface OnboardingTemplateField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'url_list' | 'file'
  required: boolean
  placeholder?: string
  options?: string[]
  accept?: string
  multiple?: boolean
}

export interface OnboardingTemplate {
  id: string
  slug: string
  name: string
  description: string | null
  fields: OnboardingTemplateField[] // JSON array
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingSubmission {
  id: string
  template_id: string
  project_id: string | null
  data: Record<string, any> // JSON object
  files: string[] // Storage paths
  status: SubmissionStatus
  submitted_at: string
  // Relationships
  template?: OnboardingTemplate
  project?: Project
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  description: string | null
  category: string | null
  project_id: string | null
  source: string | null
  vendor: string | null
  created_at: string
  // Relationships
  project?: Project
}

export interface RecurringRevenue {
  id: string
  project_id: string | null
  client_id: string | null
  amount: number
  frequency: RevenueFrequency
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Document {
  id: string
  path: string
  title: string
  project_id: string | null
  created_at: string
  updated_at: string
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  data: T | null
  error: {
    code: string
    message: string
  } | null
}

export interface ApiListResponse<T> {
  data: T[]
  count: number
  error: {
    code: string
    message: string
  } | null
}

// ============================================
// INBOX TYPES
// ============================================
export type InboxItemType =
  | 'new_submission'
  | 'client_task_done'
  | 'overdue_milestone'
  | 'overdue_task'
  | 'blocked_item'

export interface InboxItem {
  id: string
  type: InboxItemType
  priority: 'high' | 'medium' | 'low'
  title: string
  subtitle: string
  timestamp: string
  link: string
  source_id: string
  source_table: string
}

// ============================================
// FORM TYPES
// ============================================
export interface ProjectFormData {
  name: string
  client_id: string | null
  type: ProjectType
  status: ProjectStatus
  description: string
  deliverables: string[]
  start_date: string
  target_end_date: string
  project_value: number | null
  is_recurring: boolean
}

export interface ClientFormData {
  name: string
  email: string
  phone: string
  company: string
}

export interface MilestoneFormData {
  name: string
  description: string
  due_date: string
  status: MilestoneStatus
}

export interface TaskFormData {
  title: string
  description: string
  milestone_id: string | null
  due_date: string
  status: TaskStatus
}

export interface ClientTaskFormData {
  title: string
  description: string
  priority: ClientTaskPriority
  status: ClientTaskStatus
  status_note: string
  due_date: string
  links: ClientTaskLink[]
}

export interface TransactionFormData {
  type: TransactionType
  amount: number
  date: string
  description: string
  category: string
  project_id: string | null
  source: string
  vendor: string
}
```

**Test:** No TypeScript errors in the file.

---

### [x] 0.9 Update Tailwind Config (using Tailwind v4 @theme syntax)

**What:** Add custom colors and settings.

**File: `tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#dbeafe',
          text: '#1e40af',
        }
      },
    },
  },
  plugins: [],
}
export default config
```

**Test:** Run `npm run dev` and check there are no Tailwind errors.

---

## Phase 1: Core MVP (Days 2-5)

### [x] 1.1 Create Base UI Components

**What:** Build reusable UI components that will be used throughout the app.

**File: `src/components/ui/button.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Variants
            'bg-accent text-white hover:bg-accent-hover': variant === 'primary',
            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'secondary',
            'text-gray-600 hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            // Sizes
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
```

**File: `src/components/ui/input.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-md text-sm',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

**File: `src/components/ui/textarea.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-md text-sm min-h-[100px]',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
```

**File: `src/components/ui/select.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-md text-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
```

**File: `src/components/ui/card.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 border-b border-gray-200', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
```

**File: `src/components/ui/badge.tsx`**
```typescript
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
```

**File: `src/components/ui/icon.tsx`**
```typescript
import { cn } from '@/lib/utils'

export interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return <i className={cn(`gg-${name}`, className)} />
}
```

**Create a barrel export file:**

**File: `src/components/ui/index.ts`**
```typescript
export { Button } from './button'
export { Input } from './input'
export { Textarea } from './textarea'
export { Select } from './select'
export { Card, CardHeader, CardContent } from './card'
export { Badge } from './badge'
export { Icon } from './icon'
```

**Test:** Import a component in your main page and verify it renders.

---

### [x] 1.2 Create Middleware for Auth Protection

**What:** Protect admin routes and allow public access to specific pages.

**File: `src/middleware.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public routes that don't require auth
  const publicRoutes = [
    '/login',
    '/onboard',
    '/project',
    '/api/onboarding/templates',
    '/api/onboarding/submissions',
    '/api/onboarding/upload',
    '/api/client-dashboard',
  ]

  // Check if the current path starts with any public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For admin routes, check auth
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  if (!session && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

### [x] 1.3 Create Login Page

**What:** Admin login page with email/password authentication.

**File: `src/app/login/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardContent } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Ourchother</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Test:**
1. Run `npm run dev`
2. Go to http://localhost:3000/login
3. Try logging in with invalid credentials (should show error)
4. Log in with your admin credentials (should redirect to /dashboard)

---

### [x] 1.4 Create Admin Layout

**What:** The shared layout for all admin pages with sidebar navigation.

**File: `src/components/admin/sidebar.tsx`**
```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/projects', label: 'Projects', icon: 'folder' },
  { href: '/clients', label: 'Clients', icon: 'user' },
  { href: '/onboarding', label: 'Onboarding', icon: 'clipboard' },
  { href: '/finances', label: 'Finances', icon: 'credit-card' },
  { href: '/docs', label: 'Docs', icon: 'file-document' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">OURCHOTHER</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent-light text-accent-text'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 w-full"
        >
          <Icon name="log-out" />
          Logout
        </button>
      </div>
    </aside>
  )
}
```

**File: `src/app/(admin)/layout.tsx`**
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
```

**Create a simple dashboard page to test:**

**File: `src/app/(admin)/dashboard/page.tsx`**
```typescript
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <p className="text-gray-600">Welcome to Ourchother!</p>
    </div>
  )
}
```

**Test:**
1. Log in to the app
2. You should see the sidebar with navigation
3. The Dashboard link should be highlighted
4. Clicking Logout should sign you out

---

### [x] 1.5 Create API Routes for Projects

**What:** CRUD API endpoints for managing projects.

**File: `src/app/api/projects/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug, generateDashboardPassword } from '@/lib/utils'
import { hashPassword } from '@/lib/utils/password'

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let query = supabase
      .from('projects')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, count, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Generate slug from project name
    const slug = generateSlug(body.name)

    // Generate and hash dashboard password
    const plainPassword = generateDashboardPassword(slug)
    const hashedPassword = await hashPassword(plainPassword)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...body,
        slug,
        dashboard_password: hashedPassword,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    // Return the project with the plain password (only shown once)
    return NextResponse.json({
      data: { ...data, plain_password: plainPassword },
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

**File: `src/app/api/projects/[id]/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/projects/[id] - Get a single project with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        milestones(*),
        tasks(*),
        client_tasks(*)
      `)
      .eq('id', id)
      .order('sort_order', { foreignTable: 'milestones', ascending: true })
      .order('sort_order', { foreignTable: 'tasks', ascending: true })
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { data: null, error: { code: 'NOT_FOUND', message: 'Project not found' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { id }, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

**Test:** Use a tool like Postman or curl to test the API endpoints after logging in.

---

### [x] 1.6-1.10 Continue with remaining API routes

Create similar API route files for:

- **`/api/clients/route.ts`** and **`/api/clients/[id]/route.ts`** - CRUD for clients
- **`/api/milestones/route.ts`** and **`/api/milestones/[id]/route.ts`** - CRUD for milestones
- **`/api/tasks/route.ts`** and **`/api/tasks/[id]/route.ts`** - CRUD for tasks
- **`/api/client-tasks/route.ts`** and **`/api/client-tasks/[id]/route.ts`** - CRUD for client tasks
- **`/api/onboarding/templates/[slug]/route.ts`** - GET template by slug (public)
- **`/api/onboarding/submissions/route.ts`** - GET all, POST new (public)
- **`/api/onboarding/submissions/[id]/route.ts`** - GET single, PATCH status
- **`/api/onboarding/submissions/[id]/convert/route.ts`** - POST to convert to project
- **`/api/onboarding/upload/route.ts`** - POST file upload
- **`/api/client-dashboard/auth/route.ts`** - POST password validation
- **`/api/client-dashboard/[slug]/route.ts`** - GET project data for client
- **`/api/client-dashboard/[slug]/tasks/[id]/complete/route.ts`** - POST mark task complete

**Note:** Each API route follows the same pattern as the projects example above. I'll provide key ones below.

---

### [x] 1.11 Create Public Onboarding Form

**File: `src/app/(public)/layout.tsx`**
```typescript
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
```

**File: `src/app/(public)/onboard/[template]/[id]/page.tsx`**
```typescript
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { OnboardingForm } from '@/components/forms/onboarding-form'

interface Props {
  params: { template: string; id: string }
}

export default async function OnboardingPage({ params }: Props) {
  const supabase = createAdminClient()

  // Fetch the template
  const { data: template, error } = await supabase
    .from('onboarding_templates')
    .select('*')
    .eq('slug', params.template)
    .eq('is_active', true)
    .single()

  if (error || !template) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        {template.description && (
          <p className="text-gray-600 mt-2">{template.description}</p>
        )}
      </div>

      <OnboardingForm
        template={template}
        onboardingId={params.id}
      />
    </div>
  )
}
```

**File: `src/components/forms/onboarding-form.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui'
import type { OnboardingTemplate, OnboardingTemplateField } from '@/types'

interface Props {
  template: OnboardingTemplate
  onboardingId: string
}

export function OnboardingForm({ template, onboardingId }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, fileList: FileList | null) => {
    if (fileList) {
      setFiles(prev => ({ ...prev, [name]: Array.from(fileList) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, upload any files
      const uploadedFiles: string[] = []

      for (const [fieldName, fieldFiles] of Object.entries(files)) {
        for (const file of fieldFiles) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('fieldName', fieldName)
          formData.append('onboardingId', onboardingId)

          const res = await fetch('/api/onboarding/upload', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            throw new Error('Failed to upload file')
          }

          const { data } = await res.json()
          uploadedFiles.push(data.path)
        }
      }

      // Then, submit the form
      const res = await fetch('/api/onboarding/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          data: formData,
          files: uploadedFiles,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Thank you for your submission!
          </h2>
          <p className="text-gray-600">
            We&apos;ll be in touch soon to discuss your project.
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderField = (field: OnboardingTemplateField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            key={field.name}
            type={field.type}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'select':
        return (
          <Select
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
            placeholder="Select an option"
            required={field.required}
          />
        )

      case 'date':
        return (
          <Input
            key={field.name}
            type="date"
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          />
        )

      case 'file':
        return (
          <div key={field.name} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="file"
              name={field.name}
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.name, e.target.files)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent-light file:text-accent-text hover:file:bg-blue-100"
            />
            {files[field.name] && (
              <p className="text-xs text-gray-500 mt-1">
                {files[field.name].length} file(s) selected
              </p>
            )}
          </div>
        )

      case 'url_list':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Enter one URL per line"}
            required={field.required}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {template.fields.map(renderField)}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Test:**
1. Go to http://localhost:3000/onboard/web-design/test123
2. Fill out the form
3. Submit and verify it shows the success message

---

### [x] 1.12 Create Client Dashboard

**File: `src/app/(client)/layout.tsx`**
```typescript
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold text-gray-900">OURCHOTHER</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  )
}
```

**File: `src/app/(client)/project/[slug]/page.tsx`**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { PasswordGate } from '@/components/client/password-gate'
import { ClientDashboard } from '@/components/client/client-dashboard'
import type { Project } from '@/types'

interface Props {
  params: { slug: string }
}

export default function ClientProjectPage({ params }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated (cookie exists)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch(`/api/client-dashboard/${params.slug}`)
      if (res.ok) {
        const { data } = await res.json()
        setProject(data)
        setIsAuthenticated(true)
      }
    } catch (err) {
      // Not authenticated, show password gate
    } finally {
      setLoading(false)
    }
  }

  const handleAuthenticated = (projectData: Project) => {
    setProject(projectData)
    setIsAuthenticated(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PasswordGate slug={params.slug} onAuthenticated={handleAuthenticated} />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
      </div>
    )
  }

  return <ClientDashboard project={project} onUpdate={() => checkAuth()} />
}
```

**File: `src/components/client/password-gate.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import type { Project } from '@/types'

interface Props {
  slug: string
  onAuthenticated: (project: Project) => void
}

export function PasswordGate({ slug, onAuthenticated }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/client-dashboard/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })

      const { data, error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      onAuthenticated(data.project)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Project Access</h2>
            <p className="text-gray-600 mt-1">Enter your project password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**File: `src/components/client/client-dashboard.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, Badge, Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Project, ClientTask, Milestone } from '@/types'

interface Props {
  project: Project
  onUpdate: () => void
}

const statusColors = {
  pending: 'warning',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  cancelled: 'error',
} as const

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'default',
} as const

export function ClientDashboard({ project, onUpdate }: Props) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const pendingTasks = project.client_tasks?.filter(t => t.status === 'pending') || []
  const completedTasks = project.client_tasks?.filter(t => t.status === 'completed') || []
  const hasPendingTasks = pendingTasks.length > 0

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId)
    try {
      await fetch(`/api/client-dashboard/${project.slug}/tasks/${taskId}/complete`, {
        method: 'POST',
      })
      onUpdate()
    } catch (err) {
      console.error('Failed to complete task')
    } finally {
      setCompletingTaskId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <Badge variant={statusColors[project.status]}>
          {project.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Action Required Banner */}
      {hasPendingTasks && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-lg">⚠️</span>
              <span className="font-medium text-amber-800">
                ACTION REQUIRED: You have {pendingTasks.length} task(s) that need your attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Tasks */}
      {(pendingTasks.length > 0 || completedTasks.length > 0) && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Your Tasks</h2>
          </CardHeader>
          <CardContent className="divide-y">
            {pendingTasks.map((task) => (
              <ClientTaskCard
                key={task.id}
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
                isCompleting={completingTaskId === task.id}
              />
            ))}
            {completedTasks.map((task) => (
              <ClientTaskCard key={task.id} task={task} completed />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {project.start_date && project.target_end_date && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Timeline</h2>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Start:</span> {formatDate(project.start_date)}
              </div>
              <div>
                <span className="font-medium">Target Completion:</span> {formatDate(project.target_end_date)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      {project.deliverables && project.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Deliverables</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {project.deliverables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Milestones</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ClientTaskCard({
  task,
  onComplete,
  isCompleting,
  completed,
}: {
  task: ClientTask
  onComplete?: () => void
  isCompleting?: boolean
  completed?: boolean
}) {
  return (
    <div className={`py-4 ${completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!completed && (
              <Badge variant={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            )}
            {completed && <span className="text-green-600">✓</span>}
            <span className={`font-medium ${completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          {task.status_note && !completed && (
            <p className="text-sm text-amber-600 mt-1">⚠️ {task.status_note}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-gray-500 mt-1">Due: {formatDate(task.due_date)}</p>
          )}

          {/* Links */}
          {task.links && task.links.length > 0 && (
            <div className="flex gap-2 mt-2">
              {task.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}
        </div>

        {!completed && onComplete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onComplete}
            disabled={isCompleting}
          >
            {isCompleting ? 'Saving...' : 'Mark Complete'}
          </Button>
        )}
      </div>
    </div>
  )
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const statusIcon = {
    upcoming: '○',
    in_progress: '●',
    complete: '✓',
    blocked: '✕',
  }

  return (
    <div className="flex items-start gap-3">
      <span className={`${milestone.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
        {statusIcon[milestone.status]}
      </span>
      <div className="flex-1">
        <div className="font-medium">{milestone.name}</div>
        {milestone.due_date && (
          <div className="text-sm text-gray-500">{formatDate(milestone.due_date)}</div>
        )}
      </div>
    </div>
  )
}
```

---

### [x] 1.13-1.17 Admin Pages

Continue building out the admin pages following the same patterns:

- **`/projects/page.tsx`** - List all projects with filters
- **`/projects/[id]/page.tsx`** - Project detail with milestones, tasks, client tasks
- **`/projects/new/page.tsx`** - Create new project form
- **`/onboarding/page.tsx`** - List onboarding submissions
- **`/onboarding/submissions/[id]/page.tsx`** - View submission, convert to project
- **`/dashboard/page.tsx`** - Main dashboard with inbox, projects overview, deadlines

---

---

## Phase 2: Data Model Improvements

### [ ] 2.1 Remove Internal/External Project Distinction

**What:** Remove the artificial internal/external project type distinction. Instead, all projects will require a client. "Ourchother" will be a client representing internal work.

**Decisions:**
- ✅ Keep `type` field on projects but make optional (future-proofing)
- ✅ Make `client_id` required on all projects

**Database Migration (run in Supabase SQL Editor):**
```sql
-- 1. Create Ourchother client with fixed UUID
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

-- 3. Make client_id required
ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;

-- 4. Make type nullable (keep for future use)
ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;
```

**Type Updates (`src/types/index.ts`):**
- Line 31: `client_id: string | null` → `client_id: string`
- Line 32: `type: ProjectType` → `type?: ProjectType`
- Line 217: `client_id: string | null` → `client_id: string`
- Line 218: `type: ProjectType` → `type?: ProjectType`
- Add constant: `export const OURCHOTHER_CLIENT_ID = '00000000-0000-0000-0000-000000000001'`

**New Project Form (`src/app/(admin)/projects/new/page.tsx`):**
- Remove "Project Type" dropdown (lines 163-171)
- Remove conditional around client selector (line 196 condition `formData.type === 'external'`)
- Make client selector always visible and required
- Add validation: reject submit if no client selected
- Sort clients to show "Ourchother (Internal)" at top of dropdown
- Remove `type` from form state or default to null

**API Updates:**
- `src/app/api/projects/route.ts`: POST - Add validation that `client_id` is provided, make `type` optional
- `src/app/api/projects/[id]/route.ts`: PATCH - Ensure `client_id` can't be set to null

**Project List Page (`src/app/(admin)/projects/page.tsx`):**
- Update type filter to filter by client_id (Ourchother = internal, others = external)
- Update badges to show "Internal" for Ourchother projects instead of type-based

**Project Detail Page (`src/app/(admin)/projects/[id]/page.tsx`):**
- Remove or update type display
- Can compute "Internal/External" from `client_id === OURCHOTHER_CLIENT_ID`

**Files to Modify:**
| File | Changes |
|------|---------|
| `src/types/index.ts` | Update Project interface, add constant |
| `src/app/(admin)/projects/new/page.tsx` | Remove type selector, always show client |
| `src/app/api/projects/route.ts` | Validate client_id required |
| `src/app/api/projects/[id]/route.ts` | Prevent null client_id |
| `src/app/(admin)/projects/page.tsx` | Update filters/badges |
| `src/app/(admin)/projects/[id]/page.tsx` | Update type display |

**Testing Checklist:**
- [ ] Creating project requires selecting a client
- [ ] "Ourchother (Internal)" appears at top of client dropdown
- [ ] Existing projects migrated to Ourchother
- [ ] API rejects project creation without client_id
- [ ] Project list/detail pages display correctly

---

## Deployment Checklist

### Before Deploying
- [x] All API routes are working
- [x] Admin can log in and see dashboard
- [x] Onboarding form submits successfully
- [x] Client dashboard shows project data
- [x] All environment variables are set

### Deploy to Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
4. Deploy

### After Deploying
- [ ] Test login at your-domain.vercel.app/login
- [ ] Test onboarding form
- [ ] Test client dashboard
- [ ] Set up custom domain (ourchother.com)

---

## Quick Reference: Common Patterns

### API Route Pattern
```typescript
// Standard API response
return NextResponse.json({ data, error: null })

// Error response
return NextResponse.json(
  { data: null, error: { code: 'ERROR_CODE', message: 'Error message' } },
  { status: 400 }
)
```

### Form Handling Pattern
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const { data, error } = await res.json()

    if (error) {
      setError(error.message)
      return
    }

    // Success - redirect or update state
  } catch (err) {
    setError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
```

### Status Badge Pattern
```typescript
const statusVariant = {
  active: 'success',
  pending: 'warning',
  completed: 'default',
  blocked: 'error',
} as const

<Badge variant={statusVariant[item.status]}>{item.status}</Badge>
```

---

*End of Implementation Tasks*
