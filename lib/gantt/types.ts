export interface GanttAssignment {
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
  }
  crew_member: {
    id: string
    full_name: string
    role: string
    nationality?: string
    flag_state?: string
    home_airport?: string
    company?: string
  }
}

export interface GanttProject {
  id: string
  name: string
  type: string
  status: string
  color: string
}

export interface GanttCrewMember {
  id: string
  full_name: string
  role: string
  status: string
  nationality?: string
  flag_state?: string
  home_airport?: string
  company?: string
}

export interface GanttItem {
  id: string
  rowId: string
  start: Date
  end: Date
  assignment: GanttAssignment
}

export interface GanttRow {
  id: string
  label: string
  sublabel?: string
  color?: string
  items: GanttItem[]
  /** Whether this row is a group header (vessel header in vessel view) */
  isGroupHeader?: boolean
  /** Parent group ID (vessel ID for crew rows in vessel view) */
  parentGroupId?: string
  /** Crew member ID for linking to crew profile */
  crewMemberId?: string
  /** Additional crew details for display in sidebar */
  crewDetails?: {
    nationality?: string
    flag_state?: string
    home_airport?: string
    company?: string
  }
}

export type GanttViewMode = 'by-crew' | 'by-project'

export type GanttZoomLevel = 'day' | 'week' | 'month'

export interface GanttTimeRange {
  start: Date
  end: Date
}

export interface GanttDragState {
  itemId: string
  originalStart: Date
  originalEnd: Date
  currentStart: Date
  currentEnd: Date
  hasConflict: boolean
}

export interface GanttConfig {
  viewMode: GanttViewMode
  zoomLevel: GanttZoomLevel
  timeRange: GanttTimeRange
  rowHeight: number
  headerHeight: number
  sidebarWidth: number
}
