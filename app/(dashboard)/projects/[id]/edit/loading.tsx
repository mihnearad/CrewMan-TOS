export default function EditProjectLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
