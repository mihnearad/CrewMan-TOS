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
  const home_airport = formData.get('home_airport') as string

  // Check for duplicate name (case-insensitive)
  const { data: existing } = await supabase
    .from('crew_members')
    .select('id')
    .ilike('full_name', full_name.trim())
    .maybeSingle()

  if (existing) {
    redirect('/crew/new?error=A crew member with this name already exists')
  }

  const { error } = await supabase.from('crew_members').insert({
    full_name: full_name.trim(),
    role,
    email: email || null,
    phone: phone || null,
    nationality: nationality || null,
    home_airport: home_airport || null,
    status: 'available',
  })

  if (error) {
    console.error('Error creating crew member:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect('/crew/new?error=A crew member with this name already exists')
    }
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
  const home_airport = formData.get('home_airport') as string

  const { error } = await supabase
    .from('crew_members')
    .update({
      full_name: full_name.trim(),
      role,
      email: email || null,
      phone: phone || null,
      nationality: nationality || null,
      home_airport: home_airport || null,
      status,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating crew member:', error)
    if (error.code === '23505') { // Unique constraint violation
      redirect(`/crew/${id}/edit?error=A crew member with this name already exists`)
    }
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
