/**
 * ThemeToggle Component
 * 
 * Button to toggle between light and dark mode.
 * Shows sun icon in dark mode, moon icon in light mode.
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show label text */
  showLabel?: boolean
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export default function ThemeToggle({ 
  className,
  size = 'md',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          'rounded-lg transition-colors duration-200',
          'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
          'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          sizeClasses[size],
          showLabel && 'flex items-center gap-2',
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <div className={cn(iconSizes[size], 'bg-gray-200 dark:bg-gray-700 rounded animate-pulse')} />
        {showLabel && <span className="text-sm">Theme</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'rounded-lg transition-colors duration-200',
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
        sizeClasses[size],
        showLabel && 'flex items-center gap-2',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={cn(iconSizes[size], 'text-yellow-500')} />
      ) : (
        <Moon className={cn(iconSizes[size], 'text-gray-600')} />
      )}
      {showLabel && (
        <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
      )}
    </button>
  )
}
