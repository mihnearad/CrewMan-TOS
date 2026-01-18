import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import CrewList from '@/components/crew/CrewList'

interface CrewWithAssignments {
  id: string
  full_name: string
  role: string
  status: string
  email: string | null
  phone: string | null
  assignments: {
    id: string
    start_date: string
    end_date: string
    project: {
      id: string
      name: string
      color: string
    }
  }[]
}

export default async function CrewPage() {
  const supabase = await createClient()

  const { data: crew } = await supabase
    .from('crew_members')
    .select(`
      id,
      full_name,
      role,
      status,
      email,
      phone,
      assignments:assignments(
        id,
        start_date,
        end_date,
        project:projects(id, name, color)
      )
    `)
    .order('full_name', { ascending: true })

  const crewWithAssignments = (crew as unknown as CrewWithAssignments[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crew Members</h1>
        <Link
          href="/crew/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Crew
        </Link>
      </div>

      {crewWithAssignments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No crew members</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first crew member.</p>
          <div className="mt-6">
            <Link
              href="/crew/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Crew
            </Link>
          </div>
        </div>
      ) : (
        <CrewList crew={crewWithAssignments} />
      )}
    </div>
  )
}
