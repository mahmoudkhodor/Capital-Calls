import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Feature flag - set to 'true' to enable emails
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

const FROM_EMAIL = process.env.FROM_EMAIL || 'Capital Call <onboarding@resend.dev>';
const APP_URL = process.env.NEXTAUTH_URL || 'https://capital-calls-2exq.vercel.app';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Skip if emails are disabled via feature flag
  if (!EMAIL_ENABLED) {
    console.log('📧 Email (disabled):', { to, subject });
    return { success: true, disabled: true };
  }

  // Skip if no Resend API key
  if (!resend) {
    console.log('📧 Email (mock):', { to, subject });
    return { success: true, mock: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log('📧 Email sent:', { to, subject, result });
    return { success: true, result };
  } catch (error) {
    console.error('📧 Email failed:', error);
    return { success: false, error };
  }
}

// Email templates
export async function sendStartupStatusChange({
  to,
  companyName,
  newStatus,
}: {
  to: string;
  companyName: string;
  newStatus: string;
}) {
  const statusMessages: Record<string, string> = {
    SUBMITTED: 'Your application has been submitted and is under review.',
    IN_REVIEW: 'Your application is now being reviewed.',
    FOLLOW_UP: 'We need some additional information from you.',
    SHORTLISTED: 'Congratulations! Your startup has been shortlisted.',
    NOT_MOVING_FORWARD: 'Unfortunately, we will not be moving forward at this time.',
  };

  return sendEmail({
    to,
    subject: `Update: ${companyName} - ${newStatus.replace('_', ' ')}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Application Update</h1>
        <p>Hi,</p>
        <p>Your startup <strong>${companyName}</strong> status has been updated to:</p>
        <p style="font-size: 18px; font-weight: bold; color: #2563eb;">${newStatus.replace('_', ' ')}</p>
        <p>${statusMessages[newStatus] || ''}</p>
        <p>
          <a href="${APP_URL}/startup" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Dashboard
          </a>
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Capital Call - Startup Dealroom Platform
        </p>
      </div>
    `,
  });
}

export async function sendNewApplicationNotification({
  to,
  companyName,
  founderName,
}: {
  to: string;
  companyName: string;
  founderName: string;
}) {
  return sendEmail({
    to,
    subject: `New Application: ${companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Startup Application</h1>
        <p>Hi Admin,</p>
        <p>A new startup has applied:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Founder:</strong> ${founderName}</p>
        </div>
        <p>
          <a href="${APP_URL}/admin/startups" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Review Application
          </a>
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Capital Call - Startup Dealroom Platform
        </p>
      </div>
    `,
  });
}

export async function sendIntroRequestNotification({
  to,
  startupName,
  investorName,
}: {
  to: string;
  startupName: string;
  investorName: string;
}) {
  return sendEmail({
    to,
    subject: `Intro Request: ${investorName} interested in ${startupName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Intro Request</h1>
        <p>Hi,</p>
        <p>An investor has requested an introduction:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Investor:</strong> ${investorName}</p>
          <p><strong>Startup:</strong> ${startupName}</p>
        </div>
        <p>
          <a href="${APP_URL}/admin/intros" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Review Request
          </a>
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Capital Call - Startup Dealroom Platform
        </p>
      </div>
    `,
  });
}
