'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { format, parseISO, differenceInDays, isWithinInterval, eachDayOfInterval, addDays } from 'date-fns'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronRight,
  GripHorizontal
} from 'lucide-react'
import { assignCrew, updateAssignment, removeAssignment, checkConflict } from '@/app/planning/actions'
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent
} from '@dnd-kit/core'

// Types
interface CrewMember {
  id: string
  full_name: string
  role: string
  status: string
  email?: string | null
  phone?: string | null
}

interface Assignment {
  id: string
  project_id: string
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  crew_member: CrewMember
}

interface Project {
  id: string
  name: string
  color: string
  start_date: string | null
  end_date: string | null
}

interface ProjectCrewManagementProps {
  project: Project
  assignments: Assignment[]
  availableCrew: CrewMember[]
}

// Modal wrapper component
function Modal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Crew Modal Component
function AddCrewModal({
  isOpen,
  onClose,
  project,
  availableCrew,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  project: Project
  availableCrew: CrewMember[]
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedCrewId, setSelectedCrewId] = useState('')
  const [startDate, setStartDate] = useState(project.start_date || '')
  const [endDate, setEndDate] = useState(project.end_date || '')
  const [roleOnProject, setRoleOnProject] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  const resetForm = () => {
    setSelectedCrewId('')
    setStartDate(project.start_date || '')
    setEndDate(project.end_date || '')
    setRoleOnProject('')
    setError(null)
    setConflictWarning(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Check for conflicts when crew or dates change
  const handleCheckConflict = async () => {
    if (!selectedCrewId || !startDate || !endDate) {
      setConflictWarning(null)
      return
    }

    const result = await checkConflict(selectedCrewId, startDate, endDate)
    if (result.hasConflict && result.conflictingAssignments) {
      const projectNames = result.conflictingAssignments
        .map(a => a.project.name)
        .join(', ')
      setConflictWarning(`Warning: Conflicts with assignment(s) to ${projectNames}`)
    } else {
      setConflictWarning(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedCrewId) {
      setError('Please select a crew member')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
      return
    }

    startTransition(async () => {
      const result = await assignCrew(
        project.id,
        selectedCrewId,
        startDate,
        endDate,
        roleOnProject || undefined
      )

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
        handleClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Crew Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {conflictWarning && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{conflictWarning}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="crew" className="block text-sm font-medium text-gray-700">
            Crew Member
          </label>
          <select
            id="crew"
            value={selectedCrewId}
            onChange={(e) => {
              setSelectedCrewId(e.target.value)
              setTimeout(handleCheckConflict, 100)
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a crew member...</option>
            {availableCrew.map((crew) => (
              <option key={crew.id} value={crew.id}>
                {crew.full_name} - {crew.role}
                {crew.status !== 'available' && ` (${crew.status.replace('_', ' ')})`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setTimeout(handleCheckConflict, 100)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setTimeout(handleCheckConflict, 100)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role on Project (Optional)
          </label>
          <input
            type="text"
            id="role"
            value={roleOnProject}
            onChange={(e) => setRoleOnProject(e.target.value)}
            placeholder="e.g., Lead Developer, QA Engineer"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            If left empty, their default role will be used
          </p>
        </div>

        <div className="mt-5 sm:mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Assigning...' : 'Assign Crew'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Edit Assignment Modal Component
function EditAssignmentModal({
  isOpen,
  onClose,
  assignment,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment | null
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [startDate, setStartDate] = useState(assignment?.start_date || '')
  const [endDate, setEndDate] = useState(assignment?.end_date || '')
  const [roleOnProject, setRoleOnProject] = useState(assignment?.role_on_project || '')
  const [error, setError] = useState<string | null>(null)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  // Update form when assignment changes
  useState(() => {
    if (assignment) {
      setStartDate(assignment.start_date)
      setEndDate(assignment.end_date)
      setRoleOnProject(assignment.role_on_project || '')
    }
  })

  const handleClose = () => {
    setError(null)
    setConflictWarning(null)
    onClose()
  }

  const handleCheckConflict = async () => {
    if (!assignment || !startDate || !endDate) {
      setConflictWarning(null)
      return
    }

    const result = await checkConflict(
      assignment.crew_member_id,
      startDate,
      endDate,
      assignment.id
    )
    if (result.hasConflict && result.conflictingAssignments) {
      const projectNames = result.conflictingAssignments
        .map(a => a.project.name)
        .join(', ')
      setConflictWarning(`Warning: Conflicts with assignment(s) to ${projectNames}`)
    } else {
      setConflictWarning(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return

    setError(null)

    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
      return
    }

    startTransition(async () => {
      const result = await updateAssignment(assignment.id, {
        startDate,
        endDate,
        roleOnProject: roleOnProject || undefined
      })

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
        handleClose()
      }
    })
  }

  if (!assignment) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Assignment">
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-900">{assignment.crew_member.full_name}</p>
        <p className="text-sm text-gray-500">{assignment.crew_member.role}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {conflictWarning && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{conflictWarning}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="editStartDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="editStartDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setTimeout(handleCheckConflict, 100)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="editEndDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="editEndDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setTimeout(handleCheckConflict, 100)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="editRole" className="block text-sm font-medium text-gray-700">
            Role on Project
          </label>
          <input
            type="text"
            id="editRole"
            value={roleOnProject}
            onChange={(e) => setRoleOnProject(e.target.value)}
            placeholder="e.g., Lead Developer, QA Engineer"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="mt-5 sm:mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Assignment Card Component
function AssignmentCard({
  assignment,
  onEdit,
  onRemove
}: {
  assignment: Assignment
  onEdit: () => void
  onRemove: () => void
}) {
  const [isRemoving, startTransition] = useTransition()
  const duration = differenceInDays(
    parseISO(assignment.end_date),
    parseISO(assignment.start_date)
  ) + 1

  const handleRemove = () => {
    if (!confirm(`Remove ${assignment.crew_member.full_name} from this project?`)) {
      return
    }

    startTransition(async () => {
      await removeAssignment(assignment.id)
    })
  }

  const isCurrentlyActive = isWithinInterval(new Date(), {
    start: parseISO(assignment.start_date),
    end: parseISO(assignment.end_date)
  })

  return (
    <div className={`border rounded-lg p-4 ${isCurrentlyActive ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {assignment.crew_member.full_name}
            </h4>
            {isCurrentlyActive && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {assignment.role_on_project || assignment.crew_member.role}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {format(parseISO(assignment.start_date), 'MMM d, yyyy')}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {format(parseISO(assignment.end_date), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {duration} day{duration !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit assignment"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Remove from project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Draggable Assignment Bar Component
function DraggableAssignmentBar({
  assignment,
  style,
  isActive,
  isDragging,
  dragOffset,
  totalDays,
  onDragPreview
}: {
  assignment: Assignment
  style: { left: string; width: string }
  isActive: boolean
  isDragging: boolean
  dragOffset: number
  totalDays: number
  onDragPreview: (days: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: assignment.id,
    data: { assignment }
  })

  const transformStyle = transform
    ? { transform: `translateX(${transform.x}px)` }
    : undefined

  return (
    <div className="relative h-8">
      <div
        ref={setNodeRef}
        className={`absolute h-full rounded px-2 py-1 text-xs font-medium text-white truncate flex items-center gap-1 cursor-grab active:cursor-grabbing ${
          isActive ? 'bg-green-600' : 'bg-blue-600'
        } ${isDragging ? 'opacity-80 shadow-lg ring-2 ring-offset-1 ring-blue-400 z-20' : ''}`}
        style={{ ...style, ...transformStyle }}
        title={`${assignment.crew_member.full_name}: ${format(parseISO(assignment.start_date), 'MMM d')} - ${format(parseISO(assignment.end_date), 'MMM d')} (drag to move)`}
        {...listeners}
        {...attributes}
      >
        <GripHorizontal className="h-3 w-3 flex-shrink-0 opacity-60" />
        <span className="truncate">{assignment.crew_member.full_name}</span>
      </div>
    </div>
  )
}

// Assignment Timeline Component with Drag and Drop
function AssignmentTimeline({
  assignments,
  project,
  onAssignmentUpdate
}: {
  assignments: Assignment[]
  project: Project
  onAssignmentUpdate: (assignmentId: string, newStartDate: string, newEndDate: string) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragDayOffset, setDragDayOffset] = useState(0)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  if (assignments.length === 0) return null

  // Calculate timeline bounds
  const allDates = assignments.flatMap(a => [
    parseISO(a.start_date),
    parseISO(a.end_date)
  ])

  if (project.start_date) allDates.push(parseISO(project.start_date))
  if (project.end_date) allDates.push(parseISO(project.end_date))

  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

  // Add some padding
  minDate.setDate(minDate.getDate() - 2)
  maxDate.setDate(maxDate.getDate() + 2)

  const totalDays = differenceInDays(maxDate, minDate) + 1
  const days = eachDayOfInterval({ start: minDate, end: maxDate })

  // Generate month headers
  const months: { month: string; startDay: number; span: number }[] = []
  let currentMonth = ''
  days.forEach((day, index) => {
    const monthKey = format(day, 'MMM yyyy')
    if (monthKey !== currentMonth) {
      if (months.length > 0) {
        months[months.length - 1].span = index - months[months.length - 1].startDay
      }
      months.push({ month: monthKey, startDay: index, span: 0 })
      currentMonth = monthKey
    }
  })
  if (months.length > 0) {
    months[months.length - 1].span = days.length - months[months.length - 1].startDay
  }

  const getPositionStyle = (startDate: string, endDate: string) => {
    const start = differenceInDays(parseISO(startDate), minDate)
    const duration = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    return {
      left: `${(start / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    }
  }

  const pixelsToDays = (pixels: number): number => {
    if (!timelineRef.current) return 0
    const timelineWidth = timelineRef.current.offsetWidth
    const daysPerPixel = totalDays / timelineWidth
    return Math.round(pixels * daysPerPixel)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string)
    setDragDayOffset(0)
    setConflictWarning(null)
  }

  const handleDragMove = async (event: DragMoveEvent) => {
    if (!event.delta) return
    const daysMoved = pixelsToDays(event.delta.x)
    setDragDayOffset(daysMoved)

    // Check for conflicts during drag
    const assignment = assignments.find(a => a.id === event.active.id)
    if (assignment && daysMoved !== 0) {
      const newStart = addDays(parseISO(assignment.start_date), daysMoved)
      const newEnd = addDays(parseISO(assignment.end_date), daysMoved)

      const result = await checkConflict(
        assignment.crew_member_id,
        format(newStart, 'yyyy-MM-dd'),
        format(newEnd, 'yyyy-MM-dd'),
        assignment.id
      )

      if (result.hasConflict && result.conflictingAssignments) {
        const projectNames = result.conflictingAssignments.map(a => a.project.name).join(', ')
        setConflictWarning(`Conflict with: ${projectNames}`)
      } else {
        setConflictWarning(null)
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event
    setDraggingId(null)
    setDragDayOffset(0)
    setConflictWarning(null)

    if (!delta || (delta.x === 0 && delta.y === 0)) return

    const daysMoved = pixelsToDays(delta.x)
    if (daysMoved === 0) return

    const assignment = assignments.find(a => a.id === active.id)
    if (!assignment) return

    const newStart = addDays(parseISO(assignment.start_date), daysMoved)
    const newEnd = addDays(parseISO(assignment.end_date), daysMoved)

    onAssignmentUpdate(
      assignment.id,
      format(newStart, 'yyyy-MM-dd'),
      format(newEnd, 'yyyy-MM-dd')
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Assignment Timeline</h4>
        <span className="text-xs text-gray-500">Drag bars to reschedule</span>
      </div>

      {/* Conflict warning during drag */}
      {conflictWarning && (
        <div className="mb-2 rounded-md bg-yellow-50 p-2 text-xs">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-yellow-700">{conflictWarning}</span>
          </div>
        </div>
      )}

      {/* Drag day offset indicator */}
      {draggingId && dragDayOffset !== 0 && (
        <div className="mb-2 text-xs text-gray-600">
          Moving {Math.abs(dragDayOffset)} day{Math.abs(dragDayOffset) !== 1 ? 's' : ''} {dragDayOffset > 0 ? 'forward' : 'backward'}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div ref={timelineRef} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Month headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-xs font-medium text-gray-600 px-2 py-1 border-r border-gray-200 last:border-r-0"
                style={{ width: `${(m.span / totalDays) * 100}%` }}
              >
                {m.month}
              </div>
            ))}
          </div>

          {/* Day markers */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {days.filter((_, i) => i % 7 === 0).map((day, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-400 px-1"
                style={{ width: `${(7 / totalDays) * 100}%` }}
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>

          {/* Assignment bars */}
          <div className="p-2 space-y-2">
            {assignments.map((assignment) => {
              const style = getPositionStyle(assignment.start_date, assignment.end_date)
              const isActive = isWithinInterval(new Date(), {
                start: parseISO(assignment.start_date),
                end: parseISO(assignment.end_date)
              })

              return (
                <DraggableAssignmentBar
                  key={assignment.id}
                  assignment={assignment}
                  style={style}
                  isActive={isActive}
                  isDragging={draggingId === assignment.id}
                  dragOffset={draggingId === assignment.id ? dragDayOffset : 0}
                  totalDays={totalDays}
                  onDragPreview={() => {}}
                />
              )
            })}
          </div>

          {/* Today marker */}
          {isWithinInterval(new Date(), { start: minDate, end: maxDate }) && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${(differenceInDays(new Date(), minDate) / totalDays) * 100}%` }}
            />
          )}
        </div>
      </DndContext>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center">
          <span className="w-3 h-3 rounded bg-green-600 mr-1" />
          Currently active
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded bg-blue-600 mr-1" />
          Scheduled
        </span>
        <span className="flex items-center">
          <GripHorizontal className="h-3 w-3 mr-1" />
          Draggable
        </span>
      </div>
    </div>
  )
}

// Main Component
export default function ProjectCrewManagement({
  project,
  assignments: initialAssignments,
  availableCrew
}: ProjectCrewManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [isUpdating, startUpdateTransition] = useTransition()

  // Sort assignments by start date
  const sortedAssignments = [...initialAssignments].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )

  // Count active assignments
  const activeCount = sortedAssignments.filter(a =>
    isWithinInterval(new Date(), {
      start: parseISO(a.start_date),
      end: parseISO(a.end_date)
    })
  ).length

  const handleSuccess = () => {
    // Page will revalidate automatically due to server action
  }

  const handleTimelineDragUpdate = useCallback((
    assignmentId: string,
    newStartDate: string,
    newEndDate: string
  ) => {
    startUpdateTransition(async () => {
      await updateAssignment(assignmentId, {
        startDate: newStartDate,
        endDate: newEndDate
      })
    })
  }, [])

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-400" />
              Crew Management
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {sortedAssignments.length} total assignment{sortedAssignments.length !== 1 ? 's' : ''}
              {activeCount > 0 && (
                <span className="text-green-600 ml-2">
                  ({activeCount} currently active)
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Assign Crew
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 sm:px-6">
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No crew assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by assigning crew members to this project.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Crew Member
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Assignment cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {sortedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={() => setEditingAssignment(assignment)}
                  onRemove={() => {}}
                />
              ))}
            </div>

            {/* Timeline visualization */}
            <AssignmentTimeline
              assignments={sortedAssignments}
              project={project}
              onAssignmentUpdate={handleTimelineDragUpdate}
            />
            {isUpdating && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                Updating assignment...
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddCrewModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        project={project}
        availableCrew={availableCrew}
        onSuccess={handleSuccess}
      />

      <EditAssignmentModal
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        assignment={editingAssignment}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
