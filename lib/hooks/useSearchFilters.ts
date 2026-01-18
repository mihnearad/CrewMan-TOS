/**
 * useSearchFilters Hook
 * 
 * Custom hook for URL-persisted search and filter state using nuqs.
 * Provides debounced search, multi-select filters, and date range handling.
 * 
 * Features:
 * - URL persistence (shareable links, survives refresh)
 * - Debounced search input (300ms default)
 * - Type-safe filter options
 * - Clear all functionality
 * - Keyboard shortcut support (Escape to clear)
 * 
 * @example
 * ```tsx
 * const { search, setSearch, filters, setFilter, clearAll } = useSearchFilters({
 *   filterKeys: ['status', 'type'],
 * })
 * ```
 */

'use client'

import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs'
import { useDebounce } from 'use-debounce'
import { useCallback, useEffect, useMemo } from 'react'

/**
 * Configuration options for the useSearchFilters hook
 */
interface UseSearchFiltersOptions {
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number
  /** Default search value */
  defaultSearch?: string
}

/**
 * Hook for managing search query with URL persistence and debouncing
 */
export function useSearchQuery(options: UseSearchFiltersOptions = {}) {
  const { debounceMs = 300, defaultSearch = '' } = options
  
  // URL state for search query
  const [searchParam, setSearchParam] = useQueryState('q', parseAsString.withDefault(defaultSearch))
  
  // Debounced value for filtering
  const [debouncedSearch] = useDebounce(searchParam, debounceMs)
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchParam(null)
  }, [setSearchParam])
  
  return {
    /** Current search input value (immediate) */
    search: searchParam,
    /** Debounced search value (for filtering) */
    debouncedSearch,
    /** Set search value */
    setSearch: setSearchParam,
    /** Clear search */
    clearSearch,
    /** Whether search is active */
    hasSearch: Boolean(searchParam),
  }
}

/**
 * Hook for managing a single-select filter with URL persistence
 */
export function useSingleFilter(key: string, defaultValue: string | null = null) {
  const [value, setValue] = useQueryState(key, parseAsString.withDefault(defaultValue ?? ''))
  
  const clear = useCallback(() => {
    setValue(null)
  }, [setValue])
  
  const toggle = useCallback((newValue: string) => {
    setValue(current => current === newValue ? null : newValue)
  }, [setValue])
  
  return {
    value: value || null,
    setValue,
    clear,
    toggle,
    hasValue: Boolean(value),
  }
}

/**
 * Hook for managing a multi-select filter with URL persistence
 */
export function useMultiFilter(key: string) {
  const [values, setValues] = useQueryState(
    key,
    parseAsArrayOf(parseAsString).withDefault([])
  )
  
  const toggle = useCallback((value: string) => {
    setValues(current => {
      const currentValues = current || []
      if (currentValues.includes(value)) {
        const newValues = currentValues.filter(v => v !== value)
        return newValues.length > 0 ? newValues : null
      }
      return [...currentValues, value]
    })
  }, [setValues])
  
  const clear = useCallback(() => {
    setValues(null)
  }, [setValues])
  
  const has = useCallback((value: string) => {
    return (values || []).includes(value)
  }, [values])
  
  return {
    values: values || [],
    setValues,
    toggle,
    clear,
    has,
    hasValues: (values || []).length > 0,
  }
}

/**
 * Hook for managing date range filter with URL persistence
 */
export function useDateRangeFilter() {
  const [from, setFrom] = useQueryState('from', parseAsString)
  const [to, setTo] = useQueryState('to', parseAsString)
  
  const setRange = useCallback((newFrom: string | null, newTo: string | null) => {
    setFrom(newFrom)
    setTo(newTo)
  }, [setFrom, setTo])
  
  const clear = useCallback(() => {
    setFrom(null)
    setTo(null)
  }, [setFrom, setTo])
  
  return {
    from,
    to,
    setFrom,
    setTo,
    setRange,
    clear,
    hasRange: Boolean(from || to),
  }
}

/**
 * Combined hook for common filter patterns
 * Provides search + status filter + optional type filter
 */
export function useTableFilters(options: {
  enableTypeFilter?: boolean
  enableDateFilter?: boolean
  debounceMs?: number
} = {}) {
  const { enableTypeFilter = false, enableDateFilter = false, debounceMs = 300 } = options
  
  const { search, debouncedSearch, setSearch, clearSearch, hasSearch } = useSearchQuery({ debounceMs })
  const { value: status, setValue: setStatus, toggle: toggleStatus, clear: clearStatus, hasValue: hasStatus } = useSingleFilter('status')
  const { value: type, setValue: setType, toggle: toggleType, clear: clearType, hasValue: hasType } = useSingleFilter('type')
  const { from, to, setFrom, setTo, setRange, clear: clearDateRange, hasRange } = useDateRangeFilter()
  
  const clearAll = useCallback(() => {
    clearSearch()
    clearStatus()
    if (enableTypeFilter) clearType()
    if (enableDateFilter) clearDateRange()
  }, [clearSearch, clearStatus, clearType, clearDateRange, enableTypeFilter, enableDateFilter])
  
  const hasFilters = hasSearch || hasStatus || (enableTypeFilter && hasType) || (enableDateFilter && hasRange)
  
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (hasSearch) count++
    if (hasStatus) count++
    if (enableTypeFilter && hasType) count++
    if (enableDateFilter && hasRange) count++
    return count
  }, [hasSearch, hasStatus, hasType, hasRange, enableTypeFilter, enableDateFilter])
  
  return {
    // Search
    search,
    debouncedSearch,
    setSearch,
    clearSearch,
    hasSearch,
    
    // Status filter
    status,
    setStatus,
    toggleStatus,
    clearStatus,
    hasStatus,
    
    // Type filter (optional)
    type: enableTypeFilter ? type : null,
    setType: enableTypeFilter ? setType : () => {},
    toggleType: enableTypeFilter ? toggleType : () => {},
    clearType: enableTypeFilter ? clearType : () => {},
    hasType: enableTypeFilter ? hasType : false,
    
    // Date range (optional)
    dateFrom: enableDateFilter ? from : null,
    dateTo: enableDateFilter ? to : null,
    setDateFrom: enableDateFilter ? setFrom : () => {},
    setDateTo: enableDateFilter ? setTo : () => {},
    setDateRange: enableDateFilter ? setRange : () => {},
    clearDateRange: enableDateFilter ? clearDateRange : () => {},
    hasDateRange: enableDateFilter ? hasRange : false,
    
    // Combined
    clearAll,
    hasFilters,
    activeFilterCount,
  }
}

/**
 * Hook to handle Escape key to clear filters
 */
export function useFilterKeyboardShortcuts(clearAll: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear all filters (when not in an input)
      if (e.key === 'Escape' && document.activeElement?.tagName !== 'INPUT') {
        clearAll()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [clearAll])
}
