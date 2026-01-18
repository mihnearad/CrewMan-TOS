/**
 * Global Search Server Actions
 * 
 * Server-side search functionality for the global Command+K search.
 * Searches across projects, crew, clients, and consultants in parallel.
 * 
 * Uses Supabase ilike for case-insensitive text matching.
 * Results are limited to 5 per category for performance.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { SearchResult, SearchResults, SearchResponse } from '@/lib/search/types'

/** Maximum results per category */
const MAX_RESULTS_PER_CATEGORY = 5

/** Minimum query length to perform search */
const MIN_QUERY_LENGTH = 2

/**
 * Global search across all entities
 * 
 * @param query - Search query string
 * @returns Search results grouped by category
 * 
 * @example
 * ```ts
 * const { results, totalCount } = await globalSearch('john')
 * // results.crew contains matching crew members
 * // results.projects contains matching projects
 * ```
 */
export async function globalSearch(query: string): Promise<SearchResponse> {
  // Validate query
  const trimmedQuery = query.trim()
  
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return {
      results: { projects: [], crew: [], clients: [], consultants: [] },
      query: trimmedQuery,
      totalCount: 0,
    }
  }
  
  const supabase = await createClient()
  const searchPattern = `%${trimmedQuery}%`
  
  // Execute all searches in parallel for performance
  const [
    projectsResult,
    crewResult,
    clientsResult,
    consultantsResult,
  ] = await Promise.all([
    // Search projects by name
    supabase
      .from('projects')
      .select('id, name, type, status, color')
      .ilike('name', searchPattern)
      .limit(MAX_RESULTS_PER_CATEGORY),
    
    // Search crew by name, role, or email
    supabase
      .from('crew_members')
      .select('id, full_name, role, status, email')
      .or(`full_name.ilike.${searchPattern},role.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(MAX_RESULTS_PER_CATEGORY),
    
    // Search clients by name or contact name
    supabase
      .from('clients')
      .select('id, name, contact_name, status')
      .or(`name.ilike.${searchPattern},contact_name.ilike.${searchPattern}`)
      .limit(MAX_RESULTS_PER_CATEGORY),
    
    // Search consultants by name, role, or email
    supabase
      .from('consultants')
      .select('id, full_name, role, status, email')
      .or(`full_name.ilike.${searchPattern},role.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(MAX_RESULTS_PER_CATEGORY),
  ])
  
  // Transform results to SearchResult format
  const projects: SearchResult[] = (projectsResult.data || []).map(project => ({
    id: project.id,
    title: project.name,
    subtitle: formatProjectType(project.type),
    category: 'projects',
    href: `/projects/${project.id}`,
    color: project.color,
    status: project.status,
  }))
  
  const crew: SearchResult[] = (crewResult.data || []).map(member => ({
    id: member.id,
    title: member.full_name,
    subtitle: member.role,
    category: 'crew',
    href: `/crew/${member.id}`,
    status: member.status,
  }))
  
  const clients: SearchResult[] = (clientsResult.data || []).map(client => ({
    id: client.id,
    title: client.name,
    subtitle: client.contact_name || undefined,
    category: 'clients',
    href: `/clients/${client.id}`,
    status: client.status,
  }))
  
  const consultants: SearchResult[] = (consultantsResult.data || []).map(consultant => ({
    id: consultant.id,
    title: consultant.full_name,
    subtitle: consultant.role || undefined,
    category: 'consultants',
    href: `/consultants/${consultant.id}`,
    status: consultant.status,
  }))
  
  const results: SearchResults = { projects, crew, clients, consultants }
  const totalCount = projects.length + crew.length + clients.length + consultants.length
  
  return {
    results,
    query: trimmedQuery,
    totalCount,
  }
}

/**
 * Format project type for display
 */
function formatProjectType(type: string): string {
  switch (type) {
    case 'vessel': return 'Vessel'
    case 'windfarm': return 'Wind Farm'
    case 'other': return 'Other'
    default: return type
  }
}

/**
 * Get recent searches from the server (placeholder for future enhancement)
 * Currently, recent searches are stored client-side in localStorage
 */
export async function getRecentSearches(): Promise<string[]> {
  // This could be enhanced to store recent searches per user in the database
  return []
}
