'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteProjectButton({ onDelete }: { onDelete: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Are you sure you want to delete this vessel?')) {
      e.preventDefault()
    }
  }

  return (
    <button
      type="submit"
      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
      onClick={handleClick}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </button>
  )
}
