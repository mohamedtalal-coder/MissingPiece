import { User } from "../auth/user.model.js";
import type { z } from "zod";
import type { updateProfileSchema } from "./account.validation.js";

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
