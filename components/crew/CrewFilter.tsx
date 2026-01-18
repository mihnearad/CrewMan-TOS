/**
 * CrewFilter Component
 * 
 * Filter controls for the crew list page.
 * Uses shared UI components for consistent styling.
 * Supports search, status filter, and role filter.
 */

'use client'

import SearchInput from '@/components/ui/SearchInput'
import FilterPills, { crewStatusOptions } from '@/components/ui/FilterPills'

interface CrewFilterProps {
  /** Current search query */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Current status filter value */
  statusFilter: string | null
  /** Callback when status filter changes (receives value to toggle) */
  onStatusChange: (status: string) => void
  /** Available roles for role filter (optional) */
  roles?: string[]
  /** Current role filter value */
  roleFilter?: string | null
  /** Callback when role filter changes */
  onRoleChange?: (role: string) => void
  /** Callback to clear all filters */
  onClearAll?: () => void
}

export default function CrewFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roles = [],
  roleFilter,
  onRoleChange,
  onClearAll,
}: CrewFilterProps) {
  const hasFilters = searchQuery || statusFilter || roleFilter
  
  // Build role options dynamically from data
  const roleOptions = roles.map(role => ({
    value: role,
    label: role,
  }))
  
  // Clear all filters
  const handleClearAll = () => {
    onSearchChange('')
    if (statusFilter) onStatusChange(statusFilter)
    if (roleFilter && onRoleChange) onRoleChange(roleFilter)
    onClearAll?.()
  }
  
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search by name, role, or email..."
        shortcutHint="/"
      />
      
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <FilterPills
          label="Status"
          options={crewStatusOptions}
          value={statusFilter}
          onChange={onStatusChange}
        />
        
        {/* Role Filter (if roles available) */}
        {roles.length > 0 && onRoleChange && (
          <FilterPills
            label="Role"
            options={roleOptions}
            value={roleFilter || null}
            onChange={onRoleChange}
          />
        )}
        
        {/* Clear All */}
        {hasFilters && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
