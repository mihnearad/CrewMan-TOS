/**
 * ProjectsTable Component
 * 
 * Main table component for displaying projects with filtering capabilities.
 * Uses nuqs for URL-persisted filter state (shareable, survives refresh).
 * 
 * Features:
 * - Search by name
 * - Filter by status (active, planned, completed, cancelled)
 * - Filter by type (vessel, windfarm, other)
 * - Filter by date range (start_date within range)
 * - Results count display
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Wind, Anchor, Users, Boxes, Building2, UserCog } from 'lucide-react'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { useTableFilters, useFilterKeyboardShortcuts } from '@/lib/hooks/useSearchFilters'
import ProjectsFilter from './ProjectsFilter'
import QuickStatusBadge from './QuickStatusBadge'

interface ProjectWithRelations {
  id: string
  name: string
  type: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at: string
  assignments: { count: number }[]
  client: { id: string; name: string } | null
  consultant: { id: string; full_name: string } | null
}

interface ProjectsTableProps {
  projects: ProjectWithRelations[]
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  // Use URL-persisted filter state
  const {
    search,
    debouncedSearch,
    setSearch,
    status,
    toggleStatus,
    type,
    toggleType,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    clearDateRange,
    clearAll,
    hasFilters,
    activeFilterCount,
  } = useTableFilters({ enableTypeFilter: true, enableDateFilter: true })
  
  // Register keyboard shortcut (Escape to clear)
  useFilterKeyboardShortcuts(clearAll)
  
  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter (debounced)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const matchesName = project.name.toLowerCase().includes(query)
        const matchesType = project.type.toLowerCase().includes(query)
        const matchesClient = project.client?.name.toLowerCase().includes(query)
        if (!matchesName && !matchesType && !matchesClient) return false
      }
      
      // Status filter
      if (status && project.status !== status) return false
      
      // Type filter
      if (type && project.type !== type) return false
      
      // Date range filter (checks if project start_date is within range)
      if (dateFrom || dateTo) {
        if (!project.start_date) return false
        const projectStart = parseISO(project.start_date)
        
        if (dateFrom && dateTo) {
          if (!isWithinInterval(projectStart, { 
            start: parseISO(dateFrom), 
            end: parseISO(dateTo) 
          })) return false
        } else if (dateFrom) {
          if (projectStart < parseISO(dateFrom)) return false
        } else if (dateTo) {
          if (projectStart > parseISO(dateTo)) return false
        }
      }
      
      return true
    })
  }, [projects, debouncedSearch, status, type, dateFrom, dateTo])
  
  return (
    <div>
      {/* Filters */}
      <ProjectsFilter
        searchQuery={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusChange={toggleStatus}
        typeFilter={type}
        onTypeChange={toggleType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onDateClear={clearDateRange}
        showDateFilter
        onClearAll={clearAll}
      />
      
      {/* Empty state */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <Boxes className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No matching vessels</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {projects.length === 0
              ? 'Get started by creating a new vessel.'
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
                  Vessel Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Consultant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Crew
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  End Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredProjects.map((project) => {
                const crewCount = project.assignments?.[0]?.count || 0
                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        {project.type === 'windfarm' ? (
                          <>
                            <Wind className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                            Windfarm
                          </>
                        ) : project.type === 'vessel' ? (
                          <>
                            <Anchor className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                            Vessel
                          </>
                        ) : (
                          <>
                            <Boxes className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                            Other
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.client ? (
                        <Link
                          href={`/clients/${project.client.id}`}
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          <Building2 className="h-4 w-4 mr-1.5 text-indigo-400 dark:text-indigo-500" />
                          <span className="truncate max-w-[120px]">{project.client.name}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.consultant ? (
                        <Link
                          href={`/consultants/${project.consultant.id}`}
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          <UserCog className="h-4 w-4 mr-1.5 text-teal-400 dark:text-teal-500" />
                          <span className="truncate max-w-[120px]">{project.consultant.full_name}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {crewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuickStatusBadge
                        projectId={project.id}
                        currentStatus={project.status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Results count */}
      {hasFilters && filteredProjects.length > 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProjects.length} of {projects.length} vessels
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
