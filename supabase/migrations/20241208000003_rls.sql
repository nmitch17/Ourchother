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
