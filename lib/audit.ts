import { createClient } from '@/lib/supabase/server'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type AuditLogEntry = {
  id: string
  table_name: string
  record_id: string
  action: AuditAction
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  changed_fields: string[] | null
  user_id: string | null
  user_email: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/**
 * Get the list of fields that changed between old and new values
 */
function getChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): string[] {
  const changed: string[] = []
  
  // Check all fields in new values
  for (const key in newValues) {
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
      changed.push(key)
    }
  }
  
  // Check for fields that were removed
  for (const key in oldValues) {
    if (!(key in newValues) && !changed.includes(key)) {
      changed.push(key)
    }
  }
  
  return changed
}

/**
 * Log a CREATE operation to the audit log
 */
export async function logCreate(
  tableName: string,
  recordId: string,
  newValues: Record<string, any>,
  userEmail: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action: 'CREATE',
      old_values: null,
      new_values: newValues,
      changed_fields: null,
      user_id: userId || null,
      user_email: userEmail,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })
    
    if (error) {
      console.error('Failed to log CREATE audit entry:', error)
    }
  } catch (err) {
    console.error('Exception in logCreate:', err)
  }
}

/**
 * Log an UPDATE operation to the audit log
 */
export async function logUpdate(
  tableName: string,
  recordId: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  userEmail: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    const changedFields = getChangedFields(oldValues, newValues)
    
    // Only log if there are actual changes
    if (changedFields.length === 0) {
      return
    }
    
    const { error } = await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action: 'UPDATE',
      old_values: oldValues,
      new_values: newValues,
      changed_fields: changedFields,
      user_id: userId || null,
      user_email: userEmail,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })
    
    if (error) {
      console.error('Failed to log UPDATE audit entry:', error)
    }
  } catch (err) {
    console.error('Exception in logUpdate:', err)
  }
}

/**
 * Log a DELETE operation to the audit log
 */
export async function logDelete(
  tableName: string,
  recordId: string,
  oldValues: Record<string, any>,
  userEmail: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action: 'DELETE',
      old_values: oldValues,
      new_values: null,
      changed_fields: null,
      user_id: userId || null,
      user_email: userEmail,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })
    
    if (error) {
      console.error('Failed to log DELETE audit entry:', error)
    }
  } catch (err) {
    console.error('Exception in logDelete:', err)
  }
}

/**
 * Get audit logs for a specific record
 */
export async function getAuditLogsForRecord(
  tableName: string,
  recordId: string
): Promise<AuditLogEntry[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('Exception in getAuditLogsForRecord:', err)
    return []
  }
}

/**
 * Get all audit logs with pagination and filters
 */
export async function getAuditLogs(options?: {
  tableName?: string
  action?: AuditAction
  userId?: string
  limit?: number
  offset?: number
}): Promise<{ data: AuditLogEntry[]; count: number }> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (options?.tableName) {
      query = query.eq('table_name', options.tableName)
    }
    
    if (options?.action) {
      query = query.eq('action', options.action)
    }
    
    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return { data: [], count: 0 }
    }
    
    return { data: data || [], count: count || 0 }
  } catch (err) {
    console.error('Exception in getAuditLogs:', err)
    return { data: [], count: 0 }
  }
}
