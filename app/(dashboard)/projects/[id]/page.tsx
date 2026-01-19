import { createClient } from '@/lib/supabase/server'
import { getProjectById, deleteProject } from '@/app/projects/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, ArrowLeft, Calendar, BarChart3, FileText, Building2, UserCog } from 'lucide-react'
import { format } from 'date-fns'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import ProjectCrewManagement from '@/components/assignments/ProjectCrewManagement'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project with client and consultant
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      consultant:consultants(*)
    `)
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Fetch assignments for this project with crew member details
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      crew_member:crew_members(*)
    `)
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  // Fetch all crew members for the dropdown (including those already assigned to other projects)
  const { data: allCrew } = await supabase
    .from('crew_members')
    .select('*')
    .order('full_name', { ascending: true })

  // Filter out crew already assigned to THIS project for the same date range
  // (they can be assigned to other projects, we just want to show them all for selection)
  const assignedCrewIds = new Set(assignments?.map(a => a.crew_member_id) || [])
  const availableCrew = allCrew?.filter(c => !assignedCrewIds.has(c.id)) || []

  async function handleDelete() {
    'use server'
    await deleteProject(id)
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vessels
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h1>
              <p className="text-sm text-gray-500">
                {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${id}/planning`}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Planning
            </Link>
            <Link
              href={`/projects/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <form action={handleDelete}>
              <DeleteProjectButton onDelete={handleDelete} />
            </form>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {/* Status */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </dd>
          </div>

          {/* Type */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 capitalize">
              {project.type}
            </dd>
          </div>

          {/* Start Date */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project.start_date ? (
                <span className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                  {format(new Date(project.start_date), 'MMM d, yyyy')}
                </span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </dd>
          </div>

          {/* End Date */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project.end_date ? (
                <span className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                  {format(new Date(project.end_date), 'MMM d, yyyy')}
                </span>
              ) : (
                <span className="text-gray-400">Continuous</span>
              )}
            </dd>
          </div>
        </div>

        {/* Client & Consultant Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200">
          {/* Client */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project.client ? (
                <Link
                  href={`/clients/${project.client.id}`}
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <Building2 className="mr-1.5 h-4 w-4 text-indigo-500" />
                  {project.client.name}
                </Link>
              ) : (
                <span className="text-gray-400">No client assigned</span>
              )}
            </dd>
          </div>

          {/* Consultant */}
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Consultant</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project.consultant ? (
                <Link
                  href={`/consultants/${project.consultant.id}`}
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <UserCog className="mr-1.5 h-4 w-4 text-teal-500" />
                  {project.consultant.full_name}
                </Link>
              ) : (
                <span className="text-gray-400">No consultant assigned</span>
              )}
            </dd>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {project.notes && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Notes
            </h3>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.notes}</p>
          </div>
        </div>
      )}

      {/* Crew Management Section */}
      <ProjectCrewManagement
        project={{
          id: project.id,
          name: project.name,
          color: project.color,
          start_date: project.start_date,
          end_date: project.end_date
        }}
        assignments={assignments || []}
        availableCrew={availableCrew}
      />
    </div>
  )
}
