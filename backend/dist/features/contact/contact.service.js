import { Contact } from "./contact.model.js";
export async function createContactMessage(input) {
    const contact = new Contact(input);
    await contact.save();
    return contact;
}
export async function listContacts(params) {
    const skip = (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
        Contact.find().sort({ createdAt: -1 }).skip(skip).limit(params.limit).lean(),
        Contact.countDocuments(),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}
export async function updateContactStatus(id, status) {
    return Contact.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
}
//# sourceMappingURL=contact.service.js.map