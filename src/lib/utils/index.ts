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
const nanoid4digits = customAlphabet('0123456789', 4)

export function generateId(length: 6 | 3 = 6): string {
  return nanoid6()
}

// Generate URL-safe slugs from text
export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true })
}

// Generate dashboard password like "project-name-1234"
export function generateDashboardPassword(projectSlug: string): string {
  return `${projectSlug}-${nanoid4digits()}`
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
