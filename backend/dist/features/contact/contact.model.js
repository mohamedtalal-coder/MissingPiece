import mongoose, { Schema, Document } from "mongoose";
const ContactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["unread", "read", "resolved"], default: "unread" },
}, { timestamps: true });
export const Contact = mongoose.model("Contact", ContactSchema);
//# sourceMappingURL=contact.model.js.map