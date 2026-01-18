'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createConsultant(formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('consultants').insert({
    full_name,
    email: email || null,
    phone: phone || null,
    role: role || null,
    notes: notes || null,
  })

  if (error) {
    console.error('Error creating consultant:', error)
    redirect('/consultants/new?error=Failed to create consultant')
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

  const { error } = await supabase
    .from('consultants')
    .update({
      full_name,
      email: email || null,
      phone: phone || null,
      role: role || null,
      notes: notes || null,
      status,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating consultant:', error)
    redirect(`/consultants/${id}/edit?error=Failed to update consultant`)
  }

  revalidatePath('/consultants')
  revalidatePath(`/consultants/${id}`)
  redirect(`/consultants/${id}`)
}

export async function deleteConsultant(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('consultants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting consultant:', error)
    return { error: 'Failed to delete consultant' }
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
