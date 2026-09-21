import type { Request, Response, NextFunction } from "express";
import { AuditLog } from "./audit.model.js";

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.action) query["action"] = req.query.action;
    if (req.query.adminId) query["adminId"] = req.query.adminId;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("adminId", "name email")
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      items: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
