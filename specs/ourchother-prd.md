# Ourchother LLC Business Management Platform
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 7, 2024  
**Author:** Ourchother LLC  
**Domain:** ourchother.com

---

## 1. Executive Summary

Ourchother is an internal business management platform for Ourchother LLC, a company operating two business lines: revenue-generating affiliate websites (internal projects) and web development services for external clients. The platform centralizes project management, client onboarding, financial tracking, and internal documentation—with a foundation for AI agent automation using the Claude Code SDK.

**Immediate priority:** External client onboarding and project dashboard system.

---

## 2. Business Context

### 2.1 Business Lines

**Internal Projects (Affiliate Websites)**
- **CoinClarity.com** — Crypto information site, SEO traffic, revenue via exchange affiliate programs (Bybit, KuCoin, Kraken, etc.)
- **SmartHomePursuits.com** — Smart home content site, SEO traffic, revenue via Amazon Associates

**External Clients (Web Development Services)**
- Retainer client: $5,000/month ongoing web development
- Project-based clients: One-off builds (e.g., Squarespace design/build)

### 2.2 Current Pain Points
- No unified view of all projects and financials
- No standardized client onboarding process
- No client-facing project visibility
- Internal documentation scattered, not agent-accessible

---

## 3. Product Vision

A single platform that:
1. Onboards external clients with customizable intake forms
2. Provides clients read-only dashboards to track their project
3. Gives the business owner a unified view of all projects, finances, and deadlines
4. Stores internal documentation in markdown for human and AI agent consumption
5. Enables AI-powered automations via Claude Code SDK

---

## 4. User Roles

| Role | Description | Auth Method |
|------|-------------|-------------|
| **Admin** | Business owner (single user) | Supabase Auth (email/password or magic link) |
| **Client** | External clients viewing their project | Simple password (project-slug + nanoid) |

---

## 5. Feature Specifications

### 5.1 Client Onboarding System (P0 — Build First)

#### 5.1.1 Onboarding Form Builder
- Admin can create/edit onboarding form templates
- Standard fields (always present):
  - Client name
  - Email
  - Phone number
- Custom fields per template:
  - Text input
  - Textarea
  - File upload (images, PDFs)
  - URL input
  - Date picker
  - Multiple choice
  - Checkbox group
- Form templates saved and reusable

#### 5.1.2 Default Web Design Onboarding Template
Pre-built template for immediate use:
- Client name, email, phone (standard)
- Project name
- Project type (dropdown: Website Design, Website Build, Design + Build, Other)
- Platform preference (dropdown: Squarespace, WordPress, Custom, Other)
- Target launch date
- Budget range (dropdown)
- Project description (textarea)
- Inspiration links (repeatable URL field)
- Inspiration uploads (multi-file upload, images)
- Brand assets upload (logo, colors doc, fonts)
- Additional notes (textarea)

#### 5.1.3 Onboarding Flow
1. Admin generates unique onboarding link: `ourchother.com/onboard/[template-slug]/[nanoid-6]`
2. Client completes form (no auth required to submit)
3. Submission creates:
   - New project record
   - Client record (linked to project)
   - Client dashboard with auto-generated password
4. Admin receives notification (email or in-app)
5. Admin reviews submission, activates project

#### 5.1.4 Data Model: Onboarding

```
OnboardingTemplate {
  id: uuid
  slug: string
  name: string
  fields: json (field definitions)
  created_at: timestamp
  updated_at: timestamp
}

OnboardingSubmission {
  id: uuid
  template_id: uuid (FK)
  project_id: uuid (FK, nullable until project created)
  data: json (form responses)
  files: json (file URLs)
  status: enum (pending, reviewed, converted)
  submitted_at: timestamp
}
```

---

### 5.2 Client Dashboard (P0)

#### 5.2.1 Access
- URL: `ourchother.com/project/[project-slug]`
- Auth: Single password field
- Password format: `[project-slug]-[nanoid-3]` (e.g., `smith-website-x7k`)
- Session persists via cookie (7 days)

