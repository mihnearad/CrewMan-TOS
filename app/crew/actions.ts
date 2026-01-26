'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crewMemberSchema, updateCrewMemberSchema, validateFormData } from '@/lib/validations'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

export async function createCrewMember(formData: FormData) {
  const supabase = await createClient()

  // Validate input
  const validation = validateFormData(crewMemberSchema, formData)
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]
    redirect(`/crew/new?error=${encodeURIComponent(firstError)}`)
  }

  const { full_name, role, email, phone, nationality, home_airport } = validation.data

  // Check for duplicate name (case-insensitive)
  const { data: existing } = await supabase
    .from('crew_members')
    .select('id')
    .ilike('full_name', full_name)
    .maybeSingle()

  if (existing) {
    redirect('/crew/new?error=A crew member with this name already exists')
  }

  const newCrewMember = {
    full_name,
    role,
    email: email || null,
    phone: phone || null,
    nationality: nationality || null,
    home_airport: home_airport || null,
    status: 'available',
  }

  const { data: created, error } = await supabase
    .from('crew_members')
    .insert(newCrewMember)
    .select()
    .single()

  if (error) {
    console.error('Error creating crew member:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect('/crew/new?error=A crew member with this name already exists')
    }
    redirect('/crew/new?error=Failed to create crew member')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('crew_members', created.id, created, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/crew')
  redirect('/crew')
}

export async function updateCrewMember(id: string, formData: FormData) {
  const supabase = await createClient()

  // Validate input
  const validation = validateFormData(updateCrewMemberSchema, formData)
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]
    redirect(`/crew/${id}/edit?error=${encodeURIComponent(firstError)}`)
  }

  const { full_name, role, email, phone, status, nationality, home_airport } = validation.data

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', id)
    .single()

  const updatedValues = {
    full_name,
    role,
    email: email || null,
    phone: phone || null,
    nationality: nationality || null,
    home_airport: home_airport || null,
    status,
  }

  const { error } = await supabase
    .from('crew_members')
    .update(updatedValues)
    .eq('id', id)

  if (error) {
    console.error('Error updating crew member:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect(`/crew/${id}/edit?error=A crew member with this name already exists`)
    }
    redirect(`/crew/${id}/edit?error=Failed to update crew member`)
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('crew_members', id, oldValues, { ...oldValues, ...updatedValues }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/crew')
  revalidatePath(`/crew/${id}`)
  redirect(`/crew/${id}`)
}

export async function deleteCrewMember(id: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('crew_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting crew member:', error)
    return { error: 'Failed to delete crew member' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logDelete('crew_members', id, oldValues, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/crew')
  redirect('/crew')
}

export async function getCrewMemberById(id: string) {
  const supabase = await createClient()

  const { data: crewMember, error } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching crew member:', error)
    return null
  }

  return crewMember
}

export async function updateCrewStatus(id: string, status: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('crew_members')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating crew status:', error)
    return { error: 'Failed to update crew status' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('crew_members', id, oldValues, { ...oldValues, status }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/crew')
  revalidatePath(`/crew/${id}`)
  return { success: true }
}
