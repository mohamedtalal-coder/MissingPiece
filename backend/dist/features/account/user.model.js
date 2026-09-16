import mongoose, { Schema, Document } from "mongoose";
const AddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
});
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Assuming auth teammate will handle this
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
}, { timestamps: true });
export const User = mongoose.model("User", UserSchema);
//# sourceMappingURL=user.model.js.map