import { createClient } from '@/lib/supabase/server'
import { Settings as SettingsIcon } from 'lucide-react'
import CrewRolesManager from '@/components/settings/CrewRolesManager'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Fetch all crew roles
  const { data: roles } = await supabase
    .from('crew_roles')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage system configuration and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Crew Roles Section */}
        <CrewRolesManager roles={roles || []} />
      </div>
    </div>
  )
}
