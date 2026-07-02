import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  Unsubscribe,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from './config';
import { Notification, NotificationType } from '../types';

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
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedEntityType?: 'grievance' | 'appointment' | 'announcement';
    relatedEntityId?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => notificationFromDoc(doc.id, doc.data()));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      where('isRead', '==', false)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => notificationFromDoc(doc.id, doc.data())));
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, notificationId), { isRead: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => this.markAsRead(n.id)));
  },

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const q = query(collection(db, COLLECTION), where('createdAt', '<', cutoff));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => updateDoc(doc(db, COLLECTION, d.id), { isRead: true })));
  },
};

export default NotificationService;