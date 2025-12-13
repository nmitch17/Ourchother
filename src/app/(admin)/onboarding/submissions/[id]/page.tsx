'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardContent, Badge } from '@/components/ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { OnboardingSubmission, SubmissionStatus } from '@/types'

const statusVariant = {
  pending: 'warning',
  reviewed: 'info',
  converted: 'success',
} as const

interface Props {
  params: Promise<{ id: string }>
}

export default function SubmissionDetailPage({ params }: Props) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<OnboardingSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/onboarding/submissions/${id}`)
      const { data, error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      setSubmission(data)
    } catch (err) {
      setError('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: SubmissionStatus) => {
    try {
      const res = await fetch(`/api/onboarding/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const { error } = await res.json()

      if (error) {
        alert(error.message)
        return
      }

      fetchSubmission()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Submission not found'}</p>
        <Link href="/onboarding">
          <Button variant="secondary" className="mt-4">
            Back to Onboarding
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/onboarding" className="text-gray-500 hover:text-gray-700">
              Onboarding
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Submission</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.data?.name || submission.data?.business_name || 'Submission Details'}
            </h1>
            <Badge variant={statusVariant[submission.status]}>
              {submission.status}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            Submitted {formatRelativeTime(submission.submitted_at)}
            {submission.template && ` via ${submission.template.name}`}
          </p>
        </div>

        <div className="flex gap-2">
          {submission.status === 'pending' && (
            <Button variant="secondary" onClick={() => handleUpdateStatus('reviewed')}>
              Mark as Reviewed
            </Button>
          )}
          {submission.project && (
            <Link href={`/projects/${submission.project.id}`}>
              <Button>View Linked Project</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Imported Notice */}
      {submission.project && (
        <Card className="border-green-200 bg-green-50 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-medium text-green-800">
                    Imported to Project
                  </p>
                  <p className="text-sm text-green-600">
                    This submission has been linked to: <strong>{submission.project.name}</strong>
                  </p>
                </div>
              </div>
              <Link href={`/projects/${submission.project.id}`}>
                <Button size="sm">View Project →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Submission Data</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(submission.data || {}).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Files */}
          {submission.files && submission.files.length > 0 && (() => {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
            const images = submission.files.filter(file => {
              const ext = file.split('.').pop()?.toLowerCase()
              return ext && imageExtensions.includes(ext)
            })
            const otherFiles = submission.files.filter(file => {
              const ext = file.split('.').pop()?.toLowerCase()
              return !ext || !imageExtensions.includes(ext)
            })

            return (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">Attached Files</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((file, i) => (
                        <a
                          key={i}
                          href={`/api/files/${encodeURIComponent(file)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-accent transition-colors"
                        >
                          <img
                            src={`/api/files/${encodeURIComponent(file)}`}
                            alt={file.split('/').pop() || 'Uploaded image'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs truncate">
                              {file.split('/').pop()}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Other Files List */}
                  {otherFiles.length > 0 && (
                    <ul className="space-y-2">
                      {otherFiles.map((file, i) => (
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
                  )}
                </CardContent>
              </Card>
            )
          })()}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Metadata</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Submission ID</p>
                <p className="text-gray-900 font-mono text-sm">{submission.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted At</p>
                <p className="text-gray-900">{formatDate(submission.submitted_at)}</p>
              </div>
              {submission.template && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Template</p>
                  <p className="text-gray-900">{submission.template.name}</p>
                </div>
              )}
              {submission.project && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Linked Project</p>
                  <Link
                    href={`/projects/${submission.project.id}`}
                    className="text-accent hover:underline"
                  >
                    {submission.project.name}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Status</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                {submission.status === 'pending' && 'This submission is awaiting review.'}
                {submission.status === 'reviewed' && 'This submission has been reviewed and is ready to be imported into a project.'}
                {submission.status === 'converted' && 'This submission has been imported into a project.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={submission.status === 'pending' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus('pending')}
                  disabled={submission.status === 'pending' || submission.status === 'converted'}
                >
                  Pending
                </Button>
                <Button
                  variant={submission.status === 'reviewed' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleUpdateStatus('reviewed')}
                  disabled={submission.status === 'reviewed' || submission.status === 'converted'}
                >
                  Reviewed
                </Button>
                {submission.status === 'converted' && (
                  <Badge variant="success">Converted</Badge>
                )}
              </div>
              {!submission.project && submission.status !== 'converted' && (
                <p className="text-xs text-gray-500 mt-2">
                  To import this submission into a project, go to the project and use "Import from Onboarding".
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
