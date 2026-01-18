'use client'

import { useState, useMemo, useTransition } from 'react'
import {
  Calendar,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  User,
  Briefcase,
} from 'lucide-react'
import { format, differenceInDays, isBefore, isAfter } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { removeAssignment } from '@/app/planning/actions'

export interface Assignment {
  id: string
  project_id: string
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  project: {
    id: string
    name: string
    color: string
    type?: string
    status?: string
  }
  crew_member?: {
    id: string
    full_name: string
    role: string
  }
}

export type AssignmentStatus = 'active' | 'upcoming' | 'past'

interface AssignmentCardProps {
  assignment: Assignment
  /** Display mode - determines what info is shown prominently */
  displayMode: 'crew-view' | 'project-view'
  /** Callback when edit is clicked */
  onEdit?: (assignment: Assignment) => void
  /** Callback when delete is completed */
  onDelete?: (assignmentId: string) => void
  /** Show link to project/crew detail page */
  showLink?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Determines the status of an assignment based on current date
 */
function getAssignmentStatus(startDate: string, endDate: string): AssignmentStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  if (isBefore(end, today)) {
    return 'past'
  }

  if (isAfter(start, today)) {
    return 'upcoming'
  }

  return 'active'
}

/**
 * Returns status display configuration
 */
function getStatusConfig(status: AssignmentStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        icon: CheckCircle,
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        borderClass: 'border-green-200',
        iconClass: 'text-green-500',
        badgeClass: 'bg-green-100 text-green-800',
      }
    case 'upcoming':
      return {
        label: 'Upcoming',
        icon: Clock,
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200',
        iconClass: 'text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-800',
      }
    case 'past':
      return {
        label: 'Completed',
        icon: CheckCircle,
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-500',
        borderClass: 'border-gray-200',
        iconClass: 'text-gray-400',
        badgeClass: 'bg-gray-100 text-gray-600',
      }
  }
}

/**
 * AssignmentCard Component
 *
 * Displays a single crew assignment with status indicators, dates, and role information.
 * Supports both crew-view (shows project info) and project-view (shows crew member info).
 * Color-coded by project color with edit/delete capabilities.
 */
export default function AssignmentCard({
  assignment,
  displayMode,
  onEdit,
  onDelete,
  showLink = true,
  className,
}: AssignmentCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = useMemo(
    () => getAssignmentStatus(assignment.start_date, assignment.end_date),
    [assignment.start_date, assignment.end_date]
  )

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon
  const projectColor = assignment.project.color || '#6b7280'

  // Calculate days remaining or days since completion
  const daysInfo = useMemo(() => {
    const today = new Date()
    const endDate = new Date(assignment.end_date)
    const startDate = new Date(assignment.start_date)

    if (status === 'past') {
      const daysAgo = differenceInDays(today, endDate)
      return { label: `Ended ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`, urgent: false }
    }

    if (status === 'upcoming') {
      const daysUntil = differenceInDays(startDate, today)
      return { label: `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, urgent: false }
    }

    const daysRemaining = differenceInDays(endDate, today)
    const urgent = daysRemaining <= 3
    return {
      label:
        daysRemaining === 0
          ? 'Ends today'
          : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
      urgent,
    }
  }, [assignment.start_date, assignment.end_date, status])

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await removeAssignment(assignment.id)
      if (result.error) {
        setError(result.error)
        setShowDeleteConfirm(false)
      } else {
        onDelete?.(assignment.id)
      }
    })
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const isPast = status === 'past'

  return (
    <div
      className={cn(
        'relative rounded-lg border shadow-sm transition-all duration-200',
        'hover:shadow-md',
        isPast ? 'opacity-75' : '',
        statusConfig.borderClass,
        className
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: projectColor,
      }}
    >
      {/* Project color accent bar */}
      <div
        className="absolute top-0 right-0 w-16 h-1 rounded-tr-lg"
        style={{ backgroundColor: projectColor }}
      />

      <div className={cn('p-4', statusConfig.bgClass)}>
        {/* Header row: Title and status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {displayMode === 'crew-view' ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  {showLink ? (
                    <Link
                      href={`/projects/${assignment.project_id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1 truncate"
                    >
                      {assignment.project.name}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-gray-900 truncate">
                      {assignment.project.name}
                    </h3>
                  )}
                </div>
                {assignment.role_on_project && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{assignment.role_on_project}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {showLink && assignment.crew_member ? (
                    <Link
                      href={`/crew/${assignment.crew_member_id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1 truncate"
                    >
                      {assignment.crew_member.full_name}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-gray-900 truncate">
                      {assignment.crew_member?.full_name || 'Unknown'}
                    </h3>
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  {assignment.crew_member?.role && (
                    <span className="truncate">{assignment.crew_member.role}</span>
                  )}
                  {assignment.crew_member?.role && assignment.role_on_project && (
                    <span className="text-gray-400 mx-1">|</span>
                  )}
                  {assignment.role_on_project && (
                    <>
                      <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{assignment.role_on_project}</span>
                    </>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Status badge */}
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
              statusConfig.badgeClass
            )}
          >
            <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.iconClass)} />
            {statusConfig.label}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>
            {format(new Date(assignment.start_date), 'MMM d, yyyy')} -{' '}
            {format(new Date(assignment.end_date), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Days info with urgency indicator */}
        <div className="flex items-center gap-2 text-sm mb-3">
          {daysInfo.urgent && status === 'active' && (
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
          <span
            className={cn(
              daysInfo.urgent && status === 'active'
                ? 'text-amber-600 font-medium'
                : 'text-gray-500'
            )}
          >
            {daysInfo.label}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Action buttons */}
        {!isPast && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200/70">
            {showDeleteConfirm ? (
              <>
                <span className="text-sm text-gray-600">Delete this assignment?</span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isPending}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEdit?.(assignment)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-md transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
