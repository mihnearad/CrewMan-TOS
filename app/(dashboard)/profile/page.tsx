import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { User, Mail, Lock, ArrowLeft } from 'lucide-react'
import { updateEmail, updatePassword } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const supabase = await createClient()
  const { error, success } = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-md p-2 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Profile Overview */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.email}</h2>
            <p className="text-sm text-gray-500">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Email Update Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Email Address</h2>
        </div>
        <form action={updateEmail}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={user.email || ''}
                  required
                  className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                You will receive a confirmation email at both your current and new email addresses.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Email
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <form action={updatePassword}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="current_password"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="current_password"
                  id="current_password"
                  required
                  className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    required
                    minLength={6}
                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    required
                    minLength={6}
                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Password must be at least 6 characters long.
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Change Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
