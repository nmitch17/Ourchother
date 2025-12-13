'use client'

import { useState } from 'react'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Input, Card, CardContent } from '@/components/ui'
import type { Project } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

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
    <div className="client-dashboard-gradient min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full animate-fade-in-up">
        <span className="text-lg font-semibold tracking-tight text-[var(--muted)]">
          ourchother
        </span>
        <span className="text-sm text-[var(--muted)]">
          Client Portal
        </span>
      </nav>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <Card variant="sketch" className="w-full max-w-md animate-fade-in-up animation-delay-100 hover-lift">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className={`${serif.className} text-2xl font-medium`}>Project Access</h2>
              <p className="text-[var(--muted)] mt-2 text-sm">
                Enter your password to view project details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="text-center"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Access Project'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-[var(--muted)] mt-6">
              Need help? Contact your project manager.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 animate-fade-in-up animation-delay-200">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Ourchother</span>
        </div>
      </footer>
    </div>
  )
}
