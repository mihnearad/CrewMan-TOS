'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { UserCog, Anchor, Search } from 'lucide-react'

interface ConsultantWithCount {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: string | null
  status: string
  created_at: string
  projects: { count: number }[]
}

interface ConsultantsTableProps {
  consultants: ConsultantWithCount[]
}

export default function ConsultantsTable({ consultants }: ConsultantsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = consultant.full_name.toLowerCase().includes(query)
        const matchesRole = consultant.role?.toLowerCase().includes(query) || false
        const matchesEmail = consultant.email?.toLowerCase().includes(query) || false
        if (!matchesName && !matchesRole && !matchesEmail) return false
      }

      // Status filter
      if (statusFilter && consultant.status !== statusFilter) return false

      return true
    })
  }, [consultants, searchQuery, statusFilter])

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search consultants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {filteredConsultants.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <UserCog className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching consultants</h3>
          <p className="mt-1 text-sm text-gray-500">
            {consultants.length === 0
              ? 'Get started by adding a new consultant.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultants.map((consultant) => {
                const projectCount = consultant.projects?.[0]?.count || 0
                return (
                  <tr key={consultant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/consultants/${consultant.id}`} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium">
                          {consultant.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {consultant.full_name}
                          </div>
                          {consultant.email && (
                            <div className="text-sm text-gray-500">{consultant.email}</div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{consultant.role || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Anchor className="h-4 w-4 mr-1.5 text-gray-400" />
                        {projectCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          consultant.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : consultant.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {consultant.status === 'on_leave' ? 'On Leave' : consultant.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Results count */}
      {(searchQuery || statusFilter) && filteredConsultants.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {filteredConsultants.length} of {consultants.length} consultants
        </p>
      )}
    </div>
  )
}
