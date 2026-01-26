'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  const newClient = {
    name,
    contact_name: contact_name || null,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    address: address || null,
    notes: notes || null,
  }

  const { data: created, error } = await supabase
    .from('clients')
    .insert(newClient)
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    redirect('/clients/new?error=Failed to create client')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('clients', created.id, created, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  const updatedValues = {
    name,
    contact_name: contact_name || null,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    address: address || null,
    notes: notes || null,
    status,
  }

  const { error } = await supabase
    .from('clients')
    .update(updatedValues)
    .eq('id', id)

  if (error) {
    console.error('Error updating client:', error)
    redirect(`/clients/${id}/edit?error=Failed to update client`)
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('clients', id, oldValues, { ...oldValues, ...updatedValues }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  redirect(`/clients/${id}`)
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: 'Failed to delete client' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logDelete('clients', id, oldValues, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function getClientById(id: string) {
  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return client
}

export async function getAllClients() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return clients
}
