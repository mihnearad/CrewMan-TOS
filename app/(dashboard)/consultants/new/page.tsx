import { createConsultant } from '@/app/consultants/actions'
import Link from 'next/link'

export default function NewConsultantPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Consultant
          </h2>
        </div>
      </div>

      <form action={createConsultant} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., Jane Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role / Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="role"
              id="role"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="e.g., Senior Project Manager"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., jane@tos.com"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., +1 555 123 4567"
              />
            </div>
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
              placeholder="Additional notes about the consultant..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/consultants"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Consultant
          </button>
        </div>
      </form>
    </div>
  )
}
