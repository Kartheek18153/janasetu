export type UserRole = 'citizen' | 'admin' | 'officer';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export type NationalityCategory = 'citizen' | 'nri' | 'other';

export type NotificationChannel = 'email' | 'sms' | 'both';

export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'ta' | 'te' | 'bn';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  department?: string;
  designation?: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isPhoneVerified?: boolean;
  registrationId?: string;
  gender?: string;
  nationality?: NationalityCategory;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  language?: SupportedLanguage;
  notificationChannel?: NotificationChannel;
  grievanceUpdates?: boolean;
  appointmentReminders?: boolean;
  announcementAlerts?: boolean;
}

export interface Grievance {
  id: string;
  trackingId: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
  status: GrievanceStatus;
  department: string;
  assignedTo?: string;
  assignedToName?: string;
  location?: {
    address: string;
    landmark: string;
    city: string;
    wardNo: string;
    district: string;
    state: string;
    pincode: string;
  };
  attachments: Attachment[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  feedback?: Feedback;
}

export type GrievanceCategory = 
  | 'water_supply'
  | 'electricity'
  | 'roads'
  | 'sanitation'
  | 'healthcare'
  | 'education'
  | 'revenue'
  | 'public_distribution'
  | 'social_welfare'
  | 'other';

export type GrievancePriority = 'low' | 'medium' | 'high' | 'urgent';

export type GrievanceStatus = 
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'pending_citizen'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface TimelineEvent {
  id: string;
  status: GrievanceStatus;
  description: string;
  updatedBy: string;
  updatedByName: string;
  createdAt: Date;
  isVisibleToCitizen: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Feedback {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  submittedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  publishedBy: string;
  publishedByName: string;
  publishedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  targetAudience: 'all' | 'citizens' | 'officers' | 'specific_department';
  department?: string;
  attachments: Attachment[];
}

export type AnnouncementType = 
  | 'general'
  | 'scheme'
  | 'holiday'
  | 'emergency'
  | 'notice'
  | 'circular';

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Appointment {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  department: string;
  purpose: string;
  preferredDate: Date;
  preferredTimeSlot: TimeSlot;
  status: AppointmentStatus;
  scheduledDate?: Date;
  scheduledTimeSlot?: TimeSlot;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TimeSlot = 
  | '09:00-10:00'
  | '10:00-11:00'
  | '11:00-12:00'
  | '12:00-13:00'
  | '14:00-15:00'
  | '15:00-16:00'
  | '16:00-17:00';

export type AppointmentStatus = 
  | 'requested'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Officer {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  availableSlots: TimeSlot[];
  isActive: boolean;
  maxAppointmentsPerDay: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  categories: GrievanceCategory[];
  officers: Officer[];
  headOfficerId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntityType?: 'grievance' | 'appointment' | 'announcement';
  relatedEntityId?: string;
  createdAt: Date;
}

export type NotificationType = 
  | 'grievance_status_update'
  | 'grievance_assigned'
  | 'grievance_resolved'
  | 'appointment_confirmed'
  | 'appointment_rescheduled'
  | 'appointment_cancelled'
  | 'new_announcement'
  | 'system';

export interface Stats {
  totalGrievances: number;
  pendingGrievances: number;
  inProgressGrievances: number;
  resolvedGrievances: number;
  avgResolutionTime: number;
  citizenSatisfaction: number;
}

export interface FilterOptions {
  status?: GrievanceStatus[];
  category?: GrievanceCategory[];
  priority?: GrievancePriority[];
  department?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SocialCategory = 'general' | 'sc' | 'st' | 'obc' | 'ews' | 'other';

export type SchemeScope = 'central' | 'state';

export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'disbursed' | 'rejected';

export interface Scheme {
  id: string;
  name: string;
  description: string;
  ministry: string;
  scope: SchemeScope;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    states?: string[];
    maxAnnualIncome?: number;
    categories?: SocialCategory[];
    occupation?: string;
    gender?: string;
    other?: string;
  };
  benefits: string;
  documents: string[];
  howToApply: string;
  officialLink: string;
  icon: string;
  active: boolean;
  tags: string[];
}

export interface SchemeApplication {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  status: ApplicationStatus;
  submittedAt: Date;
  updatedAt: Date;
  timeline: SchemeTimelineEvent[];
}

export interface SchemeTimelineEvent {
  status: string;
  description: string;
  date: Date;
}

export interface UserProfileForm {
  age: number;
  state: string;
  annualIncome: number;
  category: SocialCategory;
  occupation: string;
  gender: string;
}