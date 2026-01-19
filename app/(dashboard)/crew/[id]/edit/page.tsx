import { getCrewMemberById, updateCrewMember } from '@/app/crew/actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RoleSelect from '@/components/crew/RoleSelect'

export default async function EditCrewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crewMember = await getCrewMemberById(id)
  
  const supabase = await createClient()
  
  // Fetch all crew roles
  const { data: roles } = await supabase
    .from('crew_roles')
    .select('id, name')
    .order('display_order', { ascending: true })

  if (!crewMember) {
    notFound()
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateCrewMember(id, formData)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Crew Member
          </h2>
        </div>
      </div>

      <form action={handleUpdate} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
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
              defaultValue={crewMember.full_name}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="mt-1">
            <RoleSelect roles={roles || []} defaultValue={crewMember.role} required />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Can't find the role? Add it in <Link href="/settings" className="text-blue-600 hover:text-blue-700">Settings</Link>
          </p>
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
              defaultValue={crewMember.email || ''}
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
              defaultValue={crewMember.phone || ''}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
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
              defaultValue={crewMember.status}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="available">Available</option>
              <option value="on_project">Onboard</option>
              <option value="on_leave">On Leave</option>
            </select>
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
                  defaultValue={crewMember.nationality || ''}
                  placeholder="e.g., Lithuanian, Latvian"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
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
                  defaultValue={crewMember.home_airport || ''}
                  placeholder="e.g., WAW - Warsaw"
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
