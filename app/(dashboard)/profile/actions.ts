'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateEmail(formData: FormData) {
  const supabase = await createClient()
  const newEmail = formData.get('email') as string

  if (!newEmail) {
    redirect('/profile?error=Email is required')
  }

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) {
    console.error('Error updating email:', error)
    redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/profile?success=Email update initiated. Please check your new email for confirmation.')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect('/profile?error=All password fields are required')
  }

  if (newPassword !== confirmPassword) {
    redirect('/profile?error=New passwords do not match')
  }

  if (newPassword.length < 6) {
    redirect('/profile?error=Password must be at least 6 characters')
  }

  // First verify the current password by attempting to sign in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/profile?error=Could not verify current user')
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    redirect('/profile?error=Current password is incorrect')
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Error updating password:', error)
    redirect(`/profile?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/profile?success=Password updated successfully')
}
