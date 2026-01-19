'use client'

import React from 'react'
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
  onClick?: (item: GanttItemType) => void
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
  onClick,
}: GanttItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  const mouseDownTime = React.useRef<number>(0)

  const { left, width } = getItemPosition(item.start, item.end, timeRange, zoomLevel)
  const assignment = item.assignment
  const isTraining = assignment.assignment_type === 'training'
  const project = assignment.project
  const crewMember = assignment.crew_member

  // Display different info based on view mode and assignment type
  let primaryText: string
  if (isTraining) {
    primaryText = assignment.training_description || 'Training'
  } else if (viewMode === 'by-crew') {
    primaryText = project?.name || 'Unknown'
  } else {
    primaryText = formatDateRange(item.start, item.end)
  }
  
  // Training gets orange color, vessels get their project color
  const color = isTraining ? '#f59e0b' : (project?.color || '#3b82f6')

  const style: React.CSSProperties = {
    position: 'absolute',
    left: left,
    width: Math.max(width, 24), // Minimum width (smaller for compact view)
    transform: CSS.Translate.toString(transform),
    backgroundColor: hasConflict ? '#fecaca' : color + 'f0', // Nearly opaque (f0 = 94% opacity)
    borderLeft: `3px solid ${hasConflict ? '#ef4444' : color}`,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
    zIndex: isDragging ? 100 : 1,
  }

  // Handle resize edge mouse down
  const handleResizeMouseDown = (e: React.MouseEvent, edge: 'start' | 'end') => {
    e.stopPropagation()
    e.preventDefault()
    onResizeStart?.(item.id, edge)
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute top-1 bottom-1 rounded-md flex items-center px-1.5 text-[10px] select-none transition-all duration-150 ${
        isDragging ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md hover:brightness-105'
      } ${hasConflict ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
      style={style}
      title={isTraining 
        ? `${crewMember.full_name} - Training: ${assignment.training_description || 'Training'}\n${formatDateRange(item.start, item.end)}`
        : `${crewMember.full_name} - ${project?.name || 'Unknown'}\n${formatDateRange(item.start, item.end)}`
      }
      {...listeners}
      {...attributes}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-gray-400/30 dark:hover:bg-gray-300/30"
        onMouseDown={(e) => handleResizeMouseDown(e, 'start')}
      />

      {/* Clickable content area */}
      <div 
        className="flex-1 min-w-0 truncate cursor-pointer"
        onMouseDown={(e) => {
          mouseDownTime.current = Date.now()
        }}
        onMouseUp={(e) => {
          const duration = Date.now() - mouseDownTime.current
          // If mouse was down for less than 200ms, consider it a click (not a drag)
          if (duration < 200 && onClick && !isDragging) {
            e.stopPropagation()
            e.preventDefault()
            onClick(item)
          }
        }}
      >
        <span className="font-semibold text-white drop-shadow-sm">
          {primaryText}
        </span>
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-gray-400/30 dark:hover:bg-gray-300/30"
        onMouseDown={(e) => handleResizeMouseDown(e, 'end')}
      />

      {/* Conflict indicator */}
      {hasConflict && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[7px] font-bold">!</span>
        </div>
      )}
    </div>
  )
}
