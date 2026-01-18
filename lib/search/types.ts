/**
 * Search Types
 * 
 * Type definitions for the global search functionality.
 * Used by GlobalSearch component and search server actions.
 */

/**
 * Categories that can be searched across the application
 */
export type SearchCategory = 'projects' | 'crew' | 'clients' | 'consultants'

/**
 * Individual search result item
 */
export interface SearchResult {
  /** Unique identifier for the result */
  id: string
  /** Display title (e.g., project name, crew member name) */
  title: string
  /** Secondary text (e.g., role, status, type) */
  subtitle?: string
  /** Category this result belongs to */
  category: SearchCategory
  /** URL to navigate to when selected */
  href: string
  /** Optional color for visual distinction (e.g., project color) */
  color?: string
  /** Optional status badge text */
  status?: string
}

/**
 * Grouped search results by category
 */
export interface SearchResults {
  projects: SearchResult[]
  crew: SearchResult[]
  clients: SearchResult[]
  consultants: SearchResult[]
}

/**
 * Search response from server action
 */
export interface SearchResponse {
  results: SearchResults
  query: string
  totalCount: number
}

/**
 * Recent search item stored in localStorage
 */
export interface RecentSearch {
  query: string
  timestamp: number
  resultCount: number
}

/**
 * Filter option for multi-select filters
 */
export interface FilterOption {
  /** Unique value for the option */
  value: string
  /** Display label */
  label: string
  /** Optional color for visual styling */
  color?: string
  /** Optional count of items matching this filter */
  count?: number
}

/**
 * Date range filter value
 */
export interface DateRange {
  from: string | null
  to: string | null
}

/**
 * Preset date range options
 */
export interface DateRangePreset {
  label: string
  getValue: () => DateRange
}
