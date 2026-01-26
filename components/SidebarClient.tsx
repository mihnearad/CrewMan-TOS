/**
 * SidebarClient Component
 * 
 * Client-side sidebar component that includes interactive elements
 * like the global search trigger. This is separated from the main
 * Sidebar to allow server-side rendering of static navigation items.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Anchor, Users, Calendar, Building2, UserCog, Settings, ClipboardList } from 'lucide-react'
import SearchTrigger from './search/SearchTrigger'
import { cn } from '@/lib/utils'

const baseNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vessels', href: '/projects', icon: Anchor },
  { name: 'Crew', href: '/crew', icon: Users },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Consultants', href: '/consultants', icon: UserCog },
  { name: 'Planning', href: '/planning', icon: Calendar },
]

const adminOnlyItems = [
  { name: 'Audit Log', href: '/audit', icon: ClipboardList },
]

const settingsItem = { name: 'Settings', href: '/settings', icon: Settings }

type SidebarClientProps = {
  userRole: 'admin' | 'planner' | 'viewer'
}

export default function SidebarClient({ userRole }: SidebarClientProps) {
  const pathname = usePathname()
  const [shortcutKey, setShortcutKey] = useState('⌘')

  // Build navigation based on user role
  const navigation = [
    ...baseNavigation,
    ...(userRole === 'admin' ? adminOnlyItems : []),
    settingsItem,
  ]
  
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setShortcutKey(isMac ? '⌘' : 'Ctrl+')
  }, [])
  
  // Check if a nav item is active (exact match or starts with for nested routes)
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }
  
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white print:hidden" data-sidebar>
      {/* Logo */}
      <div className="flex flex-col items-center justify-center gap-2 border-b border-gray-800 py-4">
        <Image src="/Logo.png" alt="CrewMan TOS Logo" width={80} height={80} priority />
        <h1 className="text-xl font-bold">CrewMan TOS</h1>
      </div>
      
      {/* Search */}
      <div className="px-2 py-3 border-b border-gray-800">
        <SearchTrigger variant="sidebar" />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-6 w-6 flex-shrink-0 transition-colors',
                  active
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-300'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      {/* Keyboard shortcut hint */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400 text-xs">{shortcutKey}K</kbd> to search
        </p>
      </div>
    </div>
  )
}
