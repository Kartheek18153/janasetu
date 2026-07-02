import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  increment,
  DocumentData,
  QueryConstraint,
  startAfter,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import {
  Grievance,
  GrievanceStatus,
  GrievanceCategory,
  GrievancePriority,
  TimelineEvent,
  Feedback,
  FilterOptions,
  PaginatedResponse,
} from '../types';

const COLLECTION = 'grievances';

function generateTrackingId(): string {
  const prefix = 'JST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function grievanceFromDoc(id: string, data: DocumentData): Grievance {
  return {
    id,
    trackingId: data.trackingId,
    citizenId: data.citizenId,
    citizenName: data.citizenName,
    citizenPhone: data.citizenPhone,
    citizenEmail: data.citizenEmail,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: data.status,
    department: data.department,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName,
    location: data.location,
    attachments: data.attachments || [],
    timeline: (data.timeline || []).map((t: DocumentData) => ({
      ...t,
      createdAt: t.createdAt?.toDate?.() || t.createdAt,
    })),
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    resolvedAt: data.resolvedAt?.toDate?.() || data.resolvedAt,
    feedback: data.feedback,
  };
}

export const GrievanceService = {
  async createGrievance(data: {
    citizenId: string;
    citizenName: string;
    citizenPhone: string;
    citizenEmail: string;
    title: string;
    description: string;
    category: GrievanceCategory;
    priority: GrievancePriority;
    department: string;
    location: { address: string; landmark: string; city: string; wardNo: string; district: string; state: string; pincode: string };
    attachments?: { name: string; url: string; type: string; size: number }[];
  }): Promise<{ id: string; trackingId: string }> {
    const trackingId = generateTrackingId();
    const timelineEvent: Omit<TimelineEvent, 'id'> = {
      status: 'submitted',
      description: 'Grievance submitted successfully',
      updatedBy: data.citizenId,
      updatedByName: data.citizenName,
      createdAt: new Date(),
      isVisibleToCitizen: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      trackingId,
      status: 'submitted',
      attachments: data.attachments || [],
      timeline: [{ id: crypto.randomUUID(), ...timelineEvent }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, trackingId };
  },

  async getGrievance(id: string): Promise<Grievance | null> {
    const docRef = await getDoc(doc(db, COLLECTION, id));
    if (!docRef.exists()) return null;
    return grievanceFromDoc(docRef.id, docRef.data());
  },

  async getGrievanceByTrackingId(trackingId: string): Promise<Grievance | null> {
    const q = query(collection(db, COLLECTION), where('trackingId', '==', trackingId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return grievanceFromDoc(doc.id, doc.data());
  },

  async getCitizenGrievances(citizenId: string): Promise<Grievance[]> {
    const q = query(
      collection(db, COLLECTION),
      where('citizenId', '==', citizenId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => grievanceFromDoc(doc.id, doc.data()));
  },

  async getGrievances(options?: {
    filters?: FilterOptions;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Grievance>> {
    const constraints: QueryConstraint[] = [];
    const { filters, page = 1, pageSize = 10 } = options || {};

    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }
    if (filters?.category && filters.category.length > 0) {
      constraints.push(where('category', 'in', filters.category));
    }
    if (filters?.priority && filters.priority.length > 0) {
      constraints.push(where('priority', 'in', filters.priority));
    }
    if (filters?.department && filters.department.length > 0) {
      constraints.push(where('department', 'in', filters.department));
    }

    constraints.push(orderBy('updatedAt', 'desc'));

    const totalSnapshot = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const total = totalSnapshot.size;

    constraints.push(limit(pageSize));
    if (page > 1) {
      const prevSnapshot = await getDocs(
        query(collection(db, COLLECTION), ...constraints.slice(0, -1), limit((page - 1) * pageSize))
      );
      const lastDoc = prevSnapshot.docs[prevSnapshot.docs.length - 1];
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(doc => grievanceFromDoc(doc.id, doc.data())),
      total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  subscribeToGrievances(
    callback: (grievances: Grievance[]) => void,
    filters?: { status?: GrievanceStatus[]; department?: string }
  ): Unsubscribe {
    let constraints: QueryConstraint[] = [];

    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }
    if (filters?.department) {
      constraints.push(where('department', '==', filters.department));
    }

    constraints.push(orderBy('updatedAt', 'desc'));

    const q = query(collection(db, COLLECTION), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const grievances = snapshot.docs.map(doc => grievanceFromDoc(doc.id, doc.data()));
      callback(grievances);
    });
  },

  async updateStatus(
    id: string,
    status: GrievanceStatus,
    description: string,
    updatedBy: string,
    updatedByName: string,
    isVisibleToCitizen: boolean = true
  ): Promise<void> {
    const timelineEvent: Omit<TimelineEvent, 'id'> = {
      status,
      description,
      updatedBy,
      updatedByName,
      createdAt: new Date(),
      isVisibleToCitizen,
    };

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
      [`timeline.${Timestamp.now().toMillis()}`]: { id: crypto.randomUUID(), ...timelineEvent },
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = serverTimestamp();
    }

    await updateDoc(doc(db, COLLECTION, id), updateData);
  },

  async assignGrievance(
    id: string,
    assignedTo: string,
    assignedToName: string,
    updatedBy: string,
    updatedByName: string
  ): Promise<void> {
    await this.updateStatus(id, 'assigned', `Assigned to ${assignedToName}`, updatedBy, updatedByName);
    await updateDoc(doc(db, COLLECTION, id), {
      assignedTo,
      assignedToName,
    });
  },

  async addFeedback(id: string, feedback: Feedback): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      feedback,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteGrievance(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async getDashboardStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    avgResolutionDays: number;
  }> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const grievances = snapshot.docs.map(doc => grievanceFromDoc(doc.id, doc.data()));

    const total = grievances.length;
    const pending = grievances.filter(g => g.status === 'submitted' || g.status === 'under_review').length;
    const inProgress = grievances.filter(g => g.status === 'assigned' || g.status === 'in_progress').length;
    const resolved = grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
    const rejected = grievances.filter(g => g.status === 'rejected').length;

    const resolvedGrievances = grievances.filter(g => g.resolvedAt && g.createdAt);
    const avgResolutionDays = resolvedGrievances.length > 0
      ? resolvedGrievances.reduce((sum, g) => {
          const diff = g.resolvedAt!.getTime() - g.createdAt.getTime();
          return sum + diff / (1000 * 60 * 60 * 24);
        }, 0) / resolvedGrievances.length
      : 0;

    return { total, pending, inProgress, resolved, rejected, avgResolutionDays: Math.round(avgResolutionDays * 10) / 10 };
  },
};

export default GrievanceService;