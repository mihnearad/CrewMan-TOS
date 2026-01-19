import { createClient } from '@/lib/supabase/server'
import PlanningBoard from './PlanningBoard'

export default async function PlanningPage() {
  const supabase = await createClient()

  // Fetch all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('name')

  // Fetch all crew members
  const { data: crew } = await supabase
    .from('crew_members')
    .select('*')
    .order('full_name')

  // Fetch all assignments with related project and crew data
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      project:projects(*),
      crew_member:crew_members(*)
    `)
    .order('start_date', { ascending: true })

  // Fetch all crew roles
  const { data: roles } = await supabase
    .from('crew_roles')
    .select('id, name')
    .order('display_order', { ascending: true })

  // Fetch all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name')

  return (
    <PlanningBoard
      initialProjects={projects || []}
      initialCrew={crew || []}
      initialAssignments={assignments || []}
      roles={roles || []}
      clients={clients || []}
    />
  )
}
