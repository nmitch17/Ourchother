'use client'

import { useState } from 'react'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui'
import type { OnboardingTemplate, OnboardingTemplateField } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface Props {
  template: OnboardingTemplate
  onboardingId: string
  initialData?: Record<string, string>
  projectId?: string
}

export function OnboardingForm({ template, onboardingId, initialData = {}, projectId }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, fileList: FileList | null) => {
    if (fileList) {
      setFiles(prev => ({ ...prev, [name]: Array.from(fileList) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, upload any files
      const uploadedFiles: string[] = []

      for (const [fieldName, fieldFiles] of Object.entries(files)) {
        for (const file of fieldFiles) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('fieldName', fieldName)
          uploadFormData.append('onboardingId', onboardingId)

          const res = await fetch('/api/onboarding/upload', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!res.ok) {
            throw new Error('Failed to upload file')
          }

          const { data } = await res.json()
          uploadedFiles.push(data.path)
        }
      }

      // Then, submit the form
      const res = await fetch('/api/onboarding/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          project_id: projectId || null, // Include pre-linked project if provided
          link_id: onboardingId, // Pass the link ID to associate the submission
          data: formData,
          files: uploadedFiles,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card variant="sketch" className="hover-lift">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`${serif.className} text-2xl font-medium text-[var(--foreground)] mb-3`}>
            Thank you for your submission!
          </h2>
          <p className="text-[var(--muted)] leading-relaxed">
            We&apos;ll be in touch soon to discuss your project.
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderField = (field: OnboardingTemplateField, index: number) => {
    const animationClass = `animate-fade-in-up animation-delay-${Math.min((index + 1) * 100, 500)}`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.name} className={animationClass}>
            <Input
              type={field.type}
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className={animationClass}>
            <Textarea
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className={animationClass}>
            <Select
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
              placeholder="Select an option"
              required={field.required}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.name} className={animationClass}>
            <Input
              type="date"
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        )

      case 'file':
        return (
          <div key={field.name} className={`w-full ${animationClass}`}>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              {field.label}
            </label>
            <div className="relative">
              <input
                type="file"
                name={field.name}
                accept={field.accept}
                multiple={field.multiple}
                onChange={(e) => handleFileChange(field.name, e.target.files)}
                className="w-full text-sm text-[var(--muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--accent-light)] file:text-[var(--accent-text)] hover:file:bg-[var(--accent)] hover:file:text-white file:transition-colors file:cursor-pointer cursor-pointer"
              />
            </div>
            {files[field.name] && (
              <p className="text-xs text-[var(--accent)] mt-2 font-medium">
                {files[field.name].length} file(s) selected
              </p>
            )}
          </div>
        )

      case 'url_list':
        return (
          <div key={field.name} className={animationClass}>
            <Textarea
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || "Enter one URL per line"}
              required={field.required}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card variant="sketch" className="hover-lift">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {template.fields.map((field, index) => renderField(field, index))}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
