'use client'

import { useMemo } from 'react'
import { isSameDay, isToday } from 'date-fns'
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

  return (
    <div className="flex border-b bg-gray-50 sticky top-0 z-10">
      {/* Spacer for sidebar */}
      <div
        className="flex-shrink-0 border-r bg-gray-100"
        style={{ width: sidebarWidth }}
      />

      {/* Time scale columns */}
      <div className="flex">
        {columns.map((column, idx) => {
          const isCurrentDay = zoomLevel === 'day' && isToday(column.date)

          return (
            <div
              key={idx}
              className={`flex-shrink-0 border-r text-center py-2 ${
                isCurrentDay ? 'bg-blue-50' : ''
              }`}
              style={{ width: pixelsPerUnit }}
            >
              <div
                className={`text-xs font-medium ${
                  isCurrentDay ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {column.label}
              </div>
              {column.subLabel && (
                <div
                  className={`text-xs ${
                    isCurrentDay ? 'text-blue-500' : 'text-gray-500'
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
