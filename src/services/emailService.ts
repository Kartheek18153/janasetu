const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;

export async function sendVerificationCodeEmail(toEmail: string, code: string, name: string): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS not configured. Set VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID, and VITE_EMAILJS_TEMPLATE_ID in .env');
  }
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_email: toEmail,
        email: toEmail,
        to_name: name,
        user_email: toEmail,
        user_name: name,
        from_name: 'JanaSetu',
        passcode: code,
        code: code,
        verification_code: code,
        time: '5 minutes',
        message: `Your JanaSetu email verification code is: ${code}. This code expires in 5 minutes.`,
        subject: 'JanaSetu - Email Verification Code',
      },
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `EmailJS error (status ${response.status})`);
  }
}
