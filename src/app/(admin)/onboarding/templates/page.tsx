'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardContent, Badge, Input } from '@/components/ui'
import { formatDate, generateId } from '@/lib/utils'
import type { OnboardingTemplate } from '@/types'

export default function OnboardingTemplatesPage() {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      // Fetch templates using the existing API
      const res = await fetch('/api/onboarding/templates/web-design')
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching templates:', error.message)
        return
      }

      // For now, we only have the web-design template
      // When templates list API is built, this will fetch all templates
      setTemplates(data ? [data] : [])
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateLink = (template: OnboardingTemplate) => {
    const uniqueId = generateId()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${baseUrl}/onboard/${template.slug}/${uniqueId}`
    setGeneratedLinks((prev) => ({ ...prev, [template.id]: link }))
    return link
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Templates</h1>
          <p className="text-gray-500 mt-1">
            Manage onboarding form templates and generate shareable links
          </p>
        </div>
      </div>

      {/* Quick Link Generator */}
      <Card className="mb-6 bg-accent-light border-accent">
        <CardContent className="py-4">
          <h2 className="font-semibold text-gray-900 mb-3">Quick Link Generator</h2>
          <p className="text-sm text-gray-600 mb-4">
            Generate a unique onboarding link to share with your client. Each link is unique and
            tracks submissions separately.
          </p>

          {templates.map((template) => (
            <div key={template.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{template.name}:</span>
              {generatedLinks[template.id] ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={generatedLinks[template.id]}
                    readOnly
                    className="flex-1 text-sm font-mono bg-white"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(generatedLinks[template.id], template.id)}
                  >
                    {copiedId === template.id ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="secondary" onClick={() => generateLink(template)}>
                    New Link
                  </Button>
                </div>
              ) : (
                <Button onClick={() => generateLink(template)}>Generate Link</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Templates List */}
      <h2 className="text-lg font-semibold mb-4">All Templates</h2>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No templates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <Badge variant={template.is_active ? 'success' : 'default'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    )}

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{template.fields.length}</span> fields
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.fields.map((field) => (
                          <span
                            key={field.name}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Created {formatDate(template.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href={`/onboard/${template.slug}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" className="w-full">
                        Preview
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Coming Soon Notice */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#9432;</span>
            <div>
              <h3 className="font-semibold text-blue-900">Template Builder Coming Soon</h3>
              <p className="text-sm text-blue-700 mt-1">
                A visual template builder for creating and editing onboarding forms will be
                available in a future update. For now, templates can be managed directly in the
                database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
