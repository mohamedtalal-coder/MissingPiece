import mongoose from "mongoose";
import { AuditLog } from "./audit.model.js";

export const logAdminAction = async ({
  adminId,
  action,
  resourceId,
  resourceModel,
  details,
  ipAddress,
}: {
  adminId: string | mongoose.Types.ObjectId;
  action: string;
  resourceId?: string | undefined;
  resourceModel?: string | undefined;
  details?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
}) => {
  try {
    const log = new AuditLog({
      adminId,
      action,
      resourceId,
      resourceModel,
      details,
      ipAddress,
    });
    await log.save();
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // We intentionally don't throw here to avoid failing the main request if logging fails,
    // though for strict compliance systems, you might want to throw.
  }
};
