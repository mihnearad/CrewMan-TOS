'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { assignCrew, removeAssignment, updateAssignment } from '@/app/planning/actions'
import { Plus, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, BarChart3, Printer } from 'lucide-react'
import {
  format,
  addDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO
} from 'date-fns'
import { getAssignmentStatus, getStatusColorClasses } from '@/lib/utils'
import { useMultiFilter, useDateRangeFilter, useSingleFilter } from '@/lib/hooks/useSearchFilters'
import PlanningFilters from '@/components/planning/PlanningFilters'
import PrintHeader from '@/components/planning/PrintHeader'
import { exportPdf } from '@/lib/utils/exportPdf'

// Lazy load heavy GanttView component
const GanttView = dynamic(() => import('@/components/planning/GanttView'), {
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg border dark:bg-gray-900 dark:border-gray-700">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  ),
  ssr: false
})

interface Assignment {
  id: string
  project_id: string | null
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  assignment_type?: 'vessel' | 'training'
  training_description?: string | null
  project: { name: string; color: string; client_id?: string | null } | null
  crew_member: { full_name: string; role: string }
}

interface Project {
  id: string
  name: string
  type: string
  status: string
  color: string
}

interface CrewMember {
  id: string
  full_name: string
  role: string
  status: string
  nationality?: string
  flag_state?: string
  home_airport?: string
  company?: string
}

interface Role {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
}

interface PlanningBoardProps {
  initialProjects: Project[]
  initialCrew: CrewMember[]
  initialAssignments: Assignment[]
  roles?: Role[]
  clients?: Client[]
}

