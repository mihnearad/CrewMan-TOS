'use client'

import { useDroppable } from '@dnd-kit/core'
import { isToday, isSameDay } from 'date-fns'
import type { GanttRow as GanttRowType, GanttViewMode, GanttTimeRange, GanttZoomLevel } from '@/lib/gantt/types'
import { getTimeScaleColumns, getPixelsPerUnit } from '@/lib/gantt/utils'
import GanttItem from './GanttItem'

interface GanttRowProps {
  row: GanttRowType
  viewMode: GanttViewMode
  timeRange: GanttTimeRange
  zoomLevel: GanttZoomLevel
  rowHeight: number
  conflictingItems?: Set<string>
  onResizeStart?: (itemId: string, edge: 'start' | 'end') => void
  onResizeEnd?: () => void
}

export default function GanttRow({
  row,
  viewMode,
  timeRange,
  zoomLevel,
  rowHeight,
  conflictingItems = new Set(),
  onResizeStart,
  onResizeEnd,
}: GanttRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-${row.id}`,
    data: { rowId: row.id },
  })

  const columns = getTimeScaleColumns(timeRange, zoomLevel)
  const pixelsPerUnit = getPixelsPerUnit(zoomLevel)

  return (
    <div
      ref={setNodeRef}
      className={`relative border-b flex ${isOver ? 'bg-blue-50' : 'bg-white'}`}
      style={{ height: rowHeight }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 flex pointer-events-none">
        {columns.map((column, idx) => {
          const isCurrentDay = zoomLevel === 'day' && isToday(column.date)
          return (
            <div
              key={idx}
              className={`flex-shrink-0 border-r ${
                isCurrentDay ? 'bg-blue-50/50' : ''
              }`}
              style={{ width: pixelsPerUnit }}
            />
          )
        })}
      </div>

      {/* Items */}
      {row.items.map((item) => (
        <GanttItem
          key={item.id}
          item={item}
          viewMode={viewMode}
          timeRange={timeRange}
          zoomLevel={zoomLevel}
          hasConflict={conflictingItems.has(item.id)}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
        />
      ))}
    </div>
  )
}
