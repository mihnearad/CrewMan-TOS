'use client'

import { useMemo } from 'react'
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns'
import { Clock, CheckCircle, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Assignment, AssignmentStatus } from './AssignmentCard'

interface AssignmentTimelineProps {
  assignments: Assignment[]
  /** Callback when an assignment is clicked */
  onAssignmentClick?: (assignment: Assignment) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Determines the status of an assignment based on current date
 */
function getAssignmentStatus(startDate: string, endDate: string): AssignmentStatus {
  const today = startOfDay(new Date())
  const start = startOfDay(new Date(startDate))
  const end = startOfDay(new Date(endDate))

  if (isBefore(end, today)) {
    return 'past'
  }

  if (isAfter(start, today)) {
    return 'upcoming'
  }

  return 'active'
}

/**
 * Check if assignment is ending soon (within 3 days)
 */
function isEndingSoon(endDate: string): boolean {
  const today = startOfDay(new Date())
  const end = startOfDay(new Date(endDate))
  const daysRemaining = differenceInDays(end, today)
  return daysRemaining >= 0 && daysRemaining <= 3
}

/**
 * AssignmentTimeline Component
 *
 * Visual timeline showing assignments as horizontal bars.
 * Past assignments are grayed out, current highlighted, future shown normally.
 * Compact horizontal bar view with tooltips for details.
 */
export default function AssignmentTimeline({
  assignments,
  onAssignmentClick,
  className,
}: AssignmentTimelineProps) {
  // Calculate the timeline range (2 months before and 5 months after today)
  const timelineConfig = useMemo(() => {
    const today = startOfDay(new Date())
    const start = startOfMonth(subMonths(today, 2))
    const end = endOfMonth(addMonths(today, 5))
    const totalDays = differenceInDays(end, start)

    // Generate month labels
    const months: { start: Date; end: Date; label: string }[] = []
    let current = start
    while (isBefore(current, end)) {
      const monthEnd = endOfMonth(current)
      months.push({
        start: current,
        end: monthEnd,
        label: format(current, 'MMM yyyy'),
      })
      current = addMonths(startOfMonth(current), 1)
    }

    return { start, end, totalDays, months, today }
  }, [])

  // Position an assignment on the timeline
  const getAssignmentPosition = (assignment: Assignment) => {
    const assignStart = startOfDay(new Date(assignment.start_date))
    const assignEnd = startOfDay(new Date(assignment.end_date))
    const { start, end, totalDays } = timelineConfig

    // Clamp the assignment dates to the visible range
    const visibleStart = isBefore(assignStart, start) ? start : assignStart
    const visibleEnd = isAfter(assignEnd, end) ? end : assignEnd

    // If assignment is completely outside the range, don't show it
    if (isAfter(visibleStart, end) || isBefore(visibleEnd, start)) {
      return null
    }

    const leftDays = differenceInDays(visibleStart, start)
    const widthDays = differenceInDays(visibleEnd, visibleStart) + 1

    return {
      left: `${(leftDays / totalDays) * 100}%`,
      width: `${Math.max((widthDays / totalDays) * 100, 2)}%`, // Minimum 2% width
      isClippedLeft: isBefore(assignStart, start),
      isClippedRight: isAfter(assignEnd, end),
    }
  }

  // Get today marker position
  const todayPosition = useMemo(() => {
    const { start, totalDays, today } = timelineConfig
    const daysFromStart = differenceInDays(today, start)
    return `${(daysFromStart / totalDays) * 100}%`
  }, [timelineConfig])

  if (assignments.length === 0) {
    return (
      <div
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-8 text-center',
          className
        )}
      >
        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No assignments to display on timeline</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 overflow-hidden',
        className
      )}
    >
      {/* Month headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {timelineConfig.months.map((month, idx) => {
          const monthWidth =
            (differenceInDays(month.end, month.start) + 1) / timelineConfig.totalDays
          return (
            <div
              key={idx}
              className="py-2 px-1 text-xs font-medium text-gray-600 text-center border-r border-gray-200 last:border-r-0 truncate"
              style={{ width: `${monthWidth * 100}%` }}
            >
              {month.label}
            </div>
          )
        })}
      </div>

      {/* Timeline area */}
      <div className="relative min-h-[200px] p-4">
        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: todayPosition }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
            Today
          </div>
        </div>

        {/* Grid lines for months */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timelineConfig.months.map((month, idx) => {
            const monthWidth =
              (differenceInDays(month.end, month.start) + 1) / timelineConfig.totalDays
            return (
              <div
                key={idx}
                className="border-r border-gray-100 last:border-r-0"
                style={{ width: `${monthWidth * 100}%` }}
              />
            )
          })}
        </div>

        {/* Assignment bars */}
        <div className="relative space-y-2 pt-6">
          {assignments.map((assignment) => {
            const position = getAssignmentPosition(assignment)
            if (!position) return null

            const projectColor = assignment.project.color || '#6b7280'
            const status = getAssignmentStatus(assignment.start_date, assignment.end_date)
            const endingSoon = status === 'active' && isEndingSoon(assignment.end_date)
            const start = new Date(assignment.start_date)
            const end = new Date(assignment.end_date)

            // Status-based styling
            const getBarStyles = () => {
              switch (status) {
                case 'active':
                  return {
                    backgroundColor: projectColor,
                    opacity: 1,
                  }
                case 'upcoming':
                  return {
                    backgroundColor: projectColor,
                    opacity: 0.7,
                  }
                case 'past':
                  return {
                    backgroundColor: '#9ca3af', // gray-400
                    opacity: 0.5,
                  }
              }
            }

            const barStyles = getBarStyles()

            return (
              <div key={assignment.id} className="relative h-10">
                <button
                  type="button"
                  onClick={() => onAssignmentClick?.(assignment)}
                  className={cn(
                    'absolute top-0 h-full rounded flex items-center px-2 gap-1.5 text-xs font-medium text-white',
                    'transition-all hover:shadow-lg hover:scale-[1.02] hover:z-20',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    onAssignmentClick ? 'cursor-pointer' : 'cursor-default',
                    position.isClippedLeft && 'rounded-l-none',
                    position.isClippedRight && 'rounded-r-none',
                    endingSoon && 'ring-2 ring-amber-400 ring-offset-1'
                  )}
                  style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: barStyles.backgroundColor,
                    opacity: barStyles.opacity,
                  }}
                  title={`${assignment.project.name}\n${assignment.role_on_project || 'No role specified'}\n${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`}
                >
                  {/* Status icon */}
                  {status === 'active' && !endingSoon && (
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  {status === 'active' && endingSoon && (
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-200" />
                  )}
                  {status === 'upcoming' && (
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  {status === 'past' && (
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  )}

                  {/* Project name */}
                  <span className="truncate">{assignment.project.name}</span>

                  {/* Active pulse indicator */}
                  {status === 'active' && !endingSoon && (
                    <span className="ml-auto flex-shrink-0 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-400 opacity-50" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500 relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500 opacity-70" />
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500 ring-2 ring-amber-400 ring-offset-1" />
          <span>Ending Soon</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version of the timeline for smaller spaces
 * Shows assignments as inline badges
 */
export function CompactAssignmentTimeline({
  assignments,
  onAssignmentClick,
  className,
}: AssignmentTimelineProps) {
  // Sort assignments by date
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
  }, [assignments])

  if (assignments.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500 italic', className)}>
        No assignments
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {sortedAssignments.map((assignment) => {
        const status = getAssignmentStatus(assignment.start_date, assignment.end_date)
        const projectColor = assignment.project.color || '#6b7280'
        const endingSoon = status === 'active' && isEndingSoon(assignment.end_date)

        return (
          <button
            key={assignment.id}
            type="button"
            onClick={() => onAssignmentClick?.(assignment)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              'transition-all hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              status === 'past' && 'opacity-60',
              endingSoon && 'ring-2 ring-amber-400 ring-offset-1',
              onAssignmentClick ? 'cursor-pointer' : 'cursor-default'
            )}
            style={{
              backgroundColor: status === 'past' ? '#e5e7eb' : projectColor + '20',
              color: status === 'past' ? '#6b7280' : projectColor,
            }}
            title={`${assignment.project.name}: ${format(new Date(assignment.start_date), 'MMM d')} - ${format(new Date(assignment.end_date), 'MMM d, yyyy')}`}
          >
            {status === 'active' && !endingSoon && (
              <CheckCircle className="h-3 w-3" />
            )}
            {status === 'active' && endingSoon && (
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            )}
            {status === 'upcoming' && <Clock className="h-3 w-3" />}
            {status === 'past' && <CheckCircle className="h-3 w-3 opacity-60" />}
            <span className="truncate max-w-[100px]">{assignment.project.name}</span>
          </button>
        )
      })}
    </div>
  )
}
