import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Anchor, Users, Calendar, ArrowRight, Plus, UserPlus, ClipboardList, AlertTriangle, Building2, UserCog } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'

interface EndingAssignment {
  id: string
  end_date: string
  project: { name: string; color: string }
  crew_member: { id: string; full_name: string }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get counts for quick stats
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: crewCount } = await supabase
    .from('crew_members')
    .select('*', { count: 'exact', head: true })

  const { count: assignmentCount } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })

  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: consultantCount } = await supabase
    .from('consultants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get assignments ending within 7 days
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysFromNow = addDays(new Date(), 7).toISOString().split('T')[0]

  const { data: endingAssignments } = await supabase
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
    .limit(5)

  const typedEndingAssignments = endingAssignments as EndingAssignment[] | null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome to CrewMan TOS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <Link
          href="/projects"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3">
                <Anchor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/crew"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crew Members</p>
                <p className="text-2xl font-bold text-gray-900">{crewCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/clients"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-indigo-100 p-3">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clientCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/consultants"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-teal-100 p-3">
                <UserCog className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-2xl font-bold text-gray-900">{consultantCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/planning"
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignmentCount || 0}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/projects/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="rounded-full bg-blue-100 p-2 mb-2">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">New Project</span>
          </Link>

          <Link
            href="/crew/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="rounded-full bg-green-100 p-2 mb-2">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Crew</span>
          </Link>

          <Link
            href="/clients/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <div className="rounded-full bg-indigo-100 p-2 mb-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Client</span>
          </Link>

          <Link
            href="/consultants/new"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors"
          >
            <div className="rounded-full bg-teal-100 p-2 mb-2">
              <UserCog className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Consultant</span>
          </Link>

          <Link
            href="/planning"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="rounded-full bg-purple-100 p-2 mb-2">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">New Assignment</span>
          </Link>

          <Link
            href="/planning"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 hover:border-orange-400 hover:bg-orange-50 transition-colors"
          >
            <div className="rounded-full bg-orange-100 p-2 mb-2">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">View Planning</span>
          </Link>
        </div>
      </div>

      {/* Assignments Ending Soon */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Assignments Ending Soon</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">Crew assignments ending within the next 7 days</p>
        </div>

        {!typedEndingAssignments || typedEndingAssignments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">No assignments ending in the next 7 days</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {typedEndingAssignments.map((assignment) => {
              const daysUntilEnd = differenceInDays(new Date(assignment.end_date), new Date())
              const isUrgent = daysUntilEnd <= 3

              return (
                <li key={assignment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: assignment.project?.color || '#6B7280' }}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/crew/${assignment.crew_member?.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                        >
                          {assignment.crew_member?.full_name || 'Unknown'}
                        </Link>
                        <p className="text-sm text-gray-500 truncate">
                          {assignment.project?.name || 'Unknown project'}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isUrgent
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {daysUntilEnd === 0
                          ? 'Ends today'
                          : daysUntilEnd === 1
                          ? 'Ends tomorrow'
                          : `${daysUntilEnd} days left`}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
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
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <Link
              href="/planning"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all assignments <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
