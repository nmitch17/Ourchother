'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardHeader, CardContent, Input, Textarea, Select } from '@/components/ui'
import type { Client, ProjectStatus } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

export default function NewProjectPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdProject, setCreatedProject] = useState<{ id: string; slug: string; plain_password: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: 'pending' as ProjectStatus,
    description: '',
    deliverables: '',
    start_date: '',
    target_end_date: '',
    project_value: '',
    is_recurring: false,
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const { data } = await res.json()
      setClients(data || [])
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate client is selected
    if (!formData.client_id) {
      setError('Please select a client')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deliverables: formData.deliverables.split('\n').filter(Boolean),
          project_value: formData.project_value ? parseFloat(formData.project_value) : null,
        }),
      })

      const { data, error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      // Show the password before redirecting
      setCreatedProject({
        id: data.id,
        slug: data.slug,
        plain_password: data.plain_password,
      })
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  // Show password screen after creation
  if (createdProject) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-green-600">Project Created Successfully!</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">
                Important: Save this password now!
              </p>
              <p className="text-xs text-amber-700 mb-4">
                This is the only time you will see the client dashboard password.
                Share it with your client so they can access their project portal.
              </p>
              <div className="bg-white rounded border border-amber-300 p-3">
                <p className="text-sm text-gray-500 mb-1">Client Dashboard Password:</p>
                <code className="text-lg font-mono font-bold text-gray-900 select-all">
                  {createdProject.plain_password}
                </code>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Dashboard URL:</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded block select-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/project/{createdProject.slug}
              </code>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  const text = `Dashboard URL: ${window.location.origin}/project/${createdProject.slug}\nPassword: ${createdProject.plain_password}`
                  navigator.clipboard.writeText(text)
                  alert('Copied to clipboard!')
                }}
              >
                Copy Details
              </Button>
              <Link href={`/projects/${createdProject.id}`} className="flex-1">
                <Button className="w-full">Go to Project</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/projects" className="text-gray-500 hover:text-gray-700">
            Projects
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700">New Project</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>

              <Input
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign"
                required
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'active', label: 'Active' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project..."
              />
            </div>

            {/* Client */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Client</h3>

              <Select
                label="Client"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                options={[
                  { value: '', label: 'Select a client...' },
                  // Sort clients to show Ourchother (Internal) at top
                  ...clients
                    .sort((a, b) => {
                      if (a.id === OURCHOTHER_CLIENT_ID) return -1
                      if (b.id === OURCHOTHER_CLIENT_ID) return 1
                      return a.name.localeCompare(b.name)
                    })
                    .map((c) => ({
                      value: c.id,
                      label: c.id === OURCHOTHER_CLIENT_ID
                        ? 'Ourchother (Internal)'
                        : c.company
                          ? `${c.name} (${c.company})`
                          : c.name,
                    })),
                ]}
              />

              {clients.length === 0 && (
                <p className="text-sm text-gray-500">
                  No clients yet. <Link href="/clients" className="text-accent hover:underline">Create a client</Link> first.
                </p>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Timeline</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <Input
                  label="Target End Date"
                  type="date"
                  value={formData.target_end_date}
                  onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Deliverables & Value */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Deliverables & Value</h3>

              <Textarea
                label="Deliverables (one per line)"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                placeholder="Homepage design&#10;Inner page templates&#10;Mobile responsive version"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Project Value ($)"
                  type="number"
                  value={formData.project_value}
                  onChange={(e) => setFormData({ ...formData, project_value: e.target.value })}
                  placeholder="5000"
                />
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Recurring revenue</span>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/projects" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
