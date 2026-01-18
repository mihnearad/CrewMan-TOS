'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, History, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { isBefore, isAfter, startOfDay } from 'date-fns'
import {
  AssignmentCard,
  AssignmentTimeline,
  EditAssignmentModal,
  NewAssignmentModal,
  type Assignment,
} from '@/components/assignments'
import { assignCrew } from '@/app/planning/actions'

interface Project {
  id: string
  name: string
  color: string
  type?: string
  status?: string
}

interface CrewMember {
  id: string
  full_name: string
  role: string
  status: string
  email?: string | null
  phone?: string | null
}

interface CrewPlanningHubProps {
  crewMember: CrewMember
  assignments: Assignment[]
  projects: Project[]
}

type AssignmentCategory = 'active' | 'upcoming' | 'past'

function categorizeAssignments(assignments: Assignment[]): Record<AssignmentCategory, Assignment[]> {
  const today = startOfDay(new Date())

  const result: Record<AssignmentCategory, Assignment[]> = {
    active: [],
    upcoming: [],
    past: [],
  }

  assignments.forEach((assignment) => {
    const start = startOfDay(new Date(assignment.start_date))
    const end = startOfDay(new Date(assignment.end_date))

    if (isBefore(end, today)) {
      result.past.push(assignment)
    } else if (isAfter(start, today)) {
      result.upcoming.push(assignment)
    } else {
      result.active.push(assignment)
    }
  })

  // Sort each category
  result.active.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
  result.upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  result.past.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())

  return result
}

export default function CrewPlanningHub({
  crewMember,
  assignments,
  projects,
}: CrewPlanningHubProps) {
  const router = useRouter()
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [showPastAssignments, setShowPastAssignments] = useState(false)

  // Categorize assignments
  const categorized = useMemo(() => categorizeAssignments(assignments), [assignments])

  // Handle edit click
  const handleEditClick = useCallback((assignment: Assignment) => {
    setEditingAssignment(assignment)
    setIsEditModalOpen(true)
  }, [])

  // Handle edit success - refresh the page data
  const handleEditSuccess = useCallback(() => {
    router.refresh()
  }, [router])

  // Handle new assignment save
  const handleNewAssignmentSave = useCallback(
    async (data: {
      projectId: string
      startDate: string
      endDate: string
      roleOnProject: string
    }) => {
      const result = await assignCrew(
        data.projectId,
        crewMember.id,
        data.startDate,
        data.endDate,
        data.roleOnProject
      )

      if (result.error) {
        return { error: result.error }
      }

      router.refresh()
      return { success: true }
    },
    [crewMember.id, router]
  )

  // Handle delete callback (just refresh)
  const handleDelete = useCallback(() => {
    router.refresh()
  }, [router])

  // Handle timeline assignment click
  const handleTimelineClick = useCallback((assignment: Assignment) => {
    handleEditClick(assignment)
  }, [handleEditClick])

  const totalAssignments = assignments.length
  const activeCount = categorized.active.length
  const upcomingCount = categorized.upcoming.length
  const pastCount = categorized.past.length

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{activeCount}</p>
              <p className="text-sm text-green-700">Active Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{upcomingCount}</p>
              <p className="text-sm text-blue-700">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <History className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pastCount}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Assignment Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          New Assignment
        </button>
      </div>

      {/* Visual Timeline */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          Assignment Timeline
        </h2>
        <AssignmentTimeline
          assignments={assignments}
          onAssignmentClick={handleTimelineClick}
        />
      </section>

      {/* Active Assignments */}
      {categorized.active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Active Assignments ({activeCount})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categorized.active.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                displayMode="crew-view"
                onEdit={handleEditClick}
                onDelete={handleDelete}
                showLink={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Assignments */}
      {categorized.upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            Upcoming Assignments ({upcomingCount})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {categorized.upcoming.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                displayMode="crew-view"
                onEdit={handleEditClick}
                onDelete={handleDelete}
                showLink={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Assignments (collapsible) */}
      {categorized.past.length > 0 && (
        <section>
          <button
            onClick={() => setShowPastAssignments(!showPastAssignments)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              Past Assignments ({pastCount})
            </h2>
            {showPastAssignments ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showPastAssignments && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {categorized.past.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  displayMode="crew-view"
                  showLink={true}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {totalAssignments === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
          <p className="text-gray-500 mb-4">
            This crew member hasn&apos;t been assigned to any projects.
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create First Assignment
          </button>
        </div>
      )}

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        assignment={editingAssignment}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingAssignment(null)
        }}
        onSuccess={handleEditSuccess}
        otherAssignments={assignments}
      />

      {/* New Assignment Modal */}
      <NewAssignmentModal
        crewMemberId={crewMember.id}
        crewMemberName={crewMember.full_name}
        crewMemberRole={crewMember.role}
        projects={projects}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleNewAssignmentSave}
      />
    </div>
  )
}
