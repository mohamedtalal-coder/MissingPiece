import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transporter — Gmail SMTP with App Password (no domain needed)
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env["GMAIL_USER"],
    pass: process.env["GMAIL_APP_PASSWORD"],
  },
});

// ---------------------------------------------------------------------------
// Dev fallback: if credentials are missing, log OTP to console
// ---------------------------------------------------------------------------
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
}) {
  const gmailUser = process.env["GMAIL_USER"];
  const gmailPass = process.env["GMAIL_APP_PASSWORD"];

  // No credentials configured — use console fallback in dev, throw in prod
  if (!gmailUser || !gmailPass) {
    if (process.env["NODE_ENV"] === "production") {
      throw new Error("Email credentials not configured");
    }
    logDevFallback(to, subject, otp);
    return;
  }

  await transporter.sendMail({
    from: `"MissingPiece" <${gmailUser}>`,
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
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  await sendEmail({ to: email, otp, subject: "Reset Your Password" });
}

export async function sendEmailVerificationCode(email: string, otp: string) {
  await sendEmail({ to: email, otp, subject: "Verify Your Email" });
}