import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { LogOut, User } from 'lucide-react'
import { ToastProvider } from '@/components/ui/ToastProvider'

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
    <ToastProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-end bg-white px-6 shadow">
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <form action={signout}>
                  <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
