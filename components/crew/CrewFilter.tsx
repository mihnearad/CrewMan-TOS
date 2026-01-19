/**
 * CrewFilter Component
 * 
 * Filter controls for the crew list page.
 * Uses shared UI components for consistent styling.
 * Supports search, status filter, and role filter.
 */

'use client'

import SearchInput from '@/components/ui/SearchInput'
import { crewStatusOptions } from '@/components/ui/FilterPills'

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
  
  const handleStatusSelect = (value: string) => {
    if (!value && statusFilter) {
      onStatusChange(statusFilter)
      return
    }
    if (value) {
      onStatusChange(value)
    }
  }

  const handleRoleSelect = (value: string) => {
    if (!value && roleFilter && onRoleChange) {
      onRoleChange(roleFilter)
      return
    }
    if (value && onRoleChange) {
      onRoleChange(value)
    }
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
      
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter || ''}
            onChange={(e) => handleStatusSelect(e.target.value)}
            className="min-w-[140px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="">All</option>
            {crewStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {roles.length > 0 && onRoleChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
            <select
              value={roleFilter || ''}
              onChange={(e) => handleRoleSelect(e.target.value)}
              className="min-w-[160px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">All</option>
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}
        
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
