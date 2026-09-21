import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"] || "re_dummy");

function isResendSandboxRestriction(message: string): boolean {
  return message.includes("You can only send testing emails to your own email address");
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
  const { error } = await resend.emails.send({
    from: process.env["RESEND_FROM_EMAIL"] || "onboarding@resend.dev",
    to,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>Your code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });

  if (error) {
    const isDevelopment = process.env["NODE_ENV"] !== "production";
    if (isDevelopment && isResendSandboxRestriction(error.message)) {
      console.warn(`
╔══════════════════════════════════════════════════════════╗
║            📧  DEV EMAIL FALLBACK (Resend sandbox)       ║
╠══════════════════════════════════════════════════════════╣
║  To      : ${to.padEnd(44)} ║
║  Subject : ${subject.padEnd(44)} ║
║  OTP     : ${otp.padEnd(44)} ║
╚══════════════════════════════════════════════════════════╝
⚠️  Resend sandbox only sends to your own account email.
   Add a verified domain at https://resend.com/domains to fix this.
`);
      return;
    }

    throw new Error(error.message);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string
) {
  await sendEmail({ to: email, otp, subject: "Reset Your Password" });
}

export async function sendEmailVerificationCode(
  email: string,
  otp: string
) {
  await sendEmail({ to: email, otp, subject: "Verify Your Email" });
}