/**
 * ThemeProvider Component
 * 
 * Provides dark mode functionality across the application.
 * - Persists theme preference to localStorage
 * - Manages 'dark' class on document.documentElement
 * - Exposes useTheme hook for components to access/toggle theme
 * 
 * @example
 * ```tsx
 * // In layout
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 * 
 * // In component
 * const { theme, toggleTheme } = useTheme()
 * ```
 */

'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  /** Current theme ('light' or 'dark') */
  theme: Theme
  /** Toggle between light and dark mode */
  toggleTheme: () => void
  /** Set theme directly */
  setTheme: (theme: Theme) => void
  /** Whether the theme is dark */
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** localStorage key for theme preference */
const THEME_STORAGE_KEY = 'theme'

/**
 * Hook to access theme context
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme, isDark } = useTheme()
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  /** Default theme if no preference is stored */
  defaultTheme?: Theme
}

export default function ThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: ThemeProviderProps) {
  // Initialize with default, will be updated in useEffect
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // On mount, read theme from localStorage or use default
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      // No stored preference, use default
      applyTheme(defaultTheme)
    }
  }, [defaultTheme])

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
  }

  // Prevent hydration mismatch by not rendering until mounted
  // The inline script in layout.tsx handles the initial theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
