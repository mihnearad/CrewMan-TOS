/**
 * FilterPills Component
 * 
 * Reusable filter pill buttons supporting single or multi-select modes.
 * Features color-coded options, active states with focus rings, and
 * accessible keyboard navigation. Supports dark mode.
 * 
 * @example
 * ```tsx
 * // Single select
 * <FilterPills
 *   label="Status"
 *   options={statusOptions}
 *   value={status}
 *   onChange={setStatus}
 * />
 * 
 * // Multi-select
 * <FilterPills
 *   label="Types"
 *   options={typeOptions}
 *   value={selectedTypes}
 *   onChange={toggleType}
 *   multiple
 * />
 * ```
 */

'use client'

import { cn } from '@/lib/utils'

/**
 * Filter option configuration
 */
export interface FilterPillOption {
  /** Unique value for the option */
  value: string
  /** Display label */
  label: string
  /** Tailwind classes for active state (e.g., 'bg-green-100 text-green-800 border-green-200') */
  activeClasses?: string
  /** Dark mode classes for active state */
  darkActiveClasses?: string
  /** Optional count badge */
  count?: number
  /** Optional icon component */
  icon?: React.ReactNode
}

interface FilterPillsProps {
  /** Label shown before the pills */
  label?: string
  /** Available options */
  options: FilterPillOption[]
  /** Current value (string for single, string[] for multiple) */
  value: string | string[] | null
  /** Callback when selection changes */
  onChange: (value: string) => void
  /** Enable multi-select mode */
  multiple?: boolean
  /** Additional CSS classes for container */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
  /** Show "All" option that clears selection */
  showAllOption?: boolean
  /** Label for the "All" option */
  allOptionLabel?: string
  /** Callback to clear all selections */
  onClear?: () => void
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
}

const defaultActiveClasses = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'

export default function FilterPills({
  label,
  options,
  value,
  onChange,
  multiple = false,
  className,
  size = 'md',
  showAllOption = false,
  allOptionLabel = 'All',
  onClear,
}: FilterPillsProps) {
  // Normalize value to array for easier checking
  const selectedValues = Array.isArray(value) 
    ? value 
    : value 
      ? [value] 
      : []
  
  const isSelected = (optionValue: string) => selectedValues.includes(optionValue)
  const hasSelection = selectedValues.length > 0
  
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {label && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}:
        </span>
      )}
      
      {/* "All" option */}
      {showAllOption && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'rounded-full font-medium border transition-all',
            sizeClasses[size],
            !hasSelection
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          )}
        >
          {allOptionLabel}
        </button>
      )}
      
      {/* Filter options */}
      {options.map((option) => {
        const selected = isSelected(option.value)
        const activeClasses = option.activeClasses 
          ? `${option.activeClasses} ${option.darkActiveClasses || ''}`
          : defaultActiveClasses
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full font-medium border transition-all inline-flex items-center gap-1.5',
              sizeClasses[size],
              selected
                ? cn(activeClasses, 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900')
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
            aria-pressed={selected}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span 
                className={cn(
                  'ml-0.5 px-1.5 py-0.5 rounded-full text-xs',
                  selected ? 'bg-white/30 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-700'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Pre-configured status filter options for projects
 */
export const projectStatusOptions: FilterPillOption[] = [
  { value: 'active', label: 'Active', activeClasses: 'bg-green-100 text-green-800 border-green-200', darkActiveClasses: 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' },
  { value: 'planned', label: 'Planned', activeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200', darkActiveClasses: 'dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
  { value: 'completed', label: 'Completed', activeClasses: 'bg-gray-100 text-gray-800 border-gray-200', darkActiveClasses: 'dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
  { value: 'cancelled', label: 'Cancelled', activeClasses: 'bg-red-100 text-red-800 border-red-200', darkActiveClasses: 'dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' },
]

/**
 * Pre-configured type filter options for projects
 */
export const projectTypeOptions: FilterPillOption[] = [
  { value: 'vessel', label: 'Vessel' },
  { value: 'windfarm', label: 'Wind Farm' },
  { value: 'other', label: 'Other' },
]

/**
 * Pre-configured status filter options for crew
 */
export const crewStatusOptions: FilterPillOption[] = [
  { value: 'available', label: 'Available', activeClasses: 'bg-green-100 text-green-800 border-green-200', darkActiveClasses: 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' },
  { value: 'on_project', label: 'Onboard', activeClasses: 'bg-blue-100 text-blue-800 border-blue-200', darkActiveClasses: 'dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700' },
  { value: 'on_leave', label: 'On Leave', activeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200', darkActiveClasses: 'dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
]

/**
 * Pre-configured status filter options for clients/consultants
 */
export const entityStatusOptions: FilterPillOption[] = [
  { value: 'active', label: 'Active', activeClasses: 'bg-green-100 text-green-800 border-green-200', darkActiveClasses: 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' },
  { value: 'inactive', label: 'Inactive', activeClasses: 'bg-gray-100 text-gray-800 border-gray-200', darkActiveClasses: 'dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
]

/**
 * Status options for consultants (includes on_leave)
 */
export const consultantStatusOptions: FilterPillOption[] = [
  { value: 'active', label: 'Active', activeClasses: 'bg-green-100 text-green-800 border-green-200', darkActiveClasses: 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' },
  { value: 'inactive', label: 'Inactive', activeClasses: 'bg-gray-100 text-gray-800 border-gray-200', darkActiveClasses: 'dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
  { value: 'on_leave', label: 'On Leave', activeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-200', darkActiveClasses: 'dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
]
