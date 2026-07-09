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
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { UserProfile } from '../types';
import { generateRegistrationId } from './utils';

const EMAILJS_PUBLIC_KEY = import.meta.env['VITE_EMAILJS_PUBLIC_KEY'] || '';
const EMAILJS_SERVICE_ID = import.meta.env['VITE_EMAILJS_SERVICE_ID'] || '';
const EMAILJS_TEMPLATE_ID = import.meta.env['VITE_EMAILJS_TEMPLATE_ID'] || '';

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export const AuthService = {
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

    if (docSnap.exists()) {
      return userProfileFromDoc(docSnap.id, docSnap.data());
    }

    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      name: cred.user.displayName || email.split('@')[0],
      phone: '',
      role: 'citizen',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      nationality: 'citizen',
      registrationId: generateRegistrationId(),
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
      uid: cred.user.uid,
      email: cred.user.email || '',
      name: cred.user.displayName || 'User',
      phone: cred.user.phoneNumber || '',
      role: 'citizen',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      nationality: 'citizen',
      registrationId: generateRegistrationId(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async register(data: { email: string; password: string; name: string; phone?: string }): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });

    const profile: UserProfile = {
      uid: cred.user.uid,
      email: data.email,
      name: data.name,
      phone: data.phone || '',
      role: 'citizen',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      nationality: 'citizen',
      registrationId: generateRegistrationId(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  },

  async getEmailVerified(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.data()?.isVerified ?? false;
  },

  async sendVerificationCode(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await updateDoc(doc(db, 'users', user.uid), {
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
      updatedAt: serverTimestamp(),
    });

    if (EMAILJS_PUBLIC_KEY) {
      const templateParams = {
        email: user.email || '',
        passcode: code,
      };

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY,
        );
      } catch (err) {
        console.warn('EmailJS SDK failed, trying REST API:', err);
        try {
          const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: EMAILJS_SERVICE_ID,
              template_id: EMAILJS_TEMPLATE_ID,
              user_id: EMAILJS_PUBLIC_KEY,
              template_params: templateParams,
            }),
          });
          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`EmailJS API error ${resp.status}: ${text}`);
          }
        } catch (apiErr) {
          console.error('EmailJS REST API also failed:', apiErr);
          throw new Error('Failed to send verification email. Please check EmailJS configuration.');
        }
      }
    } else {
      console.info('EmailJS not configured; verification code stored in Firestore');
    }

    return code;
  },

  async verifyEmailCode(code: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.data();
    if (!data) return false;

    const storedCode = data.emailVerificationCode;
    const expiresAt = data.emailVerificationExpires;

    if (!storedCode || !expiresAt) return false;
    if (Date.now() > expiresAt) return false;
    if (storedCode !== code) return false;

    await updateDoc(doc(db, 'users', user.uid), {
      isVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
      updatedAt: serverTimestamp(),
    });

    return true;
  },

  async checkEmailVerifiedAndSync(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload();
    if (user.emailVerified) {
      await updateDoc(doc(db, 'users', user.uid), {
        isVerified: true,
        updatedAt: serverTimestamp(),
      });
      return true;
    }
    return false;
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Not authenticated');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  },

  // Verification via Firebase Auth built-in (free on Spark plan)
  // The user receives an email with a verification link from Firebase.
  // After clicking it, emailVerified becomes true.
  // We sync this to Firestore via checkEmailVerifiedAndSync().
  generateVerificationCode(_uid: string): Promise<string> {
    throw new Error('Use sendVerificationCode() instead');
  },

  generatePhoneVerificationCode(_uid: string): Promise<string> {
    throw new Error('Phone verification via Firebase Phone Auth (RecaptchaVerifier) - available on Spark plan');
  },

  verifyPhoneCode(_uid: string, _code: string): Promise<boolean> {
    throw new Error('Phone verification via Firebase Phone Auth');
  },

  async checkNameExists(name: string): Promise<boolean> {
    const { query, collection, getDocs, where } = await import('firebase/firestore');
    const q = query(collection(db, 'users'), where('name', '==', name));
    const snap = await getDocs(q);
    return !snap.empty;
  },

  async lookupRegistrationId(email: string): Promise<string | null> {
    const { query, collection, getDocs, where } = await import('firebase/firestore');
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data()?.registrationId || null;
  },

  async isPhoneVerified(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.data()?.isPhoneVerified ?? false;
  },
};

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
    isPhoneVerified: data.isPhoneVerified ?? false,
    registrationId: data.registrationId,
    gender: data.gender,
    nationality: data.nationality,
    address: data.address,
    city: data.city,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    language: data.language,
    notificationChannel: data.notificationChannel,
    grievanceUpdates: data.grievanceUpdates ?? true,
    appointmentReminders: data.appointmentReminders ?? true,
    announcementAlerts: data.announcementAlerts ?? false,
  };
}

export default AuthService;
