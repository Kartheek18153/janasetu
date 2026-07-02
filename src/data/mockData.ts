import {
  Grievance,
  Announcement,
  Appointment,
  Officer,
  Department,
  Notification,
  UserProfile,
} from '../types';

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000);

const DEMO_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Water Supply & Sanitation',
    code: 'WSS',
    description: 'Handles water supply, drainage, and sanitation issues',
    categories: ['water_supply', 'sanitation'],
    officers: [],
  },
  {
    id: 'dept-2',
    name: 'Electricity Board',
    code: 'EB',
    description: 'Manages power supply, electrical infrastructure, and billing',
    categories: ['electricity'],
    officers: [],
  },
  {
    id: 'dept-3',
    name: 'Public Works Department',
    code: 'PWD',
    description: 'Handles roads, bridges, and public infrastructure',
    categories: ['roads'],
    officers: [],
  },
  {
    id: 'dept-4',
    name: 'Health Department',
    code: 'HLTH',
    description: 'Manages healthcare services and facilities',
    categories: ['healthcare'],
    officers: [],
  },
  {
    id: 'dept-5',
    name: 'Revenue Department',
    code: 'REV',
    description: 'Handles land records, property tax, and revenue matters',
    categories: ['revenue'],
    officers: [],
  },
];

const DEMO_OFFICERS: Officer[] = [
  { id: 'off-1', name: 'Rajesh Kumar', designation: 'District Magistrate', department: 'Revenue Department', email: 'rajesh.kumar@gov.in', phone: '9876543210', availableSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00'], isActive: true, maxAppointmentsPerDay: 8 },
  { id: 'off-2', name: 'Priya Sharma', designation: 'Chief Engineer', department: 'Public Works Department', email: 'priya.sharma@gov.in', phone: '9876543211', availableSlots: ['10:00-11:00', '11:00-12:00', '15:00-16:00'], isActive: true, maxAppointmentsPerDay: 6 },
  { id: 'off-3', name: 'Amit Patel', designation: 'Executive Engineer', department: 'Water Supply & Sanitation', email: 'amit.patel@gov.in', phone: '9876543212', availableSlots: ['09:00-10:00', '14:00-15:00', '15:00-16:00'], isActive: true, maxAppointmentsPerDay: 6 },
  { id: 'off-4', name: 'Sunita Verma', designation: 'Chief Medical Officer', department: 'Health Department', email: 'sunita.verma@gov.in', phone: '9876543213', availableSlots: ['10:00-11:00', '11:00-12:00', '14:00-15:00'], isActive: true, maxAppointmentsPerDay: 10 },
  { id: 'off-5', name: 'Vikram Singh', designation: 'Superintendent Engineer', department: 'Electricity Board', email: 'vikram.singh@gov.in', phone: '9876543214', availableSlots: ['09:00-10:00', '10:00-11:00', '16:00-17:00'], isActive: true, maxAppointmentsPerDay: 6 },
];

const DEMO_GRIEVANCES: Grievance[] = [
  {
    id: 'griev-1', trackingId: 'JST-A1B2-C3D4', citizenId: 'citizen-1', citizenName: 'Ravi Sharma', citizenPhone: '9876543200', citizenEmail: 'ravi@example.com',
    title: 'Streetlight not working in Sector 12', description: 'The streetlight near the park in Sector 12 has been broken for over a week. The area is dark at night causing safety concerns.',
    category: 'electricity', priority: 'high', status: 'in_progress', department: 'Electricity Board',
    assignedTo: 'off-5', assignedToName: 'Vikram Singh',
    location: { address: 'Sector 12, Near Central Park', landmark: 'Central Park', city: 'New Delhi', wardNo: '12', district: 'South Delhi', state: 'Delhi', pincode: '110012' },
    attachments: [], timeline: [
      { id: crypto.randomUUID(), status: 'submitted', description: 'Grievance submitted successfully', updatedBy: 'citizen-1', updatedByName: 'Ravi Sharma', createdAt: daysAgo(5), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'under_review', description: 'Grievance is under initial review', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(4), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'assigned', description: 'Assigned to Vikram Singh for action', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(3), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'in_progress', description: 'Team dispatched to inspect the location', updatedBy: 'off-5', updatedByName: 'Vikram Singh', createdAt: daysAgo(1), isVisibleToCitizen: true },
    ],
    createdAt: daysAgo(5), updatedAt: hoursAgo(6),
  },
  {
    id: 'griev-2', trackingId: 'JST-E5F6-G7H8', citizenId: 'citizen-2', citizenName: 'Anita Desai', citizenPhone: '9876543201', citizenEmail: 'anita@example.com',
    title: 'Water supply disruption in Colony B', description: 'No water supply for the past 3 days in Colony B. Residents are facing severe difficulties.',
    category: 'water_supply', priority: 'urgent', status: 'resolved', department: 'Water Supply & Sanitation',
    assignedTo: 'off-3', assignedToName: 'Amit Patel',
    location: { address: 'Colony B, Main Road', landmark: 'Main Road', city: 'New Delhi', wardNo: '5', district: 'West Delhi', state: 'Delhi', pincode: '110015' },
    attachments: [], timeline: [
      { id: crypto.randomUUID(), status: 'submitted', description: 'Grievance submitted successfully', updatedBy: 'citizen-2', updatedByName: 'Anita Desai', createdAt: daysAgo(7), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'under_review', description: 'Urgent - being reviewed', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(7), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'assigned', description: 'Assigned to Amit Patel, Executive Engineer', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(6), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'in_progress', description: 'Repair team working on the pipeline', updatedBy: 'off-3', updatedByName: 'Amit Patel', createdAt: daysAgo(4), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'resolved', description: 'Pipeline repaired. Water supply restored.', updatedBy: 'off-3', updatedByName: 'Amit Patel', createdAt: daysAgo(2), isVisibleToCitizen: true },
    ],
    createdAt: daysAgo(7), updatedAt: daysAgo(2), resolvedAt: daysAgo(2),
    feedback: { rating: 4, comment: 'Water supply restored. Thank you for the prompt action.', submittedAt: daysAgo(1) },
  },
  {
    id: 'griev-3', trackingId: 'JST-I9J0-K1L2', citizenId: 'citizen-1', citizenName: 'Ravi Sharma', citizenPhone: '9876543200', citizenEmail: 'ravi@example.com',
    title: 'Pothole on Main Road causing accidents', description: 'Large pothole near the main road intersection has caused multiple accidents. Needs immediate repair.',
    category: 'roads', priority: 'urgent', status: 'submitted', department: 'Public Works Department',
    location: { address: 'Main Road, Near Bus Stand', landmark: 'Bus Stand', city: 'New Delhi', wardNo: '8', district: 'North Delhi', state: 'Delhi', pincode: '110012' },
    attachments: [], timeline: [
      { id: crypto.randomUUID(), status: 'submitted', description: 'Grievance submitted successfully', updatedBy: 'citizen-1', updatedByName: 'Ravi Sharma', createdAt: hoursAgo(3), isVisibleToCitizen: true },
    ],
    createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
  },
  {
    id: 'griev-4', trackingId: 'JST-M3N4-O5P6', citizenId: 'citizen-3', citizenName: 'Suresh Reddy', citizenPhone: '9876543202', citizenEmail: 'suresh@example.com',
    title: 'Land record mutation pending', description: 'Applied for land record mutation 2 months ago. Still no update. Please expedite.',
    category: 'revenue', priority: 'medium', status: 'under_review', department: 'Revenue Department',
    location: { address: 'Village Panchayat Office', landmark: 'Panchayat Office', city: 'Rajpur Khurd', wardNo: '1', district: 'South West Delhi', state: 'Delhi', pincode: '110020' },
    attachments: [], timeline: [
      { id: crypto.randomUUID(), status: 'submitted', description: 'Grievance submitted successfully', updatedBy: 'citizen-3', updatedByName: 'Suresh Reddy', createdAt: daysAgo(10), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'under_review', description: 'Application under verification', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(8), isVisibleToCitizen: true },
    ],
    createdAt: daysAgo(10), updatedAt: daysAgo(8),
  },
  {
    id: 'griev-5', trackingId: 'JST-Q7R8-S9T0', citizenId: 'citizen-2', citizenName: 'Anita Desai', citizenPhone: '9876543201', citizenEmail: 'anita@example.com',
    title: 'Primary Health Center understaffed', description: 'PHC in Ward 5 has no doctor available for the past week. Patients being turned away.',
    category: 'healthcare', priority: 'high', status: 'closed', department: 'Health Department',
    assignedTo: 'off-4', assignedToName: 'Sunita Verma',
    location: { address: 'Ward 5, PHC Building', landmark: 'PHC Building', city: 'New Delhi', wardNo: '5', district: 'West Delhi', state: 'Delhi', pincode: '110015' },
    attachments: [], timeline: [
      { id: crypto.randomUUID(), status: 'submitted', description: 'Grievance submitted successfully', updatedBy: 'citizen-2', updatedByName: 'Anita Desai', createdAt: daysAgo(15), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'under_review', description: 'Grievance verified - doctor shortage confirmed', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(14), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'assigned', description: 'Assigned to Sunita Verma, CMO', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(13), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'in_progress', description: 'New doctor being arranged', updatedBy: 'off-4', updatedByName: 'Sunita Verma', createdAt: daysAgo(11), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'resolved', description: 'New doctor deployed at PHC', updatedBy: 'off-4', updatedByName: 'Sunita Verma', createdAt: daysAgo(7), isVisibleToCitizen: true },
      { id: crypto.randomUUID(), status: 'closed', description: 'Case closed after citizen confirmed resolution', updatedBy: 'admin-1', updatedByName: 'Admin Officer', createdAt: daysAgo(5), isVisibleToCitizen: true },
    ],
    createdAt: daysAgo(15), updatedAt: daysAgo(5), resolvedAt: daysAgo(7),
    feedback: { rating: 5, comment: 'Excellent response time. Doctor now available.', submittedAt: daysAgo(4) },
  },
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1', title: 'New Ayushman Bharat Scheme Enrollment Drive', content: 'The district administration is organizing a special enrollment drive for Ayushman Bharat health insurance scheme. Eligible citizens can register at their nearest Common Service Centre (CSC). Required documents: Aadhaar card, BPL certificate, and recent passport size photo. The drive will run from 15th to 30th of this month.',
    type: 'scheme', priority: 'high', publishedBy: 'admin-1', publishedByName: 'Collector Office',
    publishedAt: daysAgo(1), isActive: true, targetAudience: 'all',
    attachments: [],
  },
  {
    id: 'ann-2', title: 'Office Holiday - Festival of Eid', content: 'The District Collectorate will remain closed on 10th July on account of Eid-ul-Adha. All citizen services will resume on 11th July. Emergency services will continue to operate as usual.',
    type: 'holiday', priority: 'medium', publishedBy: 'admin-1', publishedByName: 'Collector Office',
    publishedAt: daysAgo(2), isActive: true, targetAudience: 'all',
    attachments: [],
  },
  {
    id: 'ann-3', title: 'Emergency: Heavy Rainfall Alert', content: 'IMD has issued a red alert for heavy rainfall in the district over the next 48 hours. Citizens in low-lying areas are advised to move to safer locations. Emergency control room numbers: 1070 (District), 108 (Ambulance). All disaster relief teams are on standby.',
    type: 'emergency', priority: 'critical', publishedBy: 'admin-1', publishedByName: 'District Emergency Cell',
    publishedAt: hoursAgo(6), isActive: true, targetAudience: 'all',
    attachments: [],
  },
  {
    id: 'ann-4', title: 'Public Notice: Property Tax Revision', content: 'Notice is hereby given that the property tax rates for the financial year 2026-27 have been revised. Citizens can view the revised rates on the district website or visit the Revenue Department office. Last date for payment without penalty: 31st August 2026.',
    type: 'notice', priority: 'medium', publishedBy: 'admin-1', publishedByName: 'Revenue Department',
    publishedAt: daysAgo(5), isActive: true, targetAudience: 'citizens',
    attachments: [],
  },
  {
    id: 'ann-5', title: 'Circular: All Officers - Quarterly Review Meeting', content: 'All department heads are directed to attend the quarterly performance review meeting on 20th July at 10:00 AM in the Collectorate Conference Hall. Please come prepared with department-wise progress reports.',
    type: 'circular', priority: 'high', publishedBy: 'admin-1', publishedByName: 'Collector Office',
    publishedAt: daysAgo(3), isActive: true, targetAudience: 'officers',
    attachments: [],
  },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1', citizenId: 'citizen-1', citizenName: 'Ravi Sharma', citizenPhone: '9876543200', citizenEmail: 'ravi@example.com',
    officerId: 'off-1', officerName: 'Rajesh Kumar', officerDesignation: 'District Magistrate', department: 'Revenue Department',
    purpose: 'Land dispute resolution', preferredDate: daysAgo(-2), preferredTimeSlot: '10:00-11:00',
    status: 'confirmed', scheduledDate: daysAgo(-2), scheduledTimeSlot: '10:00-11:00',
    createdAt: daysAgo(5), updatedAt: daysAgo(4),
  },
  {
    id: 'app-2', citizenId: 'citizen-2', citizenName: 'Anita Desai', citizenPhone: '9876543201', citizenEmail: 'anita@example.com',
    officerId: 'off-3', officerName: 'Amit Patel', officerDesignation: 'Executive Engineer', department: 'Water Supply & Sanitation',
    purpose: 'New water connection application', preferredDate: daysAgo(3), preferredTimeSlot: '14:00-15:00',
    status: 'completed',
    createdAt: daysAgo(7), updatedAt: daysAgo(3),
  },
  {
    id: 'app-3', citizenId: 'citizen-1', citizenName: 'Ravi Sharma', citizenPhone: '9876543200', citizenEmail: 'ravi@example.com',
    officerId: 'off-5', officerName: 'Vikram Singh', officerDesignation: 'Superintendent Engineer', department: 'Electricity Board',
    purpose: 'New electricity connection', preferredDate: daysAgo(5), preferredTimeSlot: '09:00-10:00',
    status: 'cancelled',
    createdAt: daysAgo(8), updatedAt: daysAgo(6),
  },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'citizen-1', title: 'Grievance Update', message: 'Your grievance JST-A1B2-C3D4 status has been updated to "In Progress". Team dispatched for inspection.', type: 'grievance_status_update', isRead: false, relatedEntityType: 'grievance', relatedEntityId: 'griev-2', createdAt: hoursAgo(6) },
  { id: 'notif-2', userId: 'citizen-1', title: 'Grievance Resolved', message: 'Your grievance JST-E5F6-G7H8 has been resolved. Pipeline repaired and water supply restored.', type: 'grievance_resolved', isRead: false, relatedEntityType: 'grievance', relatedEntityId: 'griev-2', createdAt: daysAgo(2) },
  { id: 'notif-3', userId: 'citizen-1', title: 'Appointment Confirmed', message: 'Your appointment with Rajesh Kumar (DM) on 04-Jul-2026 at 10:00 AM has been confirmed.', type: 'appointment_confirmed', isRead: true, relatedEntityType: 'appointment', relatedEntityId: 'app-1', createdAt: daysAgo(4) },
  { id: 'notif-4', userId: 'citizen-1', title: 'Emergency Announcement', message: 'Heavy rainfall alert issued for the district. Please take necessary precautions.', type: 'new_announcement', isRead: false, relatedEntityType: 'announcement', relatedEntityId: 'ann-3', createdAt: hoursAgo(6) },
];

