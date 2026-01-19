'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Phone, User, Flag, Plane, Building2, Globe, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface CrewMember {
  id: string
  full_name: string
  role: string
  status: string
  email?: string
  phone?: string
  nationality?: string
  flag_state?: string
  home_airport?: string
  company?: string
}

interface Assignment {
  id: string
  start_date: string
  end_date: string
  role_on_project?: string
  project: {
    id: string
    name: string
    color: string
  }
}

interface CrewDetailModalProps {
  crewMemberId: string
  isOpen: boolean
  onClose: () => void
}

function getStatusDisplay(status: string) {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        bgClass: 'bg-green-100',
        textClass: 'text-green-800',
        dotClass: 'bg-green-500',
      }
    case 'on_project':
      return {
        label: 'Onboard',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800',
        dotClass: 'bg-blue-500',
      }
    case 'on_leave':
      return {
        label: 'On Leave',
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800',
        dotClass: 'bg-yellow-500',
      }
    default:
      return {
        label: status.replace('_', ' '),
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        dotClass: 'bg-gray-500',
      }
  }
}

export default function CrewDetailModal({
  crewMemberId,
  isOpen,
  onClose,
}: CrewDetailModalProps) {
  const [crewMember, setCrewMember] = useState<CrewMember | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !crewMemberId) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/crew/${crewMemberId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch crew member')
        }
        const data = await response.json()
        setCrewMember(data.crewMember)
        setAssignments(data.assignments || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, crewMemberId])

  if (!isOpen) return null

  const statusDisplay = crewMember ? getStatusDisplay(crewMember.status) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Crew Member Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          ) : crewMember ? (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {crewMember.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {crewMember.full_name}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-1.5 mt-0.5">
                    <User className="h-4 w-4" />
                    {crewMember.role}
                  </p>
                  {statusDisplay && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium mt-2 ${statusDisplay.bgClass} ${statusDisplay.textClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotClass}`} />
                      {statusDisplay.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(crewMember.email || crewMember.phone) && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {crewMember.email && (
                    <a
                      href={`mailto:${crewMember.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {crewMember.email}
                    </a>
                  )}
                  {crewMember.phone && (
                    <a
                      href={`tel:${crewMember.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {crewMember.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Additional Details */}
              {(crewMember.nationality || crewMember.flag_state || crewMember.home_airport || crewMember.company) && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  {crewMember.nationality && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Nationality</p>
                        <p className="text-sm font-medium text-gray-900">{crewMember.nationality}</p>
                      </div>
                    </div>
                  )}
                  {crewMember.flag_state && (
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Flag State</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{crewMember.flag_state}</p>
                      </div>
                    </div>
                  )}
                  {crewMember.home_airport && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Home Airport</p>
                        <p className="text-sm font-medium text-gray-900">{crewMember.home_airport}</p>
                      </div>
                    </div>
                  )}
                  {crewMember.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Company</p>
                        <p className="text-sm font-medium text-gray-900">{crewMember.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assignments */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Assignments
                </h4>
                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No assignments</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.slice(0, 5).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 bg-white"
                      >
                        <div
                          className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: assignment.project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {assignment.project.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(assignment.start_date), 'MMM d, yyyy')} - {format(new Date(assignment.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {assignments.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{assignments.length - 5} more assignments
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          {crewMember && (
            <Link
              href={`/crew/${crewMember.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Full Profile
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
