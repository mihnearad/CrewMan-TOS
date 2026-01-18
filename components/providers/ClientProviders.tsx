/**
 * ClientProviders Component
 * 
 * Wraps client-side providers that need to be used in the app.
 * This is necessary because the layout is a server component but
 * some providers (like GlobalSearchProvider) are client components.
 * 
 * Add new client-side providers here as needed.
 */

'use client'

import { ReactNode } from 'react'
import GlobalSearchProvider from '@/components/search/GlobalSearchProvider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NuqsAdapter>
      <GlobalSearchProvider>
        {children}
      </GlobalSearchProvider>
    </NuqsAdapter>
  )
}