export default function PlanningBoard({
  initialProjects,
  initialCrew,
  initialAssignments,
  roles = [],
  clients = []
}: PlanningBoardProps) {
  const [view, setView] = useState<'calendar' | 'timeline' | 'gantt'>('gantt')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignmentType, setAssignmentType] = useState<'vessel' | 'training'>('vessel')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedCrew, setSelectedCrew] = useState<string>('')
  const [roleOnProject, setRoleOnProject] = useState<string>('')
  const [trainingDescription, setTrainingDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isPrinting, setIsPrinting] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  // Filter state using nuqs for URL persistence
  const { values: filterProjects, toggle: toggleProject, clear: clearProjects } = useMultiFilter('projects')
  const { values: filterCrew, toggle: toggleCrew, clear: clearCrew } = useMultiFilter('crew')
  const { values: filterRoles, toggle: toggleRole, clear: clearRoles } = useMultiFilter('roles')
  const { from: filterDateFrom, to: filterDateTo, setFrom: setFilterDateFrom, setTo: setFilterDateTo, clear: clearDateRange } = useDateRangeFilter()
  const { value: endingSoonFilter, toggle: toggleEndingSoon } = useSingleFilter('endingSoon')
  const endingSoon = endingSoonFilter === 'true'

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    clearProjects()
    clearCrew()
    clearRoles()
    clearDateRange()
    if (endingSoon) toggleEndingSoon('true')
  }, [clearProjects, clearCrew, clearRoles, clearDateRange, endingSoon, toggleEndingSoon])

  // Handle ending soon toggle
  const handleEndingSoonToggle = useCallback(() => {
    toggleEndingSoon('true')
  }, [toggleEndingSoon])

  const activeProjects = initialProjects.filter(p => p.status === 'active')

  // Filter assignments based on current filters
  const filteredAssignments = useMemo(() => {
    return initialAssignments.filter(assignment => {
      // Project filter (skip training assignments if filtering by project)
      if (filterProjects.length > 0 && assignment.project_id && !filterProjects.includes(assignment.project_id)) {
        return false
      }

      // Crew filter
      if (filterCrew.length > 0 && !filterCrew.includes(assignment.crew_member_id)) {
        return false
      }

      // Role filter
      if (filterRoles.length > 0) {
        const crewRole = assignment.role_on_project || assignment.crew_member.role
        if (!filterRoles.includes(crewRole)) {
          return false
        }
      }

      // Date range filter
      if (filterDateFrom || filterDateTo) {
        const assignmentStart = parseISO(assignment.start_date)
        const assignmentEnd = parseISO(assignment.end_date)
        
        if (filterDateFrom && filterDateTo) {
          const filterStart = parseISO(filterDateFrom)
          const filterEnd = parseISO(filterDateTo)
          // Check if assignment overlaps with filter range
          if (assignmentEnd < filterStart || assignmentStart > filterEnd) {
            return false
          }
        } else if (filterDateFrom) {
          if (assignmentEnd < parseISO(filterDateFrom)) return false
        } else if (filterDateTo) {
          if (assignmentStart > parseISO(filterDateTo)) return false
        }
      }

      // Ending soon filter (within 7 days)
      if (endingSoon) {
        const status = getAssignmentStatus(assignment.end_date)
        if (status !== 'ending-critical' && status !== 'ending-soon') {
          return false
        }
      }

      return true
    })
  }, [initialAssignments, filterProjects, filterCrew, filterRoles, filterDateFrom, filterDateTo, endingSoon])

  // Check if any filters are active
  const hasFilters = filterProjects.length > 0 || filterCrew.length > 0 || filterRoles.length > 0 || filterDateFrom || filterDateTo || endingSoon

  const filterSummary = useMemo(() => {
    const parts: string[] = []

    if (filterProjects.length > 0) {
      const projectNames = initialProjects
        .filter(project => filterProjects.includes(project.id))
        .map(project => project.name)
      parts.push(`Vessels: ${projectNames.join(', ') || 'None'}`)
    }

    if (filterCrew.length > 0) {
      const crewNames = initialCrew
        .filter(member => filterCrew.includes(member.id))
        .map(member => member.full_name)
      parts.push(`Crew: ${crewNames.join(', ') || 'None'}`)
    }

    if (filterRoles.length > 0) {
      parts.push(`Roles: ${filterRoles.join(', ')}`)
    }

    if (filterDateFrom || filterDateTo) {
      const fromLabel = filterDateFrom ? format(parseISO(filterDateFrom), 'MMM d, yyyy') : 'Any'
      const toLabel = filterDateTo ? format(parseISO(filterDateTo), 'MMM d, yyyy') : 'Any'
      parts.push(`Dates: ${fromLabel} - ${toLabel}`)
    }

    if (endingSoon) {
      parts.push('Ending Soon: Yes')
    }

    return parts.join(' | ')
  }, [filterProjects, filterCrew, filterRoles, filterDateFrom, filterDateTo, endingSoon, initialProjects, initialCrew])

  const handlePrintPdf = useCallback(async () => {
    if (!printRef.current) return

    setIsPrinting(true)
    setGeneratedAt(format(new Date(), 'MMM d, yyyy h:mm a'))
    try {
      // Wait for React to render the updated state
      await new Promise<void>(resolve => setTimeout(resolve, 100))
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      await exportPdf(printRef.current)
    } finally {
      setGeneratedAt(null)
      setIsPrinting(false)
    }
  }, [setGeneratedAt])

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  // Get assignments for a specific day (uses filtered assignments)
  const getAssignmentsForDay = useCallback((day: Date) => {
    return filteredAssignments.filter(assignment => {
      const start = parseISO(assignment.start_date)
      const end = parseISO(assignment.end_date)
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end)
    })
  }, [filteredAssignments])

  const handleAssign = async () => {
    // Validation
    if (!selectedCrew || !startDate || !endDate) {
      setError('Crew member, start date, and end date are required')
      return
    }

    if (assignmentType === 'vessel' && !selectedProject) {
      setError('Please select a vessel')
      return
    }

    if (assignmentType === 'training' && !trainingDescription) {
      setError('Please provide a training description')
      return
    }

    setLoading(true)
    setError('')

    const result = await assignCrew(
      assignmentType === 'vessel' ? selectedProject : null,
      selectedCrew,
      startDate,
      endDate,
      roleOnProject || undefined,
      assignmentType,
      trainingDescription
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setShowAssignModal(false)
      setSelectedProject('')
      setSelectedCrew('')
      setRoleOnProject('')
      setStartDate('')
      setEndDate('')
      setAssignmentType('vessel')
      setTrainingDescription('')
      setLoading(false)
      window.location.reload() // Simple refresh for MVP
    }
  }

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return

    setLoading(true)
    const result = await removeAssignment(assignmentId)

    if (result.error) {
      alert(result.error)
    } else {
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="p-3 print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planning</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Assign crew to vessels</p>
        </div>

        <div className="flex gap-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-2 text-sm font-medium border ${
                view === 'timeline'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              } rounded-l-md`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                view === 'gantt'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              } rounded-r-md`}
            >
              <BarChart3 className="inline h-4 w-4 mr-1" />
              Gantt
            </button>
          </div>

          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            disabled={isPrinting}
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? 'Generating...' : 'Print PDF'}
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </button>
        </div>
      </div>

      {/* Filters */}
      <PlanningFilters
        projects={initialProjects}
        crewMembers={initialCrew}
        roles={roles}
        selectedProjects={filterProjects}
        onProjectToggle={toggleProject}
        selectedCrew={filterCrew}
        onCrewToggle={toggleCrew}
        selectedRoles={filterRoles}
        onRoleToggle={toggleRole}
        dateFrom={filterDateFrom}
        dateTo={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        onDateClear={clearDateRange}
        endingSoon={endingSoon}
        onEndingSoonToggle={handleEndingSoonToggle}
        onClearAll={clearAllFilters}
      />

      {/* Filter results summary */}
      {hasFilters && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 print:hidden">
          Showing {filteredAssignments.length} of {initialAssignments.length} assignments
        </div>
      )}

      <div ref={printRef} className="bg-white p-4 rounded-lg print:p-0 print:shadow-none print:rounded-none">
        <PrintHeader filterSummary={filterSummary} generatedAt={generatedAt || undefined} />
        {/* Timeline View */}
        {view === 'timeline' && (
          <div className="space-y-6">
            {activeProjects.map(project => {
              const projectAssignments = filteredAssignments.filter(
                a => a.project_id === project.id
              )

              return (
                <div key={project.id} className="bg-white shadow rounded-lg p-4 dark:bg-gray-900 dark:shadow-gray-900/30">
                  <div className="flex items-center mb-4">
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                      {projectAssignments.length} assigned
                    </span>
                  </div>

                  {projectAssignments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400">No crew assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {projectAssignments.map(assignment => {
                        const status = getAssignmentStatus(assignment.end_date)
                        const statusClasses = getStatusColorClasses(status)

                        return (
                          <div
                            key={assignment.id}
                            className={`flex items-center justify-between p-3 rounded border ${statusClasses}`}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {assignment.crew_member.full_name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {assignment.role_on_project || assignment.crew_member.role}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <CalendarIcon className="inline h-4 w-4 mr-1" />
                                {format(new Date(assignment.start_date), 'MMM d')} -{' '}
                                {format(new Date(assignment.end_date), 'MMM d, yyyy')}
                              </div>
                              {status === 'ending-critical' && (
                                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                  Ending in {differenceInDays(new Date(assignment.end_date), new Date())} days
                                </span>
                              )}
                              {status === 'ending-soon' && (
                                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                                  Ending soon
                                </span>
                              )}
                              <button
                                onClick={() => handleRemove(assignment.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-900 dark:shadow-gray-900/30">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayAssignments = getAssignmentsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] border-b border-r p-1 dark:border-gray-700 ${
                      !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
                    } ${idx % 7 === 0 ? 'border-l' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 px-1 ${
                      isToday
                        ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                        : isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      {dayAssignments.slice(0, 2).map(assignment => {
                        const isTraining = assignment.assignment_type === 'training'
                        const displayColor = isTraining ? '#f59e0b' : (assignment.project?.color || '#6b7280')
                        const displayName = isTraining ? (assignment.training_description || 'Training') : (assignment.project?.name || 'Unknown')
                        
                        return (
                          <div
                            key={assignment.id}
                            className="text-xs px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: displayColor + '20',
                              borderLeft: `3px solid ${displayColor}`
                            }}
                            title={`${assignment.crew_member.full_name} - ${displayName}`}
                          >
                            <div className="font-medium truncate" style={{ color: displayColor }}>
                              {displayName}
                            </div>
                            <div className="text-gray-600 truncate dark:text-gray-400">
                              {assignment.crew_member.full_name}
                            </div>
                          </div>
                        )
                      })}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-500 px-1 dark:text-gray-400">
                          +{dayAssignments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* Gantt View */}
        {view === 'gantt' && (
          <GanttView
            assignments={filteredAssignments.map(a => ({
              ...a,
              assignment_type: a.assignment_type || 'vessel',
              project: a.project && a.project_id ? { ...a.project, id: a.project_id } : null,
              crew_member: { ...a.crew_member, id: a.crew_member_id }
            }))}
            projects={initialProjects}
            crewMembers={initialCrew}
            clients={clients}
            roles={roles}
          />
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 dark:bg-gray-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Create Assignment</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Assignment Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Assignment Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignmentType('vessel')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                      assignmentType === 'vessel'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                    disabled={loading}
                  >
                    Vessel
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentType('training')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                      assignmentType === 'training'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                    disabled={loading}
                  >
                    Training
                  </button>
                </div>
              </div>

              {assignmentType === 'vessel' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Vessel
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loading}
                  >
                    <option value="">Select vessel...</option>
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Training Description
                  </label>
                  <input
                    type="text"
                    value={trainingDescription}
                    onChange={(e) => setTrainingDescription(e.target.value)}
                    placeholder="e.g., Safety Training, STCW Certification"
                    className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Crew Member
                </label>
                <select
                  value={selectedCrew}
                  onChange={(e) => {
                    const crewId = e.target.value
                    setSelectedCrew(crewId)
                    const crewMember = initialCrew.find(member => member.id === crewId)
                    setRoleOnProject(crewMember?.role || '')
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={loading}
                >
                  <option value="">Select crew member...</option>
                  {initialCrew.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} - {c.role} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {assignmentType === 'vessel' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Role Onboard
                  </label>
                  <select
                    value={roleOnProject}
                    onChange={(e) => setRoleOnProject(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loading}
                  >
                    <option value="">No specific role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setError('')
                  setSelectedProject('')
                  setSelectedCrew('')
                  setRoleOnProject('')
                  setStartDate('')
                  setEndDate('')
                  setAssignmentType('vessel')
                  setTrainingDescription('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
