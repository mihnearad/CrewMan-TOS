import { createProject } from '@/app/projects/actions'
import { getAllClients } from '@/app/clients/actions'
import { getAllConsultants } from '@/app/consultants/actions'
import Link from 'next/link'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; consultant_id?: string }>
}) {
  const params = await searchParams
  const [clients, consultants] = await Promise.all([
    getAllClients(),
    getAllConsultants(),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Vessel
          </h2>
        </div>
      </div>

      <form action={createProject} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Vessel Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., Atlantic Explorer"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="vessel">Vessel</option>
              <option value="windfarm">Wind Farm</option>
              <option value="other">Other</option>
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
                defaultValue={params.client_id || ''}
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
                defaultValue={params.consultant_id || ''}
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
              defaultValue="#3b82f6"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Additional notes or details about the vessel..."
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
            Create Vessel
          </button>
        </div>
      </form>
    </div>
  )
}
