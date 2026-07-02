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
  serverTimestamp,
  Timestamp,
  DocumentData,
  startAfter,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import {
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  PaginatedResponse,
} from '../types';

const COLLECTION = 'announcements';

function announcementFromDoc(id: string, data: DocumentData): Announcement {
  return {
    id,
    title: data.title,
    content: data.content,
    type: data.type,
    priority: data.priority,
    publishedBy: data.publishedBy,
    publishedByName: data.publishedByName,
    publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
    expiresAt: data.expiresAt?.toDate?.() || data.expiresAt,
    isActive: data.isActive ?? true,
    targetAudience: data.targetAudience || 'all',
    department: data.department,
    attachments: data.attachments || [],
  };
}

export const AnnouncementService = {
  async create(data: {
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    publishedBy: string;
    publishedByName: string;
    expiresAt?: Date;
    targetAudience?: 'all' | 'citizens' | 'officers' | 'specific_department';
    department?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      isActive: true,
      attachments: [],
      publishedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAnnouncement(id: string): Promise<Announcement | null> {
    const docRef = await getDoc(doc(db, COLLECTION, id));
    if (!docRef.exists()) return null;
    return announcementFromDoc(docRef.id, docRef.data());
  },

  async getAnnouncements(options?: {
    type?: AnnouncementType;
    priority?: AnnouncementPriority;
    active?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Announcement>> {
    const constraints = [];
    const { type, priority, active = true, page = 1, pageSize = 10 } = options || {};

    if (active) {
      constraints.push(where('isActive', '==', true));
    }
    if (type) {
      constraints.push(where('type', '==', type));
    }
    if (priority) {
      constraints.push(where('priority', '==', priority));
    }

    constraints.push(orderBy('publishedAt', 'desc'));

    const totalSnapshot = await getDocs(query(collection(db, COLLECTION), ...constraints));
    const total = totalSnapshot.size;

    constraints.push(limit(pageSize));
    if (page > 1) {
      const prevSnapshot = await getDocs(
        query(collection(db, COLLECTION), ...constraints.slice(0, -1), limit((page - 1) * pageSize))
      );
      const lastDoc = prevSnapshot.docs[prevSnapshot.docs.length - 1];
      if (lastDoc) constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(doc => announcementFromDoc(doc.id, doc.data())),
      total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  subscribeToAnnouncements(callback: (announcements: Announcement[]) => void): Unsubscribe {
    const q = query(collection(db, COLLECTION), where('isActive', '==', true), orderBy('publishedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => announcementFromDoc(doc.id, doc.data())));
    });
  },

  async update(id: string, data: Partial<Announcement>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async deactivate(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { isActive: false });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};

export default AnnouncementService;