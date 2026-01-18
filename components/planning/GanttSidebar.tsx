'use client'

import type { GanttRow } from '@/lib/gantt/types'

interface GanttSidebarProps {
  rows: GanttRow[]
  rowHeight: number
  width: number
}

export default function GanttSidebar({
  rows,
  rowHeight,
  width,
}: GanttSidebarProps) {
  return (
    <div
      className="flex-shrink-0 border-r bg-white sticky left-0 z-20"
      style={{ width }}
    >
      {rows.map((row) => (
        <div
          key={row.id}
          className="border-b px-3 flex items-center"
          style={{ height: rowHeight }}
        >
          {row.color && (
            <div
              className="w-3 h-3 rounded mr-2 flex-shrink-0"
              style={{ backgroundColor: row.color }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {row.label}
            </div>
            {row.sublabel && (
              <div className="text-xs text-gray-500 truncate">
                {row.sublabel}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
