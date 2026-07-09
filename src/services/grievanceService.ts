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
  startAfter,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Grievance,
  GrievanceCategory,
  GrievancePriority,
  GrievanceStatus,
  TimelineEvent,
  Feedback,
  PaginatedResponse,
  FilterOptions,
} from '../types';
import { generateTrackingId } from './utils';

const COLLECTION = 'grievances';

export function grievanceFromDoc(id: string, data: DocumentData): Grievance {
  return {
    id,
    trackingId: data.trackingId,
    citizenId: data.citizenId,
    citizenName: data.citizenName,
    citizenPhone: data.citizenPhone,
    citizenEmail: data.citizenEmail,
    title: data.title,
    description: data.description,
    category: data.category as GrievanceCategory,
    priority: data.priority as GrievancePriority,
    status: data.status as GrievanceStatus,
    department: data.department,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName,
    location: data.location,
    attachments: data.attachments || [],
    timeline: (data.timeline || []).map((t: DocumentData) => ({
      ...t,
      createdAt: t.createdAt?.toDate?.() || t.createdAt,
    })) as TimelineEvent[],
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
    location: {
      address: string;
      landmark: string;
      city: string;
      wardNo: string;
      district: string;
      state: string;
      pincode: string;
    };
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
      assignedTo: null,
      assignedToName: null,
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
    if (filters?.assignedTo) {
      constraints.push(where('assignedTo', '==', filters.assignedTo));
    }

    constraints.push(orderBy('updatedAt', 'desc'));

    // Get total count
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

  async updateGrievance(id: string, data: Partial<Grievance> & { timelineEvent?: Omit<TimelineEvent, 'id'> }): Promise<void> {
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.timeline;
    delete updateData.resolvedAt;
    delete updateData.timelineEvent;

    if (data.timelineEvent) {
      const grievanceSnap = await getDoc(doc(db, COLLECTION, id));
      if (grievanceSnap.exists()) {
        const existingTimeline = (grievanceSnap.data().timeline || []) as TimelineEvent[];
        updateData.timeline = [...existingTimeline, { id: crypto.randomUUID(), ...data.timelineEvent }];
      }
    }

    if (data.status === 'resolved' || data.status === 'closed') {
      updateData.resolvedAt = serverTimestamp();
    }

    await updateDoc(doc(db, COLLECTION, id), updateData);
  },

  async assignGrievance(grievanceId: string, officerId: string, officerName: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, grievanceId), {
      assignedTo: officerId,
      assignedToName: officerName,
      status: 'assigned',
      updatedAt: serverTimestamp(),
      timeline: arrayUnion({
        id: crypto.randomUUID(),
        status: 'assigned',
        description: `Assigned to ${officerName}`,
        updatedBy: officerId,
        updatedByName: officerName,
        createdAt: new Date(),
        isVisibleToCitizen: true,
      }),
    });
  },

  async addFeedback(grievanceId: string, feedback: Feedback): Promise<void> {
    await updateDoc(doc(db, COLLECTION, grievanceId), {
      feedback,
      status: 'closed',
      updatedAt: serverTimestamp(),
    });
  },

  async deleteGrievance(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  subscribeToGrievances(
    callback: (grievances: Grievance[]) => void,
    filters?: { status?: GrievanceStatus[]; department?: string; citizenId?: string }
  ): () => void {
    let constraints: QueryConstraint[] = [];

    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }
    if (filters?.department) {
      constraints.push(where('department', '==', filters.department));
    }
    if (filters?.citizenId) {
      constraints.push(where('citizenId', '==', filters.citizenId));
    }

    constraints.push(orderBy('updatedAt', 'desc'));

    const q = query(collection(db, COLLECTION), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const grievances = snapshot.docs.map(doc => grievanceFromDoc(doc.id, doc.data()));
      callback(grievances);
    });
  },
};

export default GrievanceService;