import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { FAQ, localizeFaq } from "./faq.model.js";
import { logAdminAction } from "../audit/audit.service.js";
import type { AppError } from "../../shared/middleware/errorHandler.js";

const faqBodySchema = z.object({
  questionEn: z.string().trim().min(1).max(500),
  questionAr: z.string().trim().min(1).max(500),
  answerEn: z.string().trim().min(1).max(5000),
  answerAr: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(100).default("General"),
  status: z.enum(["draft", "published"]).default("draft"),
  order: z.coerce.number().int().min(0).default(0),
});

const faqUpdateSchema = faqBodySchema.partial();

export const getFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang === "ar" ? "ar" : "en";
    const faqs = await FAQ.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({
      success: true,
      items: faqs.map((f) => localizeFaq(f as Record<string, unknown>, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json({
      success: true,
      items: faqs.map((f) => localizeFaq(f as Record<string, unknown>, "en")),
    });
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = faqBodySchema.parse(req.body);
    const faq = new FAQ(input);
    await faq.save();

    await logAdminAction({
      adminId: req.userId!,
      action: "CREATE_FAQ",
      resourceId: faq._id.toString(),
      resourceModel: "FAQ",
      details: { questionEn: input.questionEn, status: input.status },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: localizeFaq(faq.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const updates = faqUpdateSchema.parse(req.body);

    const faq = await FAQ.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    if (!faq) {
      const err: AppError = new Error("FAQ not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "UPDATE_FAQ",
      resourceId: id,
      resourceModel: "FAQ",
      details: updates,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: localizeFaq(faq as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const faq = await FAQ.findByIdAndDelete(id).lean();

    if (!faq) {
      const err: AppError = new Error("FAQ not found");
      err.statusCode = 404;
      throw err;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "DELETE_FAQ",
      resourceId: id,
      resourceModel: "FAQ",
      details: { questionEn: faq.questionEn || faq.question },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    next(error);
  }
};
