'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, Users, FolderOpen } from 'lucide-react'

interface Assignment {
  id: string
  project_id: string | null
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  assignment_type?: 'vessel' | 'training' | null
  training_description?: string | null
  project: { id: string; name: string; color: string } | null
  crew_member: { id: string; full_name: string; role: string }
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
}

interface DashboardPlanningWidgetProps {
  assignments: Assignment[]
  projects: Project[]
  crewMembers: CrewMember[]
}

type ViewMode = 'by-project' | 'by-crew'

const ROW_HEIGHT = 28
const SIDEBAR_WIDTH = 140
const MIN_dayWidth = 32
const DEFAULT_dayWidth = 36

export default function DashboardPlanningWidget({
  assignments,
  projects,
  crewMembers,
}: DashboardPlanningWidgetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('by-project')
  const [weekOffset, setWeekOffset] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.offsetWidth)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Calculate the time range (3 weeks centered on current week + offset)
  const timeRange = useMemo(() => {
    const today = new Date()
    const baseStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
    const start = subWeeks(baseStart, 1) // Start 1 week before
    const end = addWeeks(baseStart, 2) // End 2 weeks after (total 3 weeks)
    return { start, end }
  }, [weekOffset])

  // Generate days for the timeline
  const days = useMemo(() => {
    const result: Date[] = []
    let current = timeRange.start
    while (current <= timeRange.end) {
      result.push(current)
      current = addDays(current, 1)
    }
    return result
  }, [timeRange])

  // Calculate dynamic day width to fill container
  const dayWidth = useMemo(() => {
    if (containerWidth === 0 || days.length === 0) return DEFAULT_dayWidth
    const availableWidth = containerWidth - SIDEBAR_WIDTH
    const calculatedWidth = Math.floor(availableWidth / days.length)
    return Math.max(MIN_dayWidth, calculatedWidth)
  }, [containerWidth, days.length])

  // Group assignments by project or crew
  const rows = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active')
    
    if (viewMode === 'by-project') {
      return activeProjects.map(project => {
        const projectAssignments = assignments.filter(a => a.project_id === project.id)
        return {
          id: project.id,
          label: project.name,
          color: project.color,
          assignments: projectAssignments,
          type: 'project' as const,
        }
      }).filter(row => row.assignments.length > 0)
    } else {
      return crewMembers.map(crew => {
        const crewAssignments = assignments.filter(a => a.crew_member_id === crew.id)
        return {
          id: crew.id,
          label: crew.full_name,
          sublabel: crew.role,
          color: '#6366f1', // Default indigo for crew
          assignments: crewAssignments,
          type: 'crew' as const,
        }
      }).filter(row => row.assignments.length > 0)
    }
  }, [assignments, projects, crewMembers, viewMode])

  // Get position and width for an assignment bar
  const getBarStyle = (assignment: Assignment) => {
    const start = parseISO(assignment.start_date)
    const end = parseISO(assignment.end_date)
    
    const startDiff = differenceInDays(start, timeRange.start)
    const duration = differenceInDays(end, start) + 1
    
    // Clamp to visible range
    const visibleStart = Math.max(0, startDiff)
    const visibleEnd = Math.min(days.length, startDiff + duration)
    const visibleDuration = visibleEnd - visibleStart
    
    if (visibleDuration <= 0) return null
    
    return {
      left: visibleStart * dayWidth,
      width: visibleDuration * dayWidth - 2,
    }
  }

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setWeekOffset(0)
    } else if (direction === 'prev') {
      setWeekOffset(prev => prev - 1)
    } else {
      setWeekOffset(prev => prev + 1)
    }
  }

  // Check if today is visible
  const today = new Date()
  const todayIndex = days.findIndex(d => isSameDay(d, today))

  // Group days by month for month headers
  const monthGroups = useMemo(() => {
    const groups: { month: string; year: number; days: number; startIndex: number }[] = []
    let currentMonth = ''
    let currentYear = 0
    let currentCount = 0
    let startIndex = 0

    days.forEach((day, idx) => {
      const month = format(day, 'MMMM')
      const year = day.getFullYear()
      
      if (month !== currentMonth || year !== currentYear) {
        if (currentMonth) {
          groups.push({ month: currentMonth, year: currentYear, days: currentCount, startIndex })
        }
        currentMonth = month
        currentYear = year
        currentCount = 1
        startIndex = idx
      } else {
        currentCount++
      }
    })
    
    if (currentMonth) {
      groups.push({ month: currentMonth, year: currentYear, days: currentCount, startIndex })
    }
    
    return groups
  }, [days])

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-900 dark:shadow-gray-900/30 border border-slate-200/60 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200/60 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/50">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planning Overview</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(timeRange.start, 'MMM d')} - {format(timeRange.end, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-md p-0.5 bg-slate-100 dark:bg-gray-800" role="group">
              <button
                onClick={() => setViewMode('by-project')}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium transition-all duration-150 rounded ${
                  viewMode === 'by-project'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="Group by Vessel"
              >
                <FolderOpen className="w-3.5 h-3.5 mr-1" />
                Vessel
              </button>
              <button
                onClick={() => setViewMode('by-crew')}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium transition-all duration-150 rounded ${
                  viewMode === 'by-crew'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="Group by Crew"
              >
                <Users className="w-3.5 h-3.5 mr-1" />
                Crew
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-0.5 ml-2">
              <button
                onClick={() => handleNavigate('prev')}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors dark:hover:bg-gray-800"
                title="Previous week"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleNavigate('today')}
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Today
              </button>
              <button
                onClick={() => handleNavigate('next')}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors dark:hover:bg-gray-800"
                title="Next week"
              >
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div style={{ minWidth: SIDEBAR_WIDTH + days.length * dayWidth }}>
          {/* Timeline Header - Month Row */}
          <div className="flex border-b border-slate-200/60 dark:border-gray-700 bg-slate-100/80 dark:bg-gray-800/80">
            {/* Sidebar header spacer */}
            <div 
              className="flex-shrink-0 border-r border-slate-200/60 dark:border-gray-700"
              style={{ width: SIDEBAR_WIDTH }}
            />
            {/* Months */}
            <div className="flex">
              {monthGroups.map((group, idx) => (
                <div
                  key={`${group.month}-${group.year}-${idx}`}
                  className="flex-shrink-0 text-center py-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 border-r border-slate-200/60 dark:border-gray-700"
                  style={{ width: group.days * dayWidth }}
                >
                  {group.month} {group.year}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Header - Days Row */}
          <div className="flex border-b border-slate-200/60 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
            {/* Sidebar header */}
            <div 
              className="flex-shrink-0 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-r border-slate-200/60 dark:border-gray-700"
              style={{ width: SIDEBAR_WIDTH }}
            >
              {viewMode === 'by-project' ? 'Vessel' : 'Crew'}
            </div>
            {/* Days */}
            <div className="flex">
              {days.map((day, idx) => {
                const isToday = isSameDay(day, today)
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 text-center py-2 text-xs border-r border-slate-100 dark:border-gray-700/50 ${
                      isToday 
                        ? 'bg-blue-50 dark:bg-blue-900/30' 
                        : isWeekend 
                          ? 'bg-slate-100/50 dark:bg-gray-800/50' 
                          : ''
                    }`}
                    style={{ width: dayWidth }}
                  >
                    <div className={`font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-gray-400'}`}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`${isToday ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-gray-500'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No assignments in this period</p>
              </div>
            </div>
          ) : (
            rows.slice(0, 6).map((row, rowIdx) => (
              <div 
                key={row.id} 
                className={`flex border-b border-slate-100 dark:border-gray-700/50 ${
                  rowIdx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-slate-50/30 dark:bg-gray-800/30'
                }`}
                style={{ height: ROW_HEIGHT }}
              >
                {/* Row label */}
                <div 
                  className="flex-shrink-0 px-3 flex items-center border-r border-slate-200/60 dark:border-gray-700"
                  style={{ width: SIDEBAR_WIDTH }}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-gray-300 truncate">
                    {row.label}
                  </span>
                </div>

                {/* Timeline area */}
                <div className="relative flex-1">
                  {/* Day columns background */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, idx) => {
                      const isToday = isSameDay(day, today)
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6
                      return (
                        <div
                          key={idx}
                          className={`flex-shrink-0 border-r border-slate-100/50 dark:border-gray-700/30 ${
                            isToday 
                              ? 'bg-blue-50/50 dark:bg-blue-900/20' 
                              : isWeekend 
                                ? 'bg-slate-100/30 dark:bg-gray-800/30' 
                                : ''
                          }`}
                          style={{ width: dayWidth }}
                        />
                      )
                    })}
                  </div>

                  {/* Assignment bars */}
                  {row.assignments.map(assignment => {
                    const style = getBarStyle(assignment)
                    if (!style) return null

                    const isTraining = assignment.assignment_type === 'training'
                    const barColor = isTraining 
                      ? '#F59E0B' // Amber for training
                      : (assignment.project?.color || '#6B7280')
                    
                    const assignmentLabel = isTraining
                      ? (assignment.training_description || 'Training')
                      : (assignment.project?.name || 'Unknown')

                    return (
                      <div
                        key={assignment.id}
                        className="absolute top-1 rounded-sm cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        style={{
                          left: style.left,
                          width: style.width,
                          height: ROW_HEIGHT - 8,
                          backgroundColor: barColor,
                        }}
                        title={`${assignment.crew_member.full_name} - ${assignmentLabel}\n${format(parseISO(assignment.start_date), 'MMM d')} - ${format(parseISO(assignment.end_date), 'MMM d')}`}
                      >
                        <div className="px-1.5 text-[10px] font-medium text-white truncate leading-[20px]">
                          {viewMode === 'by-project' 
                            ? assignment.crew_member.full_name 
                            : assignmentLabel}
                        </div>
                      </div>
                    )
                  })}

                  {/* Today indicator line */}
                  {todayIndex >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 dark:bg-blue-400 z-10"
                      style={{ left: todayIndex * dayWidth + dayWidth / 2 }}
                    />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Show more indicator */}
          {rows.length > 6 && (
            <div className="px-4 py-2 text-xs text-slate-500 dark:text-gray-400 bg-slate-50/50 dark:bg-gray-800/50 border-t border-slate-200/60 dark:border-gray-700">
              +{rows.length - 6} more {viewMode === 'by-project' ? 'vessels' : 'crew members'}
            </div>
          )}
        </div>
      </div>

      {/* Footer with link to full planning page */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/60 dark:bg-gray-800 dark:border-gray-700">
        <Link
          href="/planning"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          View full planning board
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
