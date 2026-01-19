'use client'

import { useMemo } from 'react'
import { isToday, isSameWeek, isSameMonth } from 'date-fns'
import type { GanttZoomLevel, GanttTimeRange } from '@/lib/gantt/types'
import { getTimeScaleColumns, getPixelsPerUnit } from '@/lib/gantt/utils'

interface GanttHeaderProps {
  timeRange: GanttTimeRange
  zoomLevel: GanttZoomLevel
  sidebarWidth: number
}

export default function GanttHeader({
  timeRange,
  zoomLevel,
  sidebarWidth,
}: GanttHeaderProps) {
  const columns = useMemo(
    () => getTimeScaleColumns(timeRange, zoomLevel),
    [timeRange, zoomLevel]
  )

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

  return (
    <div 
      className="flex sticky top-0 z-10 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-850 border-b border-slate-200/60 dark:border-gray-700"
    >
      {/* Spacer for sidebar (only if sidebarWidth > 0) */}
      {sidebarWidth > 0 && (
        <div
          className="flex-shrink-0 bg-slate-100 dark:bg-gray-800 border-r border-slate-200/50 dark:border-gray-700"
          style={{ 
            width: sidebarWidth,
          }}
        />
      )}

      {/* Time scale columns */}
      <div className="flex">
        {columns.map((column, idx) => {
          const isCurrent = isCurrentPeriod(column.date)

          return (
            <div
              key={idx}
              className={`flex-shrink-0 text-center py-1.5 border-r border-slate-200/35 dark:border-gray-700/50 ${
                isCurrent ? 'bg-blue-50/60 dark:bg-blue-900/30' : ''
              }`}
              style={{ 
                width: pixelsPerUnit,
              }}
            >
              <div
                className={`text-[10px] font-semibold ${
                  isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {column.label}
              </div>
              {column.subLabel && (
                <div
                  className={`text-[9px] ${
                    isCurrent ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {column.subLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
