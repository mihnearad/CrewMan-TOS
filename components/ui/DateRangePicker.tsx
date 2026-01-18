/**
 * DateRangePicker Component
 * 
 * Date range picker with preset options and custom range inputs.
 * Features quick presets (This week, This month, etc.), clear button,
 * and proper date validation.
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   from={dateFrom}
 *   to={dateTo}
 *   onFromChange={setDateFrom}
 *   onToChange={setDateTo}
 *   onClear={clearDateRange}
 * />
 * ```
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, X, ChevronDown } from 'lucide-react'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
} from 'date-fns'
import { cn } from '@/lib/utils'

interface DateRangePreset {
  label: string
  getRange: () => { from: string; to: string }
}

interface DateRangePickerProps {
  /** Current "from" date (YYYY-MM-DD format) */
  from: string | null
  /** Current "to" date (YYYY-MM-DD format) */
  to: string | null
  /** Callback when "from" date changes */
  onFromChange: (date: string | null) => void
  /** Callback when "to" date changes */
  onToChange: (date: string | null) => void
  /** Callback to clear both dates */
  onClear: () => void
  /** Additional CSS classes */
  className?: string
  /** Label text */
  label?: string
  /** Show preset buttons */
  showPresets?: boolean
  /** Compact mode (single dropdown) */
  compact?: boolean
}

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd')

// Preset date range options
const datePresets: DateRangePreset[] = [
  {
    label: 'This Week',
    getRange: () => ({
      from: formatDate(startOfWeek(new Date(), { weekStartsOn: 1 })),
      to: formatDate(endOfWeek(new Date(), { weekStartsOn: 1 })),
    }),
  },
  {
    label: 'This Month',
    getRange: () => ({
      from: formatDate(startOfMonth(new Date())),
      to: formatDate(endOfMonth(new Date())),
    }),
  },
  {
    label: 'This Quarter',
    getRange: () => ({
      from: formatDate(startOfQuarter(new Date())),
      to: formatDate(endOfQuarter(new Date())),
    }),
  },
  {
    label: 'Next 7 Days',
    getRange: () => ({
      from: formatDate(new Date()),
      to: formatDate(addDays(new Date(), 7)),
    }),
  },
  {
    label: 'Next 30 Days',
    getRange: () => ({
      from: formatDate(new Date()),
      to: formatDate(addDays(new Date(), 30)),
    }),
  },
  {
    label: 'Last 30 Days',
    getRange: () => ({
      from: formatDate(subDays(new Date(), 30)),
      to: formatDate(new Date()),
    }),
  },
]

export default function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  className,
  label = 'Date Range',
  showPresets = true,
  compact = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Handle preset selection
  const handlePresetSelect = useCallback((preset: DateRangePreset) => {
    const { from, to } = preset.getRange()
    onFromChange(from)
    onToChange(to)
    setIsOpen(false)
  }, [onFromChange, onToChange])
  
  // Format display text
  const displayText = useMemo(() => {
    if (!from && !to) return null
    if (from && to) {
      return `${format(new Date(from), 'MMM d')} - ${format(new Date(to), 'MMM d, yyyy')}`
    }
    if (from) return `From ${format(new Date(from), 'MMM d, yyyy')}`
    if (to) return `Until ${format(new Date(to), 'MMM d, yyyy')}`
    return null
  }, [from, to])
  
  const hasRange = Boolean(from || to)
  
  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
            'transition-colors duration-150',
            hasRange
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          <Calendar className="h-4 w-4" />
          {displayText || label}
          {hasRange ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="ml-1 hover:text-blue-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
              {/* Presets */}
              {showPresets && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Quick Select</p>
                  <div className="flex flex-wrap gap-1.5">
                    {datePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Range */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Custom Range</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                    <input
                      type="date"
                      value={from || ''}
                      onChange={(e) => onFromChange(e.target.value || null)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-gray-400 mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                    <input
                      type="date"
                      value={to || ''}
                      onChange={(e) => onToChange(e.target.value || null)}
                      min={from || undefined}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Clear button */}
              {hasRange && (
                <button
                  type="button"
                  onClick={() => {
                    onClear()
                    setIsOpen(false)
                  }}
                  className="mt-3 w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Clear dates
                </button>
              )}
            </div>
          </>
        )}
      </div>
    )
  }
  
  // Expanded inline mode
  return (
    <div className={cn('space-y-3', className)}>
      {/* Label with clear button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {label}
        </span>
        {hasRange && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Presets */}
      {showPresets && (
        <div className="flex flex-wrap gap-1.5">
          {datePresets.slice(0, 4).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="date"
            value={from || ''}
            onChange={(e) => onFromChange(e.target.value || null)}
            placeholder="Start date"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <span className="text-gray-400">to</span>
        <div className="flex-1">
          <input
            type="date"
            value={to || ''}
            onChange={(e) => onToChange(e.target.value || null)}
            min={from || undefined}
            placeholder="End date"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
