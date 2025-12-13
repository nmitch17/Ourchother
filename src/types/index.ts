// ============================================
// CONSTANTS
// ============================================
export const OURCHOTHER_CLIENT_ID = '00000000-0000-0000-0000-000000000001'

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
  client_id: string
  type?: ProjectType
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
  onboarding_submissions?: OnboardingSubmission[]
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

export interface OnboardingLink {
  id: string
  link_id: string // The unique ID in the URL (e.g., "0vqy4w")
  template_id: string
  project_id: string | null
  submission_id: string | null // Set when form is submitted
  created_at: string
  // Relationships
  template?: OnboardingTemplate
  project?: Project
  submission?: OnboardingSubmission
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
  client_id: string
  type?: ProjectType
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
