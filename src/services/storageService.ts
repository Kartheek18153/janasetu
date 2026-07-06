import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

export async function uploadDocument(userId: string, docType: string, file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `documents/${userId}/${docType}/${fileName}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  const docRef = doc(collection(db, 'documents'));
  await setDoc(docRef, {
    id: docRef.id, userId, docType, fileName, url, uploadedAt: new Date(),
  });
  return url;
}

export async function getUserDocuments(userId: string): Promise<any[]> {
  const q = query(collection(db, 'documents'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteDocument(docId: string, storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, 'documents', docId));
}
