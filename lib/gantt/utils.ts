import {
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  differenceInWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isWithinInterval,
} from 'date-fns'
import type {
  GanttAssignment,
  GanttItem,
  GanttRow,
  GanttViewMode,
  GanttZoomLevel,
  GanttTimeRange,
  GanttProject,
  GanttCrewMember,
} from './types'

// Calculate the pixel width for a given time unit
export function getPixelsPerUnit(zoomLevel: GanttZoomLevel): number {
  switch (zoomLevel) {
    case 'day':
      return 40
    case 'week':
      return 120
    case 'month':
      return 200
    default:
      return 40
  }
}

// Calculate position and width for an assignment bar
export function getItemPosition(
  start: Date,
  end: Date,
  timeRange: GanttTimeRange,
  zoomLevel: GanttZoomLevel
): { left: number; width: number } {
  const pixelsPerUnit = getPixelsPerUnit(zoomLevel)
  const daysFromStart = differenceInDays(start, timeRange.start)
  const durationDays = differenceInDays(end, start) + 1

  switch (zoomLevel) {
    case 'day':
      return {
        left: daysFromStart * pixelsPerUnit,
        width: durationDays * pixelsPerUnit - 4, // -4 for gap
      }
    case 'week':
      return {
        left: (daysFromStart / 7) * pixelsPerUnit,
        width: (durationDays / 7) * pixelsPerUnit - 4,
      }
    case 'month':
      return {
        left: (daysFromStart / 30) * pixelsPerUnit,
        width: (durationDays / 30) * pixelsPerUnit - 4,
      }
    default:
      return { left: 0, width: 0 }
  }
}

// Calculate date from pixel position
export function getDateFromPosition(
  pixelX: number,
  timeRange: GanttTimeRange,
  zoomLevel: GanttZoomLevel
): Date {
  const pixelsPerUnit = getPixelsPerUnit(zoomLevel)

  switch (zoomLevel) {
    case 'day':
      return addDays(timeRange.start, Math.floor(pixelX / pixelsPerUnit))
    case 'week':
      return addDays(timeRange.start, Math.floor((pixelX / pixelsPerUnit) * 7))
    case 'month':
      return addDays(timeRange.start, Math.floor((pixelX / pixelsPerUnit) * 30))
    default:
      return timeRange.start
  }
}

// Get time scale columns for header
export function getTimeScaleColumns(
  timeRange: GanttTimeRange,
  zoomLevel: GanttZoomLevel
): { date: Date; label: string; subLabel?: string }[] {
  switch (zoomLevel) {
    case 'day':
      return eachDayOfInterval({ start: timeRange.start, end: timeRange.end }).map(date => ({
        date,
        label: format(date, 'd'),
        subLabel: format(date, 'EEE'),
      }))
    case 'week':
      return eachWeekOfInterval({ start: timeRange.start, end: timeRange.end }).map(date => ({
        date,
        label: format(date, 'MMM d'),
        subLabel: `Week ${format(date, 'w')}`,
      }))
    case 'month':
      return eachMonthOfInterval({ start: timeRange.start, end: timeRange.end }).map(date => ({
        date,
        label: format(date, 'MMMM'),
        subLabel: format(date, 'yyyy'),
      }))
    default:
      return []
  }
}

// Calculate total width for the timeline
export function getTimelineWidth(
  timeRange: GanttTimeRange,
  zoomLevel: GanttZoomLevel
): number {
  const columns = getTimeScaleColumns(timeRange, zoomLevel)
  return columns.length * getPixelsPerUnit(zoomLevel)
}

// Convert assignments to Gantt rows based on view mode
export function assignmentsToRows(
  assignments: GanttAssignment[],
  projects: GanttProject[],
  crewMembers: GanttCrewMember[],
  viewMode: GanttViewMode
): GanttRow[] {
  if (viewMode === 'by-crew') {
    return crewMembers.map(crew => {
      const crewAssignments = assignments.filter(a => a.crew_member_id === crew.id)
      return {
        id: crew.id,
        label: crew.full_name,
        sublabel: crew.role,
        items: crewAssignments.map(a => ({
          id: a.id,
          rowId: crew.id,
          start: parseISO(a.start_date),
          end: parseISO(a.end_date),
          assignment: a,
        })),
      }
    })
  } else {
    return projects.map(project => {
      const projectAssignments = assignments.filter(a => a.project_id === project.id)
      return {
        id: project.id,
        label: project.name,
        color: project.color,
        items: projectAssignments.map(a => ({
          id: a.id,
          rowId: project.id,
          start: parseISO(a.start_date),
          end: parseISO(a.end_date),
          assignment: a,
        })),
      }
    })
  }
}

// Get default time range (current month +/- buffer)
export function getDefaultTimeRange(): GanttTimeRange {
  const today = new Date()
  const start = addDays(startOfMonth(today), -14)
  const end = addDays(endOfMonth(addMonths(today, 2)), 14)
  return { start, end }
}

// Navigate time range
export function navigateTimeRange(
  current: GanttTimeRange,
  direction: 'prev' | 'next' | 'today',
  zoomLevel: GanttZoomLevel
): GanttTimeRange {
  if (direction === 'today') {
    return getDefaultTimeRange()
  }

  const multiplier = direction === 'next' ? 1 : -1

  switch (zoomLevel) {
    case 'day':
      return {
        start: addWeeks(current.start, multiplier),
        end: addWeeks(current.end, multiplier),
      }
    case 'week':
      return {
        start: addMonths(current.start, multiplier),
        end: addMonths(current.end, multiplier),
      }
    case 'month':
      return {
        start: addMonths(current.start, multiplier * 3),
        end: addMonths(current.end, multiplier * 3),
      }
    default:
      return current
  }
}

// Check if two date ranges overlap
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && end1 >= start2
}

// Format date for display
export function formatDateRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return format(start, 'MMM d, yyyy')
  }
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
}
