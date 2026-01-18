'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('clients').insert({
    name,
    contact_name: contact_name || null,
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    address: address || null,
    notes: notes || null,
  })

  if (error) {
    console.error('Error creating client:', error)
    redirect('/clients/new?error=Failed to create client')
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

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      contact_name: contact_name || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      address: address || null,
      notes: notes || null,
      status,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating client:', error)
    redirect(`/clients/${id}/edit?error=Failed to update client`)
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  redirect(`/clients/${id}`)
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: 'Failed to delete client' }
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
