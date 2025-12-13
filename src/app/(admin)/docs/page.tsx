'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Card, CardHeader, CardContent, Input, Badge } from '@/components/ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Document, Project } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface DocumentWithProject extends Document {
  project?: Pick<Project, 'id' | 'name' | 'slug'> | null
}

export default function DocsPage() {
  const [documents, setDocuments] = useState<DocumentWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDocForm, setShowNewDocForm] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: '',
    path: '',
    project_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [docsRes, projectsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/projects'),
      ])

      const docsData = await docsRes.json()
      const projectsData = await projectsRes.json()

      if (docsData.data) {
        setDocuments(docsData.data)
      }
      if (projectsData.data) {
        setProjects(projectsData.data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDoc.title,
          path: newDoc.path || newDoc.title.toLowerCase().replace(/\s+/g, '-'),
          project_id: newDoc.project_id || null,
        }),
      })

      const { error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      setNewDoc({ title: '', path: '', project_id: '' })
      setShowNewDocForm(false)
      fetchData()
    } catch (err) {
      setError('Failed to create document')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      const { error } = await res.json()

      if (error) {
        console.error('Error deleting document:', error.message)
        return
      }

      fetchData()
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase()
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.path.toLowerCase().includes(query) ||
      doc.project?.name?.toLowerCase().includes(query)
    )
  })

  // Group documents by project
  const unlinkedDocs = filteredDocuments.filter((d) => !d.project_id)
  const projectGroups = projects
    .map((project) => ({
      project,
      docs: filteredDocuments.filter((d) => d.project_id === project.id),
    }))
    .filter((g) => g.docs.length > 0)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Knowledge Base</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Documentation</h1>
          <p className="text-[var(--muted)] mt-1">Internal documentation and project files</p>
        </div>
        <Button onClick={() => setShowNewDocForm(true)}>+ New Document</Button>
      </div>

      {/* New Document Form */}
      {showNewDocForm && (
        <Card className="mb-6">
          <CardContent className="py-5">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)] mb-4`}>Create New Document</h2>
            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Title"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="e.g., Project Setup Guide"
                  required
                />
                <Input
                  label="Path (optional)"
                  value={newDoc.path}
                  onChange={(e) => setNewDoc({ ...newDoc, path: e.target.value })}
                  placeholder="e.g., guides/setup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Link to Project (optional)
                </label>
                <select
                  value={newDoc.project_id}
                  onChange={(e) => setNewDoc({ ...newDoc, project_id: e.target.value })}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-shadow duration-200 cursor-pointer"
                >
                  <option value="">No project (general documentation)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Document'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowNewDocForm(false)
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search documents by title, path, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[var(--muted)]">
              {searchQuery ? 'No documents match your search' : 'No documents yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setShowNewDocForm(true)}
              >
                Create your first document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* General Documents (not linked to any project) */}
          {unlinkedDocs.length > 0 && (
            <div>
              <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)] mb-3`}>General Documentation</h2>
              <div className="space-y-2">
                {unlinkedDocs.map((doc) => (
                  <Card key={doc.id} className="hover:border-[var(--accent)] transition-all hover-lift">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[var(--foreground)]">{doc.title}</h3>
                          <p className="text-sm text-[var(--muted)] font-mono">{doc.path}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[var(--muted)]">
                            Updated {formatRelativeTime(doc.updated_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Project-Linked Documents */}
          {projectGroups.map(({ project, docs }) => (
            <div key={project.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>{project.name}</h2>
                <Link href={`/projects/${project.id}`}>
                  <Badge variant="info">View Project</Badge>
                </Link>
              </div>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <Card key={doc.id} className="hover:border-[var(--accent)] transition-all hover-lift">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[var(--foreground)]">{doc.title}</h3>
                          <p className="text-sm text-[var(--muted)] font-mono">{doc.path}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[var(--muted)]">
                            Updated {formatRelativeTime(doc.updated_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coming Soon Notice */}
      <Card className="mt-6 bg-[var(--accent-light)] border-[var(--accent)]">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <h3 className={`${serif.className} text-lg font-medium text-[var(--accent-text)]`}>Markdown Editor Coming Soon</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                A full-featured markdown editor with preview, auto-save, and document linking will be
                available in a future update. For now, you can create and organize document entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
