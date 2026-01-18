/**
 * ClientsTable Component
 * 
 * Main table component for displaying clients with filtering capabilities.
 * Uses nuqs for URL-persisted filter state (shareable, survives refresh).
 * 
 * Features:
 * - Search by name, contact name, or email
 * - Filter by status (active, inactive)
 * - Results count display
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Building2, Anchor } from 'lucide-react'
import { useTableFilters, useFilterKeyboardShortcuts } from '@/lib/hooks/useSearchFilters'
import SearchInput from '@/components/ui/SearchInput'
import FilterPills, { entityStatusOptions } from '@/components/ui/FilterPills'

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
  // Use URL-persisted filter state
  const {
    search,
    debouncedSearch,
    setSearch,
    status,
    toggleStatus,
    clearAll,
    hasFilters,
    activeFilterCount,
  } = useTableFilters({ enableTypeFilter: false, enableDateFilter: false })
  
  // Register keyboard shortcut (Escape to clear)
  useFilterKeyboardShortcuts(clearAll)
  
  // Filter clients based on current filters
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search filter (debounced)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const matchesName = client.name.toLowerCase().includes(query)
        const matchesContact = client.contact_name?.toLowerCase().includes(query) || false
        const matchesEmail = client.contact_email?.toLowerCase().includes(query) || false
        if (!matchesName && !matchesContact && !matchesEmail) return false
      }
      
      // Status filter
      if (status && client.status !== status) return false
      
      return true
    })
  }, [clients, debouncedSearch, status])
  
  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search clients..."
          shortcutHint="/"
        />
        
        <div className="flex flex-wrap items-center gap-4">
          <FilterPills
            label="Status"
            options={entityStatusOptions}
            value={status}
            onChange={toggleStatus}
          />
          
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Empty state */}
      {filteredClients.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching clients</h3>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length === 0
              ? 'Get started by creating a new client.'
              : 'Try adjusting your search or filters.'}
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          )}
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
      {hasFilters && filteredClients.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {filteredClients.length} of {clients.length} clients
          {activeFilterCount > 0 && (
            <span className="ml-2 text-blue-600">
              ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)
            </span>
          )}
        </p>
      )}
    </div>
  )
}
