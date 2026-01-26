'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

/**
 * Get all crew roles ordered by display_order
 */
export async function getCrewRoles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crew_roles')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching crew roles:', error)
    return []
  }
  
  return data || []
}

/**
 * Create a new crew role
 */
export async function createCrewRole(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  
  if (!name || name.trim().length === 0) {
    redirect('/settings?error=Role name is required')
  }
  
  // Get the highest display_order and add 1
  const { data: roles } = await supabase
    .from('crew_roles')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
  
  const nextOrder = roles && roles.length > 0 ? roles[0].display_order + 1 : 0
  
  const newRole = {
    name: name.trim(),
    display_order: nextOrder
  }

  const { data: created, error } = await supabase
    .from('crew_roles')
    .insert(newRole)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating crew role:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect('/settings?error=A role with this name already exists')
    }
    redirect('/settings?error=Failed to create role')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('crew_roles', created.id, created, userContext.userEmail, userContext.userId)
  }
  
  revalidatePath('/settings')
  revalidatePath('/crew')
  redirect('/settings?success=Role created successfully')
}

/**
 * Update a crew role
 */
export async function updateCrewRole(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  
  if (!name || name.trim().length === 0) {
    redirect('/settings?error=Role name is required')
  }

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('crew_roles')
    .select('*')
    .eq('id', id)
    .single()
  
  const { error } = await supabase
    .from('crew_roles')
    .update({ name: name.trim() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating crew role:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect('/settings?error=A role with this name already exists')
    }
    redirect('/settings?error=Failed to update role')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('crew_roles', id, oldValues, { ...oldValues, name: name.trim() }, userContext.userEmail, userContext.userId)
  }
  
  revalidatePath('/settings')
  revalidatePath('/crew')
  redirect('/settings?success=Role updated successfully')
}

/**
 * Delete a crew role
 */
export async function deleteCrewRole(id: string) {
  const supabase = await createClient()
  
  // Check if any crew members are using this role
  const { data: crewMembers } = await supabase
    .from('crew_members')
    .select('id')
    .eq('role', id)
    .limit(1)
  
  if (crewMembers && crewMembers.length > 0) {
    return { error: 'Cannot delete role that is assigned to crew members' }
  }

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('crew_roles')
    .select('*')
    .eq('id', id)
    .single()
  
  const { error } = await supabase
    .from('crew_roles')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting crew role:', error)
    return { error: 'Failed to delete role' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logDelete('crew_roles', id, oldValues, userContext.userEmail, userContext.userId)
  }
  
  revalidatePath('/settings')
  revalidatePath('/crew')
  return { success: true }
}

/**
 * Reorder crew roles
 */
export async function reorderCrewRoles(roleIds: string[]) {
  const supabase = await createClient()
  
  // Update display_order for each role based on its position in the array
  const updates = roleIds.map((id, index) => 
    supabase
      .from('crew_roles')
      .update({ display_order: index })
      .eq('id', id)
  )
  
  try {
    await Promise.all(updates)
    revalidatePath('/settings')
    revalidatePath('/crew')
    return { success: true }
  } catch (error) {
    console.error('Error reordering crew roles:', error)
    return { error: 'Failed to reorder roles' }
  }
}
