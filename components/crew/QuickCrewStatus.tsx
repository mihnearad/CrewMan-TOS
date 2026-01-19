'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { updateCrewStatus } from '@/app/crew/actions'
import { useToast } from '@/components/ui/ToastProvider'

interface QuickCrewStatusProps {
  crewId: string
  currentStatus: string
}

const statuses = [
  { value: 'available', label: 'Available', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'on_project', label: 'Onboard', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 'on_leave', label: 'On Leave', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
]

export default function QuickCrewStatus({ crewId, currentStatus }: QuickCrewStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  const currentStatusInfo = statuses.find(s => s.value === currentStatus) || statuses[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateCrewStatus(crewId, newStatus)
      if (result.error) {
        showToast(result.error, 'error')
      } else {
        showToast('Crew status updated', 'success')
      }
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setIsUpdating(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.textColor} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all ${isUpdating ? 'opacity-50' : ''}`}
      >
        {currentStatusInfo.label.replace('_', ' ')}
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleStatusChange(status.value)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  status.value === currentStatus ? 'bg-gray-50' : ''
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${status.bgColor.replace('100', '500')}`} />
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
