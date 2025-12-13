'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Card, CardHeader, CardContent, Badge, Button, Select } from '@/components/ui'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { OnboardingSubmission, OnboardingLink, SubmissionStatus } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const statusVariant = {
  pending: 'warning',
  reviewed: 'info',
  converted: 'success',
} as const

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'awaiting', label: 'Awaiting Response' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'converted', label: 'Converted' },
]

export default function OnboardingPage() {
  const [links, setLinks] = useState<OnboardingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchLinks()
  }, [statusFilter])

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/links')
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching links:', error.message)
        return
      }

      setLinks(data || [])
    } catch (err) {
      console.error('Failed to fetch links:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter links based on status
  const filteredLinks = links.filter(link => {
    if (!statusFilter) return true
    if (statusFilter === 'awaiting') return !link.submission_id
    if (link.submission) {
      return link.submission.status === statusFilter
    }
    return false
  })

  // Group links by status for a quick overview
  const awaitingCount = links.filter(l => !l.submission_id).length
  const pendingCount = links.filter(l => l.submission?.status === 'pending').length
  const reviewedCount = links.filter(l => l.submission?.status === 'reviewed').length
  const convertedCount = links.filter(l => l.submission?.status === 'converted').length

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Submissions</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Onboarding</h1>
          <p className="text-[var(--muted)] mt-1">Review and manage client submissions</p>
        </div>
        <Link href="/onboarding/templates">
          <Button variant="secondary">Manage Templates</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Awaiting Response</p>
            <p className={`${serif.className} text-4xl font-medium text-gray-500`}>{awaitingCount}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Pending Review</p>
            <p className={`${serif.className} text-4xl font-medium text-[var(--accent)]`}>{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Reviewed</p>
            <p className={`${serif.className} text-4xl font-medium text-blue-600`}>{reviewedCount}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="py-5">
            <p className="text-sm text-[var(--muted)] mb-1">Imported to Project</p>
            <p className={`${serif.className} text-4xl font-medium text-emerald-600`}>{convertedCount}</p>
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

      {/* Onboarding Forms List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      ) : filteredLinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-[var(--muted)]">No onboarding forms yet</p>
            <p className="text-sm text-[var(--muted)] mt-2">
              Generate a link from the Templates page to get started
            </p>
            <Link href="/onboarding/templates">
              <Button className="mt-4">Go to Templates</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link) => {
            const hasSubmission = !!link.submission_id
            const submission = link.submission

            return (
              <Card
                key={link.id}
                className={`transition-all ${hasSubmission ? 'hover:border-[var(--accent)] cursor-pointer hover-lift' : 'border-dashed'}`}
              >
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>
                          {hasSubmission
                            ? (submission?.data?.client_name || submission?.data?.name || 'Submission')
                            : (link.project?.client?.name || 'Awaiting Response')
                          }
                        </h2>
                        {hasSubmission ? (
                          <Badge variant={statusVariant[submission?.status || 'pending']}>
                            {submission?.status}
                          </Badge>
                        ) : (
                          <Badge variant="default">awaiting</Badge>
                        )}
                      </div>

                      {/* Template and project info */}
                      <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-[var(--muted)]">
                        {link.template && (
                          <span>Form: {link.template.name}</span>
                        )}
                        {link.project && (
                          <span>• Project: {link.project.name}</span>
                        )}
                      </div>

                      {/* Submission data if available */}
                      {hasSubmission && submission?.data && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                          {submission.data.email && (
                            <span>{submission.data.email}</span>
                          )}
                          {submission.data.phone && (
                            <span>{submission.data.phone}</span>
                          )}
                          {submission.data.company && (
                            <span>{submission.data.company}</span>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted)]">
                        <span>Created: {formatRelativeTime(link.created_at)}</span>
                        {hasSubmission && submission?.submitted_at && (
                          <span>Submitted: {formatRelativeTime(submission.submitted_at)}</span>
                        )}
                        {submission?.files && submission.files.length > 0 && (
                          <span>{submission.files.length} file(s) attached</span>
                        )}
                      </div>

                      {/* Linked project badge */}
                      {link.project && hasSubmission && submission?.status === 'converted' && (
                        <div className="mt-2">
                          <Badge variant="success" className="text-xs">
                            Linked to: {link.project.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      {hasSubmission ? (
                        <>
                          {submission?.status === 'pending' && (
                            <div className="text-[var(--accent)] text-sm font-medium">
                              Needs Review
                            </div>
                          )}
                          <Link href={`/onboarding/submissions/${submission?.id}`}>
                            <Button variant="secondary" size="sm">View Submission</Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/onboard/${link.template?.slug}/${link.link_id}${link.project_id ? `?project=${link.project_id}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="secondary" size="sm">Open Form</Button>
                          </a>
                          <CopyLinkButton linkId={link.link_id} templateSlug={link.template?.slug} projectId={link.project_id} />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Copy Link Button Component
function CopyLinkButton({ linkId, templateSlug, projectId }: { linkId: string; templateSlug?: string; projectId?: string | null }) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    let link = `${baseUrl}/onboard/${templateSlug}/${linkId}`
    if (projectId) {
      link += `?project=${projectId}`
    }

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={copyLink}>
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  )
}
