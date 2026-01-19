'use client'

import { Anchor, Building2, GraduationCap } from 'lucide-react'
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
      className="bg-white dark:bg-gray-900"
      style={{ width }}
    >
      {rows.map((row) => {
        // Client header row styling (top level)
        if (row.isGroupHeader && row.isClientHeader) {
          const icon = row.id.startsWith('training') ? (
            <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: row.color || '#f59e0b' }} />
          ) : (
            <Building2 className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: row.color || '#6b7280' }} />
          )
          
          return (
            <div
              key={row.id}
              className="px-2.5 flex items-center bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600"
              style={{ 
                height: rowHeight,
              }}
            >
              {icon}
              <div className="min-w-0 flex-1">
                <div 
                  className="text-xs font-bold truncate tracking-wider uppercase text-gray-700 dark:text-gray-200"
                >
                  {row.label}
                </div>
              </div>
            </div>
          )
        }
        
        // Vessel header row styling (under client)
        if (row.isGroupHeader) {
          return (
            <div
              key={row.id}
              className="px-2.5 flex items-center bg-slate-50 dark:bg-gray-800/50 border-b border-slate-200/60 dark:border-gray-700/60"
              style={{ 
                height: rowHeight,
                backgroundColor: row.color ? `${row.color}12` : undefined,
                paddingLeft: '1.5rem', // Extra indent for vessels under clients
              }}
            >
              <Anchor 
                className="w-3.5 h-3.5 mr-2 flex-shrink-0" 
                style={{ color: row.color || '#64748b' }}
              />
              <div className="min-w-0 flex-1">
                <div 
                  className="text-xs font-semibold truncate tracking-wide dark:text-slate-200"
                  style={{ color: row.color || undefined }}
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
            className={`px-2.5 flex items-center bg-white dark:bg-gray-900 text-[11px] gap-1 border-b border-slate-200/50 dark:border-gray-700/50 ${
              isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-100' : ''
            }`}
            style={{ 
              height: rowHeight,
            }}
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
              isClickable ? 'text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {row.label}
            </div>
            
            {/* Position/Role - fixed width */}
            <div className="w-[90px] truncate text-gray-600 dark:text-gray-400 text-center" title={row.sublabel}>
              {row.sublabel || '-'}
            </div>
            
            {/* Airport code - fixed width */}
            <div 
              className="w-[48px] text-gray-500 dark:text-gray-500 text-center font-mono text-[10px]"
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
