'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { History, ArrowRight } from 'lucide-react'
import { AuditLogEntry } from '@/lib/audit'

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const TABLE_NAMES: Record<string, string> = {
  crew_members: 'Crew',
  projects: 'Project',
  assignments: 'Assignment',
  clients: 'Client',
  consultants: 'Consultant',
  crew_roles: 'Role',
}

export default function RecentActivityWidget({ logs }: { logs: AuditLogEntry[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) {
      const date = new Date(dateString)
      const month = date.toISOString().substring(5, 7)
      const day = date.toISOString().substring(8, 10)
      const time = date.toISOString().substring(11, 16)
      return `${month}-${day} ${time}`
    }
    return format(new Date(dateString), 'MMM d, HH:mm')
  }

  if (logs.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-900 dark:shadow-gray-900/30">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <History className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <Link
              href="/audit"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Latest changes across the system</p>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.slice(0, 5).map((log) => (
            <li key={log.id} className="px-4 py-3 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      ACTION_COLORS[log.action as keyof typeof ACTION_COLORS]
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="ml-3 text-sm text-gray-900 dark:text-white truncate">
                    {TABLE_NAMES[log.table_name] || log.table_name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                    by {log.user_email.split('@')[0]}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
