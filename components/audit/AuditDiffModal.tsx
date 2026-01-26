'use client'

import { useState, useEffect } from 'react'
import { AuditLogEntry } from '@/lib/audit'
import { format } from 'date-fns'
import { X } from 'lucide-react'

type AuditDiffModalProps = {
  log: AuditLogEntry
  onClose: () => void
}

const TABLE_DISPLAY_NAMES: Record<string, string> = {
  crew_members: 'Crew Member',
  projects: 'Project',
  assignments: 'Assignment',
  clients: 'Client',
  consultants: 'Consultant',
  crew_roles: 'Crew Role',
}

export default function AuditDiffModal({ log, onClose }: AuditDiffModalProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (dateString: string) => {
    if (!isClient) {
      return new Date(dateString).toISOString().replace('T', ' ').substring(0, 19)
    }
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss')
  }

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  const renderFieldChange = (field: string, oldVal: any, newVal: any) => {
    const oldValue = renderValue(oldVal)
    const newValue = renderValue(newVal)
    const hasChanged = oldValue !== newValue

    return (
      <div key={field} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        {log.action === 'CREATE' ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">New Value:</div>
            <div className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
              {newValue}
            </div>
          </div>
        ) : log.action === 'DELETE' ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deleted Value:</div>
            <div className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
              {oldValue}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded p-2 ${hasChanged ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Before:</div>
              <div className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
                {oldValue}
              </div>
            </div>
            <div className={`rounded p-2 ${hasChanged ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">After:</div>
              <div className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap break-all">
                {newValue}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const allFields = new Set<string>()
  if (log.old_values) Object.keys(log.old_values).forEach(k => allFields.add(k))
  if (log.new_values) Object.keys(log.new_values).forEach(k => allFields.add(k))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Log Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {TABLE_DISPLAY_NAMES[log.table_name] || log.table_name} - {log.action}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Metadata */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">User:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">{log.user_email}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">
                  {formatDate(log.created_at)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Record ID:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                  {log.record_id}
                </span>
              </div>
              {log.changed_fields && log.changed_fields.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Changed Fields:</span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    {log.changed_fields.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Changes */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-4">
            {Array.from(allFields).map(field => 
              renderFieldChange(
                field,
                log.old_values?.[field],
                log.new_values?.[field]
              )
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
