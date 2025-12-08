'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge, Select } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No projects found</p>
            <Link href="/projects/new">
              <Button variant="secondary" className="mt-4">
                Create your first project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">
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
                        <p className="text-sm text-gray-600 mt-1">
                          Client: {project.client.name}
                          {project.client.company && ` (${project.client.company})`}
                        </p>
                      )}

                      {project.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {project.start_date && (
                          <span>Start: {formatDate(project.start_date)}</span>
                        )}
                        {project.target_end_date && (
                          <span>Target: {formatDate(project.target_end_date)}</span>
                        )}
                        {project.project_value && (
                          <span className="font-medium text-gray-700">
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
