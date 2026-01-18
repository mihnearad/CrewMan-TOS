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
import FilterPills, { projectStatusOptions, projectTypeOptions } from '@/components/ui/FilterPills'
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
  
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search projects by name..."
        shortcutHint="/"
      />
      
      {/* Filter Pills Row */}
      <div className="flex flex-wrap gap-4 items-start">
        {/* Status Filter */}
        <FilterPills
          label="Status"
          options={projectStatusOptions}
          value={statusFilter}
          onChange={onStatusChange}
        />
        
        {/* Type Filter */}
        <FilterPills
          label="Type"
          options={projectTypeOptions}
          value={typeFilter}
          onChange={onTypeChange}
        />
        
        {/* Date Range Filter (compact dropdown) */}
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
        
        {/* Clear All */}
        {hasFilters && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline self-center"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
