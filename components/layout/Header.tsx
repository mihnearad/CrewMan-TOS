/**
 * Header Component
 * 
 * Dashboard header with theme toggle, profile link, and sign out button.
 * Client component to support interactive elements like ThemeToggle.
 */

'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface HeaderProps {
  /** Server action for sign out */
  signoutAction: () => Promise<void>
}

export default function Header({ signoutAction }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-end bg-white dark:bg-gray-900 px-6 shadow dark:shadow-gray-900/20 border-b border-transparent dark:border-gray-800">
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
        
        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Link>
        
        {/* Sign Out */}
        <form action={signoutAction}>
          <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
