import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Department, Officer, TimeSlot } from '../types';

const COLLECTION = 'departments';
const OFFICERS_COLLECTION = 'officers';

function departmentFromDoc(id: string, data: DocumentData): Department {
  return {
    id,
    name: data.name,
    code: data.code,
    description: data.description,
    categories: data.categories || [],
    officers: data.officers || [],
    headOfficerId: data.headOfficerId,
  };
}

function officerFromDoc(id: string, data: DocumentData): Officer {
  return {
    id,
    name: data.name,
    designation: data.designation,
    department: data.department,
    email: data.email,
    phone: data.phone,
    availableSlots: data.availableSlots || [],
    isActive: data.isActive ?? true,
    maxAppointmentsPerDay: data.maxAppointmentsPerDay || 10,
  };
}

export const DepartmentService = {
  async getDepartments(): Promise<Department[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => departmentFromDoc(doc.id, doc.data()));
  },

  async getDepartment(id: string): Promise<Department | null> {
    const docRef = await getDoc(doc(db, COLLECTION, id));
    if (!docRef.exists()) return null;
    return departmentFromDoc(docRef.id, docRef.data());
  },

  async getDepartmentByCode(code: string): Promise<Department | null> {
    const q = query(collection(db, COLLECTION), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return departmentFromDoc(snapshot.docs[0].id, snapshot.docs[0].data());
  },

  async getOfficers(department?: string): Promise<Officer[]> {
    let constraints = [where('isActive', '==', true)];
    if (department) {
      constraints.push(where('department', '==', department));
    }
    const q = query(collection(db, OFFICERS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => officerFromDoc(doc.id, doc.data()));
  },

  async getAvailableOfficers(department: string, date: Date, timeSlot: TimeSlot): Promise<Officer[]> {
    const officers = await this.getOfficers(department);
    return officers.filter(o => o.isActive && o.availableSlots.includes(timeSlot));
  },

  async addOfficer(data: Omit<Officer, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, OFFICERS_COLLECTION), data);
    return docRef.id;
  },

  async updateOfficer(id: string, data: Partial<Officer>): Promise<void> {
    await updateDoc(doc(db, OFFICERS_COLLECTION, id), data);
  },

  async updateOfficerSlots(id: string, slots: TimeSlot[]): Promise<void> {
    await updateDoc(doc(db, OFFICERS_COLLECTION, id), { availableSlots: slots });
  },
};

export default DepartmentService;