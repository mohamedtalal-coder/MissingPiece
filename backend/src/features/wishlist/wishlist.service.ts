import { User } from "../auth/user.model.js";

export async function getUserWishlist(userId: string) {
  const user = await User.findById(userId).populate("wishlist").select("wishlist").lean();
  return user?.wishlist ?? [];
}

export async function addProductToWishlist(userId: string, productId: string) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },
    { new: true }
  ).populate("wishlist").lean();
  
  return user?.wishlist ?? [];
}

export async function removeProductFromWishlist(userId: string, productId: string) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true }
  ).populate("wishlist").lean();

  return user?.wishlist ?? [];
}
