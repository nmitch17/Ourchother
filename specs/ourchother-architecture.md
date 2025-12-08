# Ourchother Platform Architecture Document

**Version:** 1.0  
**Date:** December 7, 2024  
**Based on:** PRD v1.0

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Next.js App                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ Admin Pages │  │Client Pages │  │  Public Pages   │  │   │
│  │  │ /dashboard  │  │ /project/*  │  │  /onboard/*     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  │                         │                                │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              API Routes (/api/*)                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL    │  │     Auth        │  │    Storage      │  │
│  │   (all tables)  │  │ (admin only)    │  │ (/docs, /files) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Claude Code SDK (Future)                       │
│            Agent access to /docs via Storage API                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Complete SQL Schema

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
  dashboard_password text, -- bcrypt hashed
  project_value decimal(10,2), -- one-time value or monthly if recurring
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
-- CLIENT TASKS (Tasks assigned to clients)
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
  status_note text, -- freeform context: "Blocking design phase", "Need before Dec 15"
  due_date date,
  links jsonb default '[]'::jsonb, -- [{label: "Squarespace Login", url: "https://..."}]
  files jsonb default '[]'::jsonb, -- storage paths for screenshots/instructions
  completed_at timestamptz,
  acknowledged_at timestamptz, -- when admin has seen the completion
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
  files jsonb default '[]'::jsonb, -- array of storage paths
  status submission_status not null default 'pending',
  submitted_at timestamptz default now()
);

create index idx_submissions_template on onboarding_submissions(template_id);
create index idx_submissions_status on onboarding_submissions(status);

-- ============================================
-- TRANSACTIONS (Financials)
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
  source text, -- for income: "Amazon Affiliate", "Bybit", etc.
  vendor text, -- for expenses
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
-- DOCUMENTS (Metadata only - content in Storage)
-- ============================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  path text unique not null, -- mirrors storage path: "internal/processes/onboarding.md"
  title text not null,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_documents_path on documents(path);
create index idx_documents_project on documents(project_id);

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

### 2.2 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table clients enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table tasks enable row level security;
alter table onboarding_templates enable row level security;
alter table onboarding_submissions enable row level security;
alter table transactions enable row level security;
alter table recurring_revenue enable row level security;
alter table documents enable row level security;

-- Admin policy: Full access for authenticated users
-- (Single admin user, no role check needed)
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

### 2.3 Seed Data: Web Design Onboarding Template

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

## 3. Supabase Storage Structure

```
/buckets
  /files                    # Onboarding uploads, project files
    /onboarding
      /[submission-id]
        /inspiration
          image1.png
          image2.jpg
        /brand
          logo.png
          brand-guide.pdf
    /projects
      /[project-id]
        /...
  
  /docs                     # Internal documentation (markdown)
    /internal
      /processes
        client-onboarding.md
        project-kickoff.md
        invoicing.md
      /templates
        proposal-template.md
        contract-template.md
    /projects
      /coinclarity
        overview.md
        affiliate-programs.md
      /smarthomepursuits
        overview.md
      /[project-slug]
        notes.md
        requirements.md
```

Storage bucket policies:
- `files`: Private, authenticated access only (admin)
- `docs`: Private, authenticated access only (admin + future agent)

---

## 4. API Routes

### 4.1 Route Structure

```
/api
  /auth
    /session          GET     Get current session (admin check)
  
  /projects
    /                 GET     List all projects (filterable)
    /                 POST    Create project
    /[id]             GET     Get project by ID
    /[id]             PATCH   Update project
    /[id]             DELETE  Delete project
    /[id]/milestones  GET     List milestones for project
    /[id]/tasks       GET     List tasks for project
  
  /clients
    /                 GET     List all clients
    /                 POST    Create client
    /[id]             GET     Get client by ID
    /[id]             PATCH   Update client
    /[id]             DELETE  Delete client
  
  /milestones
    /                 POST    Create milestone
    /[id]             PATCH   Update milestone
    /[id]             DELETE  Delete milestone
    /reorder          POST    Reorder milestones
  
  /tasks
    /                 POST    Create task
    /[id]             PATCH   Update task
    /[id]             DELETE  Delete task
    /reorder          POST    Reorder tasks
  
  /client-tasks
    /                 POST    Create client task
    /[id]             PATCH   Update client task
    /[id]             DELETE  Delete client task
    /[id]/acknowledge POST    Mark completion as acknowledged
    /upload           POST    Upload instruction files/screenshots
  
  /onboarding
    /templates
      /                GET     List templates (admin)
      /                POST    Create template
      /[slug]          GET     Get template by slug (public for form render)
      /[slug]          PATCH   Update template
    /submissions
      /                GET     List submissions (admin)
      /                POST    Create submission (public)
      /[id]            GET     Get submission
      /[id]/convert    POST    Convert to project
    /upload            POST    Upload files for submission (public)
  
  /transactions
    /                 GET     List transactions (filterable by date, type, project)
    /                 POST    Create transaction
    /[id]             PATCH   Update transaction
    /[id]             DELETE  Delete transaction
    /summary          GET     Financial summary (monthly totals, etc.)
  
  /recurring
    /                 GET     List recurring revenue
    /                 POST    Create recurring entry
    /[id]             PATCH   Update recurring entry
    /[id]             DELETE  Delete recurring entry
  
  /documents
    /                 GET     List documents (metadata)
    /                 POST    Create document (metadata + upload to storage)
    /[id]             GET     Get document content (fetches from storage)
    /[id]             PATCH   Update document (metadata + storage)
    /[id]             DELETE  Delete document
    /tree             GET     Get full file tree structure
  
  /inbox
    /                 GET     Get all inbox items (aggregated from multiple sources)
    /[type]/[id]/ack  POST    Acknowledge/dismiss an inbox item
  
  /client-dashboard
    /auth             POST    Validate project password, return session token
    /[slug]           GET     Get project data for client view (requires valid token)
    /[slug]/tasks/[id]/complete  POST  Mark a client task as completed
```

### 4.2 API Response Format

```typescript
// Success
{
  data: T,
  error: null
}

// Error
{
  data: null,
  error: {
    code: string,
    message: string
  }
}

// List responses
{
  data: T[],
  count: number,
  error: null
}
```

### 4.3 Client Dashboard Auth Flow

```typescript
// POST /api/client-dashboard/auth
// Request
{
  slug: "smith-website",
  password: "smith-website-x7k"
}

// Response (success)
{
  data: {
    token: "eyJ...", // JWT with project_id, exp (7 days)
    project: {
      name: "Smith Website",
      // ... basic project info
    }
  }
}

// Token stored in httpOnly cookie: "client_session"
// Subsequent requests to /api/client-dashboard/[slug] validate this cookie
```

### 4.4 Inbox Aggregation Logic

The inbox is a virtual aggregation, not a separate table. The `/api/inbox` endpoint queries multiple sources and merges them:

```typescript
// Inbox item types
type InboxItemType = 
  | 'new_submission'      // Onboarding submission with status 'pending'
  | 'client_task_done'    // Client task completed but not acknowledged
  | 'overdue_milestone'   // Milestone past due_date, not complete
  | 'overdue_task'        // Task past due_date, not complete
  | 'blocked_item';       // Any milestone/task with status 'blocked'

interface InboxItem {
  id: string;
  type: InboxItemType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  subtitle: string;           // Project name, context
  timestamp: Date;            // When it became an inbox item
  link: string;               // URL to resolve it
  source_id: string;          // ID of the source record
  source_table: string;       // Table name for acknowledgment
}

// Priority assignment:
// - HIGH: new_submission, overdue items, blocked items
// - MEDIUM: client_task_done
// - LOW: (reserved for future low-priority notifications)

// Sort order: priority DESC, then timestamp ASC (oldest first within priority)
```

**Queries to build inbox:**

```sql
-- New submissions
SELECT id, 'new_submission' as type, 'high' as priority,
       data->>'project_name' as title,
       submitted_at as timestamp
FROM onboarding_submissions
WHERE status = 'pending';

-- Completed client tasks (not acknowledged)
SELECT ct.id, 'client_task_done' as type, 'medium' as priority,
       ct.title, p.name as subtitle,
       ct.completed_at as timestamp
FROM client_tasks ct
JOIN projects p ON ct.project_id = p.id
WHERE ct.status = 'completed' AND ct.acknowledged_at IS NULL;

-- Overdue milestones
SELECT m.id, 'overdue_milestone' as type, 'high' as priority,
       m.name as title, p.name as subtitle,
       m.due_date as timestamp
FROM milestones m
JOIN projects p ON m.project_id = p.id
WHERE m.due_date < CURRENT_DATE AND m.status != 'complete';

-- Overdue tasks
SELECT t.id, 'overdue_task' as type, 'high' as priority,
       t.title, p.name as subtitle,
       t.due_date as timestamp
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.due_date < CURRENT_DATE AND t.status != 'complete';

-- Blocked items
SELECT id, 'blocked_item' as type, 'high' as priority, title, ... 
FROM tasks WHERE status = 'blocked'
UNION
SELECT id, 'blocked_item' as type, 'high' as priority, name as title, ...
FROM milestones WHERE status = 'blocked';
```

**Acknowledgment:**
- `POST /api/inbox/[type]/[id]/ack` sets the appropriate field:
  - `new_submission` → Update status to 'reviewed'
  - `client_task_done` → Set `acknowledged_at = now()`
  - Overdue/blocked → No direct ack; resolve by completing or updating status

---

## 5. Frontend Architecture

### 5.1 Directory Structure

```
/app
  /(admin)
    layout.tsx              # Admin shell with sidebar
    /dashboard
      page.tsx              # Main dashboard (includes inbox summary)
    /inbox
      page.tsx              # Full inbox view (P2.5)
    /projects
      page.tsx              # Projects list
      /[id]
        page.tsx            # Project detail
        /edit
          page.tsx          # Edit project form
    /clients
      page.tsx              # Clients list
      /[id]
        page.tsx            # Client detail
    /onboarding
      page.tsx              # Submissions list
      /templates
        page.tsx            # Templates list
        /[slug]
          page.tsx          # Edit template
      /submissions
        /[id]
          page.tsx          # View submission, convert to project
    /finances
      page.tsx              # Financial dashboard
      /transactions
        page.tsx            # Transaction list
    /docs
      page.tsx              # Documentation editor
  
  /(client)
    layout.tsx              # Minimal client layout
    /project
      /[slug]
        page.tsx            # Password gate + dashboard
  
  /(public)
    layout.tsx              # Public layout (no nav)
    /onboard
      /[template]
        /[id]
          page.tsx          # Onboarding form
  
  /login
    page.tsx                # Admin login
  
  /api
    /...                    # API routes as specified above

/components
  /ui
    button.tsx
    input.tsx
    select.tsx
    textarea.tsx
    card.tsx
    badge.tsx
    table.tsx
    modal.tsx
    dropdown.tsx
    tabs.tsx
    toast.tsx
    skeleton.tsx
    file-upload.tsx
    date-picker.tsx
    icon.tsx                # css.gg icon wrapper
  /admin
    sidebar.tsx
    header.tsx
    project-card.tsx
    milestone-list.tsx
    task-list.tsx
    client-task-list.tsx
    client-task-form.tsx
    inbox-list.tsx
    inbox-item.tsx
    financial-summary.tsx
    deadline-list.tsx
  /client
    project-header.tsx
    timeline.tsx
    milestone-card.tsx
    client-task-card.tsx
    action-required-banner.tsx
  /forms
    onboarding-form.tsx
    project-form.tsx
    client-form.tsx
    transaction-form.tsx
  /editor
    markdown-editor.tsx
    file-tree.tsx
    toolbar.tsx

/lib
  /supabase
    client.ts               # Browser client
    server.ts               # Server client (for API routes)
    admin.ts                # Service role client (for sensitive ops)
  /utils
    nanoid.ts               # ID generation
    password.ts             # Hashing helpers
    format.ts               # Date, currency formatters
    slug.ts                 # Slug generation
  /hooks
    use-projects.ts
    use-clients.ts
    use-transactions.ts
    use-documents.ts
    use-toast.ts

/types
  index.ts                  # All TypeScript types
  database.ts               # Generated Supabase types
```

### 5.2 Key Components

**Admin Sidebar**
```
┌──────────────────────┐
│  OURCHOTHER          │
├──────────────────────┤
│  ◻ Dashboard         │
│  ◻ Projects          │
│  ◻ Clients           │
│  ◻ Onboarding        │
│  ◻ Finances          │
│  ◻ Docs              │
├──────────────────────┤
│  ◻ Settings          │
│  ◻ Logout            │
└──────────────────────┘
```

**Main Dashboard Layout**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                          [+ New] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Inbox (3)                                     [View All →] │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH  New submission: Johnson Website    2h ago  │   │
│  │ 🟡 MED   Client completed: Create Sqsp acct 1d ago  │   │
│  │ 🔴 HIGH  Overdue: Smith Website wireframes  2d ago  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Revenue         │  │ Expenses        │  │ Net         │ │
│  │ $12,450         │  │ $3,200          │  │ $9,250      │ │
│  │ ↑ 12% vs last   │  │ ↓ 5% vs last    │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  Projects                                      [View All →] │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Smith Website     External  ● Active    Due Dec 20  │   │
│  │ CoinClarity       Internal  ● Active    —           │   │
│  │ SmartHomePursuits Internal  ● Active    —           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Upcoming Deadlines                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Dec 10  Smith Website    Wireframes complete        │   │
│  │ Dec 15  Smith Website    Design review              │   │
│  │ Dec 20  Smith Website    Launch                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Client Dashboard Layout**
```
┌─────────────────────────────────────────────────────────────┐
│  OURCHOTHER                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Smith Website                              ● Active        │
│  Website Design + Build                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚠️  ACTION REQUIRED                                  │   │
│  │ You have 2 tasks that need your attention            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Your Tasks                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Create Squarespace Account          Due: Dec 8   │   │
│  │    We need access to build your site.               │   │
│  │    [Go to Squarespace →]  [View Instructions]       │   │
│  │    Blocking: Design phase                           │   │
│  │                                    [Mark Complete]  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 Submit brand colors              Due: Dec 10     │   │
│  │    Please provide hex codes for your brand colors.  │   │
│  │                                    [Mark Complete]  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ✓ Initial payment                   Completed       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Timeline                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○────────●────────○────────○                        │   │
│  │ Start   Design   Build    Launch                    │   │
│  │ Dec 1   Dec 10   Dec 15   Dec 20                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Deliverables                                               │
│  • Homepage design                                          │
│  • 5 inner page templates                                   │
│  • Mobile responsive build                                  │
│  • Contact form integration                                 │
│                                                             │
│  Milestones                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Project Kickoff                        Dec 1      │   │
│  │ ● Design Phase                           Dec 10     │   │
│  │   ├─ ✓ Wireframes                                   │   │
│  │   ├─ ● Homepage mockup                              │   │
│  │   └─ ○ Inner page mockups                           │   │
│  │ ○ Build Phase                            Dec 15     │   │
│  │ ○ Launch                                 Dec 20     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Design System

### 6.1 Color Palette

```css
:root {
  /* Base (Neutral) */
  --color-bg: #ffffff;
  --color-bg-subtle: #f9fafb;
  --color-bg-muted: #f3f4f6;
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  
  /* Text */
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  
  /* Accent (Medium Blue) */
  --color-accent: #3b82f6;         /* blue-500 */
  --color-accent-hover: #2563eb;   /* blue-600 */
  --color-accent-light: #dbeafe;   /* blue-100 */
  --color-accent-text: #1e40af;    /* blue-800 */
  
  /* Semantic */
  --color-success: #10b981;        /* emerald-500 */
  --color-success-light: #d1fae5;  /* emerald-100 */
  --color-warning: #f59e0b;        /* amber-500 */
  --color-warning-light: #fef3c7;  /* amber-100 */
  --color-error: #ef4444;          /* red-500 */
  --color-error-light: #fee2e2;    /* red-100 */
  
  /* Status badges */
  --color-status-active: #10b981;
  --color-status-pending: #f59e0b;
  --color-status-complete: #6b7280;
  --color-status-blocked: #ef4444;
}
```

### 6.2 Tailwind Config Additions

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#dbeafe',
          text: '#1e40af',
        }
      }
    }
  }
}
```

