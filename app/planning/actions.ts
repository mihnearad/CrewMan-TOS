'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateAssignmentDatesSchema } from '@/lib/validations'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

// Quick conflict check for drag operations (returns minimal data)
export async function quickConflictCheck(
  crewId: string,
  startDate: string,
  endDate: string,
  excludeAssignmentId?: string
): Promise<{ hasConflict: boolean; message?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('assignments')
    .select('id, start_date, end_date, project:projects(name)')
    .eq('crew_member_id', crewId)

  if (excludeAssignmentId) {
    query = query.neq('id', excludeAssignmentId)
  }

  const { data: assignments } = await query

  if (!assignments || assignments.length === 0) {
    return { hasConflict: false }
  }

  const newStart = new Date(startDate)
  const newEnd = new Date(endDate)

  const conflicts = assignments.filter(assignment => {
    const assignStart = new Date(assignment.start_date)
    const assignEnd = new Date(assignment.end_date)
    return newStart <= assignEnd && newEnd >= assignStart
  })

  if (conflicts.length > 0) {
    const projectNames = conflicts
      .map(c => (c.project as unknown as { name: string })?.name)
      .filter(Boolean)
      .join(', ')
    return {
      hasConflict: true,
      message: `Conflicts with assignment${conflicts.length > 1 ? 's' : ''} to ${projectNames}`
    }
  }

  return { hasConflict: false }
}

// Check for assignment conflicts
export async function checkConflict(
  crewId: string,
  startDate: string,
  endDate: string,
  excludeAssignmentId?: string
): Promise<{ hasConflict: boolean; conflictingAssignments?: any[] }> {
  const supabase = await createClient()

  let query = supabase
    .from('assignments')
    .select('*, project:projects(*)')
    .eq('crew_member_id', crewId)

  // Exclude current assignment when updating
  if (excludeAssignmentId) {
    query = query.neq('id', excludeAssignmentId)
  }

  const { data: assignments } = await query

  if (!assignments || assignments.length === 0) {
    return { hasConflict: false }
  }

  // Check for date overlaps
  const conflicts = assignments.filter(assignment => {
    const assignStart = new Date(assignment.start_date)
    const assignEnd = new Date(assignment.end_date)
    const newStart = new Date(startDate)
    const newEnd = new Date(endDate)

    // Check if dates overlap: (StartA <= EndB) and (EndA >= StartB)
    return newStart <= assignEnd && newEnd >= assignStart
  })

  if (conflicts.length > 0) {
    return { hasConflict: true, conflictingAssignments: conflicts }
  }

  return { hasConflict: false }
}

// Assign crew to project or training with conflict detection
export async function assignCrew(
  projectId: string | null,
  crewId: string,
  startDate: string,
  endDate: string,
  roleOnProject?: string,
  assignmentType?: 'vessel' | 'training',
  trainingDescription?: string
) {
  const supabase = await createClient()

  // Check for conflicts
  const conflictCheck = await checkConflict(crewId, startDate, endDate)

  if (conflictCheck.hasConflict) {
    const conflictNames = conflictCheck.conflictingAssignments
      ?.map(a => a.project?.name || a.training_description || 'Unknown')
      .join(', ')
    return {
      error: `Crew member already assigned to ${conflictNames} during this period`
    }
  }

  // Create assignment
  const insertData: any = {
    crew_member_id: crewId,
    start_date: startDate,
    end_date: endDate,
    assignment_type: assignmentType || 'vessel',
  }

  if (assignmentType === 'training') {
    insertData.project_id = null
    insertData.training_description = trainingDescription || null
    insertData.role_on_project = null
  } else {
    insertData.project_id = projectId
    insertData.role_on_project = roleOnProject || null
    insertData.training_description = null
  }

  const { data: created, error } = await supabase
    .from('assignments')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error assigning crew:', error)
    return { error: 'Failed to assign crew' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('assignments', created.id, created, userContext.userEmail, userContext.userId)
  }

  // Only update crew status to 'on_project' if assignment starts today or earlier
  const today = new Date().toISOString().split('T')[0]
  if (startDate <= today) {
    await supabase.from('crew_members').update({ status: 'on_project' }).eq('id', crewId)
  }

  revalidatePath('/planning')
  revalidatePath('/projects')
  if (projectId) {
    revalidatePath(`/projects/${projectId}`)
  }
  return { success: true }
}

// Update an existing assignment
export async function updateAssignment(
  assignmentId: string,
  data: {
    startDate?: string
    endDate?: string
    roleOnProject?: string
    trainingDescription?: string
  }
) {
  const supabase = await createClient()

  // Validate dates if both are provided
  if (data.startDate && data.endDate) {
    const validation = updateAssignmentDatesSchema.safeParse(data)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return { error: firstError.message }
    }
  }

  // Get current assignment to check crew member and project (fetch full record for audit)
  const { data: currentAssignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  if (!currentAssignment) {
    return { error: 'Assignment not found' }
  }

  const newStartDate = data.startDate || currentAssignment.start_date
  const newEndDate = data.endDate || currentAssignment.end_date

  // Check for conflicts (excluding this assignment)
  const conflictCheck = await checkConflict(
    currentAssignment.crew_member_id,
    newStartDate,
    newEndDate,
    assignmentId
  )

  if (conflictCheck.hasConflict) {
    const projectNames = conflictCheck.conflictingAssignments
      ?.map(a => a.project.name)
      .join(', ')
    return {
      error: `Conflicts with existing assignment to ${projectNames}`
    }
  }

  // Update assignment
  const updateData: any = {}
  if (data.startDate) updateData.start_date = data.startDate
  if (data.endDate) updateData.end_date = data.endDate
  if (data.roleOnProject !== undefined) updateData.role_on_project = data.roleOnProject || null
  if (data.trainingDescription !== undefined) updateData.training_description = data.trainingDescription || null

  const { error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', assignmentId)

  if (error) {
    console.error('Error updating assignment:', error)
    return { error: 'Failed to update assignment' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext) {
    await logUpdate('assignments', assignmentId, currentAssignment, { ...currentAssignment, ...updateData }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/planning')
  revalidatePath('/projects')
  if (currentAssignment.project_id) {
    revalidatePath(`/projects/${currentAssignment.project_id}`)
  }
  return { success: true }
}

// Remove assignment
export async function removeAssignment(assignmentId: string) {
  const supabase = await createClient()

  // Get full assignment data before deleting
  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  if (!assignment) {
    return { error: 'Assignment not found' }
  }

  // Delete assignment
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) {
    console.error('Error removing assignment:', error)
    return { error: 'Failed to remove assignment' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext) {
    await logDelete('assignments', assignmentId, assignment, userContext.userEmail, userContext.userId)
  }

  // Check if crew has other currently active assignments (started and not ended)
  const today = new Date().toISOString().split('T')[0]
  const { data: activeAssignments } = await supabase
    .from('assignments')
    .select('id')
    .eq('crew_member_id', assignment.crew_member_id)
    .lte('start_date', today)
    .gte('end_date', today)

  // If no currently active assignments, set status to available
  if (!activeAssignments || activeAssignments.length === 0) {
    await supabase
      .from('crew_members')
      .update({ status: 'available' })
      .eq('id', assignment.crew_member_id)
  }

  revalidatePath('/planning')
  revalidatePath('/projects')
  if (assignment.project_id) {
    revalidatePath(`/projects/${assignment.project_id}`)
  }
  return { success: true }
}
