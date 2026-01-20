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
  GanttClient,
} from './types'

// Calculate the pixel width for a given time unit
export function getPixelsPerUnit(zoomLevel: GanttZoomLevel): number {
  switch (zoomLevel) {
    case 'day':
      return 40
    case 'week':
      return 120
    case 'month':
      return 240 // Increased width for month view to avoid squashing content
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
        // Average month is 30.44 days, using 30 for simplicity but might cause drift
        // Better to use differenceInMonths + fractional part?
        // Let's stick to days but scale by pixelsPerUnit / 30 for now
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
      // Approximate 30 days per month unit
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
  viewMode: GanttViewMode,
  clients?: GanttClient[]
): GanttRow[] {
  if (viewMode === 'by-crew') {
    return crewMembers.map(crew => {
      const crewAssignments = assignments.filter(a => a.crew_member_id === crew.id)
      return {
        id: crew.id,
        label: crew.full_name,
        sublabel: crew.role,
        crewMemberId: crew.id,
        crewDetails: {
          nationality: crew.nationality,
          home_airport: crew.home_airport,
        },
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
    // Vessel-centric view with client grouping: Client > Vessel > Crew
    const rows: GanttRow[] = []
    
    if (clients && clients.length > 0) {
      // Group by client
      const clientMap = new Map<string, GanttClient>()
      clients.forEach(client => clientMap.set(client.id, client))
      
      // Create a map of client ID to projects
      const projectsByClient = new Map<string | null, GanttProject[]>()
      projects.forEach(project => {
        const clientId = project.client_id || null
        const existing = projectsByClient.get(clientId) || []
        existing.push(project)
        projectsByClient.set(clientId, existing)
      })
      
      // Process each client
      Array.from(projectsByClient.entries()).forEach(([clientId, clientProjects]) => {
        const hasAssignments = clientProjects.some(p => 
          assignments.some(a => a.project_id === p.id)
        )
        
        if (!hasAssignments) return
        
        // Add client header
        if (clientId) {
          const client = clientMap.get(clientId)
          rows.push({
            id: `client-header-${clientId}`,
            label: client?.name || 'Unknown Client',
            items: [],
            isGroupHeader: true,
            isClientHeader: true,
            clientId: clientId,
            color: '#6b7280', // Gray for client headers
          })
        } else {
          // Unassigned group
          rows.push({
            id: 'client-header-unassigned',
            label: 'Unassigned',
            items: [],
            isGroupHeader: true,
            isClientHeader: true,
            color: '#9ca3af', // Light gray
          })
        }
        
        // Add vessels and crew for this client
        clientProjects.forEach(project => {
          const projectAssignments = assignments.filter(a => a.project_id === project.id)
          
          if (projectAssignments.length === 0) return
          
          // Add vessel header row
          rows.push({
            id: `vessel-header-${project.id}`,
            label: project.name,
            color: project.color,
            items: [],
            isGroupHeader: true,
            parentGroupId: clientId || 'unassigned',
          })
          
          // Group assignments by crew member
          const crewAssignmentsMap = new Map<string, GanttAssignment[]>()
          projectAssignments.forEach(a => {
            const existing = crewAssignmentsMap.get(a.crew_member_id) || []
            existing.push(a)
            crewAssignmentsMap.set(a.crew_member_id, existing)
          })
          
          // Add crew rows
          crewAssignmentsMap.forEach((crewAssignments, crewId) => {
            const crewMember = crewAssignments[0].crew_member
            rows.push({
              id: `${project.id}-${crewId}`,
              label: crewMember.full_name,
              sublabel: crewAssignments[0].role_on_project || crewMember.role,
              parentGroupId: project.id,
              crewMemberId: crewId,
              crewDetails: {
                nationality: crewMember.nationality,
                home_airport: crewMember.home_airport,
              },
              items: crewAssignments.map(a => ({
                id: a.id,
                rowId: `${project.id}-${crewId}`,
                start: parseISO(a.start_date),
                end: parseISO(a.end_date),
                assignment: a,
              })),
            })
          })
        })
      })
    } else {
      // Fallback: no client grouping (original behavior)
      projects.forEach(project => {
        const projectAssignments = assignments.filter(a => a.project_id === project.id)
        
        if (projectAssignments.length === 0) return
        
        rows.push({
          id: `vessel-header-${project.id}`,
          label: project.name,
          color: project.color,
          items: [],
          isGroupHeader: true,
        })
        
        const crewAssignmentsMap = new Map<string, GanttAssignment[]>()
        projectAssignments.forEach(a => {
          const existing = crewAssignmentsMap.get(a.crew_member_id) || []
          existing.push(a)
          crewAssignmentsMap.set(a.crew_member_id, existing)
        })
        
        crewAssignmentsMap.forEach((crewAssignments, crewId) => {
          const crewMember = crewAssignments[0].crew_member
          rows.push({
            id: `${project.id}-${crewId}`,
            label: crewMember.full_name,
            sublabel: crewAssignments[0].role_on_project || crewMember.role,
            parentGroupId: project.id,
            crewMemberId: crewId,
            crewDetails: {
              nationality: crewMember.nationality,
              home_airport: crewMember.home_airport,
            },
            items: crewAssignments.map(a => ({
              id: a.id,
              rowId: `${project.id}-${crewId}`,
              start: parseISO(a.start_date),
              end: parseISO(a.end_date),
              assignment: a,
            })),
          })
        })
      })
    }
    
    // Add training assignments section
    const trainingAssignments = assignments.filter(a => a.assignment_type === 'training' && !a.project_id)
    if (trainingAssignments.length > 0) {
      // Add training header
      rows.push({
        id: 'training-header',
        label: 'Training',
        items: [],
        isGroupHeader: true,
        isClientHeader: true,
        color: '#f59e0b', // Orange for training
      })
      
      // Group by crew member
      const trainingByCrewMap = new Map<string, GanttAssignment[]>()
      trainingAssignments.forEach(a => {
        const existing = trainingByCrewMap.get(a.crew_member_id) || []
        existing.push(a)
        trainingByCrewMap.set(a.crew_member_id, existing)
      })
      
      trainingByCrewMap.forEach((crewTraining, crewId) => {
        const crewMember = crewTraining[0].crew_member
        rows.push({
          id: `training-${crewId}`,
          label: crewMember.full_name,
          sublabel: crewMember.role,
          parentGroupId: 'training',
          crewMemberId: crewId,
          crewDetails: {
            nationality: crewMember.nationality,
            home_airport: crewMember.home_airport,
          },
          items: crewTraining.map(a => ({
            id: a.id,
            rowId: `training-${crewId}`,
            start: parseISO(a.start_date),
            end: parseISO(a.end_date),
            assignment: a,
          })),
        })
      })
    }
    
    return rows
  }
}

// Get default time range (current month +/- buffer)
export function getDefaultTimeRange(): GanttTimeRange {
  const today = new Date()
  const start = addDays(startOfMonth(addMonths(today, -1)), 0)
  const end = addDays(endOfMonth(addMonths(today, 12)), 0)
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
        start: addWeeks(current.start, multiplier * 2), // Move by 2 weeks
        end: addWeeks(current.end, multiplier * 2),
      }
    case 'week':
      return {
        start: addMonths(current.start, multiplier),
        end: addMonths(current.end, multiplier),
      }
    case 'month':
      return {
        start: addMonths(current.start, multiplier * 6), // Move by 6 months instead of 3
        end: addMonths(current.end, multiplier * 6),
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
