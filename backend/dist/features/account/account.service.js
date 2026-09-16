import { User } from "./user.model.js";
export async function getUserProfile(userId) {
    return User.findById(userId).select("-password").lean();
}
export async function updateUserProfile(userId, data) {
    return User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select("-password").lean();
}
export async function getUserWishlist(userId) {
    const user = await User.findById(userId).populate("wishlist").select("wishlist").lean();
    return user?.wishlist ?? [];
}
export async function addProductToWishlist(userId, productId) {
    const user = await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { new: true }).populate("wishlist").lean();
    return user?.wishlist ?? [];
}
export async function removeProductFromWishlist(userId, productId) {
    const user = await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { new: true }).populate("wishlist").lean();
    return user?.wishlist ?? [];
}
//# sourceMappingURL=account.service.js.map