### 6.3 Typography

- **Font:** System font stack (no custom fonts for speed)
- **Headings:** font-semibold, text-gray-900
- **Body:** font-normal, text-gray-700
- **Muted:** text-gray-500
- **Scale:** text-sm (14px) base, text-xs (12px) small, text-base (16px) for emphasis

### 6.4 Icons

Using css.gg icons via the npm package or CDN.

```tsx
// components/ui/icon.tsx
import 'css.gg/icons/all.css';

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return <i className={`gg-${name} ${className || ''}`} />;
}

// Usage
<Icon name="home" />
<Icon name="folder" />
<Icon name="check" />
```

Common icons needed:
- Navigation: `home`, `folder`, `user`, `credit-card`, `file-document`, `log-out`, `menu`
- Actions: `add`, `edit`, `trash`, `check`, `close`, `more-vertical`
- Status: `check-o`, `time`, `block`, `info`
- Files: `file`, `image`, `link`

### 6.5 Spacing

Use Tailwind defaults:
- Component padding: `p-4` or `p-6`
- Card gaps: `gap-4` or `gap-6`
- Section spacing: `space-y-6` or `space-y-8`
- Tight lists: `space-y-2`

### 6.6 Component Patterns

**Cards**
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  {children}
</div>
```

**Buttons**
```tsx
// Primary
<button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium">
  Save
