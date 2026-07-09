import { auth } from '../firebase/config';
import { sendEmailVerification } from 'firebase/auth';

export async function sendVerificationCode(toEmail: string, _name: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Uses Firebase Auth's built-in sendEmailVerification (free on Spark plan)
  // User receives an email with a verification link — no API keys exposed
  await sendEmailVerification(user, {
    url: `${import.meta.env['VITE_APP_URL'] || window.location.origin}/login`,
  });
}

export async function sendVerificationCodeSMS(_toPhone: string, _name: string): Promise<boolean> {
  // SMS verification via Firebase Phone Auth (RecaptchaVerifier) - available on Spark plan
  // Implementation requires RecaptchaVerifier widget in the UI
  return false;
}
