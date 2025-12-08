'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import type { Project } from '@/types'

interface Props {
  slug: string
  onAuthenticated: (project: Project) => void
}

export function PasswordGate({ slug, onAuthenticated }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/client-dashboard/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })

      const { data, error } = await res.json()

      if (error) {
        setError(error.message)
        return
      }

      onAuthenticated(data.project)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Project Access</h2>
            <p className="text-gray-600 mt-1">Enter your project password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
