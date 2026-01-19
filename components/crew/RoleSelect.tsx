'use client'

interface Role {
  id: string
  name: string
}

interface RoleSelectProps {
  roles: Role[]
  defaultValue?: string
  name?: string
  id?: string
  required?: boolean
  onChange?: (value: string) => void
}

export default function RoleSelect({ 
  roles, 
  defaultValue, 
  name = 'role', 
  id = 'role',
  required = true,
  onChange 
}: RoleSelectProps) {
  return (
    <select
      name={name}
      id={id}
      required={required}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <option value="">Select a role...</option>
      {roles.map((role) => (
        <option key={role.id} value={role.name}>
          {role.name}
        </option>
      ))}
    </select>
  )
}
