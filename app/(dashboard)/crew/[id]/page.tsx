import { createClient } from '@/lib/supabase/server'
import { getCrewMemberById, deleteCrewMember } from '@/app/crew/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, ArrowLeft, Mail, Phone, User } from 'lucide-react'
import CrewPlanningHub from '@/components/crew/CrewPlanningHub'
import DeleteCrewButton from '@/components/crew/DeleteCrewButton'
import type { Assignment } from '@/components/assignments'

// Status display configuration
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
        label: 'On Project',
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

export default async function CrewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crewMember = await getCrewMemberById(id)

  if (!crewMember) {
    notFound()
  }

  // Fetch assignments for this crew member with full project details
  const supabase = await createClient()
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      id,
      project_id,
      crew_member_id,
      start_date,
      end_date,
      role_on_project,
      project:projects(id, name, color, type, status)
    `)
    .eq('crew_member_id', id)
    .order('start_date', { ascending: true })

  // Fetch all available projects for new assignment modal
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, color, type, status')
    .eq('status', 'active')
    .order('name')

  async function handleDelete() {
    'use server'
    await deleteCrewMember(id)
  }

  const statusDisplay = getStatusDisplay(crewMember.status)

  // Transform assignments to match the Assignment type
  const typedAssignments: Assignment[] = (assignments || []).map((a: any) => ({
    id: a.id,
    project_id: a.project_id,
    crew_member_id: a.crew_member_id,
    start_date: a.start_date,
    end_date: a.end_date,
    role_on_project: a.role_on_project,
    project: {
      id: a.project.id,
      name: a.project.name,
      color: a.project.color,
      type: a.project.type,
      status: a.project.status,
    },
  }))

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/crew"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Crew
        </Link>
      </div>

      {/* Crew Member Header Card */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Crew member info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {crewMember.full_name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {crewMember.full_name}
                </h1>
                <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                  <User className="h-4 w-4" />
                  {crewMember.role}
                </p>

                {/* Status Badge - Prominent */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${statusDisplay.bgClass} ${statusDisplay.textClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDisplay.dotClass}`} />
                    {statusDisplay.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/crew/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
              <DeleteCrewButton crewMemberId={id} onDelete={handleDelete} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap gap-6">
            {crewMember.email && (
              <a
                href={`mailto:${crewMember.email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {crewMember.email}
              </a>
            )}
            {crewMember.phone && (
              <a
                href={`tel:${crewMember.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {crewMember.phone}
              </a>
            )}
            {!crewMember.email && !crewMember.phone && (
              <p className="text-sm text-gray-400">No contact information provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Planning Hub Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule & Assignments</h2>
        <CrewPlanningHub
          crewMember={crewMember}
          assignments={typedAssignments}
          projects={projects || []}
        />
      </div>
    </div>
  )
}