</button>

// Secondary
<button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
  Cancel
</button>

// Ghost
<button className="hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm">
  <Icon name="edit" />
</button>
```

**Status Badges**
```tsx
const statusColors = {
  active: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-gray-100 text-gray-800',
  blocked: 'bg-red-100 text-red-800',
};

<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
  {status}
</span>
```

**Inputs**
```tsx
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
             focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
/>
```

---

## 7. Auth Implementation

### 7.1 Admin Auth (Supabase)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/onboard') ||
    pathname.startsWith('/project') ||
    pathname.startsWith('/api/onboarding') ||
    pathname.startsWith('/api/client-dashboard')
  ) {
    return NextResponse.next();
  }
  
  // Check admin auth for admin routes
  const response = NextResponse.next();
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 7.2 Client Dashboard Auth

```typescript
// lib/utils/password.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.CLIENT_JWT_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateClientToken(projectId: string): string {
  return jwt.sign({ projectId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyClientToken(token: string): { projectId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { projectId: string };
  } catch {
    return null;
  }
}

export function generateDashboardPassword(slug: string): string {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 3);
  return `${slug}-${nanoid()}`;
}
```

---

## 8. Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Client Dashboard JWT
CLIENT_JWT_SECRET=your-secret-key-min-32-chars

# App
NEXT_PUBLIC_APP_URL=https://ourchother.com
```