#### 5.2.2 Dashboard Contents
- **Project header:** Project name, client name, status badge
- **Action required banner:** If any client tasks are pending/blocked, show prominent alert
- **Client tasks section:** Tasks assigned to the client (e.g., "Create Squarespace account", "Register domain")
  - Shows: title, description, priority badge, due date, status
  - Optional: links (buttons), file attachments (viewable/downloadable screenshots, instructions)
  - Client can mark tasks complete
- **Summary section:** Project description, scope, key deliverables list
- **Timeline:** Start date, target completion, key milestones (visual timeline)
- **Milestones:** List with status (upcoming, in progress, complete, blocked)
- **Tasks:** Grouped by milestone, status indicators (internal tasks, read-only for client)

#### 5.2.3 Data Model: Projects & Tasks

```
Project {
  id: uuid
  slug: string (unique)
  name: string
  client_id: uuid (FK, nullable for internal projects)
  type: enum (internal, external)
  status: enum (pending, active, on_hold, completed, cancelled)
  description: text
  deliverables: json (array of strings)
  start_date: date
  target_end_date: date
  dashboard_password: string (hashed)
  created_at: timestamp
  updated_at: timestamp
}

Client {
  id: uuid
  name: string
  email: string
  phone: string
  company: string (nullable)
  created_at: timestamp
}

Milestone {
  id: uuid
  project_id: uuid (FK)
  name: string
  description: text
  due_date: date
  status: enum (upcoming, in_progress, complete, blocked)
  order: int
  created_at: timestamp
}

Task {
  id: uuid
  project_id: uuid (FK)
  milestone_id: uuid (FK, nullable)
  title: string
  description: text
  status: enum (todo, in_progress, complete, blocked)
  due_date: date (nullable)
  order: int
  created_at: timestamp
  updated_at: timestamp
}

ClientTask {
  id: uuid
  project_id: uuid (FK)
  title: string
  description: text
  priority: enum (high, medium, low)
  status: enum (pending, completed, blocked)
  status_note: text (optional, freeform context like "Blocking design phase")
  due_date: date (nullable)
  links: json (array of {label, url})
  files: json (array of storage paths for screenshots/instructions)
  completed_at: timestamp (nullable)
  created_at: timestamp
  updated_at: timestamp
}


```

---

### 5.3 Admin Dashboard (P1)

#### 5.3.1 Main Dashboard View
- **Inbox:** Unified list of items needing attention, sorted by priority then due date
  - New onboarding submissions (unreviewed)
  - Client task completions (not yet acknowledged)
  - Overdue milestones/tasks
  - Blocked items
  - Each item links to relevant detail view
- **Projects overview:** All projects (internal + external) in card/list view
  - Filterable by type, status
  - Sortable by due date, name, status
  - Quick status badges, progress indicators
- **Financial snapshot:**
  - Current month: Revenue collected, expenses, net
  - Expected revenue (from project values + retainers)
  - Simple bar or line chart (monthly trend)
- **Upcoming deadlines:** Next 14 days of milestone/task due dates across all projects

#### 5.3.2 Project Detail View (Admin)
- All client dashboard info, plus:
- Edit project details, milestones, tasks inline
- **Client tasks management:**
  - Create/edit/delete client tasks
  - Upload screenshots/instruction files
  - Add links with labels
  - Set priority, due date, status, status note
  - View completion status and timestamp
- View onboarding submission data
- Financial tracking per project:
  - Project value (one-time or recurring)
  - Invoices sent/paid
  - Expenses logged
- Internal notes (markdown, not visible to client)

#### 5.3.3 Clients List
- All clients with linked projects
- Contact info, total project value, status

#### 5.3.4 Onboarding Management
- List of all onboarding templates
- Create/edit templates
- View submissions (pending, reviewed, converted)
- Convert submission to project (pre-fills project creation form)

---

### 5.4 Financial Tracking (P1)

#### 5.4.1 Manual Entry (Phase 1)
- Income entries: amount, date, source, category, linked project (optional)
- Expense entries: amount, date, vendor, category, linked project (optional)
- Categories (configurable): Affiliate income, Client payment, Hosting, Software, Contractor, etc.

#### 5.4.2 Dashboard Widgets
- Monthly income vs expenses
- Income by category (pie chart)
- Project profitability (for external clients)

