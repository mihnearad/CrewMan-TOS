'use client'

import { Search, X } from 'lucide-react'

interface ProjectsFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string | null
  onStatusChange: (status: string | null) => void
  typeFilter: string | null
  onTypeChange: (type: string | null) => void
}

const statuses = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'planned', label: 'Planned', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
]

const types = [
  { value: 'vessel', label: 'Vessel' },
  { value: 'windfarm', label: 'Wind Farm' },
  { value: 'other', label: 'Other' },
]

export default function ProjectsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}: ProjectsFilterProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Status:</span>
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusChange(statusFilter === status.value ? null : status.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                statusFilter === status.value
                  ? status.color + ' ring-2 ring-offset-1 ring-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Type:</span>
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(typeFilter === type.value ? null : type.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                typeFilter === type.value
                  ? 'bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-offset-1 ring-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Clear All */}
        {(statusFilter || typeFilter || searchQuery) && (
          <button
            onClick={() => {
              onSearchChange('')
              onStatusChange(null)
              onTypeChange(null)
            }}
            className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
