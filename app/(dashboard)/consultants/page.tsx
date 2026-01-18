import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, UserCog } from 'lucide-react'
import ConsultantsTable from '@/components/consultants/ConsultantsTable'

interface ConsultantWithCount {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: string | null
  status: string
  created_at: string
  projects: { count: number }[]
}

export default async function ConsultantsPage() {
  const supabase = await createClient()
  const { data: consultants } = await supabase
    .from('consultants')
    .select(`
      *,
      projects:projects(count)
    `)
    .order('full_name', { ascending: true })

  const consultantsWithCount = (consultants as ConsultantWithCount[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
        <Link
          href="/consultants/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Consultant
        </Link>
      </div>

      {consultantsWithCount.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <UserCog className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No consultants</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new consultant.</p>
          <div className="mt-6">
            <Link
              href="/consultants/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Consultant
            </Link>
          </div>
        </div>
      ) : (
        <ConsultantsTable consultants={consultantsWithCount} />
      )}
    </div>
  )
}
