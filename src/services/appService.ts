import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, Timestamp, serverTimestamp, deleteField } from 'firebase/firestore';
import {
  UserProfile, Grievance, Announcement, Appointment, Officer, Department, Notification,
  GrievanceCategory, GrievancePriority, TimeSlot,
} from '../types';

function userProfileFromDoc(id: string, data: any): UserProfile {
  return {
    uid: id,
    email: data.email,
    name: data.name,
    phone: data.phone || '',
    role: data.role || 'citizen',
    department: data.department,
    designation: data.designation,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
    isVerified: data.isVerified ?? false,
  };
}

function grievanceFromDoc(id: string, data: any): Grievance {
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
    timeline: (data.timeline || []).map((t: any) => ({
      ...t,
      createdAt: t.createdAt?.toDate?.() || t.createdAt,
    })),
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    resolvedAt: data.resolvedAt?.toDate?.() || data.resolvedAt,
    feedback: data.feedback,
  };
}

export const AppService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (!docSnap.exists()) return null;
    return userProfileFromDoc(docSnap.id, docSnap.data());
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
    const expectedRole = email.includes('@janasetu.gov.in') ? 'admin' : 'citizen';

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.role !== expectedRole) {
        await updateDoc(doc(db, 'users', cred.user.uid), { role: expectedRole, updatedAt: serverTimestamp() });
        data.role = expectedRole;
      }
      return userProfileFromDoc(docSnap.id, data);
    }

    const profile: UserProfile = {
      uid: cred.user.uid, email, name: cred.user.displayName || email.split('@')[0],
      phone: '', role: expectedRole, createdAt: new Date(), updatedAt: new Date(), isVerified: true,
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    let docSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (docSnap.exists()) return userProfileFromDoc(docSnap.id, docSnap.data());

    const profile: UserProfile = {
      uid: cred.user.uid, email: cred.user.email || '',
      name: cred.user.displayName || 'User', phone: cred.user.phoneNumber || '',
      role: 'citizen', createdAt: new Date(), updatedAt: new Date(), isVerified: true,
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async register(data: { email: string; password: string; name: string; phone: string }): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });

    const profile: UserProfile = {
      uid: cred.user.uid,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: 'citizen',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
    };

    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getGrievances(): Promise<Grievance[]> {
    const q = query(collection(db, 'grievances'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => grievanceFromDoc(d.id, d.data()));
  },

  async getGrievanceByTrackingId(trackingId: string): Promise<Grievance | null> {
    const q = query(collection(db, 'grievances'), where('trackingId', '==', trackingId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return grievanceFromDoc(snap.docs[0].id, snap.docs[0].data());
  },

  async createGrievance(data: {
    citizenId: string; citizenName: string; citizenPhone: string; citizenEmail: string;
    title: string; description: string; category: string; priority: string; department: string;
    location: { address: string; landmark: string; city: string; wardNo: string; district: string; state: string; pincode: string };
  }): Promise<{ id: string; trackingId: string }> {
    const prefix = 'JST';
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingId = `${prefix}-${ts}-${rand}`;

    const { location, ...rest } = data;
    const docRef = await addDoc(collection(db, 'grievances'), {
      ...rest,
      ...(location ? { location } : {}),
      trackingId,
      status: 'submitted',
      assignedTo: null,
      assignedToName: null,
      attachments: [],
      timeline: [{
        id: crypto.randomUUID(),
        status: 'submitted',
        description: 'Grievance submitted successfully',
        updatedBy: data.citizenId,
        updatedByName: data.citizenName,
        createdAt: new Date(),
        isVisibleToCitizen: true,
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, trackingId };
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const result = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
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
      } as Announcement;
    });
    return result.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
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
      } as Appointment;
    });
  },

  async getAppointmentsByCitizen(citizenId: string): Promise<Appointment[]> {
    const q = query(
      collection(db, 'appointments'),
      where('citizenId', '==', citizenId)
    );
    const snap = await getDocs(q);
    const apps = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id, citizenId: data.citizenId, citizenName: data.citizenName,
        citizenPhone: data.citizenPhone, citizenEmail: data.citizenEmail,
        officerId: data.officerId, officerName: data.officerName,
        officerDesignation: data.officerDesignation, department: data.department,
        purpose: data.purpose,
        preferredDate: data.preferredDate?.toDate?.() || data.preferredDate,
        preferredTimeSlot: data.preferredTimeSlot, status: data.status,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Appointment;
    });
    return apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDepartments(): Promise<Department[]> {
    const snap = await getDocs(collection(db, 'departments'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Department));
  },

  async getOfficers(department?: string): Promise<Officer[]> {
    let q;
    if (department) {
      q = query(collection(db, 'officers'), where('department', '==', department));
    } else {
      q = query(collection(db, 'officers'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Officer));
  },

  async createAppointment(data: {
    citizenId: string; citizenName: string; citizenPhone: string; citizenEmail: string;
    officerId: string; officerName: string; officerDesignation: string; department: string;
    purpose: string; preferredDate: Date; preferredTimeSlot: string;
  }): Promise<any> {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      preferredDate: Timestamp.fromDate(data.preferredDate),
      status: 'requested',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data, status: 'requested', createdAt: new Date(), updatedAt: new Date() };
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id, userId: data.userId, title: data.title, message: data.message,
        type: data.type, isRead: data.isRead ?? false,
        relatedEntityType: data.relatedEntityType, relatedEntityId: data.relatedEntityId,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      } as Notification;
    });
  },

  async getDashboardStats(): Promise<{
    total: number; pending: number; inProgress: number; resolved: number;
    rejected: number; avgResolutionDays: number;
  }> {
    const snap = await getDocs(collection(db, 'grievances'));
    const all = snap.docs.map(d => grievanceFromDoc(d.id, d.data()));
    return {
      total: all.length,
      pending: all.filter(g => g.status === 'submitted' || g.status === 'under_review').length,
      inProgress: all.filter(g => g.status === 'assigned' || g.status === 'in_progress').length,
      resolved: all.filter(g => g.status === 'resolved' || g.status === 'closed').length,
      rejected: all.filter(g => g.status === 'rejected').length,
      avgResolutionDays: 3.5,
    };
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  },

  async getEmailVerified(): Promise<boolean> {
    return auth.currentUser?.emailVerified ?? false;
  },

  async sendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  async updateAppointmentStatus(id: string, status: string): Promise<void> {
    await updateDoc(doc(db, 'appointments', id), { status, updatedAt: serverTimestamp() });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Not authenticated');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  },

  async generateVerificationCode(uid: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await updateDoc(doc(db, 'users', uid), {
      verificationCode: code,
      verificationCodeExpiresAt: expiresAt,
    });
    return code;
  },

  async verifyEmailCode(uid: string, code: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false;
    const data = snap.data();
    if (!data.verificationCode || !data.verificationCodeExpiresAt) return false;
    const expiresAt = data.verificationCodeExpiresAt?.toDate?.() || data.verificationCodeExpiresAt;
    if (new Date() > new Date(expiresAt)) return false;
    if (data.verificationCode !== code) return false;
    await updateDoc(doc(db, 'users', uid), {
      verificationCode: deleteField(),
      verificationCodeExpiresAt: deleteField(),
      isVerified: true,
    });
    return true;
  },

  async isEmailVerified(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    if (user.emailVerified) return true;
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.data()?.isVerified ?? false;
  },
};

export default AppService;