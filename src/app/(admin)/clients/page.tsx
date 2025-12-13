'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Client, Project } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

interface ClientWithProjects extends Client {
  projects?: Project[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithProjects[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      const { data, error } = await res.json()

      if (error) {
        console.error('Error fetching clients:', error.message)
        return
      }

      // Fetch projects for each client to show project count
      const clientsWithProjects = await Promise.all(
        (data || []).map(async (client: Client) => {
          const projectsRes = await fetch(`/api/clients/${client.id}`)
          const projectsData = await projectsRes.json()
          return {
            ...client,
            projects: projectsData.data?.projects || [],
          }
        })
      )

      setClients(clientsWithProjects)
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })

      const { error } = await res.json()

      if (error) {
        console.error('Error creating client:', error.message)
        return
      }

      setNewClient({ name: '', email: '', phone: '', company: '' })
      setShowNewClientForm(false)
      fetchClients()
    } catch (err) {
      console.error('Failed to create client:', err)
    } finally {
      setSaving(false)
    }
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase()
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.company?.toLowerCase().includes(query) ?? false)
    )
  })

  // Separate Ourchother from other clients and sort
  const ourchother = filteredClients.find((c) => c.id === OURCHOTHER_CLIENT_ID)
  const otherClients = filteredClients
    .filter((c) => c.id !== OURCHOTHER_CLIENT_ID)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-1">Management</p>
          <h1 className={`${serif.className} text-3xl font-medium text-[var(--foreground)]`}>Clients</h1>
          <p className="text-[var(--muted)] mt-1">Manage your clients and view their projects</p>
        </div>
        <Button onClick={() => setShowNewClientForm(true)}>+ New Client</Button>
      </div>

      {/* New Client Form */}
      {showNewClientForm && (
        <Card className="mb-6">
          <CardContent className="py-5">
            <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)] mb-4`}>Add New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
                <Input
                  label="Company"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create Client'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewClientForm(false)}
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
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-[var(--muted)]">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setShowNewClientForm(true)}
              >
                Add your first client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Ourchother (Internal) at top */}
          {ourchother && (
            <Link href={`/clients/${ourchother.id}`}>
              <Card className="hover:border-[var(--accent)] transition-all cursor-pointer bg-[var(--accent-light)] hover-lift">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>
                          {ourchother.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 bg-[var(--surface)] text-[var(--muted)] rounded-lg">
                          Internal
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted)] mt-1">{ourchother.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {ourchother.projects?.length || 0} project
                        {(ourchother.projects?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Other clients */}
          {otherClients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:border-[var(--accent)] transition-all cursor-pointer hover-lift">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`${serif.className} text-xl font-medium text-[var(--foreground)]`}>{client.name}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[var(--muted)]">
                        <span>{client.email}</span>
                        {client.phone && <span>{client.phone}</span>}
                        {client.company && (
                          <span className="text-[var(--foreground)] font-medium">{client.company}</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-2">
                        Added {formatDate(client.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {client.projects?.length || 0} project
                        {(client.projects?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
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
