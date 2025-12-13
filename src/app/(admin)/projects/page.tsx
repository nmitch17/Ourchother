'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Card, CardContent, Badge, Select } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

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

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const clientTypeOptions = [
  { value: '', label: 'All Projects' },
  { value: 'external', label: 'Client Projects' },
  { value: 'internal', label: 'Internal (Ourchother)' },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [clientTypeFilter, setClientTypeFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, clientTypeFilter])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      // Filter by client_id for internal/external distinction
      if (clientTypeFilter === 'internal') {
        params.set('client_id', OURCHOTHER_CLIENT_ID)
      } else if (clientTypeFilter === 'external') {
        params.set('exclude_client_id', OURCHOTHER_CLIENT_ID)
      }

      const res = await fetch(`/api/projects?${params.toString()}`)
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching projects:', error.message)
        return
      }

      setProjects(data || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to determine if project is internal
  const isInternalProject = (project: Project) => project.client_id === OURCHOTHER_CLIENT_ID

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Management</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Projects</h1>
        </div>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={clientTypeOptions}
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <p className="text-[var(--muted)] mb-3">No projects found</p>
            <Link href="/projects/new">
              <Button variant="secondary">
                Create your first project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-[var(--accent)] transition-all cursor-pointer hover-lift">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>
                          {project.name}
                        </h2>
                        <Badge variant={statusVariant[project.status]}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={isInternalProject(project) ? 'default' : 'info'}>
                          {isInternalProject(project) ? 'Internal' : 'Client'}
                        </Badge>
                      </div>

                      {project.client && (
                        <p className="text-sm text-[var(--muted)] mt-1">
                          Client: {project.client.name}
                          {project.client.company && ` (${project.client.company})`}
                        </p>
                      )}

                      {project.description && (
                        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-[var(--muted)]">
                        {project.start_date && (
                          <span>Start: {formatDate(project.start_date)}</span>
                        )}
                        {project.target_end_date && (
                          <span>Target: {formatDate(project.target_end_date)}</span>
                        )}
                        {project.project_value && (
                          <span className="font-medium text-[var(--foreground)]">
                            {formatCurrency(project.project_value)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
