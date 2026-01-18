import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Anchor } from 'lucide-react'
import ProjectsTable from '@/components/projects/ProjectsTable'

interface ProjectWithRelations {
  id: string
  name: string
  type: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at: string
  assignments: { count: number }[]
  client: { id: string; name: string } | null
  consultant: { id: string; full_name: string } | null
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      assignments:assignments(count),
      client:clients(id, name),
      consultant:consultants(id, full_name)
    `)
    .order('created_at', { ascending: false })

  const projectsWithRelations = (projects as ProjectWithRelations[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </div>

      {projectsWithRelations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Anchor className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <Link
              href="/projects/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
      ) : (
        <ProjectsTable projects={projectsWithRelations} />
      )}
    </div>
  )
}
