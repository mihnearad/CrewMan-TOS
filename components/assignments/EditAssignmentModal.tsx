'use client'

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react'
import { X, AlertCircle, AlertTriangle, Loader2, Calendar, CheckCircle } from 'lucide-react'
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { updateAssignment, checkConflict } from '@/app/planning/actions'
import type { Assignment } from './AssignmentCard'

interface ConflictInfo {
  hasConflict: boolean
  conflictingAssignments?: Array<{
    id: string
    start_date: string
    end_date: string
    project: {
      id: string
      name: string
    }
  }>
}

interface EditAssignmentModalProps {
  assignment: Assignment | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  /** Other assignments for this crew member (for local conflict detection) */
  otherAssignments?: Assignment[]
}

/**
 * Check for local conflicts without server call
 */
function checkLocalConflicts(
  startDate: string,
  endDate: string,
  currentAssignmentId: string,
  otherAssignments: Assignment[]
): { hasConflict: boolean; conflictingProjects: string[] } {
  const newStart = new Date(startDate)
  const newEnd = new Date(endDate)

  const conflicts = otherAssignments.filter((assignment) => {
    if (assignment.id === currentAssignmentId) return false

    const assignStart = new Date(assignment.start_date)
    const assignEnd = new Date(assignment.end_date)

    // Check if dates overlap: (StartA <= EndB) and (EndA >= StartB)
    return newStart <= assignEnd && newEnd >= assignStart
  })

  return {
    hasConflict: conflicts.length > 0,
    conflictingProjects: conflicts.map((a) => a.project.name),
  }
}

/**
 * EditAssignmentModal Component
 *
 * Modal for editing an existing assignment with fields for start_date, end_date,
 * and role_on_project. Includes real-time conflict detection and validation.
 */
export default function EditAssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSuccess,
  otherAssignments = [],
}: EditAssignmentModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverConflict, setServerConflict] = useState<ConflictInfo | null>(null)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    roleOnProject: '',
  })

  // Reset form when assignment changes
  useEffect(() => {
    if (assignment) {
      setFormData({
        startDate: assignment.start_date,
        endDate: assignment.end_date,
        roleOnProject: assignment.role_on_project || '',
      })
      setError(null)
      setServerConflict(null)
    }
  }, [assignment])

  // Local conflict check (instant feedback)
  const localConflict = useMemo(() => {
    if (!assignment || !formData.startDate || !formData.endDate) {
      return { hasConflict: false, conflictingProjects: [] }
    }
    return checkLocalConflicts(
      formData.startDate,
      formData.endDate,
      assignment.id,
      otherAssignments
    )
  }, [formData.startDate, formData.endDate, assignment, otherAssignments])

  // Debounced server conflict check
  useEffect(() => {
    if (!assignment || !formData.startDate || !formData.endDate) return

    // Skip server check if we already have local conflict detected
    if (localConflict.hasConflict) {
      setServerConflict(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingConflict(true)
      try {
        const result = await checkConflict(
          assignment.crew_member_id,
          formData.startDate,
          formData.endDate,
          assignment.id
        )
        setServerConflict(result as ConflictInfo)
      } catch {
        // Ignore errors in conflict check - will be caught on submit
      } finally {
        setIsCheckingConflict(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.startDate, formData.endDate, assignment, localConflict.hasConflict])

  // Date validation
  const dateValidation = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return { isValid: true, message: null }
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (isAfter(start, end)) {
      return { isValid: false, message: 'End date must be after start date' }
    }

    return { isValid: true, message: null }
  }, [formData.startDate, formData.endDate])

  // Combined conflict status
  const hasConflict = localConflict.hasConflict || serverConflict?.hasConflict

  const handleClose = useCallback(() => {
    if (!isPending) {
      onClose()
    }
  }, [isPending, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!assignment) return

    // Validate dates
    if (!dateValidation.isValid) {
      setError(dateValidation.message)
      return
    }

    startTransition(async () => {
      const result = await updateAssignment(assignment.id, {
        startDate: formData.startDate,
        endDate: formData.endDate,
        roleOnProject: formData.roleOnProject,
      })

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, isPending, onClose])

  if (!isOpen || !assignment) {
    return null
  }

  const projectColor = assignment.project.color || '#6b7280'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-assignment-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with project color accent */}
        <div
          className="h-1"
          style={{ backgroundColor: projectColor }}
        />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2
            id="edit-assignment-title"
            className="text-lg font-semibold text-gray-900"
          >
            Edit Assignment
          </h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Project info (read-only) */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project
            </label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: projectColor }}
              />
              <span className="truncate">{assignment.project.name}</span>
            </div>
          </div>

          {/* Role on project */}
          <div className="mb-5">
            <label
              htmlFor="roleOnProject"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Role on Project
            </label>
            <input
              type="text"
              id="roleOnProject"
              value={formData.roleOnProject}
              onChange={(e) =>
                setFormData({ ...formData, roleOnProject: e.target.value })
              }
              placeholder="e.g., Lead Developer, Consultant"
              disabled={isPending}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  disabled={isPending}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500',
                    !dateValidation.isValid
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  )}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                  disabled={isPending}
                  className={cn(
                    'w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500',
                    !dateValidation.isValid
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Date validation error */}
          {!dateValidation.isValid && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{dateValidation.message}</p>
            </div>
          )}

          {/* Conflict warning */}
          {hasConflict && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Schedule Conflict Detected
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {localConflict.hasConflict
                    ? `Overlaps with: ${localConflict.conflictingProjects.join(', ')}`
                    : serverConflict?.conflictingAssignments
                      ?.map((a) => a.project.name)
                      .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Checking conflict indicator */}
          {isCheckingConflict && !localConflict.hasConflict && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-700">Checking for conflicts...</p>
            </div>
          )}

          {/* No conflicts indicator */}
          {!hasConflict &&
            !isCheckingConflict &&
            dateValidation.isValid &&
            formData.startDate &&
            formData.endDate && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-700">No scheduling conflicts</p>
              </div>
            )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !dateValidation.isValid}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2',
                hasConflict
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending
                ? 'Saving...'
                : hasConflict
                  ? 'Save Anyway'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
