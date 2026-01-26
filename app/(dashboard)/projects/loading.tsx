export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
