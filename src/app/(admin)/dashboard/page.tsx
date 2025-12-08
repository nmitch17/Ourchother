'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent, Badge, Button } from '@/components/ui'
import { formatDate, formatRelativeTime, formatCurrency } from '@/lib/utils'
import type { Project, OnboardingSubmission, Task, Milestone, ClientTask } from '@/types'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {/* Inbox Alert */}
      {inboxItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📬</span>
                <div>
                  <p className="font-medium text-amber-800">
                    {inboxItems.length} item{inboxItems.length > 1 ? 's' : ''} need your attention
                  </p>
                  <p className="text-sm text-amber-600">
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900">{activeProjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{pendingProjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Pipeline Value</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalProjectValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inbox / Action Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">Inbox</h2>
            <Link href="/onboarding" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {inboxItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-4xl mb-2">✨</p>
                <p>All caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {inboxItems.slice(0, 5).map((item) => (
                  <Link key={item.id} href={item.link}>
                    <div className="py-3 hover:bg-gray-50 -mx-4 px-4 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.title}</span>
                            {item.priority === 'high' && (
                              <Badge variant="error" className="text-xs">!</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        </div>
                        <span className="text-xs text-gray-400">
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
            <h2 className="font-semibold">Upcoming Deadlines</h2>
            <Link href="/projects" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-4xl mb-2">📅</p>
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="divide-y">
                {upcomingDeadlines.slice(0, 5).map((project) => {
                  const daysLeft = Math.ceil(
                    (new Date(project.target_end_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const isUrgent = daysLeft <= 7

                  return (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="py-3 hover:bg-gray-50 -mx-4 px-4 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{project.name}</p>
                            {project.client && (
                              <p className="text-xs text-gray-500">{project.client.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                            </p>
                            <p className="text-xs text-gray-400">
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
            <h2 className="font-semibold">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-4xl mb-2">📁</p>
                <p>No projects yet</p>
                <Link href="/projects/new">
                  <Button variant="secondary" size="sm" className="mt-3">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 font-medium">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projects.slice(0, 10).map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium text-gray-900 hover:text-accent"
                          >
                            {project.name}
                          </Link>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {project.client?.name || '—'}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant[project.status]} className="text-xs">
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {project.project_value ? formatCurrency(project.project_value) : '—'}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
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
