/**
 * GlobalSearch Component
 * 
 * Command+K modal for searching across all entities in the application.
 * Features keyboard navigation, category grouping, and result highlighting.
 * 
 * Usage: Wrap your app with GlobalSearchProvider and press Cmd+K (or Ctrl+K)
 */

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Anchor, Users, Building2, UserCog, ArrowRight, Command } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { globalSearch } from '@/app/search/actions'
import type { SearchResult, SearchResults, SearchCategory } from '@/lib/search/types'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

/** Category display configuration */
const categoryConfig: Record<SearchCategory, { label: string; icon: React.ReactNode; color: string }> = {
  projects: { 
    label: 'Vessels', 
    icon: <Anchor className="h-4 w-4" />, 
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50' 
  },
  crew: { 
    label: 'Crew', 
    icon: <Users className="h-4 w-4" />, 
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50' 
  },
  clients: { 
    label: 'Clients', 
    icon: <Building2 className="h-4 w-4" />, 
    color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50' 
  },
  consultants: { 
    label: 'Consultants', 
    icon: <UserCog className="h-4 w-4" />, 
    color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/50' 
  },
}

/** Order of categories in results */
const categoryOrder: SearchCategory[] = ['projects', 'crew', 'clients', 'consultants']

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 200)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    if (!results) return []
    return categoryOrder.flatMap(category => results[category])
  }, [results])
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null)
      setSelectedIndex(0)
      return
    }
    
    const performSearch = async () => {
      setIsLoading(true)
      try {
        const response = await globalSearch(debouncedQuery)
        setResults(response.results)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    performSearch()
  }, [debouncedQuery])
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
    }
  }, [isOpen])
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (flatResults[selectedIndex]) {
          navigateToResult(flatResults[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [flatResults, selectedIndex, onClose])
  
  // Navigate to selected result
  const navigateToResult = useCallback((result: SearchResult) => {
    // Save to recent searches
    saveRecentSearch(query)
    // Navigate
    router.push(result.href)
    onClose()
  }, [router, onClose, query])
  
  // Save recent search to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const updated = [searchQuery, ...recent.filter((q: string) => q !== searchQuery)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }
  }
  
  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && flatResults.length > 0) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, flatResults.length])
  
  if (!isOpen) return null
  
  const hasResults = results && flatResults.length > 0
  const hasQuery = query.length >= 2
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-[15%] mx-auto max-w-2xl z-50">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:shadow-gray-950/50">
          {/* Search Input */}
          <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700">
            <Search className="absolute left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search vessels, crew, clients, consultants..."
              className="w-full py-4 pl-12 pr-12 text-lg outline-none placeholder:text-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              autoComplete="off"
              spellCheck={false}
            />
            {isLoading ? (
              <Loader2 className="absolute right-4 h-5 w-5 text-gray-400 animate-spin dark:text-gray-500" />
            ) : query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 p-1 text-gray-400 hover:text-gray-600 rounded dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="absolute right-4 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500">
                ESC
              </kbd>
            )}
          </div>
          
          {/* Results */}
          <div 
            ref={resultsRef}
            className="max-h-[60vh] overflow-y-auto"
          >
            {/* Loading state */}
            {isLoading && hasQuery && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                Searching...
              </div>
            )}
            
            {/* Results */}
            {!isLoading && hasResults && (
              <div className="py-2">
                {categoryOrder.map(category => {
                  const categoryResults = results[category]
                  if (categoryResults.length === 0) return null
                  
                  const config = categoryConfig[category]
                  
                    return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2 dark:text-gray-400">
                        <span className={cn('p-1 rounded', config.color)}>
                          {config.icon}
                        </span>
                        {config.label}
                        <span className="text-gray-400 dark:text-gray-500">({categoryResults.length})</span>
                      </div>
                      
                      {/* Results */}
                      {categoryResults.map((result) => {
                        const globalIndex = flatResults.indexOf(result)
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={result.id}
                            data-index={globalIndex}
                            onClick={() => navigateToResult(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            )}
                          >
                            {/* Color indicator for projects */}
                            {result.color && (
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: result.color }}
                              />
                            )}
                            
                            {/* Avatar for non-projects */}
                            {!result.color && (
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                config.color
                              )}>
                                {result.title.charAt(0).toUpperCase()}
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate dark:text-white">
                                <HighlightMatch text={result.title} query={query} />
                              </div>
                              {result.subtitle && (
                                <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                                  <HighlightMatch text={result.subtitle} query={query} />
                                </div>
                              )}
                            </div>
                            
                            {/* Status badge */}
                            {result.status && (
                              <span className={cn(
                                'px-2 py-0.5 text-xs rounded-full',
                                result.status === 'active' || result.status === 'available'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                  : result.status === 'on_project'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              )}>
                                {result.status.replace('_', ' ')}
                              </span>
                            )}
                            
                            {/* Arrow indicator when selected */}
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 dark:text-blue-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* No results */}
            {!isLoading && hasQuery && !hasResults && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">Try a different search term</p>
              </div>
            )}
            
            {/* Empty state */}
            {!hasQuery && !results && (
              <div className="p-6">
                <p className="text-sm text-gray-500 text-center mb-4 dark:text-gray-400">
                  Start typing to search across all data
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOrder.map(category => {
                    const config = categoryConfig[category]
                    return (
                      <div 
                        key={category}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      >
                        <span className={cn('p-1 rounded', config.color)}>
                          {config.icon}
                        </span>
                        {config.label}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">esc</kbd>
              <span className="ml-1">to close</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Highlight matching text in search results
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 dark:bg-yellow-900/50 dark:text-yellow-300">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
