import bcrypt from "bcrypt";
import { User } from "../auth/user.model.js";
import type { z } from "zod";
import type { updateProfileSchema, changePasswordSchema } from "./account.validation.js";
import { ApiError } from "../../shared/middleware/errorHandler.js";
import { revokeAllUserTokens } from "../../shared/utils/tokenRevocation.js";

export async function getUserProfile(userId: string) {
  return User.findById(userId).lean();
}

export async function updateUserProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
  return User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
}

export async function changeUserPassword(
  userId: string,
  data: z.infer<typeof changePasswordSchema>
) {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentPasswordCorrect = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.passwordHash = await bcrypt.hash(data.newPassword, 12);
  await user.save();

  // Changing the password invalidates every other session — including any
  // token an attacker may have obtained.
  await revokeAllUserTokens(userId);
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl } },
    { new: true, runValidators: true }
  ).lean();
}
