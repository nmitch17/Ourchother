'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Client, Project } from '@/types'
import { OURCHOTHER_CLIENT_ID } from '@/types'

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your clients and view their projects</p>
        </div>
        <Button onClick={() => setShowNewClientForm(true)}>+ New Client</Button>
      </div>

      {/* New Client Form */}
      {showNewClientForm && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold mb-4">Add New Client</h2>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
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
              <Card className="hover:border-accent transition-colors cursor-pointer bg-gray-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {ourchother.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                          Internal
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{ourchother.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
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
              <Card className="hover:border-accent transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{client.name}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{client.email}</span>
                        {client.phone && <span>{client.phone}</span>}
                        {client.company && (
                          <span className="text-gray-700 font-medium">{client.company}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Added {formatDate(client.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
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
