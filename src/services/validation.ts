import { z } from 'zod';

// User schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nationality: z.enum(['citizen', 'nri', 'other']).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
  language: z.enum(['en', 'hi', 'gu', 'mr', 'ta', 'te', 'bn']).optional(),
  notificationChannel: z.enum(['email', 'sms', 'both']).optional(),
  grievanceUpdates: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  announcementAlerts: z.boolean().optional(),
});

// Grievance schemas
export const locationSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  landmark: z.string().max(200).optional(),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  wardNo: z.string().max(50).optional(),
  district: z.string().min(2, 'District must be at least 2 characters').max(100),
  state: z.string().min(2, 'State must be at least 2 characters').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode (must be 6 digits)'),
});

export const createGrievanceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category: z.enum([
    'water_supply', 'electricity', 'roads', 'sanitation',
    'healthcare', 'education', 'revenue', 'public_distribution',
    'social_welfare', 'other'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  department: z.string().min(1, 'Department is required'),
  location: locationSchema,
});

export const updateGrievanceSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'assigned', 'in_progress', 'pending_citizen', 'resolved', 'closed', 'rejected']).optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  department: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field must be provided');

// Appointment schemas
export const createAppointmentSchema = z.object({
  officerId: z.string().min(1, 'Officer is required'),
  officerName: z.string().min(1),
  officerDesignation: z.string().min(1),
  department: z.string().min(1),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(1000),
  preferredDate: z.date({ required_error: 'Preferred date is required' }),
  preferredTimeSlot: z.enum([
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ]),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show']).optional(),
  scheduledDate: z.date().optional(),
  scheduledTimeSlot: z.enum([
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ]).optional(),
  notes: z.string().max(500).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field must be provided');

// Scheme application schema
export const schemeApplicationSchema = z.object({
  schemeId: z.string().min(1),
  schemeName: z.string().min(1),
});

// Announcement schema (admin only)
export const createAnnouncementSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(10000),
  type: z.enum(['general', 'scheme', 'holiday', 'emergency', 'notice', 'circular']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  targetAudience: z.enum(['all', 'citizens', 'officers', 'specific_department']),
  department: z.string().optional(),
  expiresAt: z.date().optional(),
});

// Officer schema (admin only)
export const createOfficerSchema = z.object({
  name: z.string().min(2).max(100),
  designation: z.string().min(2).max(100),
  department: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  availableSlots: z.array(z.enum([
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ])).min(1, 'At least one time slot required'),
  maxAppointmentsPerDay: z.number().int().min(1).max(20).default(10),
  isActive: z.boolean().default(true),
});

// Feedback schema
export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`) };
}

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGrievanceInput = z.infer<typeof createGrievanceSchema>;
export type UpdateGrievanceInput = z.infer<typeof updateGrievanceSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;