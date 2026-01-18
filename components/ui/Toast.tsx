'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  id: string
  message: string
  type: ToastType
  onClose: (id: string) => void
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, 4000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${
        bgColors[type]
      } ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      {icons[type]}
      <p className="text-sm text-gray-800 flex-1">{message}</p>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
