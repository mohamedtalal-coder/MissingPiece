import { User } from "../auth/user.model.js";

export async function getUserProfile(userId: string) {
  return User.findById(userId).select("-password").lean();
}

export async function updateUserProfile(userId: string, data: any) {
  return User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select("-password").lean();
}
