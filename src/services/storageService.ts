import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '../firebase/config';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  path: string;
}

export interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  folder: 'grievances',
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export async function uploadFile(
  file: File,
  userId: string,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate file size
  if (file.size > opts.maxSizeMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${opts.maxSizeMB}MB limit`);
  }

  // Validate file type
  if (!opts.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Generate unique path
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || '';
  const fileName = `${timestamp}-${random}.${extension}`;
  const path = `${opts.folder}/${userId}/${fileName}`;

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    name: file.name,
    url,
    type: file.type,
    size: file.size,
    path,
  };
}

export async function uploadFiles(
  files: File[],
  userId: string,
  options: UploadOptions = {}
): Promise<UploadedFile[]> {
  const uploads = files.map(file => uploadFile(file, userId, options));
  return Promise.all(uploads);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function deleteFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => deleteFile(path)));
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

// Document management (existing functionality)
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