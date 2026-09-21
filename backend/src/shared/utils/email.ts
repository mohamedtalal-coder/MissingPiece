import nodemailer from "nodemailer";

function getGmailCredentials(): { user: string; pass: string } | null {
  const user = process.env["GMAIL_USER"]?.trim();
  // App passwords are often pasted with spaces — strip them.
  const pass = process.env["GMAIL_APP_PASSWORD"]?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  return { user, pass };
}

function createTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function logDevFallback(to: string, subject: string, otp: string) {
  console.warn(`
╔══════════════════════════════════════════════════════════╗
║            📧  DEV EMAIL FALLBACK (no credentials)       ║
╠══════════════════════════════════════════════════════════╣
║  To      : ${to.padEnd(44)} ║
║  Subject : ${subject.padEnd(44)} ║
║  OTP     : ${otp.padEnd(44)} ║
╚══════════════════════════════════════════════════════════╝
⚠️  Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails.
`);
}

async function sendEmail({
  to,
  subject,
  otp,
}: {
  to: string;
  subject: string;
  otp: string;
}): Promise<void> {
  const creds = getGmailCredentials();

  if (!creds) {
    console.error(
      `[email] Missing GMAIL_USER / GMAIL_APP_PASSWORD (NODE_ENV=${process.env["NODE_ENV"] ?? "undefined"})`
    );
    if (process.env["NODE_ENV"] === "production") {
      throw new Error("Email credentials not configured");
    }
    logDevFallback(to, subject, otp);
    return;
  }

  try {
    const info = await createTransporter(creds.user, creds.pass).sendMail({
      from: `"MissingPiece" <${creds.user}>`,
      to,
      subject,
      html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #1a1a1a;">${subject}</h2>
        <p style="color: #555;">Use the code below. It expires in <strong>10 minutes</strong>.</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #1a1a1a;
          background: #f4f4f5;
          border-radius: 8px;
          padding: 16px 24px;
          text-align: center;
          margin: 24px 0;
        ">${otp}</div>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
    });

    console.log(
      `[email] Sent "${subject}" to ${to} (messageId=${info.messageId ?? "n/a"}, response=${info.response ?? "n/a"})`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Failed to send "${subject}" to ${to}: ${message}`);
    throw err;
  }
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  await sendEmail({ to: email, otp, subject: "Reset Your Password" });
}

export async function sendEmailVerificationCode(email: string, otp: string) {
  await sendEmail({ to: email, otp, subject: "Verify Your Email" });
}
