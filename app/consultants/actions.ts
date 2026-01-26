'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

export async function createConsultant(formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const notes = formData.get('notes') as string

  const newConsultant = {
    full_name,
    email: email || null,
    phone: phone || null,
    role: role || null,
    notes: notes || null,
  }

  const { data: created, error } = await supabase
    .from('consultants')
    .insert(newConsultant)
    .select()
    .single()

  if (error) {
    console.error('Error creating consultant:', error)
    redirect('/consultants/new?error=Failed to create consultant')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('consultants', created.id, created, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/consultants')
  redirect('/consultants')
}

export async function updateConsultant(id: string, formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', id)
    .single()

  const updatedValues = {
    full_name,
    email: email || null,
    phone: phone || null,
    role: role || null,
    notes: notes || null,
    status,
  }

  const { error } = await supabase
    .from('consultants')
    .update(updatedValues)
    .eq('id', id)

  if (error) {
    console.error('Error updating consultant:', error)
    redirect(`/consultants/${id}/edit?error=Failed to update consultant`)
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('consultants', id, oldValues, { ...oldValues, ...updatedValues }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/consultants')
  revalidatePath(`/consultants/${id}`)
  redirect(`/consultants/${id}`)
}

export async function deleteConsultant(id: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('consultants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting consultant:', error)
    return { error: 'Failed to delete consultant' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logDelete('consultants', id, oldValues, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/consultants')
  redirect('/consultants')
}

export async function getConsultantById(id: string) {
  const supabase = await createClient()

  const { data: consultant, error } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching consultant:', error)
    return null
  }

  return consultant
}

export async function getAllConsultants() {
  const supabase = await createClient()

  const { data: consultants, error } = await supabase
    .from('consultants')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching consultants:', error)
    return []
  }

  return consultants
}
