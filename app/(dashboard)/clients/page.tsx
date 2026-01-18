import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import ClientsTable from '@/components/clients/ClientsTable'

interface ClientWithCount {
  id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  status: string
  created_at: string
  projects: { count: number }[]
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      projects:projects(count)
    `)
    .order('name', { ascending: true })

  const clientsWithCount = (clients as ClientWithCount[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          href="/clients/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Link>
      </div>

      {clientsWithCount.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No clients</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
          <div className="mt-6">
            <Link
              href="/clients/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Link>
          </div>
        </div>
      ) : (
        <ClientsTable clients={clientsWithCount} />
      )}
    </div>
  )
}
