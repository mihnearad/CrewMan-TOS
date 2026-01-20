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

import { useCallback, useMemo, useState } from 'react'
import { Filter, X, AlertTriangle, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
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

interface Role {
  id: string
  name: string
}

interface PlanningFiltersProps {
  /** Available projects to filter by */
  projects: Project[]
  /** Available crew members to filter by */
  crewMembers: CrewMember[]
  /** Available roles to filter by */
  roles?: Role[]
  /** Selected project IDs */
  selectedProjects: string[]
  /** Callback when project selection changes */
  onProjectToggle: (projectId: string) => void
  /** Selected crew member IDs */
  selectedCrew: string[]
  /** Callback when crew selection changes */
  onCrewToggle: (crewId: string) => void
  /** Selected role names */
  selectedRoles?: string[]
  /** Callback when role selection changes */
  onRoleToggle?: (roleName: string) => void
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
  roles = [],
  selectedProjects,
  onProjectToggle,
  selectedCrew,
  onCrewToggle,
  selectedRoles = [],
  onRoleToggle,
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
    if (selectedRoles.length > 0) count++
    if (dateFrom || dateTo) count++
    if (endingSoon) count++
    return count
  }, [selectedProjects, selectedCrew, selectedRoles, dateFrom, dateTo, endingSoon])
  
  const hasFilters = activeFilterCount > 0
  
  // Only show active projects in filter
  const activeProjects = useMemo(() => 
    projects.filter(p => p.status === 'active'),
    [projects]
  )
  
  // Build filter summary text
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (selectedProjects.length > 0) {
      const projectNames = selectedProjects
        .map(id => activeProjects.find(p => p.id === id)?.name)
        .filter(Boolean)
      parts.push(projectNames.length === 1 ? projectNames[0]! : `${projectNames.length} vessels`)
    }
    if (selectedCrew.length > 0) {
      const crewNames = selectedCrew
        .map(id => crewMembers.find(c => c.id === id)?.full_name)
        .filter(Boolean)
      parts.push(crewNames.length === 1 ? crewNames[0]! : `${crewNames.length} crew`)
    }
    if (selectedRoles.length > 0) {
      parts.push(selectedRoles.length === 1 ? selectedRoles[0] : `${selectedRoles.length} roles`)
    }
    if (dateFrom || dateTo) {
      parts.push('Date range')
    }
    if (endingSoon) {
      parts.push('Ending soon')
    }
    return parts.join(' · ')
  }, [selectedProjects, selectedCrew, selectedRoles, dateFrom, dateTo, endingSoon, activeProjects, crewMembers])
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 dark:bg-gray-900 dark:border-gray-700 print:hidden">
      {/* Filter Header (always visible) - clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-400">
              {activeFilterCount}
            </span>
          )}
          {hasFilters && !isExpanded && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal truncate max-w-[300px]">
              {filterSummary}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick filter: Ending Soon */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEndingSoonToggle()
            }}
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
              onClick={(e) => {
                e.stopPropagation()
                onClearAll()
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          
          {/* Expand/Collapse indicator */}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
        </div>
      </button>
      
      {/* Collapsible filter content */}
      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4 dark:border-gray-700">
          {/* Vessel Filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block dark:text-gray-400">
              Vessels
            </label>
            <select
              value={selectedProjects[0] || ''}
              onChange={(e) => {
                const value = e.target.value
                if (!value) {
                  selectedProjects.forEach(id => onProjectToggle(id))
                  return
                }
                selectedProjects.forEach(id => {
                  if (id !== value) onProjectToggle(id)
                })
                if (!selectedProjects.includes(value)) {
                  onProjectToggle(value)
                }
              }}
              className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">All vessels</option>
              {activeProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          {/* Crew Filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block dark:text-gray-400">
              Crew Members
            </label>
            <select
              value={selectedCrew[0] || ''}
              onChange={(e) => {
                const value = e.target.value
                if (!value) {
                  selectedCrew.forEach(id => onCrewToggle(id))
                  return
                }
                selectedCrew.forEach(id => {
                  if (id !== value) onCrewToggle(id)
                })
                if (!selectedCrew.includes(value)) {
                  onCrewToggle(value)
                }
              }}
              className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">All crew</option>
              {crewMembers.map(crew => (
                <option key={crew.id} value={crew.id}>{crew.full_name} · {crew.role}</option>
              ))}
            </select>
          </div>
          
          {/* Role Filter */}
          {roles.length > 0 && onRoleToggle && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block dark:text-gray-400">
                Roles
              </label>
              <select
                value={selectedRoles[0] || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (!value) {
                    selectedRoles.forEach(name => onRoleToggle(name))
                    return
                  }
                  selectedRoles.forEach(name => {
                    if (name !== value) onRoleToggle(name)
                  })
                  if (!selectedRoles.includes(value)) {
                    onRoleToggle(value)
                  }
                }}
                className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="">All roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          )}
          
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
      </div>
    </div>
  )
}
