'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AuditAction } from '@/lib/audit'

type AuditLogFiltersProps = {
  currentTable?: string
  currentAction?: AuditAction
}

const TABLE_OPTIONS = [
  { value: '', label: 'All Tables' },
  { value: 'crew_members', label: 'Crew Members' },
  { value: 'projects', label: 'Projects' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'clients', label: 'Clients' },
  { value: 'consultants', label: 'Consultants' },
  { value: 'crew_roles', label: 'Crew Roles' },
]

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
]

export default function AuditLogFilters({ currentTable, currentAction }: AuditLogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/audit?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="table-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Table
        </label>
        <select
          id="table-filter"
          value={currentTable || ''}
          onChange={(e) => handleFilterChange('table', e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TABLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Action
        </label>
        <select
          id="action-filter"
          value={currentAction || ''}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
