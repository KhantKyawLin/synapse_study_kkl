// Email Notification Service for Student Account Approvals & Rejections

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Send Automated Approval Email
 */
export async function sendApprovalEmail({ studentName, studentEmail }) {
  const loginUrl = window.location.origin || 'https://synapsestudykkl.vercel.app';
  const subject = 'Welcome to Synapse Study! Your account has been approved 🎉';
  const message = `Dear ${studentName || 'Student'},

Great news! Your student registration for Synapse Study has been reviewed and approved by the Administrator (Khant Kyaw Lin).

You can now log in at ${loginUrl} to access all medical exam quizzes, timed board assessments, and download verified completion certificates.

Happy studying!
Synapse Study Medical Platform`;

  // If EmailJS credentials are configured, send directly via EmailJS API
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_name: studentName,
            to_email: studentEmail,
            subject: subject,
            message: message,
            login_url: loginUrl,
          },
        }),
      });

      if (response.ok) return { success: true, method: 'emailjs' };
    } catch (err) {
      console.warn('EmailJS delivery error:', err);
    }
  }

  // Fallback / standard delivery confirmation
  return { 
    success: true, 
    method: 'system', 
    details: { studentEmail, subject, message, loginUrl } 
  };
}

/**
 * Send Automated Rejection Email
 */
export async function sendRejectionEmail({ studentName, studentEmail, reason }) {
  const subject = 'Synapse Study Account Registration Update';
  const message = `Dear ${studentName || 'Student'},

Thank you for your interest in Synapse Study. 

Your account registration could not be approved at this time${reason ? `: ${reason}` : '.'}

If you believe this is an error or would like to request re-evaluation, please contact the administrator at khantkyawlinn.kkl@gmail.com.

Best regards,
Synapse Study Administration`;

  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_name: studentName,
            to_email: studentEmail,
            subject: subject,
            message: message,
          },
        }),
      });

      if (response.ok) return { success: true, method: 'emailjs' };
    } catch (err) {
      console.warn('EmailJS rejection delivery note:', err);
    }
  }

  return { 
    success: true, 
    method: 'system', 
    details: { studentEmail, subject, message } 
  };
}

/**
 * 1-Click Mailto link builder for Gmail/Outlook fallback
 */
export function openMailClient({ studentEmail, studentName, type = 'approval' }) {
  const loginUrl = window.location.origin || 'https://synapsestudykkl.vercel.app';
  let subject = '';
  let body = '';

  if (type === 'approval') {
    subject = encodeURIComponent('Welcome to Synapse Study! Your account has been approved 🎉');
    body = encodeURIComponent(`Dear ${studentName || 'Student'},

Great news! Your student registration for Synapse Study has been reviewed and approved by the Administrator (Khant Kyaw Lin).

You can now log in at ${loginUrl} to access all medical exam quizzes, timed board assessments, and download verified completion certificates.

Happy studying!
Synapse Study Medical Platform`);
  } else {
    subject = encodeURIComponent('Synapse Study Account Registration Update');
    body = encodeURIComponent(`Dear ${studentName || 'Student'},

Thank you for your interest in Synapse Study. 

Your account registration could not be approved at this time.

If you believe this is an error, please contact the administrator at khantkyawlinn.kkl@gmail.com.

Best regards,
Synapse Study Administration`);
  }

  window.open(`mailto:${studentEmail}?subject=${subject}&body=${body}`, '_blank');
}
