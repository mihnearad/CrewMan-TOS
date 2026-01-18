import { createClient } from '@/lib/supabase/server'
import { getClientById, deleteClient } from '@/app/clients/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, ArrowLeft, Mail, Phone, MapPin, Building2, Anchor } from 'lucide-react'
import DeleteClientButton from '@/components/clients/DeleteClientButton'

function getStatusDisplay(status: string) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bgClass: 'bg-green-100',
        textClass: 'text-green-800',
        dotClass: 'bg-green-500',
      }
    case 'inactive':
      return {
        label: 'Inactive',
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        dotClass: 'bg-gray-500',
      }
    default:
      return {
        label: status,
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        dotClass: 'bg-gray-500',
      }
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClientById(id)

  if (!client) {
    notFound()
  }

  // Fetch projects associated with this client
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, type, status, color, start_date, end_date')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  async function handleDelete() {
    'use server'
    await deleteClient(id)
  }

  const statusDisplay = getStatusDisplay(client.status)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </div>

      {/* Client Header Card */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Client info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                <Building2 className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.name}
                </h1>
                {client.contact_name && (
                  <p className="text-gray-600 mt-1">
                    Contact: {client.contact_name}
                  </p>
                )}

                {/* Status Badge */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${statusDisplay.bgClass} ${statusDisplay.textClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDisplay.dotClass}`} />
                    {statusDisplay.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/clients/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
              <DeleteClientButton clientId={id} onDelete={handleDelete} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap gap-6">
            {client.contact_email && (
              <a
                href={`mailto:${client.contact_email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {client.contact_email}
              </a>
            )}
            {client.contact_phone && (
              <a
                href={`tel:${client.contact_phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {client.contact_phone}
              </a>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {client.address}
              </div>
            )}
            {!client.contact_email && !client.contact_phone && !client.address && (
              <p className="text-sm text-gray-400">No contact information provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {client.notes && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      {/* Associated Projects */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <Link
            href={`/projects/new?client_id=${id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Project
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-8">
            <Anchor className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No projects associated with this client</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color || '#6B7280' }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.type}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
