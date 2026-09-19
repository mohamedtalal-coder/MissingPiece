import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import { sendPasswordResetEmail } from "../../shared/utils/email.js";

function generateToken(userId: string, role: string): string {
const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId, role },
    secret,
    {
      algorithm: "HS256",
      expiresIn: "7d",
    }
  );
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = generateToken(user._id.toString(), user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Account suspended. Contact support.");
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email }).select(
    "+resetPasswordOtpHash +resetPasswordOtpExpires"
  );

  if (!user) {
    return;
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  user.resetPasswordOtpHash = otpHash;
  user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendPasswordResetEmail(user.email, otp);
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
) {
  const user = await User.findOne({ email }).select(
    "+passwordHash +resetPasswordOtpHash +resetPasswordOtpExpires"
  );

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset code");
  }

  if (
    !user.resetPasswordOtpHash ||
    !user.resetPasswordOtpExpires ||
    user.resetPasswordOtpExpires.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired reset code");
  }

  const isOtpValid = await bcrypt.compare(
    otp,
    user.resetPasswordOtpHash
  );

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid or expired reset code");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.resetPasswordOtpHash = null;
  user.resetPasswordOtpExpires = null

  await user.save();
}