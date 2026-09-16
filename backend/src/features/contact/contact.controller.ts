import type { Request, Response, NextFunction } from "express";
import { contactSchema, contactStatusSchema, paginationSchema } from "./contact.validation.js";
import * as contactService from "./contact.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

/**
 * Submit a new contact message
 * POST /api/contact
 */
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = contactSchema.parse(req.body);
    await contactService.createContactMessage(input);
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contact messages (Admin only)
 * GET /api/contact
 */
export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await contactService.listContacts(query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact message status (Admin only)
 * PATCH /api/contact/:id/status
 */
export const updateContactStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = contactStatusSchema.parse(req.body);
    const contact = await contactService.updateContactStatus(req.params["id"] as string, status);

    if (!contact) {
      const err: AppError = new Error("Contact message not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};
