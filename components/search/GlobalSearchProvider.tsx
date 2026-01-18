/**
 * GlobalSearchProvider Component
 * 
 * Context provider for the global Command+K search functionality.
 * Handles keyboard listener registration and portal rendering.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * export default function Layout({ children }) {
 *   return (
 *     <GlobalSearchProvider>
 *       {children}
 *     </GlobalSearchProvider>
 *   )
 * }
 * ```
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import GlobalSearch from './GlobalSearch'

interface GlobalSearchContextValue {
  /** Whether the search modal is open */
  isOpen: boolean
  /** Open the search modal */
  open: () => void
  /** Close the search modal */
  close: () => void
  /** Toggle the search modal */
  toggle: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

/**
 * Hook to access global search functionality
 * 
 * @example
 * ```tsx
 * const { open } = useGlobalSearch()
 * // Open search modal programmatically
 * <button onClick={open}>Search</button>
 * ```
 */
export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return context
}

interface GlobalSearchProviderProps {
  children: ReactNode
}

export default function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  
  // Register keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
        return
      }
      
      // Also support "/" key when not in an input
      if (e.key === '/' && !isInputElement(e.target)) {
        e.preventDefault()
        open()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle, open])
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  const value: GlobalSearchContextValue = {
    isOpen,
    open,
    close,
    toggle,
  }
  
  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </GlobalSearchContext.Provider>
  )
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target) return false
  const element = target as HTMLElement
  const tagName = element.tagName?.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  )
}
