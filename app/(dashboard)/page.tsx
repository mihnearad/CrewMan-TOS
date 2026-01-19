import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Anchor, Users, Calendar, ArrowRight, Plus, UserPlus, ClipboardList, AlertTriangle, Building2, UserCog } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import DashboardPlanningWidget from '@/components/dashboard/DashboardPlanningWidget'

interface EndingAssignment {
  id: string
  end_date: string
  project: { name: string; color: string }
  crew_member: { id: string; full_name: string }
}

interface PlanningAssignment {
  id: string
  project_id: string
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  project: { id: string; name: string; color: string }
  crew_member: { id: string; full_name: string; role: string }
}

interface Project {
  id: string
  name: string
  type: string
  status: string
  color: string
}

interface CrewMember {
  id: string
  full_name: string
  role: string
  status: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get counts for quick stats - parallelized for better performance
  const [
    { count: projectCount },
    { count: crewCount },
    { count: assignmentCount },
    { count: clientCount },
    { count: consultantCount }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('crew_members').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('consultants').select('*', { count: 'exact', head: true }).eq('status', 'active')
  ])

  // Get assignments ending within 7 days
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysFromNow = addDays(new Date(), 7).toISOString().split('T')[0]

  // Fetch data for planning widget and ending assignments in parallel
  const [
    { data: endingAssignments },
    { data: planningAssignments },
    { data: projects },
    { data: crewMembers }
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select(`
        id,
        end_date,
        project:projects(name, color),
        crew_member:crew_members(id, full_name)
      `)
      .gte('end_date', today)
      .lte('end_date', sevenDaysFromNow)
      .order('end_date', { ascending: true })
      .limit(5),
    supabase
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
      .order('start_date', { ascending: true }),
    supabase
      .from('projects')
      .select('id, name, type, status, color')
      .order('name'),
    supabase
      .from('crew_members')
      .select('id, full_name, role, status')
      .order('full_name')
  ])

  const typedEndingAssignments = endingAssignments as EndingAssignment[] | null
  const typedPlanningAssignments = planningAssignments as PlanningAssignment[] | null
  const typedProjects = projects as Project[] | null
  const typedCrewMembers = crewMembers as CrewMember[] | null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to CrewMan TOS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <Link
          href="/projects"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                <Anchor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Vessels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors dark:text-gray-500" />
          </div>
        </Link>

        <Link
          href="/crew"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crew Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{crewCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors dark:text-gray-500" />
          </div>
        </Link>

        <Link
          href="/clients"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/50">
                <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{clientCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors dark:text-gray-500" />
          </div>
        </Link>

        <Link
          href="/consultants"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-teal-100 p-3 dark:bg-teal-900/50">
                <UserCog className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultantCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors dark:text-gray-500" />
          </div>
        </Link>

        <Link
          href="/planning"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow dark:bg-gray-900 dark:shadow-gray-900/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignmentCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors dark:text-gray-500" />
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/projects/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
          >
            <div className="rounded-full bg-blue-100 p-2 mb-2 dark:bg-blue-900/50">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Vessel</span>
          </Link>

          <Link
            href="/crew/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-green-400 hover:bg-green-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-green-900/20"
          >
            <div className="rounded-full bg-green-100 p-2 mb-2 dark:bg-green-900/50">
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Crew</span>
          </Link>

          <Link
            href="/clients/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
          >
            <div className="rounded-full bg-indigo-100 p-2 mb-2 dark:bg-indigo-900/50">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Client</span>
          </Link>

          <Link
            href="/consultants/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-teal-500 dark:hover:bg-teal-900/20"
          >
            <div className="rounded-full bg-teal-100 p-2 mb-2 dark:bg-teal-900/50">
              <UserCog className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Consultant</span>
          </Link>

          <Link
            href="/planning"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
          >
            <div className="rounded-full bg-purple-100 p-2 mb-2 dark:bg-purple-900/50">
              <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Assignment</span>
          </Link>

          <Link
            href="/planning"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-orange-400 hover:bg-orange-50 transition-colors dark:bg-gray-900 dark:border-gray-600 dark:hover:border-orange-500 dark:hover:bg-orange-900/20"
          >
            <div className="rounded-full bg-orange-100 p-2 mb-2 dark:bg-orange-900/50">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Planning</span>
          </Link>
        </div>
      </div>

      {/* Planning Overview */}
      <div className="mb-8">
        <DashboardPlanningWidget
          assignments={typedPlanningAssignments || []}
          projects={typedProjects || []}
          crewMembers={typedCrewMembers || []}
        />
      </div>

      {/* Assignments Ending Soon */}
      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-900 dark:shadow-gray-900/30">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignments Ending Soon</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crew assignments ending within the next 7 days</p>
        </div>

        {!typedEndingAssignments || typedEndingAssignments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No assignments ending in the next 7 days</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {typedEndingAssignments.map((assignment) => {
              const daysUntilEnd = differenceInDays(new Date(assignment.end_date), new Date())
              const isUrgent = daysUntilEnd <= 3

              return (
                <li key={assignment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: assignment.project?.color || '#6B7280' }}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/crew/${assignment.crew_member?.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block dark:text-white dark:hover:text-blue-400"
                        >
                          {assignment.crew_member?.full_name || 'Unknown'}
                        </Link>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                          {assignment.project?.name || 'Unknown project'}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isUrgent
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                        }`}
                      >
                        {daysUntilEnd === 0
                          ? 'Ends today'
                          : daysUntilEnd === 1
                          ? 'Ends tomorrow'
                          : `${daysUntilEnd} days left`}
                      </span>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(assignment.end_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {typedEndingAssignments && typedEndingAssignments.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <Link
              href="/planning"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all assignments <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
