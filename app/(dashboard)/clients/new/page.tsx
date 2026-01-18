import { createClientAction } from '@/app/clients/actions'
import Link from 'next/link'

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Client
          </h2>
        </div>
      </div>

      <form action={createClientAction} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Client Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., Acme Corporation"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="contact_name"
              id="contact_name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., John Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="contact_email"
                id="contact_email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., john@acme.com"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="contact_phone"
                id="contact_phone"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., +1 555 123 4567"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="mt-1">
            <textarea
              name="address"
              id="address"
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Full address..."
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
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Additional notes about the client..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/clients"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Client
          </button>
        </div>
      </form>
    </div>
  )
}
