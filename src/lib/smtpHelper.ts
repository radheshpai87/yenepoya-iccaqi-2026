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
        <a href="${paymentUrl}" target="_blank" style="background-color: #7cb305; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; shadow: 0 4px 12px rgba(124, 179, 5, 0.25);">
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
                <strong>Dates:</strong> November 6–7, 2026 • <strong>Mode:</strong> Hybrid (In-Person / Online)
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
