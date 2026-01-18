'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { GanttItem as GanttItemType, GanttViewMode, GanttTimeRange, GanttZoomLevel } from '@/lib/gantt/types'
import { getItemPosition, formatDateRange } from '@/lib/gantt/utils'

interface GanttItemProps {
  item: GanttItemType
  viewMode: GanttViewMode
  timeRange: GanttTimeRange
  zoomLevel: GanttZoomLevel
  hasConflict?: boolean
  isResizing?: 'start' | 'end' | null
  onResizeStart?: (itemId: string, edge: 'start' | 'end') => void
  onResizeEnd?: () => void
}

export default function GanttItem({
  item,
  viewMode,
  timeRange,
  zoomLevel,
  hasConflict = false,
  isResizing,
  onResizeStart,
  onResizeEnd,
}: GanttItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  const { left, width } = getItemPosition(item.start, item.end, timeRange, zoomLevel)
  const project = item.assignment.project
  const crewMember = item.assignment.crew_member

  // Display different info based on view mode
  const primaryText = viewMode === 'by-crew' ? project.name : crewMember.full_name
  const color = project.color

  const style: React.CSSProperties = {
    position: 'absolute',
    left: left,
    width: Math.max(width, 30), // Minimum width
    transform: CSS.Translate.toString(transform),
    backgroundColor: hasConflict ? '#fef2f2' : color + '20',
    borderLeft: `3px solid ${hasConflict ? '#ef4444' : color}`,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 100 : 1,
  }

  const handleMouseDown = (e: React.MouseEvent, edge: 'start' | 'end') => {
    e.stopPropagation()
    e.preventDefault()
    onResizeStart?.(item.id, edge)
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute top-1 bottom-1 rounded-r flex items-center px-2 text-xs select-none transition-shadow ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      } ${hasConflict ? 'ring-2 ring-red-400' : ''}`}
      style={style}
      title={`${crewMember.full_name} - ${project.name}\n${formatDateRange(item.start, item.end)}`}
      {...listeners}
      {...attributes}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-gray-400/30"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 truncate">
        <span className="font-medium" style={{ color: hasConflict ? '#ef4444' : color }}>
          {primaryText}
        </span>
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-gray-400/30"
        onMouseDown={(e) => handleMouseDown(e, 'end')}
      />

      {/* Conflict indicator */}
      {hasConflict && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </div>
      )}
    </div>
  )
}
