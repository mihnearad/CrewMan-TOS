import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Anchor, Users, Calendar, Building2, UserCog } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Anchor },
  { name: 'Crew', href: '/crew', icon: Users },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Consultants', href: '/consultants', icon: UserCog },
  { name: 'Planning', href: '/planning', icon: Calendar },
]

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex flex-col items-center justify-center gap-2 border-b border-gray-800 py-4">
        <Image src="/Logo.png" alt="CrewMan TOS Logo" width={80} height={80} priority />
        <h1 className="text-xl font-bold">CrewMan TOS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <item.icon
              className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300"
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
