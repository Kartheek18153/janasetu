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
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Appointment, AppointmentStatus, TimeSlot } from '../types';

const COLLECTION = 'appointments';

function appointmentFromDoc(id: string, data: DocumentData): Appointment {
  return {
    id,
    citizenId: data.citizenId,
    citizenName: data.citizenName,
    citizenPhone: data.citizenPhone,
    citizenEmail: data.citizenEmail,
    officerId: data.officerId,
    officerName: data.officerName,
    officerDesignation: data.officerDesignation,
    department: data.department,
    purpose: data.purpose,
    preferredDate: data.preferredDate?.toDate?.() || data.preferredDate,
    preferredTimeSlot: data.preferredTimeSlot,
    status: data.status,
    scheduledDate: data.scheduledDate?.toDate?.() || data.scheduledDate,
    scheduledTimeSlot: data.scheduledTimeSlot,
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
  };
}

export const AppointmentService = {
  async create(data: {
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
    notes?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      status: 'requested',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAppointmentsByCitizen(citizenId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTION),
      where('citizenId', '==', citizenId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => appointmentFromDoc(doc.id, doc.data()));
  },

  async getAppointmentsByOfficer(officerId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, COLLECTION),
      where('officerId', '==', officerId),
      orderBy('preferredDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => appointmentFromDoc(doc.id, doc.data()));
  },

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, COLLECTION),
      where('preferredDate', '>=', startOfDay),
      where('preferredDate', '<=', endOfDay),
      orderBy('preferredDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => appointmentFromDoc(doc.id, doc.data()));
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => appointmentFromDoc(doc.id, doc.data()));
  },

  async updateStatus(id: string, status: AppointmentStatus, notes?: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (notes !== undefined) updateData.notes = notes;
    await updateDoc(doc(db, COLLECTION, id), updateData);
  },

  async reschedule(id: string, date: Date, timeSlot: TimeSlot): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      preferredDate: date,
      preferredTimeSlot: timeSlot,
      status: 'rescheduled',
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};

export default AppointmentService;