'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Wind, Anchor, Users, Boxes, Building2, UserCog } from 'lucide-react'
import { format } from 'date-fns'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = project.name.toLowerCase().includes(query)
        const matchesType = project.type.toLowerCase().includes(query)
        if (!matchesName && !matchesType) return false
      }

      // Status filter
      if (statusFilter && project.status !== statusFilter) return false

      // Type filter
      if (typeFilter && project.type !== typeFilter) return false

      return true
    })
  }, [projects, searchQuery, statusFilter, typeFilter])

  return (
    <div>
      <ProjectsFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Boxes className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length === 0
              ? 'Get started by creating a new project.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crew
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => {
                const crewCount = project.assignments?.[0]?.count || 0
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        {project.type === 'windfarm' ? (
                          <>
                            <Wind className="h-4 w-4 mr-1.5 text-gray-400" />
                            Windfarm
                          </>
                        ) : project.type === 'vessel' ? (
                          <>
                            <Anchor className="h-4 w-4 mr-1.5 text-gray-400" />
                            Vessel
                          </>
                        ) : (
                          <>
                            <Boxes className="h-4 w-4 mr-1.5 text-gray-400" />
                            Other
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.client ? (
                        <Link
                          href={`/clients/${project.client.id}`}
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                        >
                          <Building2 className="h-4 w-4 mr-1.5 text-indigo-400" />
                          <span className="truncate max-w-[120px]">{project.client.name}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.consultant ? (
                        <Link
                          href={`/consultants/${project.consultant.id}`}
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                        >
                          <UserCog className="h-4 w-4 mr-1.5 text-teal-400" />
                          <span className="truncate max-w-[120px]">{project.consultant.full_name}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                        {crewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      {(searchQuery || statusFilter || typeFilter) && filteredProjects.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      )}
    </div>
  )
}
