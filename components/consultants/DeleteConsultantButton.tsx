'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteConsultantButtonProps {
  consultantId: string
  onDelete: () => Promise<void>
}

export default function DeleteConsultantButton({ consultantId, onDelete }: DeleteConsultantButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('Are you sure you want to delete this consultant? Projects assigned to this consultant will remain but lose their consultant association.')) {
      return
    }

    startTransition(async () => {
      await onDelete()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
