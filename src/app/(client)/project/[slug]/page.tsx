'use client'

import { useState, useEffect, use } from 'react'
import { PasswordGate } from '@/components/client/password-gate'
import { ClientDashboard } from '@/components/client/client-dashboard'
import type { Project } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default function ClientProjectPage({ params }: Props) {
  const { slug } = use(params)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated (cookie exists)
    checkAuth()
  }, [slug])

  const checkAuth = async () => {
    try {
      const res = await fetch(`/api/client-dashboard/${slug}`)
      if (res.ok) {
        const { data } = await res.json()
        setProject(data)
        setIsAuthenticated(true)
      }
    } catch (err) {
      // Not authenticated, show password gate
    } finally {
      setLoading(false)
    }
  }

  const handleAuthenticated = (projectData: Project) => {
    setProject(projectData)
    setIsAuthenticated(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PasswordGate slug={slug} onAuthenticated={handleAuthenticated} />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
      </div>
    )
  }

  return <ClientDashboard project={project} onUpdate={() => checkAuth()} />
}
