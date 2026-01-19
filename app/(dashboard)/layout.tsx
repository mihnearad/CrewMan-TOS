import { redirect } from 'next/navigation'
import SidebarClient from '@/components/SidebarClient'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { ToastProvider } from '@/components/ui/ToastProvider'
import ClientProviders from '@/components/providers/ClientProviders'

import { signout } from '@/app/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ClientProviders>
      <ToastProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
          <SidebarClient />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header signoutAction={signout} />
            <main className="flex-1 overflow-y-auto p-3 bg-gray-100 dark:bg-gray-950">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ClientProviders>
  )
}
