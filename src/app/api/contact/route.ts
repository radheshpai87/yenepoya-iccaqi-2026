import { NextResponse } from 'next/server';
import { getSmtpTransporter } from '@/lib/smtpHelper';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 254);
    const institution = sanitizeText(body.institution, 200);
    const message = sanitizeText(body.message, 5000);

    if (!name || !email || !institution || !message) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Institution, Message) are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER || 'iccaqi2026@yenepoya.edu.in';
    const recipientEmail = 'iccaqi2026@yenepoya.edu.in';
    const transporter = getSmtpTransporter();

    // Escape message for HTML
    const formattedMessage = message.replace(/\n/g, '<br/>');

    // 1. Dispatch email to conference secretariat with replyTo set to inquirer
    await transporter.sendMail({
      from: `"ICCAQI 2026 Website" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `[Website Enquiry] ${name} - ${institution}`,
      text: `New enquiry received from ICCAQI 2026 website:

Name: ${name}
Email: ${email}
Institution: ${institution}

Message:
${message}

Reply to this email directly to answer ${name} (${email}).`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Website Enquiry - ICCAQI 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #7cb305; padding: 24px 32px; text-align: left;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                ICCAQI 2026 • Website Enquiry
              </h2>
              <p style="color: #f7fee7; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Secretariat Contact Form Notification
              </p>
            </td>
          </tr>

          <!-- Details Card -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
                A new inquiry has been submitted via the <strong>ICCAQI 2026</strong> conference website contact form.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #64748b; width: 120px;">
                    Full Name
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #64748b;">
                    Email Address
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0284c7; font-weight: 600;">
                    <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #64748b;">
                    Institution
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #0f172a;">
                    ${institution}
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                  Message Content:
                </span>
                <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #7cb305; padding: 16px 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  ${formattedMessage}
                </div>
              </div>

              <!-- Quick Reply Action -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="mailto:${email}?subject=Re:%20ICCAQI%202026%20Enquiry%20-%20${encodeURIComponent(institution)}" style="background-color: #7cb305; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block;">
                  &larr; Click to Reply to ${name} (${email})
                </a>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                  Replying directly to this email will automatically address your response to <strong>${email}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
              ICCAQI 2026 Secretariat • Yenepoya School of Engineering &amp; Technology<br/>
              Yenepoya (Deemed to be University), Mangaluru, India
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    // 2. Best-effort acknowledgment back to the user
    try {
      await transporter.sendMail({
        from: `"ICCAQI 2026 Secretariat" <${smtpUser}>`,
        to: email,
        replyTo: smtpUser,
        subject: `Thank you for contacting ICCAQI 2026`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Enquiry Acknowledgment - ICCAQI 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #7cb305; padding: 24px 32px; text-align: left;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                ICCAQI 2026 Secretariat
              </h2>
              <p style="color: #f7fee7; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                Enquiry Acknowledgment
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; font-size: 14px; line-height: 1.7; color: #334155;">
              <p style="margin-top: 0; font-weight: 700; color: #0f172a; font-size: 15px;">
                Dear ${name},
              </p>
              <p>
                Thank you for reaching out to the <strong>International Conference on Computing, AI, Quantum Intelligence and Future Technologies (ICCAQI 2026)</strong>.
              </p>
              <p>
                We have received your enquiry regarding <em>${institution}</em>. Our conference organizing team will review your message and reply to you shortly at <strong>${email}</strong>.
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #7cb305; padding: 14px 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; color: #475569;">
                <strong>Conference Dates:</strong> November 25–26, 2026<br/>
                <strong>Venue:</strong> Yenepoya School of Engineering &amp; Technology, Mangaluru, India<br/>
                <strong>Official Email:</strong> <a href="mailto:${smtpUser}" style="color: #7cb305;">${smtpUser}</a>
              </div>
              <p style="margin-bottom: 0;">
                Warm regards,<br/>
                <strong>ICCAQI 2026 Organizing Committee</strong><br/>
                Yenepoya (Deemed to be University)
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });
    } catch (ackErr) {
      console.warn('Sender acknowledgment email skipped or failed:', ackErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been delivered to the secretariat successfully.',
    });
  } catch (err: any) {
    console.error('Contact form submission error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to send message. Please email iccaqi2026@yenepoya.edu.in directly.' },
      { status: 500 }
    );
  }
}
