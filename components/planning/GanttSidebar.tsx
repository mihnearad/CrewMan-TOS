'use client'

import { Anchor } from 'lucide-react'
import type { GanttRow } from '@/lib/gantt/types'

interface GanttSidebarProps {
  rows: GanttRow[]
  rowHeight: number
  width: number
  onCrewClick?: (crewMemberId: string) => void
}

export default function GanttSidebar({
  rows,
  rowHeight,
  width,
  onCrewClick,
}: GanttSidebarProps) {
  // Extract airport code from "WAW - Warsaw" format
  const getAirportCode = (airport?: string) => {
    if (!airport) return '-'
    const code = airport.split(' - ')[0].trim()
    return code || airport.substring(0, 3).toUpperCase()
  }

  const handleRowClick = (row: GanttRow) => {
    if (row.crewMemberId && onCrewClick) {
      onCrewClick(row.crewMemberId)
    }
  }

  return (
    <div
      className="bg-white"
      style={{ width }}
    >
      {rows.map((row) => {
        // Vessel header row styling
        if (row.isGroupHeader) {
          return (
            <div
              key={row.id}
              className="border-b px-2 flex items-center"
              style={{ 
                height: rowHeight,
                backgroundColor: row.color ? `${row.color}15` : '#f3f4f6',
              }}
            >
              <Anchor 
                className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" 
                style={{ color: row.color || '#6b7280' }}
              />
              <div className="min-w-0 flex-1">
                <div 
                  className="text-xs font-semibold truncate"
                  style={{ color: row.color || '#111827' }}
                >
                  {row.label}
                </div>
              </div>
            </div>
          )
        }
        
        // Crew row styling - compact with columns, clickable
        const isClickable = !!row.crewMemberId && !!onCrewClick
        
        return (
          <div
            key={row.id}
            onClick={() => handleRowClick(row)}
            className={`border-b px-2 flex items-center bg-white text-[11px] gap-1 ${
              isClickable ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
            }`}
            style={{ height: rowHeight }}
          >
            {/* Indent for crew rows under vessel headers */}
            {row.parentGroupId && (
              <div className="w-2 flex-shrink-0" />
            )}
            
            {/* Color dot for non-nested rows */}
            {row.color && !row.parentGroupId && (
              <div
                className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                style={{ backgroundColor: row.color }}
              />
            )}
            
            {/* Name - takes available space */}
            <div className={`min-w-0 flex-1 truncate font-medium ${
              isClickable ? 'text-blue-700 hover:text-blue-900' : 'text-gray-900'
            }`}>
              {row.label}
            </div>
            
            {/* Position/Role - fixed width */}
            <div className="w-[70px] truncate text-gray-600 text-center" title={row.sublabel}>
              {row.sublabel || '-'}
            </div>
            
            {/* Flag State - fixed width */}
            <div 
              className="w-[32px] text-center text-gray-500 font-mono text-[10px]"
              title={row.crewDetails?.flag_state ? `Flag: ${row.crewDetails.flag_state}` : undefined}
            >
              {row.crewDetails?.flag_state || '-'}
            </div>
            
            {/* Airport code - fixed width */}
            <div 
              className="w-[32px] text-gray-500 text-center font-mono text-[10px]"
              title={row.crewDetails?.home_airport || undefined}
            >
              {getAirportCode(row.crewDetails?.home_airport)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
