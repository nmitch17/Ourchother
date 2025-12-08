'use client'

import { useState } from 'react'
import { Button, Input, Textarea, Select, Card, CardContent } from '@/components/ui'
import type { OnboardingTemplate, OnboardingTemplateField } from '@/types'

interface Props {
  template: OnboardingTemplate
  onboardingId: string
}

export function OnboardingForm({ template, onboardingId }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({})
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
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-5xl mb-4">&#10004;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Thank you for your submission!
          </h2>
          <p className="text-gray-600">
            We&apos;ll be in touch soon to discuss your project.
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderField = (field: OnboardingTemplateField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            key={field.name}
            type={field.type}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'select':
        return (
          <Select
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
            placeholder="Select an option"
            required={field.required}
          />
        )

      case 'date':
        return (
          <Input
            key={field.name}
            type="date"
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          />
        )

      case 'file':
        return (
          <div key={field.name} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="file"
              name={field.name}
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => handleFileChange(field.name, e.target.files)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent-light file:text-accent-text hover:file:bg-blue-100"
            />
            {files[field.name] && (
              <p className="text-xs text-gray-500 mt-1">
                {files[field.name].length} file(s) selected
              </p>
            )}
          </div>
        )

      case 'url_list':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Enter one URL per line"}
            required={field.required}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {template.fields.map(renderField)}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
