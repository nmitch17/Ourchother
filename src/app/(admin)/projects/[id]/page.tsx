'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardHeader, CardContent, Badge, Input, Textarea, Select } from '@/components/ui'
import { formatDate, formatCurrency, formatRelativeTime, cn } from '@/lib/utils'
import type { Project, Milestone, Task, ClientTask, MilestoneStatus, TaskStatus, ClientTaskStatus, ClientTaskPriority, OnboardingSubmission } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

const statusVariant = {
  pending: 'warning',
  active: 'success',
  on_hold: 'warning',
  completed: 'default',
  cancelled: 'error',
} as const

const milestoneStatusVariant = {
  upcoming: 'default',
  in_progress: 'info',
  complete: 'success',
  blocked: 'error',
} as const

const taskStatusVariant = {
  todo: 'default',
  in_progress: 'info',
  complete: 'success',
  blocked: 'error',
} as const

const clientTaskPriorityVariant = {
  high: 'error',
  medium: 'warning',
  low: 'default',
} as const

interface Props {
  params: Promise<{ id: string }>
}

export default function ProjectDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'tasks' | 'client-tasks' | 'onboarding'>('overview')

  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showClientTaskModal, setShowClientTaskModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingClientTask, setEditingClientTask] = useState<ClientTask | null>(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      const { data, error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      setProject(data)
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      router.push('/projects')
    } catch (err) {
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Project not found'}</p>
        <Link href="/projects">
          <Button variant="secondary" className="mt-4">
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  const hasOnboardingData = project.onboarding_submissions && project.onboarding_submissions.length > 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/projects" className="text-gray-500 hover:text-gray-700">
              Projects
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{project.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge variant={statusVariant[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          {project.client && (
            <p className="text-gray-600 mt-1">
              Client: <Link href={`/clients/${project.client.id}`} className="text-accent hover:underline">
                {project.client.name}
              </Link>
              {project.client.company && ` (${project.client.company})`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            Import from Onboarding
          </Button>
          <Button variant="secondary" onClick={handleDeleteProject}>
            Delete
          </Button>
          <Link href={`/project/${project.slug}`} target="_blank">
            <Button variant="secondary">View Client Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {(['overview', 'milestones', 'tasks', 'client-tasks', 'onboarding'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab === 'client-tasks' ? 'Client Tasks' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'milestones' && project.milestones && (
                <span className="ml-1 text-gray-400">({project.milestones.length})</span>
              )}
              {tab === 'tasks' && project.tasks && (
                <span className="ml-1 text-gray-400">({project.tasks.length})</span>
              )}
              {tab === 'client-tasks' && project.client_tasks && (
                <span className="ml-1 text-gray-400">({project.client_tasks.length})</span>
              )}
              {tab === 'onboarding' && hasOnboardingData && (
                <span className="ml-1 text-green-600">●</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} onUpdate={fetchProject} />
      )}
      {activeTab === 'milestones' && (
        <MilestonesTab
          project={project}
          onUpdate={fetchProject}
          showModal={showMilestoneModal}
          setShowModal={setShowMilestoneModal}
          editingMilestone={editingMilestone}
          setEditingMilestone={setEditingMilestone}
        />
      )}
      {activeTab === 'tasks' && (
        <TasksTab
          project={project}
          onUpdate={fetchProject}
          showModal={showTaskModal}
          setShowModal={setShowTaskModal}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      )}
      {activeTab === 'client-tasks' && (
        <ClientTasksTab
          project={project}
          onUpdate={fetchProject}
          showModal={showClientTaskModal}
          setShowModal={setShowClientTaskModal}
          editingClientTask={editingClientTask}
          setEditingClientTask={setEditingClientTask}
        />
      )}
      {activeTab === 'onboarding' && (
        <OnboardingTab
          project={project}
          onImport={() => setShowImportModal(true)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportOnboardingModal
          projectId={project.id}
          existingSubmissionIds={(project.onboarding_submissions || []).map(s => s.id)}
          onClose={() => setShowImportModal(false)}
          onImported={fetchProject}
        />
      )}
    </div>
  )
}

// Import Onboarding Modal
function ImportOnboardingModal({
  projectId,
  existingSubmissionIds,
  onClose,
  onImported,
}: {
  projectId: string
  existingSubmissionIds: string[]
  onClose: () => void
  onImported: () => void
}) {
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    fetchAvailableSubmissions()
  }, [])

  const fetchAvailableSubmissions = async () => {
    try {
      // Fetch submissions that haven't been imported yet (no project_id)
      const res = await fetch('/api/onboarding/submissions')
      const { data } = await res.json()
      // Filter out already imported ones
      const available = (data || []).filter(
        (s: OnboardingSubmission) => !s.project_id || !existingSubmissionIds.includes(s.id)
      )
      setSubmissions(available)
    } catch (err) {
      console.error('Failed to fetch submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedId) return
    setImporting(true)

    try {
      const res = await fetch(`/api/projects/${projectId}/import-onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: selectedId }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onImported()
      onClose()
    } catch (err) {
      alert('Failed to import onboarding data')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Import from Onboarding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Select an onboarding submission to import into this project. The submission data will be linked and viewable in the Onboarding tab.
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No available submissions to import</p>
              <p className="text-sm mt-1">All submissions have already been imported or there are none.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissions.map((submission) => (
                <label
                  key={submission.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors',
                    selectedId === submission.id
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="submission"
                    value={submission.id}
                    checked={selectedId === submission.id}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {submission.data?.name || submission.data?.business_name || 'Unnamed'}
                    </p>
                    {submission.data?.email && (
                      <p className="text-sm text-gray-500">{submission.data.email}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {submission.template?.name} • {formatRelativeTime(submission.submitted_at)}
                    </p>
                  </div>
                  <Badge variant={submission.status === 'pending' ? 'warning' : 'default'}>
                    {submission.status}
                  </Badge>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedId || importing}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Onboarding Tab
function OnboardingTab({
  project,
  onImport,
}: {
  project: Project
  onImport: () => void
}) {
  const submissions = project.onboarding_submissions || []

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-500 mb-2">No onboarding data imported</p>
          <p className="text-sm text-gray-400 mb-4">
            Import data from an onboarding submission to view it here
          </p>
          <Button variant="secondary" onClick={onImport}>
            Import from Onboarding
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="font-semibold">
                {submission.template?.name || 'Onboarding Submission'}
              </h2>
              <p className="text-sm text-gray-500">
                Submitted {formatRelativeTime(submission.submitted_at)}
              </p>
            </div>
            <Link href={`/onboarding/submissions/${submission.id}`}>
              <Button variant="ghost" size="sm">
                View Full Submission →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(submission.data || {}).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-900">
                    {typeof value === 'object'
                      ? JSON.stringify(value, null, 2)
                      : String(value) || '—'}
                  </p>
                </div>
              ))}
            </div>

            {submission.files && submission.files.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">Attached Files</p>
                <ul className="space-y-1">
                  {submission.files.map((file, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📎</span>
                      <a
                        href={`/api/files/${encodeURIComponent(file)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline truncate"
                      >
                        {file.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="text-center">
        <Button variant="secondary" onClick={onImport}>
          Import Another Submission
        </Button>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status,
    start_date: project.start_date || '',
    target_end_date: project.target_end_date || '',
    project_value: project.project_value?.toString() || '',
    deliverables: project.deliverables?.join('\n') || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_value: formData.project_value ? parseFloat(formData.project_value) : null,
          deliverables: formData.deliverables.split('\n').filter(Boolean),
        }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      setIsEditing(false)
      onUpdate()
    } catch (err) {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Project Details</h2>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <Input
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'active', label: 'Active' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
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
              <Input
                label="Project Value ($)"
                type="number"
                value={formData.project_value}
                onChange={(e) => setFormData({ ...formData, project_value: e.target.value })}
              />
              <Textarea
                label="Deliverables (one per line)"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              />
            </>
          ) : (
            <>
              {project.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{project.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <Badge variant={project.client_id === OURCHOTHER_CLIENT_ID ? 'default' : 'info'}>
                    {project.client_id === OURCHOTHER_CLIENT_ID ? 'Internal' : 'Client Project'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="text-gray-900">
                    {project.start_date ? formatDate(project.start_date) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Target End Date</p>
                  <p className="text-gray-900">
                    {project.target_end_date ? formatDate(project.target_end_date) : 'Not set'}
                  </p>
                </div>
              </div>
              {project.project_value && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Value</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    {formatCurrency(project.project_value)}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Deliverables</h2>
        </CardHeader>
        <CardContent>
          {project.deliverables && project.deliverables.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {project.deliverables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No deliverables defined</p>
          )}
        </CardContent>
      </Card>

      <ClientDashboardCard project={project} />
    </div>
  )
}

// Client Dashboard Card with URL and Password
function ClientDashboardCard({ project }: { project: Project }) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const portalUrl = `${baseUrl}/project/${project.slug}`

  const copyToClipboard = async (text: string, type: 'url' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'url') {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Client Dashboard</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Dashboard URL</p>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline truncate"
              >
                {portalUrl}
              </a>
              <button
                onClick={() => copyToClipboard(portalUrl, 'url')}
                className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Copy URL"
              >
                {copiedUrl ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Password</p>
            <div className="flex items-center gap-2 mt-1">
              {project.dashboard_password ? (
                <>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {project.dashboard_password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(project.dashboard_password!, 'password')}
                    className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Copy password"
                  >
                    {copiedPassword ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-400 italic">No password set</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Share the dashboard URL and password with your client to give them access to their project portal.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Milestones Tab
function MilestonesTab({
  project,
  onUpdate,
  showModal,
  setShowModal,
  editingMilestone,
  setEditingMilestone,
}: {
  project: Project
  onUpdate: () => void
  showModal: boolean
  setShowModal: (show: boolean) => void
  editingMilestone: Milestone | null
  setEditingMilestone: (milestone: Milestone | null) => void
}) {
  const milestones = project.milestones || []

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <Button size="sm" onClick={() => { setEditingMilestone(null); setShowModal(true) }}>
          + Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No milestones yet</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => { setEditingMilestone(null); setShowModal(true) }}
            >
              Add your first milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{milestone.name}</h3>
                      <Badge variant={milestoneStatusVariant[milestone.status]}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    )}
                    {milestone.due_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {formatDate(milestone.due_date)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingMilestone(milestone); setShowModal(true) }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <MilestoneModal
          projectId={project.id}
          milestone={editingMilestone}
          onClose={() => { setShowModal(false); setEditingMilestone(null) }}
          onSaved={onUpdate}
        />
      )}
    </div>
  )
}

// Milestone Modal
function MilestoneModal({
  projectId,
  milestone,
  onClose,
  onSaved,
}: {
  projectId: string
  milestone: Milestone | null
  onClose: () => void
  onSaved: () => void
}) {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    status: milestone?.status || 'upcoming',
    due_date: milestone?.due_date || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = milestone
        ? `/api/milestones/${milestone.id}`
        : '/api/milestones'
      const method = milestone ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
        }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to save milestone')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!milestone || !confirm('Delete this milestone?')) return

    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, { method: 'DELETE' })
      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to delete milestone')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">{milestone ? 'Edit Milestone' : 'New Milestone'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MilestoneStatus })}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'complete', label: 'Complete' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <div className="flex justify-between pt-2">
              {milestone && (
                <Button type="button" variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Tasks Tab
function TasksTab({
  project,
  onUpdate,
  showModal,
  setShowModal,
  editingTask,
  setEditingTask,
}: {
  project: Project
  onUpdate: () => void
  showModal: boolean
  setShowModal: (show: boolean) => void
  editingTask: Task | null
  setEditingTask: (task: Task | null) => void
}) {
  const tasks = project.tasks || []

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Internal Tasks</h2>
        <Button size="sm" onClick={() => { setEditingTask(null); setShowModal(true) }}>
          + Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No tasks yet</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => { setEditingTask(null); setShowModal(true) }}
            >
              Add your first task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'complete'}
                      onChange={async () => {
                        const newStatus = task.status === 'complete' ? 'todo' : 'complete'
                        await fetch(`/api/tasks/${task.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: newStatus }),
                        })
                        onUpdate()
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={task.status === 'complete' ? 'line-through text-gray-400' : ''}>
                          {task.title}
                        </span>
                        <Badge variant={taskStatusVariant[task.status]} className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-400 mt-1">Due: {formatDate(task.due_date)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingTask(task); setShowModal(true) }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          projectId={project.id}
          milestones={project.milestones || []}
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
          onSaved={onUpdate}
        />
      )}
    </div>
  )
}

// Task Modal
function TaskModal({
  projectId,
  milestones,
  task,
  onClose,
  onSaved,
}: {
  projectId: string
  milestones: Milestone[]
  task: Task | null
  onClose: () => void
  onSaved: () => void
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    milestone_id: task?.milestone_id || '',
    due_date: task?.due_date || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = task ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
          milestone_id: formData.milestone_id || null,
        }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm('Delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'complete', label: 'Complete' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
            {milestones.length > 0 && (
              <Select
                label="Milestone (optional)"
                value={formData.milestone_id}
                onChange={(e) => setFormData({ ...formData, milestone_id: e.target.value })}
                options={[
                  { value: '', label: 'No milestone' },
                  ...milestones.map((m) => ({ value: m.id, label: m.name })),
                ]}
              />
            )}
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <div className="flex justify-between pt-2">
              {task && (
                <Button type="button" variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Client Tasks Tab
function ClientTasksTab({
  project,
  onUpdate,
  showModal,
  setShowModal,
  editingClientTask,
  setEditingClientTask,
}: {
  project: Project
  onUpdate: () => void
  showModal: boolean
  setShowModal: (show: boolean) => void
  editingClientTask: ClientTask | null
  setEditingClientTask: (task: ClientTask | null) => void
}) {
  const clientTasks = project.client_tasks || []

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Client Tasks</h2>
          <p className="text-sm text-gray-500">Tasks visible to and completable by the client</p>
        </div>
        <Button size="sm" onClick={() => { setEditingClientTask(null); setShowModal(true) }}>
          + Add Client Task
        </Button>
      </div>

      {clientTasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No client tasks yet</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => { setEditingClientTask(null); setShowModal(true) }}
            >
              Add your first client task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clientTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {task.status === 'completed' && (
                        <span className="text-green-600">✓</span>
                      )}
                      <h3 className={cn('font-medium', task.status === 'completed' && 'line-through text-gray-400')}>
                        {task.title}
                      </h3>
                      <Badge variant={clientTaskPriorityVariant[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'blocked' ? 'error' : 'warning'}>
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.status_note && (
                      <p className="text-sm text-amber-600 mt-1">Note: {task.status_note}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-500 mt-1">Due: {formatDate(task.due_date)}</p>
                    )}
                    {task.completed_at && (
                      <p className="text-xs text-green-600 mt-1">Completed: {formatDate(task.completed_at)}</p>
                    )}
                    {task.links && task.links.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {task.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent hover:underline"
                          >
                            {link.label} →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingClientTask(task); setShowModal(true) }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <ClientTaskModal
          projectId={project.id}
          task={editingClientTask}
          onClose={() => { setShowModal(false); setEditingClientTask(null) }}
          onSaved={onUpdate}
        />
      )}
    </div>
  )
}

// Client Task Modal
function ClientTaskModal({
  projectId,
  task,
  onClose,
  onSaved,
}: {
  projectId: string
  task: ClientTask | null
  onClose: () => void
  onSaved: () => void
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    status_note: task?.status_note || '',
    due_date: task?.due_date || '',
    links: task?.links || [],
  })
  const [saving, setSaving] = useState(false)
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  const handleAddLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setFormData({
        ...formData,
        links: [...formData.links, { label: newLinkLabel, url: newLinkUrl }],
      })
      setNewLinkLabel('')
      setNewLinkUrl('')
    }
  }

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = task ? `/api/client-tasks/${task.id}` : '/api/client-tasks'
      const method = task ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
        }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to save client task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm('Delete this client task?')) return

    try {
      const res = await fetch(`/api/client-tasks/${task.id}`, { method: 'DELETE' })
      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      onSaved()
      onClose()
    } catch (err) {
      alert('Failed to delete client task')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-lg mx-4 my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">{task ? 'Edit Client Task' : 'New Client Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ClientTaskPriority })}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientTaskStatus })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'blocked', label: 'Blocked' },
                ]}
              />
            </div>
            <Input
              label="Status Note (shown to client)"
              value={formData.status_note}
              onChange={(e) => setFormData({ ...formData, status_note: e.target.value })}
              placeholder="e.g., Waiting for content from you"
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />

            {/* Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Links</label>
              {formData.links.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded">
                      <span className="flex-1">{link.label}: {link.url}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddLink}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              {task && (
                <Button type="button" variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
