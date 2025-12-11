'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardContent, Input, Badge } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Client, Project } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

interface ClientWithProjects extends Client {
  projects?: Project[]
}

const statusVariant = {
  pending: 'warning',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  cancelled: 'error',
} as const

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<ClientWithProjects | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })

  const isOurchother = id === OURCHOTHER_CLIENT_ID

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${id}`)
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching client:', error.message)
        return
      }

      setClient(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
      })
    } catch (err) {
      console.error('Failed to fetch client:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const { error } = await res.json()

      if (error) {
        console.error('Error updating client:', error.message)
        return
      }

      setEditing(false)
      fetchClient()
    } catch (err) {
      console.error('Failed to update client:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      const { error } = await res.json()

      if (error) {
        console.error('Error deleting client:', error.message)
        return
      }

      router.push('/clients')
    } catch (err) {
      console.error('Failed to delete client:', err)
    } finally {
      setDeleting(false)
    }
  }

  // Calculate total project value
  const totalProjectValue = client?.projects?.reduce(
    (sum, p) => sum + (p.project_value || 0),
    0
  ) || 0

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <Link href="/clients">
          <Button variant="secondary" className="mt-4">
            Back to Clients
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/clients" className="hover:text-accent">
            Clients
          </Link>
          <span>/</span>
          <span>{client.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {isOurchother && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                Internal
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {!isOurchother && (
              <>
                <Button variant="secondary" onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  variant="secondary"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <h3 className="font-semibold text-red-800">Delete Client</h3>
            <p className="text-sm text-red-700 mt-1">
              Are you sure you want to delete this client? This action cannot be undone.
              {(client.projects?.length || 0) > 0 && (
                <span className="block mt-2 font-medium">
                  Warning: This client has {client.projects?.length} project(s) that will be
                  unlinked.
                </span>
              )}
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Client Details */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Client Details</h2>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                      label="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        <a href={`mailto:${client.email}`} className="text-accent hover:underline">
                          {client.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{client.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{client.company || '—'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-400">
                      Client since {formatDate(client.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects List */}
          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projects</h2>
              <Link href={`/projects/new?client_id=${client.id}`}>
                <Button variant="secondary" className="text-sm">
                  + New Project
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {(client.projects?.length || 0) === 0 ? (
                <p className="text-gray-500 text-center py-4">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {client.projects?.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:border-accent transition-colors cursor-pointer">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <Badge variant={statusVariant[project.status]}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {project.project_value && (
                            <p className="font-medium text-gray-900">
                              {formatCurrency(project.project_value)}
                            </p>
                          )}
                          {project.target_end_date && (
                            <p className="text-xs text-gray-500">
                              Target: {formatDate(project.target_end_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {client.projects?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Project Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalProjectValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="text-2xl font-bold text-accent">
                    {client.projects?.filter((p) => p.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
