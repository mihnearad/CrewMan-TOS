import { getProjectById, updateProject } from '@/app/projects/actions'
import { getAllClients } from '@/app/clients/actions'
import { getAllConsultants } from '@/app/consultants/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [project, clients, consultants] = await Promise.all([
    getProjectById(id),
    getAllClients(),
    getAllConsultants(),
  ])

  if (!project) {
    notFound()
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateProject(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Project
          </h2>
        </div>
      </div>

      <form action={handleUpdate} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={project.name}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., North Sea Wind Farm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              defaultValue={project.type}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="vessel">Vessel</option>
              <option value="windfarm">Wind Farm</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              defaultValue={project.status}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <div className="mt-1">
              <select
                id="client_id"
                name="client_id"
                defaultValue={project.client_id || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="">No client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="consultant_id" className="block text-sm font-medium text-gray-700">
              Consultant
            </label>
            <div className="mt-1">
              <select
                id="consultant_id"
                name="consultant_id"
                defaultValue={project.consultant_id || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="">No consultant</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="start_date"
                id="start_date"
                defaultValue={project.start_date || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="end_date"
                id="end_date"
                defaultValue={project.end_date || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color (for Planning)
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              name="color"
              id="color"
              defaultValue={project.color}
              className="h-10 w-20 p-1 rounded border border-gray-300"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1">
            <textarea
              name="notes"
              id="notes"
              rows={4}
              defaultValue={project.notes || ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Additional notes or details about the project..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href=".."
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
