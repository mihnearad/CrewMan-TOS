'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Clock, User } from 'lucide-react'
import { AuditLogEntry } from '@/lib/audit'

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function RecordHistoryClient({ logs }: { logs: AuditLogEntry[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) {
      return new Date(dateString).toISOString().replace('T', ' ').substring(0, 16)
    }
    return format(new Date(dateString), 'MMM d, yyyy HH:mm')
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No change history available for this record.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Change History
      </h2>
      
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border-l-2 border-gray-300 dark:border-gray-600 pl-4 pb-4 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      ACTION_COLORS[log.action as keyof typeof ACTION_COLORS]
                    }`}
                  >
                    {log.action}
                  </span>
                  {log.action === 'UPDATE' && log.changed_fields && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Changed: {log.changed_fields.join(', ')}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>{log.user_email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
