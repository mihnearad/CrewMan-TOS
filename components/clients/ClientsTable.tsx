'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, Anchor, Search } from 'lucide-react'

interface ClientWithCount {
  id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  status: string
  created_at: string
  projects: { count: number }[]
}

interface ClientsTableProps {
  clients: ClientWithCount[]
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = client.name.toLowerCase().includes(query)
        const matchesContact = client.contact_name?.toLowerCase().includes(query) || false
        const matchesEmail = client.contact_email?.toLowerCase().includes(query) || false
        if (!matchesName && !matchesContact && !matchesEmail) return false
      }

      // Status filter
      if (statusFilter && client.status !== statusFilter) return false

      return true
    })
  }, [clients, searchQuery, statusFilter])

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {filteredClients.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching clients</h3>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length === 0
              ? 'Get started by creating a new client.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => {
                const projectCount = client.projects?.[0]?.count || 0
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/clients/${client.id}`} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {client.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.contact_name || '-'}</div>
                      <div className="text-sm text-gray-500">{client.contact_email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Anchor className="h-4 w-4 mr-1.5 text-gray-400" />
                        {projectCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Results count */}
      {(searchQuery || statusFilter) && filteredClients.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {filteredClients.length} of {clients.length} clients
        </p>
      )}
    </div>
  )
}
