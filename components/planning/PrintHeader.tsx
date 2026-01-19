interface PrintHeaderProps {
  filterSummary: string
  generatedAt?: string
}

export default function PrintHeader({ filterSummary, generatedAt }: PrintHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-3 mb-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Planning Report</h1>
          {generatedAt ? (
            <p className="text-xs text-gray-500">Generated {generatedAt}</p>
          ) : null}
        </div>
        <div className="text-right text-xs text-gray-600 max-w-sm">
          <span className="font-medium text-gray-700">Filters:</span> {filterSummary || 'None'}
        </div>
      </div>
    </div>
  )
}