---

## 9. Deployment

### 9.1 Vercel Configuration

```json
// vercel.json (if needed)
{
  "framework": "nextjs"
}
```

### 9.2 Supabase Setup Checklist

1. Create project at supabase.com
2. Run SQL schema (Section 2.1)
3. Run seed data (Section 2.3)
4. Create storage buckets: `files`, `docs`
5. Set storage bucket policies (private)
6. Copy API keys to Vercel env vars
7. Enable email auth in Supabase Auth settings
8. Create admin user via Supabase dashboard

### 9.3 Domain Setup

1. Add `ourchother.com` to Vercel project
2. Configure DNS records per Vercel instructions
3. SSL auto-provisioned

---

## 10. Phase 1 Implementation Scope

For the initial client onboarding MVP, implement only:

**Database:**
- `clients` table
- `projects` table
- `milestones` table
- `tasks` table
- `client_tasks` table
- `onboarding_templates` table
- `onboarding_submissions` table

**Storage:**
- `files` bucket for onboarding uploads

**Pages:**
- `/login` — Admin login
- `/dashboard` — Simplified (just projects list + deadlines)
- `/projects` — List view
- `/projects/[id]` — Detail + edit
- `/projects/new` — Create project form
- `/onboarding` — Submissions list
- `/onboarding/submissions/[id]` — View + convert
- `/onboard/[template]/[id]` — Public form
- `/project/[slug]` — Client dashboard

**API Routes:**
- `/api/auth/session`
- `/api/projects` (CRUD)
- `/api/milestones` (CRUD)
- `/api/tasks` (CRUD)
- `/api/client-tasks` (CRUD + file upload)
- `/api/clients` (CRUD)
- `/api/onboarding/templates/[slug]` (GET)
- `/api/onboarding/submissions` (GET, POST)
- `/api/onboarding/submissions/[id]` (GET)
- `/api/onboarding/submissions/[id]/convert` (POST)
- `/api/onboarding/upload` (POST)
- `/api/client-dashboard/auth` (POST)
- `/api/client-dashboard/[slug]` (GET)
- `/api/client-dashboard/[slug]/tasks/[id]/complete` (POST)

---

*End of Architecture Document*
