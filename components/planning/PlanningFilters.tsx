/**
 * PlanningFilters Component
 * 
 * Comprehensive filter controls for the planning view.
 * Supports project multi-select, crew multi-select, and date range filtering.
 * Designed to be collapsible on mobile and show filter summary.
 * 
 * Features:
 * - Project filter with color indicators
 * - Crew filter with role labels
 * - Date range with presets
 * - Quick filters (Ending Soon)
 * - Filter count badge
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { Filter, ChevronDown, ChevronUp, X, AlertTriangle } from 'lucide-react'
import { addDays, format } from 'date-fns'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  color: string
  status: string
}

interface CrewMember {
  id: string
  full_name: string
  role: string
}

interface PlanningFiltersProps {
  /** Available projects to filter by */
  projects: Project[]
  /** Available crew members to filter by */
  crewMembers: CrewMember[]
  /** Selected project IDs */
  selectedProjects: string[]
  /** Callback when project selection changes */
  onProjectToggle: (projectId: string) => void
  /** Selected crew member IDs */
  selectedCrew: string[]
  /** Callback when crew selection changes */
  onCrewToggle: (crewId: string) => void
  /** Date range "from" value */
  dateFrom: string | null
  /** Date range "to" value */
  dateTo: string | null
  /** Callback when "from" date changes */
  onDateFromChange: (date: string | null) => void
  /** Callback when "to" date changes */
  onDateToChange: (date: string | null) => void
  /** Callback to clear date range */
  onDateClear: () => void
  /** Show only assignments ending soon */
  endingSoon: boolean
  /** Callback when ending soon filter changes */
  onEndingSoonToggle: () => void
  /** Callback to clear all filters */
  onClearAll: () => void
}

export default function PlanningFilters({
  projects,
  crewMembers,
  selectedProjects,
  onProjectToggle,
  selectedCrew,
  onCrewToggle,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onDateClear,
  endingSoon,
  onEndingSoonToggle,
  onClearAll,
}: PlanningFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedProjects.length > 0) count++
    if (selectedCrew.length > 0) count++
    if (dateFrom || dateTo) count++
    if (endingSoon) count++
    return count
  }, [selectedProjects, selectedCrew, dateFrom, dateTo, endingSoon])
  
  const hasFilters = activeFilterCount > 0
  
  // Only show active projects in filter
  const activeProjects = useMemo(() => 
    projects.filter(p => p.status === 'active'),
    [projects]
  )
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 dark:bg-gray-900 dark:border-gray-700">
      {/* Filter Header (always visible) */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-400">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </button>
        
        <div className="flex items-center gap-2">
          {/* Quick filter: Ending Soon */}
          <button
            onClick={onEndingSoonToggle}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
              endingSoon
                ? 'bg-amber-100 text-amber-800 border-amber-200 ring-2 ring-offset-1 ring-amber-500 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700 dark:ring-amber-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Ending Soon
          </button>
          
          {/* Clear All */}
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Active filter summary (when collapsed) */}
      {!isExpanded && hasFilters && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {selectedProjects.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:text-gray-300">
              {selectedProjects.length} vessel{selectedProjects.length > 1 ? 's' : ''}
              <button onClick={() => selectedProjects.forEach(id => onProjectToggle(id))} className="hover:text-gray-900 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCrew.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:text-gray-300">
              {selectedCrew.length} crew
              <button onClick={() => selectedCrew.forEach(id => onCrewToggle(id))} className="hover:text-gray-900 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:text-gray-300">
              {dateFrom && dateTo 
                ? `${format(new Date(dateFrom), 'MMM d')} - ${format(new Date(dateTo), 'MMM d')}`
                : dateFrom 
                  ? `From ${format(new Date(dateFrom), 'MMM d')}`
                  : `Until ${format(new Date(dateTo!), 'MMM d')}`
              }
              <button onClick={onDateClear} className="hover:text-gray-900 dark:hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
      
      {/* Expanded filter options */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4 dark:border-gray-700">
          {/* Vessel Filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block dark:text-gray-400">
              Vessels
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {activeProjects.map(project => {
                const isSelected = selectedProjects.includes(project.id)
                return (
                  <button
                    key={project.id}
                    onClick={() => onProjectToggle(project.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all',
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900'
                        : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300'
                    )}
                    style={isSelected ? {
                      backgroundColor: `${project.color}20`,
                      borderColor: project.color,
                      color: project.color,
                    } : undefined}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </button>
                )
              })}
              {activeProjects.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">No active vessels</p>
              )}
            </div>
          </div>
          
          {/* Crew Filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block dark:text-gray-400">
              Crew Members
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {crewMembers.map(crew => {
                const isSelected = selectedCrew.includes(crew.id)
                return (
                  <button
                    key={crew.id}
                    onClick={() => onCrewToggle(crew.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all',
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-offset-1 ring-blue-500 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 dark:ring-offset-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    )}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {crew.full_name.charAt(0)}
                    </div>
                    {crew.full_name}
                    <span className="text-gray-400 dark:text-gray-500">·</span>
                    <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>{crew.role}</span>
                  </button>
                )
              })}
              {crewMembers.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">No crew members</p>
              )}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={onDateFromChange}
            onToChange={onDateToChange}
            onClear={onDateClear}
            label="Date Range"
            showPresets
          />
        </div>
      )}
    </div>
  )
}
