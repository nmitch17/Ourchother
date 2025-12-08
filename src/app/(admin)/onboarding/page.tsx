'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent, Badge, Button, Select } from '@/components/ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { OnboardingSubmission, SubmissionStatus } from '@/types'

const statusVariant = {
  pending: 'warning',
  reviewed: 'info',
  imported: 'success',
} as const

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'imported', label: 'Imported' },
]

export default function OnboardingPage() {
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/onboarding/submissions?${params.toString()}`)
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching submissions:', error.message)
        return
      }

      setSubmissions(data || [])
    } catch (err) {
      console.error('Failed to fetch submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group submissions by status for a quick overview
  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const reviewedCount = submissions.filter(s => s.status === 'reviewed').length
  const importedCount = submissions.filter(s => s.status === 'imported').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-500 mt-1">Review and manage client submissions</p>
        </div>
        <Link href="/onboarding/templates">
          <Button variant="secondary">Manage Templates</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Reviewed</p>
            <p className="text-2xl font-bold text-blue-600">{reviewedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Imported to Project</p>
            <p className="text-2xl font-bold text-green-600">{importedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No submissions yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Share your onboarding form link with potential clients
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Link key={submission.id} href={`/onboarding/submissions/${submission.id}`}>
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {submission.data?.name || submission.data?.business_name || 'Unnamed Submission'}
                        </h2>
                        <Badge variant={statusVariant[submission.status]}>
                          {submission.status}
                        </Badge>
                      </div>

                      {submission.template && (
                        <p className="text-sm text-gray-500 mt-1">
                          Form: {submission.template.name}
                        </p>
                      )}

                      {/* Display key form data */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {submission.data?.email && (
                          <span>{submission.data.email}</span>
                        )}
                        {submission.data?.phone && (
                          <span>{submission.data.phone}</span>
                        )}
                        {submission.data?.company && (
                          <span>{submission.data.company}</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                        <span>Submitted: {formatRelativeTime(submission.submitted_at)}</span>
                        {submission.files && submission.files.length > 0 && (
                          <span>{submission.files.length} file(s) attached</span>
                        )}
                      </div>

                      {submission.project && (
                        <div className="mt-2">
                          <Badge variant="success" className="text-xs">
                            Converted to: {submission.project.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {submission.status === 'pending' && (
                      <div className="text-amber-500 text-sm font-medium">
                        Needs Review
                      </div>
                    )}
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
