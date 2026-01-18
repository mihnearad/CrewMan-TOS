/**
 * SearchTrigger Component
 * 
 * Button that triggers the global search modal.
 * Shows keyboard shortcut hint and can be styled as a button or input-like.
 * 
 * @example
 * ```tsx
 * // In sidebar
 * <SearchTrigger variant="sidebar" />
 * 
 * // In header
 * <SearchTrigger variant="input" />
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useGlobalSearch } from './GlobalSearchProvider'
import { cn } from '@/lib/utils'

interface SearchTriggerProps {
  /** Visual variant */
  variant?: 'button' | 'input' | 'sidebar'
  /** Additional CSS classes */
  className?: string
  /** Placeholder text for input variant */
  placeholder?: string
}

export default function SearchTrigger({
  variant = 'button',
  className,
  placeholder = 'Search...',
}: SearchTriggerProps) {
  const { open } = useGlobalSearch()
  
  // Use state to avoid hydration mismatch - start with a neutral symbol
  // that works on both platforms, then update on client
  const [shortcutKey, setShortcutKey] = useState<string>('⌘')
  
  useEffect(() => {
    // Detect OS for keyboard shortcut display after hydration
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setShortcutKey(isMac ? '⌘' : 'Ctrl+')
  }, [])
  
  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={open}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
          'text-gray-400 hover:text-white hover:bg-gray-800',
          'transition-colors duration-150',
          className
        )}
      >
        <Search className="h-5 w-5" />
        <span className="flex-1 text-left text-sm">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-800 rounded border border-gray-700">
          {shortcutKey}K
        </kbd>
      </button>
    )
  }
  
  if (variant === 'input') {
    return (
      <button
        type="button"
        onClick={open}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300',
          'bg-white hover:bg-gray-50 hover:border-gray-400',
          'transition-colors duration-150 min-w-[200px]',
          className
        )}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-left text-sm text-gray-500">{placeholder}</span>
        <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
          {shortcutKey}K
        </kbd>
      </button>
    )
  }
  
  // Default button variant
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        'transition-colors duration-150',
        className
      )}
      title={`Search (${shortcutKey}K)`}
    >
      <Search className="h-5 w-5" />
      <span className="hidden sm:inline text-sm">Search</span>
    </button>
  )
}
