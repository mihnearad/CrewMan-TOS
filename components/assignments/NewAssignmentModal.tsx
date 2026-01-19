'use client'

import { useState, useTransition } from 'react'
import { X, AlertCircle, Loader2, Search, Anchor, GraduationCap } from 'lucide-react'
import { format, addMonths } from 'date-fns'

interface Project {
  id: string
  name: string
  color: string
  type?: string
  status?: string
}

interface CrewRole {
  id: string
  name: string
}

interface NewAssignmentModalProps {
  crewMemberId: string
  crewMemberName: string
  crewMemberRole: string
  projects: Project[]
  roles?: CrewRole[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    projectId: string | null
    startDate: string
    endDate: string
    roleOnProject: string
    assignmentType: 'vessel' | 'training'
    trainingDescription?: string
  }) => Promise<{ error?: string; success?: boolean }>
}

export default function NewAssignmentModal({
  crewMemberId,
  crewMemberName,
  crewMemberRole,
  projects,
  roles = [],
  isOpen,
  onClose,
  onSave,
}: NewAssignmentModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [assignmentType, setAssignmentType] = useState<'vessel' | 'training'>('vessel')
  const [formData, setFormData] = useState({
    projectId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    roleOnProject: crewMemberRole,
    trainingDescription: '',
  })

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedProject = projects.find((p) => p.id === formData.projectId)

  if (!isOpen) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate based on assignment type
    if (assignmentType === 'vessel' && !formData.projectId) {
      setError('Please select a vessel')
      return
    }

    if (assignmentType === 'training' && !formData.trainingDescription.trim()) {
      setError('Please provide a training description')
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date')
      return
    }

    startTransition(async () => {
      const result = await onSave({
        projectId: assignmentType === 'vessel' ? formData.projectId : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        roleOnProject: formData.roleOnProject,
        assignmentType,
        trainingDescription: assignmentType === 'training' ? formData.trainingDescription : undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        // Reset form and close
        setFormData({
          projectId: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
          roleOnProject: crewMemberRole,
          trainingDescription: '',
        })
        setAssignmentType('vessel')
        setSearchQuery('')
        onClose()
      }
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Assignment</h2>
            <p className="text-sm text-gray-500">Assign {crewMemberName} to a vessel</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Assignment Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignmentType('vessel')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    assignmentType === 'vessel'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isPending}
                >
                  <Anchor className="h-4 w-4" />
                  Vessel
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentType('training')}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    assignmentType === 'training'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isPending}
                >
                  <GraduationCap className="h-4 w-4" />
                  Training
                </button>
              </div>
            </div>

            {/* Vessel Selection (only for vessel type) */}
            {assignmentType === 'vessel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vessel <span className="text-red-500">*</span>
                  </label>

                  {/* Search input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search vessels..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Project list */}
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No vessels found
                      </div>
                    ) : (
                      filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, projectId: project.id })}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            formData.projectId === project.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{project.name}</p>
                            {project.type && (
                              <p className="text-xs text-gray-500">{project.type}</p>
                            )}
                          </div>
                          {formData.projectId === project.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected project indicator */}
                {selectedProject && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                    <span className="text-sm font-medium text-blue-800">
                      Selected: {selectedProject.name}
                    </span>
                  </div>
                )}

                {/* Role onboard */}
                <div>
                  <label htmlFor="roleOnProject" className="block text-sm font-medium text-gray-700 mb-1">
                    Role Onboard
                  </label>
                  <select
                    id="roleOnProject"
                    value={formData.roleOnProject}
                    onChange={(e) => setFormData({ ...formData, roleOnProject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No specific role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Training Description (only for training type) */}
            {assignmentType === 'training' && (
              <div>
                <label htmlFor="trainingDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Training Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="trainingDescription"
                  value={formData.trainingDescription}
                  onChange={(e) => setFormData({ ...formData, trainingDescription: e.target.value })}
                  placeholder="e.g., Safety Training, STCW Certification, Medical Course"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Describe the training, certification, or course
                </p>
              </div>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || (assignmentType === 'vessel' && !formData.projectId) || (assignmentType === 'training' && !formData.trainingDescription.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                assignmentType === 'training' 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Creating...' : assignmentType === 'training' ? 'Create Training' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