const DEMO_USERS: Record<string, UserProfile> = {
  'citizen-1': { uid: 'citizen-1', email: 'ravi@example.com', name: 'Ravi Sharma', phone: '9876543200', role: 'citizen', createdAt: daysAgo(30), updatedAt: daysAgo(1), isVerified: true },
  'citizen-2': { uid: 'citizen-2', email: 'anita@example.com', name: 'Anita Desai', phone: '9876543201', role: 'citizen', createdAt: daysAgo(25), updatedAt: daysAgo(1), isVerified: true },
  'citizen-3': { uid: 'citizen-3', email: 'suresh@example.com', name: 'Suresh Reddy', phone: '9876543202', role: 'citizen', createdAt: daysAgo(20), updatedAt: daysAgo(1), isVerified: false },
  'admin-1': { uid: 'admin-1', email: 'admin@janasetu.gov.in', name: 'Admin Officer', phone: '9876543299', role: 'admin', department: 'Collectorate', designation: 'Administrative Officer', createdAt: daysAgo(365), updatedAt: daysAgo(1), isVerified: true },
};

export const MockData = {
  departments: DEMO_DEPARTMENTS,
  officers: DEMO_OFFICERS,
  grievances: DEMO_GRIEVANCES,
  announcements: DEMO_ANNOUNCEMENTS,
  appointments: DEMO_APPOINTMENTS,
  notifications: DEMO_NOTIFICATIONS,
  users: DEMO_USERS,
};

export default MockData;