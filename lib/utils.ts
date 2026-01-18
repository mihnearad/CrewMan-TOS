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
