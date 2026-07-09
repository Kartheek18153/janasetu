import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Notification } from '../types';

const COLLECTION = 'notifications';

function notificationFromDoc(id: string, data: DocumentData): Notification {
  return {
    id,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    isRead: data.isRead ?? false,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
  };
}

export const NotificationService = {
  async create(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getNotifications(userId: string, pageSize = 20): Promise<Notification[]> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => notificationFromDoc(d.id, d.data()));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    return snap.size;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, notificationId), { isRead: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
    await batch.commit();
  },

  async delete(notificationId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, notificationId));
  },

  async subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): Promise<() => void> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const { onSnapshot } = await import('firebase/firestore');
    return onSnapshot(q, (snapshot: { docs: any[] }) => {
      const notifications = snapshot.docs.map(doc => notificationFromDoc(doc.id, doc.data()));
      callback(notifications);
    });
  },
};

export default NotificationService;