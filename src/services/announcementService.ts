import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Announcement, AnnouncementType, AnnouncementPriority } from '../types';

const COLLECTION = 'announcements';

function announcementFromDoc(id: string, data: DocumentData): Announcement {
  return {
    id,
    title: data.title,
    content: data.content,
    type: data.type as AnnouncementType,
    priority: data.priority as AnnouncementPriority,
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
    targetAudience: 'all' | 'citizens' | 'officers' | 'specific_department';
    department?: string;
    expiresAt?: Date;
    attachments?: { name: string; url: string; type: string; size: number }[];
  }): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      isActive: true,
      publishedAt: serverTimestamp(),
      attachments: data.attachments || [],
    });
    return docRef.id;
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const q = query(
      collection(db, COLLECTION),
      where('isActive', '==', true),
      orderBy('publishedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => announcementFromDoc(d.id, d.data()));
  },

  async getAllAnnouncements(): Promise<Announcement[]> {
    const q = query(collection(db, COLLECTION), orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => announcementFromDoc(d.id, d.data()));
  },

  async getAnnouncement(id: string): Promise<Announcement | null> {
    const docRef = await getDoc(doc(db, COLLECTION, id));
    if (!docRef.exists()) return null;
    return announcementFromDoc(docRef.id, docRef.data());
  },

  async update(id: string, data: Partial<Announcement>): Promise<void> {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.publishedAt;
    await updateDoc(doc(db, COLLECTION, id), updateData);
  },

  async delete(id: string): Promise<void> {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { isActive, updatedAt: serverTimestamp() });
  },
};

export default AnnouncementService;