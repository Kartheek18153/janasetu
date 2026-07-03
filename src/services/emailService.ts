import emailjs from '@emailjs/browser';

emailjs.init('YOUR_PUBLIC_KEY');

const SERVICE_ID = 'service_xxxxxxx';
const TEMPLATE_ID = 'template_xxxxxxx';

export async function sendVerificationCodeEmail(toEmail: string, code: string, name: string): Promise<void> {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: toEmail,
      to_name: name,
      verification_code: code,
      subject: 'JanaSetu - Email Verification Code',
    });
  } catch (err) {
    console.log('Verification code for', toEmail, ':', code);
  }
}
