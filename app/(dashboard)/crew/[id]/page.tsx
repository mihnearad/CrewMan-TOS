import { createClient } from '@/lib/supabase/server'
import { getCrewMemberById, deleteCrewMember } from '@/app/crew/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, ArrowLeft, Mail, Phone, User, Plane, Globe } from 'lucide-react'
import CrewPlanningHub from '@/components/crew/CrewPlanningHub'
import DeleteCrewButton from '@/components/crew/DeleteCrewButton'
import type { Assignment } from '@/components/assignments'
import { computeCrewDisplayStatus, getCrewStatusDisplay } from '@/lib/utils'

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
      assignment_type,
      training_description,
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

  const { data: roles } = await supabase
    .from('crew_roles')
    .select('id, name')
    .order('display_order', { ascending: true })

  async function handleDelete() {
    'use server'
    await deleteCrewMember(id)
  }

  // Compute display status based on assignments
  const displayStatus = computeCrewDisplayStatus(
    crewMember.status,
    assignments?.map(a => ({ 
      start_date: a.start_date, 
      end_date: a.end_date,
      assignment_type: a.assignment_type,
    }))
  )
  const statusDisplay = getCrewStatusDisplay(displayStatus)

  // Transform assignments to match the Assignment type
  const typedAssignments: Assignment[] = (assignments || []).map((a: any) => ({
    id: a.id,
    project_id: a.project_id,
    crew_member_id: a.crew_member_id,
    start_date: a.start_date,
    end_date: a.end_date,
    role_on_project: a.role_on_project,
    assignment_type: a.assignment_type || 'vessel',
    training_description: a.training_description,
    project: a.project ? {
      id: a.project.id,
      name: a.project.name,
      color: a.project.color,
      type: a.project.type,
      status: a.project.status,
    } : null,
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

        {/* Additional Details */}
        {(crewMember.nationality || crewMember.home_airport) && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {crewMember.nationality && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm font-medium text-gray-900">{crewMember.nationality}</p>
                  </div>
                </div>
              )}
              {crewMember.home_airport && (
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Home Airport</p>
                    <p className="text-sm font-medium text-gray-900">{crewMember.home_airport}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Planning Hub Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule & Assignments</h2>
        <CrewPlanningHub
          crewMember={crewMember}
          assignments={typedAssignments}
          projects={projects || []}
          roles={roles || []}
        />
      </div>
    </div>
  )
}