#### 5.4.3 Future: Plaid Integration (Phase 2)
- Connect bank accounts
- Auto-categorize transactions
- Match to projects

#### 5.4.4 Data Model: Financials

```
Transaction {
  id: uuid
  type: enum (income, expense)
  amount: decimal
  date: date
  description: string
  category: string
  project_id: uuid (FK, nullable)
  source: string (nullable, for income: "Amazon Affiliate", "Bybit", "Client Payment", etc.)
  vendor: string (nullable, for expenses)
  created_at: timestamp
}

RecurringRevenue {
  id: uuid
  project_id: uuid (FK, nullable)
  client_id: uuid (FK, nullable)
  amount: decimal
  frequency: enum (monthly, annual)
  description: string
  active: boolean
  created_at: timestamp
}
```

---

### 5.5 Internal Documentation System (P1)

#### 5.5.1 Purpose
- Central knowledge base for internal processes
- Agent-readable markdown files for AI automation
- Project-specific and global documentation

#### 5.5.2 Features
- File tree sidebar (folders + files)
- Create, rename, move, delete files/folders
- Markdown editor with:
  - Syntax highlighting
  - Preview mode toggle (edit | preview | split)
  - Basic toolbar (headings, bold, italic, links, code blocks, lists)
- Auto-save (debounced)
- Search across all docs

#### 5.5.3 Structure
```
/docs
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
      seo-strategy.md
    /smarthomepursuits
      overview.md
      content-calendar.md
    /[client-project-slug]
      notes.md
      requirements.md
```

#### 5.5.4 Data Model: Documentation

Files stored in Supabase Storage at `/docs/*`. Metadata indexed in database for search and relationships.

```
Document {
  id: uuid
  path: string (unique, mirrors storage path, e.g., "internal/processes/client-onboarding.md")
  title: string
  project_id: uuid (FK, nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

Content lives in Storage, not the database. Claude Code SDK operates on actual files.

---

### 5.6 AI Agent Foundation (P2)

#### 5.6.1 Architecture
- Claude Code SDK integration
- Agent has access to:
  - `/docs` file tree (read/write)
  - Project data via API
  - Defined tools/actions

#### 5.6.2 Initial Use Cases
- Generate project documentation from onboarding submissions
- Draft project updates
- Summarize project status
- Search internal docs for context

#### 5.6.3 Future Use Cases
- Monitor affiliate dashboards (via scraping or APIs)
- Auto-generate financial reports
- SEO monitoring and alerts for internal projects
- Task suggestions based on project timeline

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Icons | css.gg |
| Backend | Next.js API Routes + Supabase |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin), custom simple auth (clients) |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| AI | Claude Code SDK / Anthropic API |

### 6.2 Project Structure

```
/app
  /(admin)
    /dashboard
    /projects
      /[id]
    /clients
    /onboarding
      /templates
      /submissions
    /finances
    /docs
  /(client)
    /project/[slug]
  /(public)
    /onboard/[template]/[id]
  /api
    /projects
    /clients
    /onboarding
    /transactions
    /documents
/components
  /ui (shared components)
  /admin
  /client
  /forms
/lib
  /supabase
  /utils
  /hooks
