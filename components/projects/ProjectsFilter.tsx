/**
 * ProjectsFilter Component
 * 
 * Filter controls for the projects list page.
 * Uses shared UI components for consistent styling.
 * Supports search, status filter, type filter, and date range.
 * 
 * Note: This component receives filter state from parent (ProjectsTable)
 * which manages URL state via nuqs hooks.
 */

'use client'

import SearchInput from '@/components/ui/SearchInput'
import { projectStatusOptions, projectTypeOptions } from '@/components/ui/FilterPills'
import DateRangePicker from '@/components/ui/DateRangePicker'

interface ProjectsFilterProps {
  /** Current search query */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Current status filter value */
  statusFilter: string | null
  /** Callback when status filter changes (receives value to toggle) */
  onStatusChange: (status: string) => void
  /** Current type filter value */
  typeFilter: string | null
  /** Callback when type filter changes (receives value to toggle) */
  onTypeChange: (type: string) => void
  /** Current date range "from" value */
  dateFrom?: string | null
  /** Current date range "to" value */
  dateTo?: string | null
  /** Callback when "from" date changes */
  onDateFromChange?: (date: string | null) => void
  /** Callback when "to" date changes */
  onDateToChange?: (date: string | null) => void
  /** Callback to clear date range */
  onDateClear?: () => void
  /** Whether date filter is enabled */
  showDateFilter?: boolean
  /** Callback to clear all filters */
  onClearAll?: () => void
}

export default function ProjectsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onDateClear,
  showDateFilter = true,
  onClearAll,
}: ProjectsFilterProps) {
  const hasFilters = searchQuery || statusFilter || typeFilter || dateFrom || dateTo
  
  // Clear all filters
  const handleClearAll = () => {
    onSearchChange('')
    // Toggle off current filters if they exist
    if (statusFilter) onStatusChange(statusFilter)
    if (typeFilter) onTypeChange(typeFilter)
    onDateClear?.()
    onClearAll?.()
  }
  
  const handleStatusSelect = (value: string) => {
    if (!value && statusFilter) {
      onStatusChange(statusFilter)
      return
    }
    if (value) {
      onStatusChange(value)
    }
  }

  const handleTypeSelect = (value: string) => {
    if (!value && typeFilter) {
      onTypeChange(typeFilter)
      return
    }
    if (value) {
      onTypeChange(value)
    }
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search projects by name..."
        shortcutHint="/"
      />
      
      {/* Filter Dropdowns Row */}
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter || ''}
            onChange={(e) => handleStatusSelect(e.target.value)}
            className="min-w-[140px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="">All</option>
            {projectStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
          <select
            value={typeFilter || ''}
            onChange={(e) => handleTypeSelect(e.target.value)}
            className="min-w-[140px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="">All</option>
            {projectTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {showDateFilter && onDateFromChange && onDateToChange && onDateClear && (
          <DateRangePicker
            from={dateFrom || null}
            to={dateTo || null}
            onFromChange={onDateFromChange}
            onToChange={onDateToChange}
            onClear={onDateClear}
            compact
            label="Date Range"
          />
        )}
        
        {hasFilters && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline self-center dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
