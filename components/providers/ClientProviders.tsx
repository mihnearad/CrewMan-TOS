/**
 * ClientProviders Component
 * 
 * Wraps client-side providers that need to be used in the app.
 * This is necessary because the layout is a server component but
 * some providers (like GlobalSearchProvider, ThemeProvider) are client components.
 * 
 * Provider order (outermost to innermost):
 * 1. NuqsAdapter - URL state management
 * 2. ThemeProvider - Dark mode support
 * 3. GlobalSearchProvider - Cmd+K search
 */

'use client'

import { ReactNode } from 'react'
import GlobalSearchProvider from '@/components/search/GlobalSearchProvider'
import ThemeProvider from '@/components/providers/ThemeProvider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <GlobalSearchProvider>
          {children}
        </GlobalSearchProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
