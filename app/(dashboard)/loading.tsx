export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-gray-900 p-4 space-y-2">
        <div className="h-8 bg-gray-800 rounded animate-pulse mb-6"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-lg shadow animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-white dark:bg-gray-900 rounded-lg shadow animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