/types
```

### 6.3 Database Schema (Supabase)

Tables:
- `clients`
- `projects`
- `milestones`
- `tasks`
- `onboarding_templates`
- `onboarding_submissions`
- `transactions`
- `recurring_revenue`
- `documents` (metadata table, actual files in Supabase Storage)

RLS Policies:
- Admin: Full access (authenticated user with admin role)
- Client dashboard: Read-only on own project (via password session token)

### 6.4 Auth Flow

**Admin:**
1. `/login` — Supabase Auth (email + password)
2. Middleware checks auth, redirects if not authenticated
3. Single admin user (no roles needed initially)

**Client:**
1. `/project/[slug]` — Password form
2. Validate password against hashed `dashboard_password` in project
3. Set HTTP-only cookie with signed token (project_id, expiry)
4. Middleware validates token on subsequent requests

---

## 7. UI/UX Guidelines

### 7.1 Design Principles
- Clean, minimal, professional
- High information density without clutter
- Fast, responsive interactions
- Mobile-friendly (admin and client dashboards)

### 7.2 Component Library
- Build on top of Tailwind
- Use css.gg icons consistently
- Consistent spacing scale (Tailwind defaults)
- Color palette: Neutral base, single accent color, semantic colors for status

### 7.3 Key UI Patterns
- Cards for project summaries
- Tables for lists (tasks, transactions)
- Slide-over panels for quick edits
- Modal dialogs for confirmations/forms
- Toast notifications for feedback
- Skeleton loaders for async content

---

## 8. Roadmap & Milestones

### Phase 1: Client System MVP (Target: 1 week)
- [ ] Project setup (Next.js, Supabase, Vercel)
- [ ] Database schema (projects, clients, milestones, tasks, updates)
- [ ] Admin auth (Supabase)
- [ ] Onboarding form (hardcoded web design template)
- [ ] Onboarding submission handling
- [ ] Client dashboard (password auth, project view)
- [ ] Admin: Create/edit projects manually
- [ ] Admin: View onboarding submissions

**Deliverable:** Functional onboarding link to send to Squarespace client.

### Phase 2: Admin Dashboard (Target: +1 week)
- [ ] Admin dashboard home (inbox, projects overview, upcoming deadlines)
- [ ] Project detail view with inline editing
- [ ] Milestones and tasks CRUD
- [ ] Client tasks CRUD (with file uploads, links)
- [ ] Clients list view

### Phase 2.5: Dedicated Inbox (Target: +2-3 days)
- [ ] `/inbox` page with full inbox functionality
- [ ] Filters (type, project, priority)
- [ ] Bulk actions (acknowledge, dismiss)
- [ ] Mark items as seen/handled

### Phase 3: Financials (Target: +1 week)
- [ ] Transaction entry (income/expense)
- [ ] Financial dashboard widgets
- [ ] Project-level financial tracking
- [ ] Monthly reports view

### Phase 4: Documentation System (Target: +1 week)
- [ ] File tree UI
- [ ] Markdown editor with preview
- [ ] CRUD operations on docs
- [ ] Search

### Phase 5: Customization & Polish (Target: +1 week)
- [ ] Onboarding template builder (dynamic fields)
- [ ] Settings page
- [ ] Notification system (email on submission)
- [ ] UI polish, mobile optimization

### Phase 6: AI Integration (Target: +2 weeks)
- [ ] Claude Code SDK setup
- [ ] Agent tooling for doc access
- [ ] Initial automations

---

## 9. Success Metrics

- Client can complete onboarding in <5 minutes
- Admin can create a project from submission in <2 minutes
- Dashboard loads in <1 second
- Client can understand project status without contacting admin
- All internal processes documented and agent-accessible

---

## 10. Open Questions / Future Considerations

1. **Contracts & Invoicing:** Integrate with service (Stripe Invoicing, QuickBooks) or build basic in-app?
2. **Time Tracking:** Needed for hourly projects?
3. **Client Messaging:** In-app messaging or keep external (email)?
4. **Multi-user:** If team grows, add roles (admin, contractor)?
5. **White-labeling:** Client dashboards with their branding?

---

## 11. Appendix

### A. Onboarding Form Fields — Web Design Template

| Field | Type | Required |
|-------|------|----------|
| Client Name | text | yes |
| Email | email | yes |
| Phone | tel | yes |
| Company/Business Name | text | no |
| Project Name | text | yes |
| Project Type | select | yes |
| Platform | select | no |
| Target Launch Date | date | yes |
| Budget Range | select | yes |
| Project Description | textarea | yes |
| Inspiration Links | url[] | no |
| Inspiration Images | file[] | no |
| Brand Assets | file[] | no |
| Additional Notes | textarea | no |

### B. Status Definitions

**Project Status:**
- `pending` — Created, not started
- `active` — Work in progress
- `on_hold` — Paused (client or internal)
- `completed` — Delivered and closed
- `cancelled` — Terminated

**Milestone/Task Status:**
- `upcoming` — Not started, future
- `in_progress` — Currently being worked on
- `complete` — Done
- `blocked` — Cannot proceed, dependency or issue

---

*End of PRD*
