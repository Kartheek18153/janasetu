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
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Scheme, SchemeApplication, SocialCategory } from '../types';
import { schemeData } from './schemeData';

const SCHEMES_COLLECTION = 'schemes';
const APPLICATIONS_COLLECTION = 'schemeApplications';

function schemeApplicationFromDoc(id: string, data: DocumentData): SchemeApplication {
  return {
    id,
    userId: data.userId,
    schemeId: data.schemeId,
    schemeName: data.schemeName,
    status: data.status,
    submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    timeline: (data.timeline || []).map((t: DocumentData) => ({
      ...t,
      date: t.date?.toDate?.() || t.date,
    })),
  };
}

export const SchemeService = {
  getAllSchemes(): Scheme[] {
    return schemeData;
  },

  getSchemesByScope(scope: 'central' | 'state'): Scheme[] {
    return schemeData.filter(s => s.scope === scope);
  },

  getSchemeById(id: string): Scheme | undefined {
    return schemeData.find(s => s.id === id);
  },

  getActiveSchemes(): Scheme[] {
    return schemeData.filter(s => s.active);
  },

  async applyForScheme(userId: string, schemeId: string, schemeName: string): Promise<string> {
    const now = new Date();
    const app: Omit<SchemeApplication, 'id'> = {
      userId,
      schemeId,
      schemeName,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      timeline: [{ status: 'submitted', description: 'Application submitted successfully', date: now }],
    };
    const ref = await addDoc(collection(db, APPLICATIONS_COLLECTION), app);
    await updateDoc(ref, { id: ref.id });
    return ref.id;
  },

  async getUserSchemeApplications(userId: string): Promise<SchemeApplication[]> {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => schemeApplicationFromDoc(d.id, d.data()));
  },

  async getAllSchemeApplications(): Promise<SchemeApplication[]> {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => schemeApplicationFromDoc(d.id, d.data()));
  },

  async updateApplicationStatus(
    applicationId: string,
    status: SchemeApplication['status'],
    notes?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
    if (notes) updateData.notes = notes;

    const { getDoc } = await import('firebase/firestore');
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      const existingTimeline = (appSnap.data().timeline || []) as SchemeApplication['timeline'];
      updateData.timeline = [
        ...existingTimeline,
        { status, description: notes || `Status updated to ${status}`, date: new Date() }
      ];
    }
    await updateDoc(appRef, updateData);
  },

  matchSchemes(profile: {
    age: number;
    annualIncome: number;
    state: string;
    category: SocialCategory;
    occupation: string;
    gender: string;
  }): { scheme: Scheme; score: number; matches: string[] }[] {
    const results: { scheme: Scheme; score: number; matches: string[] }[] = [];

    for (const scheme of schemeData) {
      if (!scheme.active) continue;
      const matches: string[] = [];
      const el = scheme.eligibility;
      let eligible = true;

      if (el.minAge !== undefined && profile.age < el.minAge) eligible = false;
      if (el.maxAge !== undefined && profile.age > el.maxAge) eligible = false;
      if (el.maxAnnualIncome !== undefined && profile.annualIncome > el.maxAnnualIncome) eligible = false;
      if (el.states && el.states.length > 0 && !el.states.includes(profile.state)) eligible = false;
      if (el.categories && el.categories.length > 0 && !el.categories.includes(profile.category)) eligible = false;
      if (el.occupation && !profile.occupation.toLowerCase().includes(el.occupation.toLowerCase())) eligible = false;
      if (el.gender && profile.gender !== el.gender) eligible = false;

      if (!eligible) continue;

      if (el.minAge !== undefined && profile.age >= el.minAge) matches.push('Age minimum met');
      if (el.maxAge !== undefined && profile.age <= el.maxAge) matches.push('Age maximum met');
      if (el.maxAnnualIncome !== undefined && profile.annualIncome <= el.maxAnnualIncome) matches.push('Income criteria met');
      if (el.states && el.states.length > 0 && el.states.includes(profile.state)) matches.push('State eligible');
      if (el.categories && el.categories.length > 0 && el.categories.includes(profile.category)) matches.push('Category eligible');
      if (el.occupation && profile.occupation.toLowerCase().includes(el.occupation.toLowerCase())) matches.push('Occupation matches');
      if (el.gender && profile.gender === el.gender) matches.push('Gender criteria met');

      const criteria = [
        el.minAge !== undefined,
        el.maxAge !== undefined,
        el.maxAnnualIncome !== undefined,
        (el.states?.length || 0) > 0,
        (el.categories?.length || 0) > 0,
        !!el.occupation,
        !!el.gender,
      ];
      const totalCriteria = criteria.filter(Boolean).length;
      const score = totalCriteria > 0 ? Math.round((matches.length / totalCriteria) * 100) : 100;

      results.push({ scheme, score, matches });
    }

    return results.sort((a, b) => b.score - a.score);
  },
};

export default SchemeService;