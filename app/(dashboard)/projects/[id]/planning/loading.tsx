export default function ProjectPlanningLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Gantt Chart Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
