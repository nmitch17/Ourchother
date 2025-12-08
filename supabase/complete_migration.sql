-- ============================================
-- OURCHOTHER DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- CLIENTS
-- ============================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_clients_email on clients(email);

-- ============================================
-- PROJECTS
-- ============================================
DO $$ BEGIN
  create type project_type as enum ('internal', 'external');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type project_status as enum ('pending', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
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

create index if not exists idx_projects_slug on projects(slug);
create index if not exists idx_projects_client on projects(client_id);
create index if not exists idx_projects_status on projects(status);

-- ============================================
-- MILESTONES
-- ============================================
DO $$ BEGIN
  create type milestone_status as enum ('upcoming', 'in_progress', 'complete', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  status milestone_status not null default 'upcoming',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_milestones_project on milestones(project_id);

-- ============================================
-- TASKS
-- ============================================
DO $$ BEGIN
  create type task_status as enum ('todo', 'in_progress', 'complete', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
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

create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_milestone on tasks(milestone_id);

-- ============================================
-- CLIENT TASKS
-- ============================================
DO $$ BEGIN
  create type client_task_priority as enum ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type client_task_status as enum ('pending', 'completed', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists client_tasks (
  id uuid primary key default gen_random_uuid(),
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

create index if not exists idx_client_tasks_project on client_tasks(project_id);
create index if not exists idx_client_tasks_status on client_tasks(status);
create index if not exists idx_client_tasks_priority on client_tasks(priority);

-- ============================================
-- ONBOARDING TEMPLATES
-- ============================================
create table if not exists onboarding_templates (
  id uuid primary key default gen_random_uuid(),
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
DO $$ BEGIN
  create type submission_status as enum ('pending', 'reviewed', 'converted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references onboarding_templates(id) on delete restrict,
  project_id uuid references projects(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  files jsonb default '[]'::jsonb,
  status submission_status not null default 'pending',
  submitted_at timestamptz default now()
);

create index if not exists idx_submissions_template on onboarding_submissions(template_id);
create index if not exists idx_submissions_status on onboarding_submissions(status);

-- ============================================
-- TRANSACTIONS
-- ============================================
DO $$ BEGIN
  create type transaction_type as enum ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
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

create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_transactions_project on transactions(project_id);
create index if not exists idx_transactions_type on transactions(type);

-- ============================================
-- RECURRING REVENUE
-- ============================================
DO $$ BEGIN
  create type revenue_frequency as enum ('monthly', 'annual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

create table if not exists recurring_revenue (
  id uuid primary key default gen_random_uuid(),
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
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  path text unique not null,
  title text not null,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_documents_path on documents(path);
create index if not exists idx_documents_project on documents(project_id);

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

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
DROP TRIGGER IF EXISTS milestones_updated_at ON milestones;
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS client_tasks_updated_at ON client_tasks;
DROP TRIGGER IF EXISTS onboarding_templates_updated_at ON onboarding_templates;
DROP TRIGGER IF EXISTS documents_updated_at ON documents;

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

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin full access" ON clients;
DROP POLICY IF EXISTS "Admin full access" ON projects;
DROP POLICY IF EXISTS "Admin full access" ON milestones;
DROP POLICY IF EXISTS "Admin full access" ON tasks;
DROP POLICY IF EXISTS "Admin full access" ON client_tasks;
DROP POLICY IF EXISTS "Admin full access" ON onboarding_templates;
DROP POLICY IF EXISTS "Admin full access" ON onboarding_submissions;
DROP POLICY IF EXISTS "Admin full access" ON transactions;
DROP POLICY IF EXISTS "Admin full access" ON recurring_revenue;
DROP POLICY IF EXISTS "Admin full access" ON documents;
DROP POLICY IF EXISTS "Public can submit onboarding" ON onboarding_submissions;
DROP POLICY IF EXISTS "Public can read active templates" ON onboarding_templates;

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

-- ============================================
-- SEED DATA
-- ============================================
-- Web Design Template (only insert if not exists)
INSERT INTO onboarding_templates (slug, name, description, fields)
SELECT 'web-design', 'Web Design Project', 'Onboarding form for website design and build projects',
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
WHERE NOT EXISTS (SELECT 1 FROM onboarding_templates WHERE slug = 'web-design');

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Remember to:
-- 1. Create storage buckets 'files' and 'docs' in Storage settings
-- 2. Create an admin user in Authentication > Users
