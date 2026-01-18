'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Users, Phone, Mail, Calendar, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import CrewFilter from './CrewFilter'
import QuickCrewStatus from './QuickCrewStatus'

interface CrewWithAssignments {
  id: string
  full_name: string
  role: string
  status: string
  email: string | null
  phone: string | null
  assignments: {
    id: string
    start_date: string
    end_date: string
    project: {
      id: string
      name: string
      color: string
    }
  }[]
}

interface CrewListProps {
  crew: CrewWithAssignments[]
}

export default function CrewList({ crew }: CrewListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const getActiveAssignment = useCallback((member: CrewWithAssignments) => {
    if (!member.assignments || member.assignments.length === 0) return null

    const active = member.assignments.find(a => {
      const start = new Date(a.start_date)
      const end = new Date(a.end_date)
      const now = new Date(today)
      return start <= now && end >= now
    })

    if (active) return { ...active, type: 'active' as const }

    const upcoming = member.assignments
      .filter(a => new Date(a.start_date) > new Date(today))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0]

    if (upcoming) return { ...upcoming, type: 'upcoming' as const }

    return null
  }, [today])

  const filteredCrew = useMemo(() => {
    return crew.filter((member) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = member.full_name.toLowerCase().includes(query)
        const matchesRole = member.role.toLowerCase().includes(query)
        const matchesEmail = member.email?.toLowerCase().includes(query)
        if (!matchesName && !matchesRole && !matchesEmail) return false
      }

      // Status filter
      if (statusFilter && member.status !== statusFilter) return false

      return true
    })
  }, [crew, searchQuery, statusFilter])

  return (
    <div>
      <CrewFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {filteredCrew.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching crew members</h3>
          <p className="mt-1 text-sm text-gray-500">
            {crew.length === 0
              ? 'Get started by adding your first crew member.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredCrew.map((member) => {
              const currentAssignment = getActiveAssignment(member)
              const assignmentCount = member.assignments?.length || 0

              return (
                <li key={member.id}>
                  <Link
                    href={`/crew/${member.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {member.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Current/Upcoming Assignment Preview - visible on all screens */}
                          {currentAssignment && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: currentAssignment.project?.color || '#6B7280' }}
                              />
                              <div className="text-sm">
                                <span className="text-gray-700 hidden sm:inline">{currentAssignment.project?.name}</span>
                                <span className="text-gray-700 sm:hidden">{currentAssignment.project?.name?.substring(0, 15)}{currentAssignment.project?.name?.length > 15 ? '...' : ''}</span>
                                <span className="text-gray-400 mx-1 hidden sm:inline">·</span>
                                <span className={`text-xs ${currentAssignment.type === 'active' ? 'text-green-600' : 'text-blue-600'} hidden sm:inline`}>
                                  {currentAssignment.type === 'active' ? 'Active' : `Starts ${format(new Date(currentAssignment.start_date), 'MMM d')}`}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Assignment Count */}
                          <div className="flex items-center text-sm text-gray-500" title="Total assignments">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {assignmentCount}
                          </div>

                          {/* Status Badge */}
                          <QuickCrewStatus
                            crewId={member.id}
                            currentStatus={member.status}
                          />

                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Contact info and mobile assignment preview */}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        {member.email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone}
                          </span>
                        )}
                        {/* Mobile assignment details */}
                        {currentAssignment && (
                          <span className="flex items-center sm:hidden">
                            <span className={`${currentAssignment.type === 'active' ? 'text-green-600' : 'text-blue-600'}`}>
                              {currentAssignment.type === 'active' ? 'Active now' : `Starts ${format(new Date(currentAssignment.start_date), 'MMM d')}`}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Results count */}
      {(searchQuery || statusFilter) && filteredCrew.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {filteredCrew.length} of {crew.length} crew members
        </p>
      )}
    </div>
  )
}
