import nodemailer from 'nodemailer';

export interface AdminNotificationPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_name: string;
  amount: number | string;
  currency?: string;
  cashfree_order_id?: string;
}

// ── Nodemailer transporter — port 587 + STARTTLS (ISP-friendly, avoids port 465 blocks) ──
function getAdminTransporter(): nodemailer.Transporter | null {
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !rawPass || user.includes('your_') || rawPass.includes('your_')) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,       // STARTTLS — works through most ISP/corporate firewalls
    secure: false,   // false = STARTTLS upgrade after connection (not SSL-from-start)
    auth: { user, pass: rawPass.replace(/\s+/g, '') },
    connectionTimeout: 10000,  // 10 s — fail fast instead of hanging
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// ── MarkdownV2 escaping (Telegram requires all special chars escaped) ─────────
function escapeMarkdown(text: string): string {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

// ── Telegram Push Notification ────────────────────────────────────────────────
async function sendTelegramAlert(booking: AdminNotificationPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_CHAT_ID;
  const chatIds = rawChatId ? rawChatId.split(',').map((id) => id.trim()).filter(Boolean) : ['1148693311'];

  if (!token || token.includes('your_')) {
    console.warn('[Notifications] TELEGRAM_BOT_TOKEN not set — skipping Telegram alert.');
    return;
  }

  if (chatIds.length === 0) {
    console.warn('[Notifications] No TELEGRAM_CHAT_ID configured — skipping Telegram alert.');
    return;
  }

  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const formattedAmount = Number(booking.amount).toLocaleString('en-IN');
  const currency = booking.currency || 'INR';

  const message =
    `🚀 *New Booking Confirmed\\!*\n\n` +
    `*Time:* ${escapeMarkdown(istTime)}\n` +
    `*Client:* ${escapeMarkdown(booking.customer_name)}\n` +
    `*Email:* ${escapeMarkdown(booking.customer_email)}\n` +
    `*Phone:* ${escapeMarkdown(booking.customer_phone || 'N/A')}\n` +
    `*Service:* ${escapeMarkdown(booking.service_name)}\n` +
    `*Amount:* ₹${formattedAmount} ${currency}\n` +
    `*Booking ID:* \`${booking.id}\`\n` +
    `*Order Ref:* \`${booking.cashfree_order_id || 'N/A'}\``;

  for (const id of chatIds) {
    const trimmedId = id.trim();
    if (!trimmedId) continue;

    // Hard 8-second timeout per chat ID — prevents hanging if Telegram is firewalled
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: trimmedId,
          text: message,
          parse_mode: 'MarkdownV2',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Telegram Error] [Chat ID: ${trimmedId}] HTTP ${response.status}:`, errorText);
      } else {
        console.log(`[Telegram Success] Notification sent to chat ${trimmedId}.`);
      }
    } catch (error: any) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') {
        console.error(`[Telegram Network Error] Request timed out after 8s for chat ${trimmedId}:`, error);
      } else {
        console.error(`[Telegram Network Error] Could not reach Telegram for chat ${trimmedId}:`, error);
      }
    }
  }
}

// ── Admin Email Notification ──────────────────────────────────────────────────
async function sendAdminEmail(booking: AdminNotificationPayload): Promise<void> {
  const adminEmail = process.env.EMAIL_USER;
  const transporter = getAdminTransporter();

  if (!transporter || !adminEmail) {
    console.warn('[Notifications] Nodemailer not configured — skipping admin email.');
    return;
  }

  const formattedAmount = Number(booking.amount).toLocaleString('en-IN');
  const currency = booking.currency || 'INR';

  try {
    const info = await transporter.sendMail({
      from: `"Control X System" <${adminEmail}>`,
      to: adminEmail,
      subject: `💼 New Booking: ${booking.customer_name} — ₹${formattedAmount}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Admin Booking Alert</title></head>
          <body style="margin:0;padding:0;background:#030705;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#EBE9E1;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background:#08140c;border:1px solid rgba(16,185,129,0.3);border-radius:14px;overflow:hidden;">
                    <tr>
                      <td style="padding:24px 28px 18px;border-bottom:1px solid rgba(255,255,255,0.07);background:linear-gradient(135deg,rgba(16,185,129,0.15),transparent);">
                        <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#10B981;margin-bottom:4px;">Control X &mdash; Admin Alert</div>
                        <div style="font-size:20px;font-weight:800;color:#fff;">🚀 New Booking Confirmed</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 28px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);width:38%;">Client</td>
                            <td style="font-size:13px;color:#fff;font-weight:600;">${booking.customer_name}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Email</td>
                            <td style="font-size:13px;color:#10B981;">${booking.customer_email}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Phone</td>
                            <td style="font-size:13px;color:#EBE9E1;">${booking.customer_phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Service</td>
                            <td style="font-size:13px;color:#EBE9E1;">${booking.service_name}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Amount</td>
                            <td style="font-size:15px;color:#10B981;font-weight:800;">₹${formattedAmount} ${currency}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Booking ID</td>
                            <td style="font-size:11px;color:#10B981;font-family:monospace;">${booking.id}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px;color:rgba(235,233,225,0.5);">Order Ref</td>
                            <td style="font-size:11px;color:rgba(235,233,225,0.6);font-family:monospace;">${booking.cashfree_order_id || 'N/A'}</td>
                          </tr>
                        </table>
                        <p style="font-size:12px;color:rgba(235,233,225,0.4);margin:20px 0 0;line-height:1.6;">
                          Automated admin notification from Control X. Manage this booking in your Supabase dashboard.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 28px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(235,233,225,0.3);text-align:center;">
                        &copy; ${new Date().getFullYear()} Control X &mdash; Admin System
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
    console.log(`[Notifications] ✅ Admin email sent. ID: ${info.messageId}`);
  } catch (error: any) {
    console.error('[Notifications] Admin email failed:', error?.message || error);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Fires Telegram push + admin email concurrently via Promise.allSettled.
 * Neither channel can crash or block the payment confirmation flow.
 */
export async function sendAdminNotifications({
  booking,
}: {
  booking: AdminNotificationPayload;
}): Promise<void> {
  console.log(`[Notifications] Dispatching admin notifications for booking ${booking.id}...`);
  try {
    await Promise.allSettled([sendTelegramAlert(booking), sendAdminEmail(booking)]);
    console.log('[Notifications] Admin notification dispatch complete.');
  } catch (error) {
    console.error('[Notifications] Unexpected error during admin notifications:', error);
  }
}
