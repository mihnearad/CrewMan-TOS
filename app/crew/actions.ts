'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCrewMember(formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const nationality = formData.get('nationality') as string
  const flag_state = formData.get('flag_state') as string
  const home_airport = formData.get('home_airport') as string
  const company = formData.get('company') as string

  const { error } = await supabase.from('crew_members').insert({
    full_name,
    role,
    email: email || null,
    phone: phone || null,
    nationality: nationality || null,
    flag_state: flag_state?.toUpperCase() || null,
    home_airport: home_airport || null,
    company: company || null,
    status: 'available',
  })

  if (error) {
    console.error('Error creating crew member:', error)
    redirect('/crew/new?error=Failed to create crew member')
  }

  revalidatePath('/crew')
  redirect('/crew')
}

export async function updateCrewMember(id: string, formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const status = formData.get('status') as string
  const nationality = formData.get('nationality') as string
  const flag_state = formData.get('flag_state') as string
  const home_airport = formData.get('home_airport') as string
  const company = formData.get('company') as string

  const { error } = await supabase
    .from('crew_members')
    .update({
      full_name,
      role,
      email: email || null,
      phone: phone || null,
      nationality: nationality || null,
      flag_state: flag_state?.toUpperCase() || null,
      home_airport: home_airport || null,
      company: company || null,
      status,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating crew member:', error)
    redirect(`/crew/${id}/edit?error=Failed to update crew member`)
  }

  revalidatePath('/crew')
  revalidatePath(`/crew/${id}`)
  redirect(`/crew/${id}`)
}

export async function deleteCrewMember(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crew_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting crew member:', error)
    return { error: 'Failed to delete crew member' }
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

  const { error } = await supabase
    .from('crew_members')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating crew status:', error)
    return { error: 'Failed to update crew status' }
  }

  revalidatePath('/crew')
  revalidatePath(`/crew/${id}`)
  return { success: true }
}
