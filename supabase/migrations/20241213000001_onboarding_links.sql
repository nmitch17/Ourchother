-- ============================================
-- ONBOARDING LINKS (tracks generated links before submission)
-- ============================================
create table onboarding_links (
  id uuid primary key default gen_random_uuid(),
  link_id text unique not null, -- The unique ID in the URL (e.g., "0vqy4w")
  template_id uuid not null references onboarding_templates(id) on delete restrict,
  project_id uuid references projects(id) on delete set null,
  submission_id uuid references onboarding_submissions(id) on delete set null, -- Set when form is submitted
  created_at timestamptz default now()
);

create index idx_onboarding_links_link_id on onboarding_links(link_id);
create index idx_onboarding_links_project on onboarding_links(project_id);
create index idx_onboarding_links_template on onboarding_links(template_id);

-- Add website_url field to the web-design template
update onboarding_templates
set fields = fields || '[{"name": "website_url", "label": "Current Website URL", "type": "text", "required": false, "placeholder": "https://example.com (leave blank if none)"}]'::jsonb
where slug = 'web-design';
