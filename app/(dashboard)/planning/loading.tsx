export default function PlanningLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Gantt Chart Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
