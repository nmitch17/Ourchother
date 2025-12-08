-- ============================================
-- CLIENTS
-- ============================================
create table clients (
  id uuid primary key default gen_random_uuid(),
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

create index idx_projects_slug on projects(slug);
create index idx_projects_client on projects(client_id);
create index idx_projects_status on projects(status);

-- ============================================
-- MILESTONES
-- ============================================
create type milestone_status as enum ('upcoming', 'in_progress', 'complete', 'blocked');

create table milestones (
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

create index idx_milestones_project on milestones(project_id);

-- ============================================
-- TASKS
-- ============================================
create type task_status as enum ('todo', 'in_progress', 'complete', 'blocked');

create table tasks (
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

create index idx_tasks_project on tasks(project_id);
create index idx_tasks_milestone on tasks(milestone_id);

-- ============================================
-- CLIENT TASKS
-- ============================================
create type client_task_priority as enum ('high', 'medium', 'low');
create type client_task_status as enum ('pending', 'completed', 'blocked');

create table client_tasks (
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

create index idx_client_tasks_project on client_tasks(project_id);
create index idx_client_tasks_status on client_tasks(status);
create index idx_client_tasks_priority on client_tasks(priority);

-- ============================================
-- ONBOARDING TEMPLATES
-- ============================================
create table onboarding_templates (
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
create type submission_status as enum ('pending', 'reviewed', 'converted');

create table onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
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

create index idx_transactions_date on transactions(date);
create index idx_transactions_project on transactions(project_id);
create index idx_transactions_type on transactions(type);

-- ============================================
-- RECURRING REVENUE
-- ============================================
create type revenue_frequency as enum ('monthly', 'annual');

create table recurring_revenue (
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
create table documents (
  id uuid primary key default gen_random_uuid(),
  path text unique not null,
  title text not null,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_documents_path on documents(path);
create index idx_documents_project on documents(project_id);
