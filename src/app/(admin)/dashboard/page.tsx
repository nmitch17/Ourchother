'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Card, CardHeader, CardContent, Badge, Button } from '@/components/ui'
import { formatDate, formatRelativeTime, formatCurrency } from '@/lib/utils'
import type { Project, OnboardingSubmission, Task, Milestone, ClientTask } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const statusVariant = {
  pending: 'warning',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  cancelled: 'error',
} as const

interface InboxItem {
  id: string
  type: 'submission' | 'client_task_done' | 'overdue' | 'blocked'
  title: string
  subtitle: string
  timestamp: string
  link: string
  priority: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])

  useEffect(() => {
    Promise.all([fetchProjects(), fetchSubmissions()]).then(() => {
      setLoading(false)
    })
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const { data } = await res.json()
      setProjects(data || [])
      return data
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      return []
    }
  }

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/onboarding/submissions?status=pending')
      const { data } = await res.json()
      setSubmissions(data || [])

      // Convert pending submissions to inbox items
      const submissionItems: InboxItem[] = (data || []).map((s: OnboardingSubmission) => ({
        id: s.id,
        type: 'submission' as const,
        title: 'New submission',
        subtitle: s.data?.name || s.data?.business_name || 'Unnamed',
        timestamp: s.submitted_at,
        link: `/onboarding/submissions/${s.id}`,
        priority: 'high' as const,
      }))

      setInboxItems(submissionItems)
      return data
    } catch (err) {
      console.error('Failed to fetch submissions:', err)
      return []
    }
  }

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active')
  const pendingProjects = projects.filter(p => p.status === 'pending')
  const totalProjectValue = projects
    .filter(p => p.status === 'active' || p.status === 'pending')
    .reduce((sum, p) => sum + (p.project_value || 0), 0)

  // Get upcoming deadlines (projects with target_end_date within 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = projects
    .filter(p => {
      if (!p.target_end_date || p.status !== 'active') return false
      const endDate = new Date(p.target_end_date)
      return endDate >= today && endDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.target_end_date!).getTime() - new Date(b.target_end_date!).getTime())

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Overview</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Dashboard</h1>
        </div>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {/* Inbox Alert */}
      {inboxItems.length > 0 && (
        <Card className="border-[var(--accent)] bg-[var(--accent-light)] mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-1.595v4.168c0 1.035-.84 1.875-1.875 1.875H4.125A1.875 1.875 0 012.25 19.125V14.82m18.5 0h-5.625c-.621 0-1.125.504-1.125 1.125v3.659M5.25 10.055V6.75a1.125 1.125 0 011.125-1.125h3.375" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[var(--accent-text)]">
                    {inboxItems.length} item{inboxItems.length > 1 ? 's' : ''} need your attention
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {submissions.length} pending submission{submissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Link href="/onboarding">
                <Button size="sm">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Active Projects</p>
            <p className={`${serif.className} text-4xl font-medium text-[var(--foreground)]`}>{activeProjects.length}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Pending</p>
            <p className={`${serif.className} text-4xl font-medium text-[var(--accent)]`}>{pendingProjects.length}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Pipeline Value</p>
            <p className={`${serif.className} text-4xl font-medium text-emerald-600`}>{formatCurrency(totalProjectValue)}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Total Projects</p>
            <p className={`${serif.className} text-4xl font-medium text-[var(--foreground)]`}>{projects.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inbox / Action Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>Inbox</h2>
            <Link href="/onboarding" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {inboxItems.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[var(--muted)]">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {inboxItems.slice(0, 5).map((item) => (
                  <Link key={item.id} href={item.link}>
                    <div className="py-3 hover:bg-[var(--accent-light)] -mx-6 px-6 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)]">{item.title}</span>
                            {item.priority === 'high' && (
                              <Badge variant="error" className="text-xs">!</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[var(--muted)]">{item.subtitle}</p>
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>Upcoming Deadlines</h2>
            <Link href="/projects" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-[var(--muted)]">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {upcomingDeadlines.slice(0, 5).map((project) => {
                  const daysLeft = Math.ceil(
                    (new Date(project.target_end_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const isUrgent = daysLeft <= 7

                  return (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="py-3 hover:bg-[var(--accent-light)] -mx-6 px-6 cursor-pointer transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--foreground)]">{project.name}</p>
                            {project.client && (
                              <p className="text-xs text-[var(--muted)]">{project.client.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-[var(--muted)]'}`}>
                              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {formatDate(project.target_end_date!)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>Recent Projects</h2>
            <Link href="/projects" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <p className="text-[var(--muted)] mb-3">No projects yet</p>
                <Link href="/projects/new">
                  <Button variant="secondary" size="sm">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--muted)] uppercase tracking-wide border-b border-[var(--border)]">
                      <th className="pb-3 pl-6 font-medium">Project</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 pr-6 font-medium">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {projects.slice(0, 10).map((project) => (
                      <tr key={project.id} className="hover:bg-[var(--accent-light)] transition-colors">
                        <td className="py-3 pl-6">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                          >
                            {project.name}
                          </Link>
                        </td>
                        <td className="py-3 text-sm text-[var(--muted)]">
                          {project.client?.name || '—'}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant[project.status]} className="text-xs">
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-[var(--muted)]">
                          {project.project_value ? formatCurrency(project.project_value) : '—'}
                        </td>
                        <td className="py-3 pr-6 text-sm text-[var(--muted)]">
                          {project.target_end_date ? formatDate(project.target_end_date) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
