import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/adminAuth';
import { getSmtpTransporter, renderEmailHtml } from '@/lib/smtpHelper';
import { isValidEmail, sanitizeText } from '@/lib/validation';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  return verifySessionToken(sessionCookie?.value);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  // 1. Strict Security Authorization Check
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized access. Valid administrator session required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipients, subject, messageBody, isTest, testEmail } = body;

    const cleanSubject = sanitizeText(subject, 200);
    const cleanBody = sanitizeText(messageBody, 10000);

    if (!cleanSubject || !cleanBody) {
      return NextResponse.json({ error: 'Subject and email message content are required.' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER || 'icc2026@yenepoya.edu.in';
    const transporter = getSmtpTransporter();

    // Handle Test Email Option (Sends single preview email to test address)
    if (isTest) {
      const targetEmail = testEmail && isValidEmail(testEmail) ? testEmail : smtpUser;
      const htmlContent = renderEmailHtml('Administrator Preview', cleanBody, 'TEST-2026', 'Yenepoya University');

      await transporter.sendMail({
        from: `"ICCAQI 2026 Secretariat" <${smtpUser}>`,
        to: targetEmail,
        subject: `[TEST PREVIEW] ${cleanSubject}`,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        message: `Test email preview successfully dispatched to ${targetEmail}`,
      });
    }

    // Handle Bulk Dispatch to Verified Delegates / Accepted Authors
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients specified for bulk dispatch.' }, { status: 400 });
    }

    // Filter valid email targets
    const validRecipients = recipients.filter((r) => r.email && isValidEmail(r.email));

    if (validRecipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipient email addresses found in request.' }, { status: 400 });
    }

    const report = {
      total: validRecipients.length,
      successCount: 0,
      failedCount: 0,
    };

    // Paced queue processing to eliminate SMTP rate limit errors
    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      let attempts = 0;
      let sentSuccessfully = false;

      const htmlContent = renderEmailHtml(
        recipient.name || 'Delegate',
        cleanBody,
        recipient.paperId || '',
        recipient.institution || ''
      );

      while (attempts < 2 && !sentSuccessfully) {
        attempts++;
        try {
          await transporter.sendMail({
            from: `"ICCAQI 2026 Secretariat" <${smtpUser}>`,
            to: recipient.email,
            subject: cleanSubject,
            html: htmlContent,
          });

          sentSuccessfully = true;
          report.successCount++;
        } catch (sendErr: any) {
          console.warn(`SMTP send warning for ${recipient.email} (Attempt ${attempts}):`, sendErr.message);
          if (attempts < 2) {
            await sleep(1500); // Wait 1.5s before retrying
          } else {
            report.failedCount++;
          }
        }
      }

      // Pacing delay (1.2s between emails) to respect Gmail / Workspace SMTP limits
      if (i < validRecipients.length - 1) {
        await sleep(1200);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk email dispatch complete. Successfully sent ${report.successCount} of ${report.total} emails.`,
      report,
    });
  } catch (err) {
    console.error('Bulk email dispatch exception:', err);
    return NextResponse.json({ error: 'Failed to complete bulk email dispatch.' }, { status: 500 });
  }
}
