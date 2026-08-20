import nodemailer from 'nodemailer';

export interface BookingConfirmationParams {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  amount: number | string;
  currency: string;
  bookingId: string;
  orderId?: string;
}

/**
 * Creates a Nodemailer Gmail SMTP transporter lazily.
 * - Uses explicit host/port/SSL instead of `service: 'gmail'` for reliability.
 * - Strips all spaces from the App Password (Google inserts them visually).
 * - Returns null if credentials are missing/placeholder, preventing module-level crashes.
 */
function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !rawPass || user.includes('your_') || rawPass.includes('your_')) {
    return null;
  }

  const appPassword = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass: appPassword },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    logger: true,
    debug: true,
  });
}

/**
 * Sends a luxury HTML booking confirmation email via Nodemailer + Gmail SMTP.
 * Returns true if delivered successfully, false on any failure.
 */
export async function sendBookingConfirmation({
  customerEmail,
  customerName,
  serviceName,
  amount,
  currency,
  bookingId,
  orderId,
}: BookingConfirmationParams): Promise<boolean> {
  // [4] — Confirm function was entered
  console.log('[4. Email Lib] Function entered.');

  // [5] & [6] — Resolve env vars and log existence (never log actual values)
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  console.log(`[5. Email Lib] EMAIL_USER exists: ${!!user}`);
  console.log(`[6. Email Lib] EMAIL_APP_PASSWORD exists: ${!!pass}, Length: ${pass?.length ?? 0}`);

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      '[Email Lib] getTransporter() returned null — EMAIL_USER or EMAIL_APP_PASSWORD ' +
      'is missing or still set to placeholder values in .env.local.'
    );
    return false;
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    console.error('[Email Lib] Invalid recipient email address:', customerEmail);
    return false;
  }

  const formattedAmount = Number(amount).toLocaleString('en-IN');
  const displayCurrency = currency || 'INR';
  const senderAddress = process.env.EMAIL_USER!;

  try {
    const info = await transporter.sendMail({
      from: `"Control X Agency" <${senderAddress}>`,
      to: customerEmail,
      subject: `Booking Confirmed: ${serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #030705; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EBE9E1;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030705; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #08140c; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">

                    <!-- Brand Header -->
                    <tr>
                      <td style="padding: 32px 32px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
                        <span style="font-size: 24px; font-weight: 800; color: #10B981; letter-spacing: -0.02em;">X</span>
                        <span style="font-size: 14px; font-weight: 700; color: #EBE9E1; letter-spacing: 0.18em; text-transform: uppercase; margin-left: 8px;">CONTROL</span>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 32px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #10B981; font-size: 22px; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.4);">&#10003;</div>
                          <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 16px 0 8px;">Booking Confirmed</h1>
                          <p style="font-size: 14px; color: rgba(235, 233, 225, 0.65); line-height: 1.6; margin: 0;">
                            Hello ${customerName}, your executive consultation has been scheduled and confirmed.
                          </p>
                        </div>

                        <!-- Details Table -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="6" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 24px;">
                          <tr>
                            <td style="font-size: 13px; color: rgba(235, 233, 225, 0.5);">Service</td>
                            <td style="font-size: 13px; color: #ffffff; font-weight: 600; text-align: right;">${serviceName}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: rgba(235, 233, 225, 0.5);">Booking ID</td>
                            <td style="font-size: 11px; color: #10B981; font-family: monospace; text-align: right;">${bookingId}</td>
                          </tr>
                          ${orderId ? `
                          <tr>
                            <td style="font-size: 13px; color: rgba(235, 233, 225, 0.5);">Payment Ref</td>
                            <td style="font-size: 11px; color: rgba(235, 233, 225, 0.7); font-family: monospace; text-align: right;">${orderId}</td>
                          </tr>` : ''}
                          <tr>
                            <td style="font-size: 13px; color: rgba(235, 233, 225, 0.5);">Amount Paid</td>
                            <td style="font-size: 14px; color: #10B981; font-weight: 700; text-align: right;">&#8377;${formattedAmount} ${displayCurrency}</td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; color: rgba(235, 233, 225, 0.5);">Status</td>
                            <td style="font-size: 12px; color: #10B981; font-weight: 700; text-align: right;">CONFIRMED</td>
                          </tr>
                        </table>

                        <p style="font-size: 13px; color: rgba(235, 233, 225, 0.6); line-height: 1.6; margin: 0 0 24px;">
                          Our team is preparing your custom consultation brief. A calendar invitation with meeting coordinates will arrive shortly.
                        </p>

                        <div style="text-align: center;">
                          <a href="https://controlx.io/dashboard"
                             style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0F8259 0%, #10B981 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.03em;">
                            View in Dashboard
                          </a>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: rgba(235, 233, 225, 0.35);">
                        &copy; ${new Date().getFullYear()} Control X. All rights reserved. Confidential &amp; Proprietary.
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

    // [7] — SMTP success
    console.log(`[7. Email Lib] SUCCESS! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    // [8] — SMTP failure with full error object
    console.error('[8. Email Lib] FAILED! Exact SMTP Error:', error);
    return false;
  }
}
