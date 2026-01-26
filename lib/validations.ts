import { z } from 'zod'

// Crew Member Validation
export const crewMemberSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').trim(),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  home_airport: z.string().optional().or(z.literal('')),
  status: z.enum(['available', 'on_project', 'on_leave']).optional(),
})

export const updateCrewMemberSchema = crewMemberSchema.extend({
  status: z.enum(['available', 'on_project', 'on_leave']),
})

// Project Validation
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  type: z.string().min(1, 'Project type is required'),
  status: z.enum(['active', 'completed', 'cancelled', 'planned']).optional(),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  client_id: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const updateProjectSchema = projectSchema.extend({
  status: z.enum(['active', 'completed', 'cancelled', 'planned']),
})

// Client Validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required').trim(),
  contact_person: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
})

export const updateClientSchema = clientSchema.extend({
  status: z.enum(['active', 'inactive']),
})

// Consultant Validation
export const consultantSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
})

export const updateConsultantSchema = consultantSchema.extend({
  status: z.enum(['active', 'inactive']),
})

// Assignment Validation
export const assignmentSchema = z.object({
  project_id: z.string().uuid('Invalid project').optional().or(z.literal('')),
  crew_member_id: z.string().uuid('Invalid crew member'),
  role_on_project: z.string().optional().or(z.literal('')),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  assignment_type: z.enum(['vessel', 'training']).optional(),
  training_description: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true
    return new Date(data.start_date) <= new Date(data.end_date)
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
).refine(
  (data) => {
    if (data.assignment_type === 'vessel' && !data.project_id) {
      return false
    }
    return true
  },
  {
    message: 'Project is required for vessel assignments',
    path: ['project_id'],
  }
)

export const updateAssignmentDatesSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

// Profile Validation
export const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

// Crew Role Validation
export const crewRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').trim(),
})

// Helper function to validate FormData
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const data: Record<string, unknown> = {}
  
  for (const [key, value] of formData.entries()) {
    data[key] = value
  }

  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errors: Record<string, string> = {}
    result.error.issues.forEach((err) => {
      const path = err.path.join('.')
      errors[path] = err.message
    })
    return { success: false, errors }
  }
}
