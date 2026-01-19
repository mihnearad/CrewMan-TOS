import { createCrewMember } from '@/app/crew/actions'
import Link from 'next/link'

export default function NewCrewPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add Crew Member
          </h2>
        </div>
      </div>

      <form action={createCrewMember} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
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
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="role"
              id="role"
              required
              placeholder="e.g. Captain, Engineer"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="phone"
              id="phone"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Details</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                Nationality
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nationality"
                  id="nationality"
                  placeholder="e.g., Lithuanian, Latvian"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="flag_state" className="block text-sm font-medium text-gray-700">
                Flag State
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="flag_state"
                  id="flag_state"
                  maxLength={3}
                  placeholder="e.g., TUV, LUX, GIB"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">3-letter country code</p>
            </div>

            <div>
              <label htmlFor="home_airport" className="block text-sm font-medium text-gray-700">
                Home Airport
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="home_airport"
                  id="home_airport"
                  placeholder="e.g., WAW - Warsaw"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company / Agency
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  placeholder="e.g., TOSN, SFX"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
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
            Add Member
          </button>
        </div>
      </form>
    </div>
  )
}