'use client'

import { useDroppable } from '@dnd-kit/core'
import { isToday, isSameWeek, isSameMonth } from 'date-fns'
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
  const today = new Date()

  // Determine if a column represents the current time period
  const isCurrentPeriod = (columnDate: Date): boolean => {
    switch (zoomLevel) {
      case 'day':
        return isToday(columnDate)
      case 'week':
        return isSameWeek(columnDate, today, { weekStartsOn: 0 })
      case 'month':
        return isSameMonth(columnDate, today)
      default:
        return false
    }
  }

  // Vessel header row - just show background, no items
  if (row.isGroupHeader) {
    return (
      <div
        className="relative flex border-b border-slate-200/60 dark:border-gray-700/60"
        style={{ 
          height: rowHeight,
          backgroundColor: row.color ? `${row.color}12` : undefined,
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 flex pointer-events-none bg-slate-50 dark:bg-gray-800/50">
          {columns.map((column, idx) => {
            const isCurrent = isCurrentPeriod(column.date)
            return (
              <div
                key={idx}
                className={`flex-shrink-0 border-r border-slate-200/30 dark:border-gray-700/30 ${
                  isCurrent ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
                }`}
                style={{ 
                  width: pixelsPerUnit,
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative flex transition-colors duration-100 border-b border-slate-200/50 dark:border-gray-700/50 ${isOver ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'}`}
      style={{ 
        height: rowHeight,
      }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 flex pointer-events-none">
        {columns.map((column, idx) => {
          const isCurrent = isCurrentPeriod(column.date)
          return (
            <div
              key={idx}
              className={`flex-shrink-0 border-r border-slate-200/35 dark:border-gray-700/35 ${
                isCurrent ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
              }`}
              style={{ 
                width: pixelsPerUnit,
              }}
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
