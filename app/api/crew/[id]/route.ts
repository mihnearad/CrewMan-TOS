import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch crew member
  const { data: crewMember, error: crewError } = await supabase
    .from('crew_members')
    .select('*')
    .eq('id', id)
    .single()

  if (crewError || !crewMember) {
    return NextResponse.json(
      { error: 'Crew member not found' },
      { status: 404 }
    )
  }

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      id,
      start_date,
      end_date,
      role_on_project,
      project:projects(id, name, color)
    `)
    .eq('crew_member_id', id)
    .order('start_date', { ascending: false })

  return NextResponse.json({
    crewMember,
    assignments: assignments || [],
  })
}
