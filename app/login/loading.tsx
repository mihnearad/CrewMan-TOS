export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full space-y-6">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <div className="h-8 w-48 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-32 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
