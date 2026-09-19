import { Contact } from "./contact.model.js";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createContactMessage(input: ContactInput) {
  const contact = new Contact(input);
  await contact.save();
  return contact;
}

export interface ListContactsParams {
  page: number;
  limit: number;
}

export async function listContacts(params: ListContactsParams) {
  const skip = (params.page - 1) * params.limit;
  
  const [items, total] = await Promise.all([
    Contact.find().sort({ createdAt: -1 }).skip(skip).limit(params.limit).lean(),
    Contact.countDocuments(),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

export async function updateContactStatus(id: string, status: string) {
  return Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).lean();
}

export async function updateContactDetails(id: string, updates: { assignedTo?: string; adminNotes?: string; status?: string }) {
  return Contact.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();
}
