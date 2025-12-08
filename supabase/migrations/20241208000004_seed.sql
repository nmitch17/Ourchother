-- Seed Data: Web Design Template
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
