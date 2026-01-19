interface PrintHeaderProps {
  filterSummary: string
  generatedAt?: string
}

export default function PrintHeader({ filterSummary, generatedAt }: PrintHeaderProps) {
  // Only render when generatedAt is set (during print)
  if (!generatedAt) return null
  
  return (
    <div className="print-header border-b border-gray-200 pb-3 mb-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Planning Report</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Generated {generatedAt}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563', maxWidth: '300px' }}>
          <span style={{ fontWeight: 500, color: '#374151' }}>Filters:</span> {filterSummary || 'None'}
        </div>
      </div>
    </div>
  )
}
