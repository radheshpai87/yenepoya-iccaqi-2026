import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer SMTP Transporter with connection pooling and rate throttling
 */
export function getSmtpTransporter() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || '').trim();
  // Strip all whitespaces, quotation marks and invisible chars
  const pass = (process.env.SMTP_PASS || '').replace(/[\s"']/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateLimit: 30, // max 30 emails / min for zero-error pacing
  });
}

/**
 * Render official Yenepoya ICCAQI 2026 responsive HTML email wrapper
 */
/**
 * Render plain text equivalent of the email for multipart delivery (reduces spam score)
 */
export function renderEmailText(
  name: string,
  messageBody: string,
  paperId?: string,
  institution?: string,
  registrationId?: string
): string {
  const regId = registrationId || paperId || '';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iccaqi.in';
  const paymentUrl = `${baseUrl.replace(/\/$/, '')}/complete-payment?id=${encodeURIComponent(regId)}`;

  const plainBody = messageBody
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/{{name}}/g, name)
    .replace(/{{paper_id}}/g, paperId || 'N/A')
    .replace(/{{registration_id}}/g, regId || 'N/A')
    .replace(/{{institution}}/g, institution || '')
    .replace(/{{payment_url}}/g, paymentUrl)
    .trim();

  let text = `Dear ${name},\n\n${plainBody}\n\n`;

  if (regId && !plainBody.includes(paymentUrl)) {
    text += `Complete Registration & Payment Link:\n${paymentUrl}\n\n`;
  }

  text += `Event Reference: International Conference on Computing, AI, Quantum Intelligence and Future Technologies (ICCAQI 2026)\n`;
  text += `Dates: November 25–26, 2026 • Mode: Hybrid (In-Person / Online)\n\n`;
  text += `Yenepoya School of Engineering & Technology\n`;
  text += `Yenepoya (Deemed to be University), Mangaluru – 575018, India\n`;
  text += `Website: https://iccaqi.in`;

  return text;
}

/**
 * Render official Yenepoya ICCAQI 2026 responsive HTML email wrapper
 */
