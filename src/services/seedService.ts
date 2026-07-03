import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { setDoc, doc } from 'firebase/firestore';

const SEED_KEY = 'janasetu_seeded_v3';

const departments = [
  { name: 'Water Supply & Sanitation', code: 'WSS', description: 'Handles water supply, drainage, and sanitation issues', categories: ['water_supply', 'sanitation'] },
  { name: 'Electricity Board', code: 'EB', description: 'Manages power supply and electrical infrastructure', categories: ['electricity'] },
  { name: 'Public Works Department', code: 'PWD', description: 'Handles roads, bridges, and public infrastructure', categories: ['roads'] },
  { name: 'Health Department', code: 'HLTH', description: 'Manages healthcare services and facilities', categories: ['healthcare'] },
  { name: 'Revenue Department', code: 'REV', description: 'Handles land records, property tax, and revenue matters', categories: ['revenue'] },
  { name: 'Education Department', code: 'EDU', description: 'Manages educational institutions and services', categories: ['education'] },
  { name: 'Social Welfare Department', code: 'SWD', description: 'Handles social welfare schemes and benefits', categories: ['social_welfare', 'public_distribution'] },
];

const officers = [
  { name: 'Rajesh Kumar', designation: 'District Magistrate', department: 'Revenue Department', email: 'rajesh.kumar@gov.in', phone: '9876543210', availableSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00'], isActive: true, maxAppointmentsPerDay: 8 },
  { name: 'Priya Sharma', designation: 'Chief Engineer', department: 'Public Works Department', email: 'priya.sharma@gov.in', phone: '9876543211', availableSlots: ['10:00-11:00', '11:00-12:00', '15:00-16:00'], isActive: true, maxAppointmentsPerDay: 6 },
  { name: 'Amit Patel', designation: 'Executive Engineer', department: 'Water Supply & Sanitation', email: 'amit.patel@gov.in', phone: '9876543212', availableSlots: ['09:00-10:00', '14:00-15:00', '15:00-16:00'], isActive: true, maxAppointmentsPerDay: 6 },
  { name: 'Sunita Verma', designation: 'Chief Medical Officer', department: 'Health Department', email: 'sunita.verma@gov.in', phone: '9876543213', availableSlots: ['10:00-11:00', '11:00-12:00', '14:00-15:00'], isActive: true, maxAppointmentsPerDay: 10 },
  { name: 'Vikram Singh', designation: 'Superintendent Engineer', department: 'Electricity Board', email: 'vikram.singh@gov.in', phone: '9876543214', availableSlots: ['09:00-10:00', '10:00-11:00', '16:00-17:00'], isActive: true, maxAppointmentsPerDay: 6 },
];

const sampleAnnouncements = [
  { title: 'New Ayushman Bharat Scheme Enrollment Drive', content: 'The district administration is organizing a special enrollment drive for Ayushman Bharat health insurance scheme. Eligible citizens can register at their nearest Common Service Centre (CSC).', type: 'scheme', priority: 'high', targetAudience: 'all' },
  { title: 'Office Holiday - Festival of Eid', content: 'The District Collectorate will remain closed on 10th July on account of Eid-ul-Adha. All citizen services will resume on 11th July.', type: 'holiday', priority: 'medium', targetAudience: 'all' },
  { title: 'Emergency: Heavy Rainfall Alert', content: 'IMD has issued a red alert for heavy rainfall. Citizens in low-lying areas are advised to move to safer locations. Emergency control room: 1070.', type: 'emergency', priority: 'critical', targetAudience: 'all' },
];

async function ensureUserDoc(email: string, password: string, profile: any) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: profile.name });
    await setDoc(doc(db, 'users', cred.user.uid), { ...profile, uid: cred.user.uid });
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { ...profile, uid: cred.user.uid, updatedAt: new Date() }, { merge: true });
    } else {
      throw e;
    }
  }
}

export async function seedFirebase() {
  localStorage.removeItem('janasetu_seeded_v1');
  const seeded = localStorage.getItem(SEED_KEY);
  if (seeded) return;

  try {
    await ensureUserDoc('admin@janasetu.gov.in', 'admin123', {
      email: 'admin@janasetu.gov.in', name: 'Admin Officer',
      phone: '9876543299', role: 'admin', department: 'Collectorate',
      designation: 'Administrative Officer', createdAt: new Date(), updatedAt: new Date(), isVerified: true,
    });

    await ensureUserDoc('ravi@example.com', 'demo123', {
      email: 'ravi@example.com', name: 'Ravi Sharma',
      phone: '9876543200', role: 'citizen', createdAt: new Date(), updatedAt: new Date(), isVerified: true,
    });

    for (const dept of departments) {
      const existing = await getDocs(query(collection(db, 'departments'), where('code', '==', dept.code)));
      if (existing.empty) {
        await addDoc(collection(db, 'departments'), dept);
      }
    }

    for (const off of officers) {
      const existing = await getDocs(query(collection(db, 'officers'), where('email', '==', off.email)));
      if (existing.empty) {
        await addDoc(collection(db, 'officers'), off);
      }
    }

    for (const ann of sampleAnnouncements) {
      await addDoc(collection(db, 'announcements'), {
        ...ann,
        publishedBy: 'admin',
        publishedByName: 'Collector Office',
        publishedAt: serverTimestamp(),
        isActive: true,
        attachments: [],
      });
    }

    localStorage.setItem(SEED_KEY, 'true');
    await signOut(auth);
  } catch (err) {
    console.error('Seed error:', err);
  }
}

export async function clearUsers() {
  const snap = await getDocs(collection(db, 'users'));
  const promises = snap.docs.map(d => deleteDoc(doc(db, 'users', d.id)));
  await Promise.all(promises);
  localStorage.removeItem(SEED_KEY);
  console.log(`Deleted ${snap.size} user documents`);
}

export default seedFirebase;