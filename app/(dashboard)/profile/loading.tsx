export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
