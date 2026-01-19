import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GanttView from '@/components/planning/GanttView'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPlanningPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch all assignments for this project
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      id,
      project_id,
      crew_member_id,
      start_date,
      end_date,
      role_on_project,
      project:projects(id, name, color),
      crew_member:crew_members(id, full_name, role)
    `)
    .eq('project_id', id)
    .order('start_date', { ascending: true })

  // Fetch all crew members (for adding new assignments)
  const { data: crewMembers } = await supabase
    .from('crew_members')
    .select('id, full_name, role, status')
    .order('full_name')

  // Transform assignments data
  const transformedAssignments = (assignments || []).map(a => {
    const proj = a.project as unknown as { id: string; name: string; color: string }
    const crew = a.crew_member as unknown as { id: string; full_name: string; role: string }
    return {
      id: a.id,
      project_id: a.project_id,
      crew_member_id: a.crew_member_id,
      start_date: a.start_date,
      end_date: a.end_date,
      role_on_project: a.role_on_project,
      project: {
        id: proj.id,
        name: proj.name,
        color: proj.color,
      },
      crew_member: {
        id: crew.id,
        full_name: crew.full_name,
        role: crew.role,
      },
    }
  })

  return (
    <div className="p-3">
      <div className="mb-4">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {project.name} - Planning
          </h1>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Manage crew assignments for this project
        </p>
      </div>

      <GanttView
        assignments={transformedAssignments}
        projects={[{
          id: project.id,
          name: project.name,
          type: project.type,
          status: project.status,
          color: project.color,
        }]}
        crewMembers={(crewMembers || []).map(c => ({
          id: c.id,
          full_name: c.full_name,
          role: c.role,
          status: c.status,
        }))}
        filterProjectId={id}
      />
    </div>
  )
}
