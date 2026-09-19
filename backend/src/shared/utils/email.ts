import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"] || "re_dummy");

export async function sendPasswordResetEmail(
  email: string,
  otp: string
) {
  const { error } = await resend.emails.send({
    from: process.env["RESEND_FROM_EMAIL"] || "onboarding@resend.dev",
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}