/**
 * SearchInput Component
 * 
 * Reusable search input with consistent styling across the application.
 * Features search icon, clear button, optional keyboard shortcut hint,
 * and proper accessibility attributes.
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search projects..."
 * />
 * ```
 */

'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  /** Current search value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Show keyboard shortcut hint (e.g., "Cmd+K") */
  shortcutHint?: string
  /** Additional CSS classes */
  className?: string
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Callback when Escape is pressed */
  onEscape?: () => void
  /** Callback when Enter is pressed */
  onEnter?: () => void
  /** ID for the input element */
  id?: string
  /** Aria label for accessibility */
  ariaLabel?: string
}

const sizeClasses = {
  sm: 'py-1.5 pl-8 pr-8 text-sm',
  md: 'py-2 pl-10 pr-10 text-sm',
  lg: 'py-3 pl-12 pr-12 text-base',
}

const iconSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const iconPositionClasses = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-4',
}

const clearPositionClasses = {
  sm: 'right-2',
  md: 'right-3',
  lg: 'right-4',
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  shortcutHint,
  className,
  autoFocus = false,
  size = 'md',
  onEscape,
  onEnter,
  id,
  ariaLabel = 'Search',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Auto-focus handling
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  
  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (value) {
        onChange('')
      }
      onEscape?.()
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      onEnter?.()
    }
  }, [value, onChange, onEscape, onEnter])
  
  // Clear button handler
  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])
  
  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      <Search 
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
          iconSizeClasses[size],
          iconPositionClasses[size]
        )} 
      />
      
      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'w-full border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'placeholder:text-gray-400',
          'transition-colors duration-150',
          sizeClasses[size]
        )}
      />
      
      {/* Clear Button or Shortcut Hint */}
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
            'transition-colors duration-150',
            clearPositionClasses[size]
          )}
          aria-label="Clear search"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      ) : shortcutHint ? (
        <kbd 
          className={cn(
            'absolute top-1/2 -translate-y-1/2 hidden sm:inline-flex',
            'items-center gap-1 px-1.5 py-0.5 rounded',
            'bg-gray-100 text-gray-500 text-xs font-mono',
            'border border-gray-200',
            clearPositionClasses[size]
          )}
        >
          {shortcutHint}
        </kbd>
      ) : null}
    </div>
  )
}
