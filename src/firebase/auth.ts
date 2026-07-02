import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { UserRole, UserProfile } from '../types';

export const AuthService = {
  async init(): Promise<void> {
    await setPersistence(auth, browserLocalPersistence);
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  async registerCitizen(email: string, password: string, name: string, phone: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await sendEmailVerification(userCredential.user);

    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      name,
      phone,
      role: 'citizen',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    return userCredential;
  },

  async registerAdmin(email: string, password: string, name: string, department: string, designation: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      name,
      phone: '',
      role: 'admin',
      department,
      designation,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    return userCredential;
  },

  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async getAdminsByDepartment(department: string): Promise<UserProfile[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'admin'),
      where('department', '==', department)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};

export default AuthService;