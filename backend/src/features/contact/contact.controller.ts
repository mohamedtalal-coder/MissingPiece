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

import { logAdminAction } from "../audit/audit.service.js";

/**
 * Update contact message status (Admin only)
 * PATCH /api/contact/:id/status
 */
export const updateContactStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = contactStatusSchema.parse(req.body);
    const contactId = req.params["id"] as string;
    const contact = await contactService.updateContactStatus(contactId, status);

    if (!contact) {
      const err: AppError = new Error("Contact message not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "UPDATE_CONTACT_STATUS",
      resourceId: contactId,
      resourceModel: "Contact",
      details: { status },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact details like assignedTo or adminNotes (Admin only)
 * PATCH /api/contact/:id
 */
export const updateContactDetailsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactId = req.params["id"] as string;
    const { assignedTo, adminNotes, status } = req.body;
    
    const contact = await contactService.updateContactDetails(contactId, { assignedTo, adminNotes, status });

    if (!contact) {
      const err: AppError = new Error("Contact message not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "UPDATE_CONTACT_DETAILS",
      resourceId: contactId,
      resourceModel: "Contact",
      details: { assignedTo, adminNotes, status },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};
