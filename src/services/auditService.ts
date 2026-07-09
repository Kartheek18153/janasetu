import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export type AuditAction =
  | 'user.login'
  | 'user.register'
  | 'user.logout'
  | 'user.verify_email'
  | 'user.verify_phone'
  | 'user.update_profile'
  | 'grievance.create'
  | 'grievance.update'
  | 'grievance.assign'
  | 'grievance.delete'
  | 'appointment.create'
  | 'appointment.update'
  | 'appointment.cancel'
  | 'announcement.create'
  | 'announcement.update'
  | 'announcement.delete'
  | 'officer.create'
  | 'officer.update'
  | 'officer.delete'
  | 'scheme.apply'
  | 'admin.action';

export async function logAuditEvent(params: {
  action: AuditAction;
  actorId: string;
  actorRole: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...params,
      timestamp: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  } catch {
    // Audit logging failures should not break the app
  }
}

export const AuditService = { log: logAuditEvent };
export default AuditService;
