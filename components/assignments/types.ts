/**
 * Types for assignment management components
 */

export interface Project {
  id: string
  name: string
  color: string
}

export interface CrewMember {
  id: string
  full_name: string
  role: string
}

export interface Assignment {
  id: string
  project_id: string
  crew_member_id: string
  start_date: string
  end_date: string
  role_on_project: string | null
  project: Project
  crew_member?: CrewMember
}

export type AssignmentStatus = 'active' | 'upcoming' | 'past'

export interface ConflictingAssignment {
  id: string
  start_date: string
  end_date: string
  project: {
    id: string
    name: string
  }
}

export interface AssignmentCardProps {
  assignment: Assignment
  /** Display mode - determines what info is shown prominently */
  displayMode: 'crew-view' | 'project-view'
  /** Callback when edit is clicked */
  onEdit?: (assignment: Assignment) => void
  /** Callback when delete is clicked */
  onDelete?: (assignmentId: string) => void
  /** Additional CSS classes */
  className?: string
}

export interface EditAssignmentModalProps {
  assignment: Assignment
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  /** Other assignments for this crew member (for conflict detection) */
  otherAssignments?: Assignment[]
}

export interface AssignmentTimelineProps {
  assignments: Assignment[]
  /** Callback when an assignment is clicked */
  onAssignmentClick?: (assignment: Assignment) => void
  /** Additional CSS classes */
  className?: string
}
