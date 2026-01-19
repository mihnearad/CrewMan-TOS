import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addDays,
  differenceInDays,
  isWithinInterval,
  format
} from 'date-fns'

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get all days in a week starting from Sunday
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 }) // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

// Get all days in a month calendar grid (including overflow days from prev/next month)
export function getMonthCalendarDays(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Split into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks
}

// Check if two date ranges overlap
export function datesOverlap(
  range1: { start: Date | string, end: Date | string },
  range2: { start: Date | string, end: Date | string }
): boolean {
  const start1 = typeof range1.start === 'string' ? new Date(range1.start) : range1.start
  const end1 = typeof range1.end === 'string' ? new Date(range1.end) : range1.end
  const start2 = typeof range2.start === 'string' ? new Date(range2.start) : range2.start
  const end2 = typeof range2.end === 'string' ? new Date(range2.end) : range2.end

  return start1 <= end2 && end1 >= start2
}

// Check if a date is within a range
export function isDateInRange(date: Date | string, start: Date | string, end: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const startObj = typeof start === 'string' ? new Date(start) : start
  const endObj = typeof end === 'string' ? new Date(end) : end

  return isWithinInterval(dateObj, { start: startObj, end: endObj })
}

// Get assignment status based on end date
export function getAssignmentStatus(endDate: Date | string): 'ending-critical' | 'ending-soon' | 'active' | 'past' {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const today = new Date()
  const daysUntil = differenceInDays(end, today)

  if (daysUntil < 0) return 'past'
  if (daysUntil <= 3) return 'ending-critical' // Red
  if (daysUntil <= 7) return 'ending-soon' // Yellow
  return 'active'
}

// Format date range for display
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end

  return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
}

// Get color classes for assignment status
export function getStatusColorClasses(status: 'ending-critical' | 'ending-soon' | 'active' | 'past'): string {
  switch (status) {
    case 'ending-critical':
      return 'bg-red-50 border-red-500 border-2'
    case 'ending-soon':
      return 'bg-yellow-50 border-yellow-500 border-2'
    case 'past':
      return 'bg-gray-100 border-gray-300'
    default:
      return 'bg-white border-gray-200'
  }
}

// Crew member status display configuration
export interface CrewStatusDisplay {
  label: string
  bgClass: string
  textClass: string
  dotClass: string
}

interface AssignmentDates {
  start_date: string
  end_date: string
  assignment_type?: 'vessel' | 'training' | null
}

// Compute the display status for a crew member based on DB status and assignments
export function computeCrewDisplayStatus(dbStatus: string, assignments?: AssignmentDates[]): string {
  if (!assignments || assignments.length === 0) return dbStatus
  if (dbStatus === 'on_leave') return dbStatus // On leave takes precedence
  
  const today = new Date().toISOString().split('T')[0]
  
  const activeAssignments = assignments.filter(a => a.start_date <= today && a.end_date >= today)
  if (activeAssignments.length > 0) {
    const hasTraining = activeAssignments.some(a => a.assignment_type === 'training')
    return hasTraining ? 'training' : 'on_project'
  }
  
  const hasFutureAssignment = assignments.some(a => a.start_date > today)
  if (hasFutureAssignment) return 'planned'
  
  return dbStatus
}

// Get display properties for a crew member status
export function getCrewStatusDisplay(status: string, darkMode: boolean = false): CrewStatusDisplay {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        bgClass: darkMode ? 'bg-green-100 dark:bg-green-900/50' : 'bg-green-100',
        textClass: darkMode ? 'text-green-800 dark:text-green-400' : 'text-green-800',
        dotClass: 'bg-green-500',
      }
    case 'on_project':
      return {
        label: 'Onboard',
        bgClass: darkMode ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-blue-100',
        textClass: darkMode ? 'text-blue-800 dark:text-blue-400' : 'text-blue-800',
        dotClass: 'bg-blue-500',
      }
    case 'on_leave':
      return {
        label: 'On Leave',
        bgClass: darkMode ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-yellow-100',
        textClass: darkMode ? 'text-yellow-800 dark:text-yellow-400' : 'text-yellow-800',
        dotClass: 'bg-yellow-500',
      }
    case 'planned':
      return {
        label: 'Planned',
        bgClass: darkMode ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-purple-100',
        textClass: darkMode ? 'text-purple-800 dark:text-purple-400' : 'text-purple-800',
        dotClass: 'bg-purple-500',
      }
    case 'training':
      return {
        label: 'Training',
        bgClass: darkMode ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-orange-100',
        textClass: darkMode ? 'text-orange-800 dark:text-orange-300' : 'text-orange-800',
        dotClass: 'bg-orange-500',
      }
    default:
      return {
        label: status.replace('_', ' '),
        bgClass: darkMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-100',
        textClass: darkMode ? 'text-gray-800 dark:text-gray-300' : 'text-gray-800',
        dotClass: 'bg-gray-500',
      }
  }
}
