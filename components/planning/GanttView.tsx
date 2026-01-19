'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, pointerWithin } from '@dnd-kit/core'
import { format, addDays, differenceInDays } from 'date-fns'
import type {
  GanttAssignment,
  GanttProject,
  GanttCrewMember,
  GanttViewMode,
  GanttZoomLevel,
  GanttTimeRange,
  GanttItem,
} from '@/lib/gantt/types'
import {
  assignmentsToRows,
  getDefaultTimeRange,
  navigateTimeRange,
  getTimelineWidth,
  getDateFromPosition,
  getPixelsPerUnit,
  datesOverlap,
} from '@/lib/gantt/utils'
import { updateAssignment } from '@/app/planning/actions'
import GanttControls from './GanttControls'
import GanttHeader from './GanttHeader'
import GanttSidebar from './GanttSidebar'
import GanttRow from './GanttRow'
import CrewDetailModal from './CrewDetailModal'

interface GanttViewProps {
  assignments: GanttAssignment[]
  projects: GanttProject[]
  crewMembers: GanttCrewMember[]
  filterProjectId?: string
}

const ROW_HEIGHT = 32
const HEADER_HEIGHT = 36
const SIDEBAR_WIDTH = 340

export default function GanttView({
  assignments,
  projects,
  crewMembers,
  filterProjectId,
}: GanttViewProps) {
  const [viewMode, setViewMode] = useState<GanttViewMode>('by-project')
  const [zoomLevel, setZoomLevel] = useState<GanttZoomLevel>('week')
  const [timeRange, setTimeRange] = useState<GanttTimeRange>(getDefaultTimeRange)
  const [draggedItem, setDraggedItem] = useState<GanttItem | null>(null)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [conflictingItems, setConflictingItems] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter assignments if showing project-specific view
  const filteredAssignments = useMemo(() => {
    if (!filterProjectId) return assignments
    return assignments.filter(a => a.project_id === filterProjectId)
  }, [assignments, filterProjectId])

  // Filter entities based on filter
  const filteredProjects = useMemo(() => {
    if (!filterProjectId) return projects.filter(p => p.status === 'active')
    return projects.filter(p => p.id === filterProjectId)
  }, [projects, filterProjectId])

  const filteredCrew = useMemo(() => {
    if (!filterProjectId) return crewMembers
    // Show crew that have assignments to this project
    const assignedCrewIds = new Set(filteredAssignments.map(a => a.crew_member_id))
    return crewMembers.filter(c => assignedCrewIds.has(c.id))
  }, [crewMembers, filteredAssignments, filterProjectId])

  // Convert to rows based on view mode
  const rows = useMemo(
    () => assignmentsToRows(filteredAssignments, filteredProjects, filteredCrew, viewMode),
    [filteredAssignments, filteredProjects, filteredCrew, viewMode]
  )

  const timelineWidth = useMemo(
    () => getTimelineWidth(timeRange, zoomLevel),
    [timeRange, zoomLevel]
  )

  // Check for conflicts during drag
  const checkDragConflicts = useCallback(
    (item: GanttItem, newStart: Date, newEnd: Date): boolean => {
      // Find all assignments for this crew member
      const crewId = item.assignment.crew_member_id
      const otherAssignments = filteredAssignments.filter(
        a => a.crew_member_id === crewId && a.id !== item.id
      )

      // Check for overlaps
      return otherAssignments.some(a => {
        const start = new Date(a.start_date)
        const end = new Date(a.end_date)
        return datesOverlap(newStart, newEnd, start, end)
      })
    },
    [filteredAssignments]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = active.data.current?.item as GanttItem
    if (item) {
      setDraggedItem(item)
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!draggedItem) return

    const { delta } = event
    const pixelsPerUnit = getPixelsPerUnit(zoomLevel)
    const daysDelta = Math.round((delta.x / pixelsPerUnit) * (zoomLevel === 'day' ? 1 : zoomLevel === 'week' ? 7 : 30))

    const newStart = addDays(draggedItem.start, daysDelta)
    const newEnd = addDays(draggedItem.end, daysDelta)

    const hasConflict = checkDragConflicts(draggedItem, newStart, newEnd)

    setConflictingItems(prev => {
      const next = new Set(prev)
      if (hasConflict) {
        next.add(draggedItem.id)
      } else {
        next.delete(draggedItem.id)
      }
      return next
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!draggedItem) {
      setDraggedItem(null)
      setConflictingItems(new Set())
      return
    }

    const { delta } = event
    const pixelsPerUnit = getPixelsPerUnit(zoomLevel)
    const daysDelta = Math.round((delta.x / pixelsPerUnit) * (zoomLevel === 'day' ? 1 : zoomLevel === 'week' ? 7 : 30))

    if (daysDelta === 0) {
      setDraggedItem(null)
      setConflictingItems(new Set())
      return
    }

    const newStart = addDays(draggedItem.start, daysDelta)
    const newEnd = addDays(draggedItem.end, daysDelta)

    // Check for conflicts before saving
    const hasConflict = checkDragConflicts(draggedItem, newStart, newEnd)
    if (hasConflict) {
      // Show conflict warning
      setConflictingItems(prev => new Set([...prev, draggedItem.id]))
      setTimeout(() => setConflictingItems(new Set()), 2000)
      setDraggedItem(null)
      return
    }

    // Save the update
    setIsUpdating(true)
    try {
      const result = await updateAssignment(draggedItem.id, {
        startDate: format(newStart, 'yyyy-MM-dd'),
        endDate: format(newEnd, 'yyyy-MM-dd'),
      })

      if (result.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update assignment:', error)
      alert('Failed to update assignment')
    } finally {
      setIsUpdating(false)
      setDraggedItem(null)
      setConflictingItems(new Set())
    }
  }

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    setTimeRange(navigateTimeRange(timeRange, direction, zoomLevel))
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60 dark:border-gray-700">
      <GanttControls
        viewMode={viewMode}
        zoomLevel={zoomLevel}
        onViewModeChange={setViewMode}
        onZoomChange={setZoomLevel}
        onNavigate={handleNavigate}
      />

      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
          <div className="text-gray-600 dark:text-gray-300">Updating...</div>
        </div>
      )}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Main scrollable container - horizontal scroll for everything */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <div style={{ width: SIDEBAR_WIDTH + timelineWidth, minWidth: '100%' }}>
            {/* Header Row */}
            <div className="flex sticky top-0 z-10">
              {/* Sidebar header with column labels */}
              <div 
                className="flex-shrink-0 sticky left-0 z-20 flex items-center px-2.5 gap-1 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-850 border-b border-slate-200/60 dark:border-gray-700 border-r border-r-slate-200/40 dark:border-r-gray-700"
                style={{ 
                  width: SIDEBAR_WIDTH, 
                  height: HEADER_HEIGHT,
                  boxShadow: '2px 0 8px -4px rgba(0,0,0,0.06)',
                }}
              >
                <div className="w-2 flex-shrink-0" /> {/* Indent spacer */}
                <div className="flex-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </div>
                <div className="w-[70px] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Position
                </div>
                <div className="w-[32px] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Flag
                </div>
                <div className="w-[32px] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Apt
                </div>
              </div>
              {/* Timeline header - scrolls horizontally with content */}
              <div style={{ width: timelineWidth }}>
                <GanttHeader
                  timeRange={timeRange}
                  zoomLevel={zoomLevel}
                  sidebarWidth={0}
                />
              </div>
            </div>

            {/* Body Row */}
            <div className="flex">
              {/* Sidebar - sticky left with subtle shadow separator */}
              <div 
                className="flex-shrink-0 sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-slate-200/40 dark:border-gray-700"
                style={{ 
                  width: SIDEBAR_WIDTH,
                  boxShadow: '2px 0 8px -4px rgba(0,0,0,0.06)',
                }}
              >
                <GanttSidebar
                  rows={rows}
                  rowHeight={ROW_HEIGHT}
                  width={SIDEBAR_WIDTH}
                  onCrewClick={(crewMemberId) => setSelectedCrewMemberId(crewMemberId)}
                />
              </div>

              {/* Timeline rows */}
              <div style={{ width: timelineWidth }}>
                {rows.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                    No assignments to display
                  </div>
                ) : (
                  rows.map((row) => (
                    <GanttRow
                      key={row.id}
                      row={row}
                      viewMode={viewMode}
                      timeRange={timeRange}
                      zoomLevel={zoomLevel}
                      rowHeight={ROW_HEIGHT}
                      conflictingItems={conflictingItems}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Legend for conflict indicator */}
      {conflictingItems.size > 0 && (
        <div 
          className="px-5 py-2.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-2.5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-t border-red-200/60 dark:border-red-800/60"
        >
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="font-medium">Conflict detected - this crew member is already assigned during this period</span>
        </div>
      )}

      {/* Crew Detail Modal */}
      <CrewDetailModal
        crewMemberId={selectedCrewMemberId || ''}
        isOpen={!!selectedCrewMemberId}
        onClose={() => setSelectedCrewMemberId(null)}
      />
    </div>
  )
}
