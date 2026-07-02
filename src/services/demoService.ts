import { UserProfile } from '../types';
import MockData from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const store = {
  grievances: [...MockData.grievances],
  announcements: [...MockData.announcements],
  appointments: [...MockData.appointments],
  notifications: [...MockData.notifications],
  users: { ...MockData.users },
  officers: [...MockData.officers],
  departments: [...MockData.departments],
};

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTrackingId(): string {
  const p = 'JST';
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${p}-${t}-${r}`;
}

export const DemoService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const stored = localStorage.getItem('janasetu_current_user');
    if (stored) return JSON.parse(stored);
    return null;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    await delay(800);
    const user = Object.values(store.users).find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    localStorage.setItem('janasetu_current_user', JSON.stringify(user));
    return user;
  },

  async register(data: { email: string; password: string; name: string; phone: string }): Promise<UserProfile> {
    await delay(800);
    const uid = `citizen-${Date.now()}`;
    const user: UserProfile = {
      uid, email: data.email, name: data.name, phone: data.phone,
      role: 'citizen', createdAt: new Date(), updatedAt: new Date(), isVerified: true,
    };
    store.users[uid] = user;
    localStorage.setItem('janasetu_current_user', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('janasetu_current_user');
  },

  async getGrievances(): Promise<typeof store.grievances> {
    await delay(300);
    return store.grievances.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getGrievanceByTrackingId(trackingId: string) {
    await delay(300);
    return store.grievances.find(g => g.trackingId === trackingId) || null;
  },

  async createGrievance(data: {
    citizenId: string; citizenName: string; citizenPhone: string; citizenEmail: string;
    title: string; description: string; category: string; priority: string; department: string;
    location: { address: string; landmark: string; city: string; wardNo: string; district: string; state: string; pincode: string };
  }) {
    await delay(500);
    const trackingId = generateTrackingId();
    const grievance = {
      id: generateId('g'),
      trackingId,
      ...data,
      status: 'submitted' as const,
      assignedTo: undefined as string | undefined,
      assignedToName: undefined as string | undefined,
      attachments: [],
      timeline: [{
        id: generateId('tl'),
        status: 'submitted' as const,
        description: 'Grievance submitted successfully',
        updatedBy: data.citizenId,
        updatedByName: data.citizenName,
        createdAt: new Date(),
        isVisibleToCitizen: true,
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.grievances.push(grievance as any);
    return { id: grievance.id, trackingId };
  },

  async getAnnouncements(): Promise<typeof store.announcements> {
    await delay(300);
    return store.announcements.filter(a => a.isActive).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },

  async getAllAppointments() {
    await delay(300);
    return store.appointments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getAppointmentsByCitizen(citizenId: string) {
    await delay(300);
    return store.appointments.filter(a => a.citizenId === citizenId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getDepartments() {
    await delay(200);
    return store.departments;
  },

  async getOfficers(department?: string) {
    await delay(200);
    if (department) return store.officers.filter(o => o.department === department);
    return store.officers;
  },

  async createAppointment(data: {
    citizenId: string; citizenName: string; citizenPhone: string; citizenEmail: string;
    officerId: string; officerName: string; officerDesignation: string; department: string;
    purpose: string; preferredDate: Date; preferredTimeSlot: string;
  }) {
    await delay(500);
    const appointment = { id: generateId('app'), ...data, status: 'requested' as const, createdAt: new Date(), updatedAt: new Date() };
    store.appointments.push(appointment as any);
    return appointment;
  },

  async getNotifications(userId: string) {
    await delay(300);
    return store.notifications.filter(n => n.userId === userId);
  },

  async getDashboardStats() {
    await delay(300);
    const g = store.grievances;
    return {
      total: g.length,
      pending: g.filter(x => x.status === 'submitted' || x.status === 'under_review').length,
      inProgress: g.filter(x => x.status === 'assigned' || x.status === 'in_progress').length,
      resolved: g.filter(x => x.status === 'resolved' || x.status === 'closed').length,
      rejected: g.filter(x => x.status === 'rejected').length,
      avgResolutionDays: 3.5,
    };
  },
};

export default DemoService;