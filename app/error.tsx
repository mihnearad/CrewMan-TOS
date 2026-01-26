'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
