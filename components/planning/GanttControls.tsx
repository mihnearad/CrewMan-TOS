'use client'

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Users, FolderOpen } from 'lucide-react'
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
  const zoomLevels: GanttZoomLevel[] = ['day', 'week', 'month']
  const currentZoomIndex = zoomLevels.indexOf(zoomLevel)

  const handleZoomIn = () => {
    if (currentZoomIndex > 0) {
      onZoomChange(zoomLevels[currentZoomIndex - 1])
    }
  }

  const handleZoomOut = () => {
    if (currentZoomIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentZoomIndex + 1])
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Group by:</span>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => onViewModeChange('by-crew')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border ${
              viewMode === 'by-crew'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-l-md`}
          >
            <Users className="w-4 h-4 mr-1.5" />
            Crew
          </button>
          <button
            onClick={() => onViewModeChange('by-project')}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border-t border-b border-r ${
              viewMode === 'by-project'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-r-md`}
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            Project
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('prev')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => onNavigate('today')}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Next"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomIn}
          disabled={currentZoomIndex === 0}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm text-gray-600 min-w-[60px] text-center capitalize">
          {zoomLevel}
        </span>
        <button
          onClick={handleZoomOut}
          disabled={currentZoomIndex === zoomLevels.length - 1}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
