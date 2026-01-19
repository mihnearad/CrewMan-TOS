/**
 * ConsultantsTable Component
 * 
 * Main table component for displaying consultants with filtering capabilities.
 * Uses nuqs for URL-persisted filter state (shareable, survives refresh).
 * 
 * Features:
 * - Search by name, role, or email
 * - Filter by status (active, inactive, on_leave)
 * - Results count display
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { UserCog, Anchor } from 'lucide-react'
import { useTableFilters, useFilterKeyboardShortcuts } from '@/lib/hooks/useSearchFilters'
import SearchInput from '@/components/ui/SearchInput'
import FilterPills, { consultantStatusOptions } from '@/components/ui/FilterPills'

interface ConsultantWithCount {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: string | null
  status: string
  created_at: string
  projects: { count: number }[]
}

interface ConsultantsTableProps {
  consultants: ConsultantWithCount[]
}

export default function ConsultantsTable({ consultants }: ConsultantsTableProps) {
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
  
  // Filter consultants based on current filters
  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      // Search filter (debounced)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const matchesName = consultant.full_name.toLowerCase().includes(query)
        const matchesRole = consultant.role?.toLowerCase().includes(query) || false
        const matchesEmail = consultant.email?.toLowerCase().includes(query) || false
        if (!matchesName && !matchesRole && !matchesEmail) return false
      }
      
      // Status filter
      if (status && consultant.status !== status) return false
      
      return true
    })
  }, [consultants, debouncedSearch, status])
  
  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search consultants..."
          shortcutHint="/"
        />
        
        <div className="flex flex-wrap items-center gap-4">
          <FilterPills
            label="Status"
            options={consultantStatusOptions}
            value={status}
            onChange={toggleStatus}
          />
          
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Empty state */}
      {filteredConsultants.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <UserCog className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No matching consultants</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {consultants.length === 0
              ? 'Get started by adding a new consultant.'
              : 'Try adjusting your search or filters.'}
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-900 dark:shadow-gray-900/30">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Consultant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Vessels
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredConsultants.map((consultant) => {
                const projectCount = consultant.projects?.[0]?.count || 0
                return (
                  <tr key={consultant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/consultants/${consultant.id}`} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium dark:bg-teal-900/50 dark:text-teal-400">
                          {consultant.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            {consultant.full_name}
                          </div>
                          {consultant.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{consultant.email}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{consultant.role || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Anchor className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {projectCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          consultant.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                            : consultant.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {consultant.status === 'on_leave' ? 'On Leave' : consultant.status}
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
      {hasFilters && filteredConsultants.length > 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredConsultants.length} of {consultants.length} consultants
          {activeFilterCount > 0 && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)
            </span>
          )}
        </p>
      )}
    </div>
  )
}
