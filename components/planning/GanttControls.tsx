'use client'

import { ChevronLeft, ChevronRight, Users, FolderOpen, Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import type { GanttViewMode, GanttZoomLevel } from '@/lib/gantt/types'

interface GanttControlsProps {
  viewMode: GanttViewMode
  zoomLevel: GanttZoomLevel
  onViewModeChange: (mode: GanttViewMode) => void
  onZoomChange: (level: GanttZoomLevel) => void
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
}

export default function GanttControls({
  viewMode,
  zoomLevel,
  onViewModeChange,
  onZoomChange,
  onNavigate,
}: GanttControlsProps) {
  // Time scale options with labels and icons
  const timeScaleOptions: { value: GanttZoomLevel; label: string; icon: React.ReactNode }[] = [
    { value: 'day', label: 'Days', icon: <Calendar className="w-4 h-4" /> },
    { value: 'week', label: 'Weeks', icon: <CalendarDays className="w-4 h-4" /> },
    { value: 'month', label: 'Months', icon: <CalendarRange className="w-4 h-4" /> },
  ]

  return (
    <div 
      className="flex items-center justify-between px-5 py-3 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-850 border-b border-slate-200/80 dark:border-gray-700"
    >
      {/* View Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Group by:</span>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-gray-800" role="group">
          <button
            onClick={() => onViewModeChange('by-crew')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
              viewMode === 'by-crew'
                ? 'bg-white text-slate-800 shadow-sm rounded-md dark:bg-gray-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 mr-1.5" />
            Crew
          </button>
          <button
            onClick={() => onViewModeChange('by-project')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
              viewMode === 'by-project'
                ? 'bg-white text-slate-800 shadow-sm rounded-md dark:bg-gray-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            Vessel
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('prev')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-100"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
        <button
          onClick={() => onNavigate('today')}
          className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-100"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-100"
          title="Next"
        >
          <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Time Scale Filter - Direct Toggle Buttons */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">View:</span>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-gray-800" role="group">
          {timeScaleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onZoomChange(option.value)}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                zoomLevel === option.value
                  ? 'bg-white text-slate-800 shadow-sm rounded-md dark:bg-gray-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              title={`View by ${option.label}`}
            >
              <span className="mr-1.5">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
