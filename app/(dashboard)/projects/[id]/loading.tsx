export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Crew Management Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
