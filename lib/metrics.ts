import { addDays, differenceInDays } from 'date-fns'

export interface DashboardMetrics {
  activeProjects: number
  availableCrew: number
  crewOnProjects: number
  upcomingDepartures: number
  projectsNeedingCrew: number
}

export interface Project {
  id: string
  status: string
  [key: string]: any
}

export interface CrewMember {
  id: string
  status: string
  [key: string]: any
}

export interface Assignment {
  id: string
  project_id: string
  crew_member_id: string
  end_date: string
  [key: string]: any
}

export function calculateDashboardMetrics(
  projects: Project[],
  crew: CrewMember[],
  assignments: Assignment[]
): DashboardMetrics {
  // Active Projects: projects with status 'active'
  const activeProjects = projects.filter(p => p.status === 'active').length

  // Available Crew: crew members with status 'available'
  const availableCrew = crew.filter(c => c.status === 'available').length

  // Crew on Projects: unique crew members who have active assignments
  const today = new Date()
  const crewOnProjectsSet = new Set<string>()

  assignments.forEach(assignment => {
    const endDate = new Date(assignment.end_date)
    if (endDate >= today) {
      crewOnProjectsSet.add(assignment.crew_member_id)
    }
  })

  const crewOnProjects = crewOnProjectsSet.size

  // Upcoming Departures: assignments ending in the next 7 days
  const sevenDaysFromNow = addDays(today, 7)
  const upcomingDepartures = assignments.filter(assignment => {
    const endDate = new Date(assignment.end_date)
    const daysUntil = differenceInDays(endDate, today)
    return daysUntil >= 0 && daysUntil <= 7
  }).length

  // Projects Needing Crew: active projects with fewer than 3 assigned crew
  const activeProjectIds = projects
    .filter(p => p.status === 'active')
    .map(p => p.id)

  const projectsNeedingCrew = activeProjectIds.filter(projectId => {
    const assignedCount = assignments.filter(a => {
      const endDate = new Date(a.end_date)
      return a.project_id === projectId && endDate >= today
    }).length
    return assignedCount < 3
  }).length

  return {
    activeProjects,
    availableCrew,
    crewOnProjects,
    upcomingDepartures,
    projectsNeedingCrew
  }
}
