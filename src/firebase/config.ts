import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
  measurementId: import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'],
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
const configComplete = requiredKeys.every(key => firebaseConfig[key]);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let functions: Functions | undefined;
let analytics: Analytics | null = null;

if (configComplete) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  db = getFirestore(app);

  storage = getStorage(app);
  functions = getFunctions(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app as FirebaseApp);
      }
    });
  }

  if (import.meta.env.DEV && import.meta.env['VITE_USE_EMULATORS'] === 'true') {
    connectAuthEmulator(auth as Auth, 'http://localhost:9099');
    connectFirestoreEmulator(db as Firestore, 'localhost', 8080);
    connectStorageEmulator(storage as FirebaseStorage, 'localhost', 9199);
    connectFunctionsEmulator(functions as Functions, 'localhost', 5001);
  }
} else {
  console.warn(
    'Firebase not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
    'VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, ' +
    'and VITE_FIREBASE_APP_ID in your .env file. See .env.example for details.'
  );
}

export { auth, db, storage, functions, analytics };
export default app;