export function renderEmailHtml(
  name: string,
  messageBody: string,
  paperId?: string,
  institution?: string,
  registrationId?: string
): string {
  const regId = registrationId || paperId || '';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iccaqi.in';
  const paymentUrl = `${baseUrl.replace(/\/$/, '')}/complete-payment?id=${encodeURIComponent(regId)}`;

  let processedBody = messageBody
    .replace(/{{name}}/g, name)
    .replace(/{{paper_id}}/g, paperId || 'N/A')
    .replace(/{{registration_id}}/g, regId || 'N/A')
    .replace(/{{institution}}/g, institution || '')
    .replace(/{{payment_url}}/g, paymentUrl);

  // If body doesn't explicitly contain {{payment_url}}, append a clean CTA button block at bottom
  const hasPaymentLinkTag = messageBody.includes('{{payment_url}}') || messageBody.includes('/complete-payment');
  
  const ctaButtonBlock = !hasPaymentLinkTag && regId
    ? `
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${paymentUrl}" target="_blank" style="background-color: #7cb305; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 179, 5, 0.25);">
          Complete Registration &amp; Upload Payment Proof &rarr;
        </a>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
          Direct Link: <a href="${paymentUrl}" style="color: #7cb305; text-decoration: underline;">${paymentUrl}</a>
        </p>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ICCAQI 2026 Official Communication</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #7cb305; padding: 24px 32px; text-align: left;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                ICCAQI 2026
              </h2>
              <p style="color: #f7fee7; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Yenepoya (Deemed to be University) • Mangaluru, India
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px; font-size: 14px; line-height: 1.7; color: #334155;">
              <p style="margin-top: 0; font-weight: 700; color: #0f172a; font-size: 15px;">
                Dear ${name},
              </p>
              
              <div style="margin: 20px 0;">
                ${processedBody}
              </div>

              ${ctaButtonBlock}

              <div style="background-color: #f8fafc; border-left: 4px solid #7cb305; padding: 14px 16px; border-radius: 6px; margin: 24px 0; font-size: 12px; color: #475569;">
                <strong>Event Reference:</strong> International Conference on Computing, AI, Quantum Intelligence and Future Technologies (ICCAQI 2026)<br/>
                <strong>Dates:</strong> November 25–26, 2026 • <strong>Mode:</strong> Hybrid (In-Person / Online)
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
              <strong>Yenepoya School of Engineering &amp; Technology</strong><br/>
              Yenepoya (Deemed to be University), University Road, Deralakatte, Mangaluru – 575018, India<br/>
              Website: <a href="https://yenepoya.edu.in" style="color: #7cb305; text-decoration: none; font-weight: 600;">yenepoya.edu.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Render automated paper submission acknowledgment HTML email
 */
export function renderSubmissionAcknowledgmentHtml(params: {
  authorName: string;
  paperTitle: string;
  articleId: string;
  institution?: string;
  track?: string;
}): string {
  const { authorName, paperTitle, articleId, institution, track } = params;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ICCAQI 2026 — Research Article Submission Acknowledgment</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #7cb305; padding: 24px 32px; text-align: left;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                ICCAQI 2026
              </h2>
              <p style="color: #f7fee7; margin: 4px 0 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Yenepoya (Deemed to be University) • Mangaluru, India
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px; font-size: 14px; line-height: 1.7; color: #334155;">
              <p style="margin-top: 0; font-weight: 700; color: #0f172a; font-size: 15px;">
                Dear ${authorName},
              </p>
              
              <p style="margin: 16px 0; color: #334155; line-height: 1.7;">
                Thank you for submitting your research article titled &ldquo;<strong>${paperTitle}</strong>&rdquo; to ICCAQI 2026. We are pleased to confirm that your manuscript has been successfully received and is currently under review by the Conference Review Committee. Your article id is <strong>${articleId}</strong>.
              </p>

              <!-- Article Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 22px 0; font-size: 13px;">
                <div style="margin-bottom: 8px;">
                  <span style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Official Article ID</span>
                  <span style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace;">${articleId}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Article Title</span>
                  <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${paperTitle}</span>
                </div>
                ${track ? `
                <div style="margin-bottom: 8px;">
                  <span style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Track</span>
                  <span style="font-size: 13px; color: #334155;">${track}</span>
                </div>` : ''}
                ${institution ? `
                <div>
                  <span style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Institution</span>
                  <span style="font-size: 13px; color: #334155;">${institution}</span>
                </div>` : ''}
              </div>

              <p style="margin: 16px 0; color: #334155; line-height: 1.7;">
                The review process is currently underway, and the outcome will be communicated to you via email once the review is completed. We sincerely appreciate your interest in ICCAQI 2026 and look forward to your participation in the conference.
              </p>

              <p style="margin: 16px 0; color: #334155; line-height: 1.7;">
                Best wishes for your research and continued academic success!
              </p>

              <!-- WhatsApp Community CTA -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://chat.whatsapp.com/JhShh9sbV840L8gQEMHWip" target="_blank" style="background-color: #25D366; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);">
                  Join Official Paper Authors WhatsApp Group &rarr;
                </a>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                  Connect with fellow authors and get live presentation slot updates.
                </p>
              </div>

              <div style="background-color: #f8fafc; border-left: 4px solid #7cb305; padding: 14px 16px; border-radius: 6px; margin: 24px 0; font-size: 12px; color: #475569;">
                <strong>Event Reference:</strong> International Conference on Computing, AI, Quantum Intelligence and Future Technologies (ICCAQI 2026)<br/>
                <strong>Dates:</strong> November 25–26, 2026 • <strong>Mode:</strong> Hybrid (In-Person / Online)
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
              <strong>Yenepoya School of Engineering &amp; Technology</strong><br/>
              Yenepoya (Deemed to be University), University Road, Deralakatte, Mangaluru – 575018, India<br/>
              Secretariat Email: <a href="mailto:iccaqi2026@yenepoya.edu.in" style="color: #7cb305; text-decoration: none;">iccaqi2026@yenepoya.edu.in</a> • Website: <a href="https://iccaqi.in" style="color: #7cb305; text-decoration: none; font-weight: 600;">iccaqi.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Render automated paper submission acknowledgment plain text email
 */
export function renderSubmissionAcknowledgmentText(params: {
  authorName: string;
  paperTitle: string;
  articleId: string;
  institution?: string;
  track?: string;
}): string {
  const { authorName, paperTitle, articleId, institution, track } = params;
  return `Dear ${authorName},

Thank you for submitting your research article titled "${paperTitle}" to ICCAQI 2026. We are pleased to confirm that your manuscript has been successfully received and is currently under review by the Conference Review Committee. Your article id is ${articleId}.

The review process is currently underway, and the outcome will be communicated to you via email once the review is completed. We sincerely appreciate your interest in ICCAQI 2026 and look forward to your participation in the conference.

Best wishes for your research and continued academic success!

Article Details:
- Article ID: ${articleId}
- Title: ${paperTitle}
${track ? `- Track: ${track}\n` : ''}${institution ? `- Institution: ${institution}\n` : ''}
Official Paper Authors WhatsApp Group:
https://chat.whatsapp.com/JhShh9sbV840L8gQEMHWip

Event Reference: International Conference on Computing, AI, Quantum Intelligence and Future Technologies (ICCAQI 2026)
Dates: November 25–26, 2026 • Mode: Hybrid (In-Person / Online)
Yenepoya School of Engineering & Technology
Yenepoya (Deemed to be University), Mangaluru – 575018, India
Secretariat Email: iccaqi2026@yenepoya.edu.in
Website: https://iccaqi.in`;
}
