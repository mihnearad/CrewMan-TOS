import { createClient } from '@/lib/supabase/server'

export type UserContext = {
  userId: string
  userEmail: string
} | null

/**
 * Get the current authenticated user's context for audit logging
 */
export async function getCurrentUserContext(): Promise<UserContext> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.error('Failed to get current user:', error)
      return null
    }
    
    return {
      userId: user.id,
      userEmail: user.email || 'unknown@example.com',
    }
  } catch (err) {
    console.error('Exception in getCurrentUserContext:', err)
    return null
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return false
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return false
    }
    
    return profile.role === 'admin'
  } catch (err) {
    console.error('Exception in isAdmin:', err)
    return false
  }
}

/**
 * Get user's role
 */
export async function getUserRole(): Promise<'admin' | 'planner' | 'viewer' | null> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return null
    }
    
    return profile.role as 'admin' | 'planner' | 'viewer'
  } catch (err) {
    console.error('Exception in getUserRole:', err)
    return null
  }
}
