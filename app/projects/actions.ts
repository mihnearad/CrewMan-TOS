'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logCreate, logUpdate, logDelete } from '@/lib/audit'
import { getCurrentUserContext } from '@/lib/auth-helpers'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const color = formData.get('color') as string
  const notes = formData.get('notes') as string
  const client_id = formData.get('client_id') as string
  const consultant_id = formData.get('consultant_id') as string

  const newProject = {
    name,
    type,
    start_date: start_date || null,
    end_date: end_date || null,
    color,
    notes: notes || null,
    client_id: client_id || null,
    consultant_id: consultant_id || null,
  }

  const { data: created, error } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    redirect('/projects/new?error=Failed to create project')
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && created) {
    await logCreate('projects', created.id, created, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/projects')
  redirect('/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const status = formData.get('status') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const color = formData.get('color') as string
  const notes = formData.get('notes') as string
  const client_id = formData.get('client_id') as string
  const consultant_id = formData.get('consultant_id') as string

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  const updatedValues = {
    name,
    type,
    status,
    start_date: start_date || null,
    end_date: end_date || null,
    color,
    notes: notes || null,
    client_id: client_id || null,
    consultant_id: consultant_id || null,
  }

  const { error } = await supabase
    .from('projects')
    .update(updatedValues)
    .eq('id', id)

  if (error) {
    console.error('Error updating project:', error)
    redirect(`/projects/${id}/edit?error=Failed to update project`)
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('projects', id, oldValues, { ...oldValues, ...updatedValues }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  redirect(`/projects/${id}`)
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: 'Failed to delete project' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logDelete('projects', id, oldValues, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/projects')
  redirect('/projects')
}

export async function getProjectById(id: string) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return project
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = await createClient()

  // Fetch old values for audit log
  const { data: oldValues } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating project status:', error)
    return { error: 'Failed to update project status' }
  }

  // Log audit trail
  const userContext = await getCurrentUserContext()
  if (userContext && oldValues) {
    await logUpdate('projects', id, oldValues, { ...oldValues, status }, userContext.userEmail, userContext.userId)
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { success: true }
}
