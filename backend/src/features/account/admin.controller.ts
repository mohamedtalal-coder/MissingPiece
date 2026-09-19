import type { Request, Response, NextFunction } from "express";
import { User } from "../auth/user.model.js";
import { Order } from "../orders/order.model.js";
import { logAdminAction } from "../audit/audit.service.js";
import { revokeAllUserTokens } from "../../shared/utils/tokenRevocation.js";

export const getAllUsersAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === "true";

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    res.json({
      items: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetailAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const user = await User.findById(id).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [orders, ordersTotal] = await Promise.all([
      Order.find({ user: id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ user: id }),
    ]);

    res.json({
      user,
      recentOrders: orders,
      orders: {
        items: orders,
        total: ordersTotal,
        page,
        totalPages: Math.ceil(ordersTotal / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const { role } = req.body;

    if (!["buyer", "admin"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    // Prevent self-demotion
    if (id === req.userId && role !== "admin") {
      res.status(400).json({ message: "Cannot demote your own admin role" });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await logAdminAction({
      adminId: req.userId!,
      action: "UPDATE_USER_ROLE",
      resourceId: id,
      resourceModel: "User",
      details: { newRole: role },
      ipAddress: req.ip,
    });

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400).json({ message: "isActive must be a boolean" });
      return;
    }

    if (id === req.userId && !isActive) {
      res.status(400).json({ message: "Cannot suspend your own account" });
      return;
    }

    const updateData = {
      isActive,
      deactivatedAt: isActive ? null : new Date(),
    };

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!isActive) {
      await revokeAllUserTokens(id);
    }

    await logAdminAction({
      adminId: req.userId!,
      action: isActive ? "REACTIVATE_USER" : "SUSPEND_USER",
      resourceId: id,
      resourceModel: "User",
      details: { isActive },
      ipAddress: req.ip,
    });

    res.json({ message: `User ${isActive ? "reactivated" : "suspended"} successfully`, user });
  } catch (error) {
    next(error);
  }
};

export const exportUsersAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: Record<string, unknown> = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === "true";

    const users = await User.find(query).sort({ createdAt: -1 }).limit(5000).lean();

    const header = "id,name,email,role,isActive,createdAt\n";
    const rows = users
      .map((u) => {
        const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        return [
          u._id,
          escape(u.name as string),
          escape(u.email as string),
          u.role,
          u.isActive,
          (u as { createdAt?: Date }).createdAt?.toISOString?.() ?? "",
        ].join(",");
      })
      .join("\n");

    await logAdminAction({
      adminId: req.userId!,
      action: "EXPORT_USERS",
      resourceId: "users",
      resourceModel: "User",
      details: { count: users.length },
      ipAddress: req.ip,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users-export.csv"');
    res.status(200).send(header + rows);
  } catch (error) {
    next(error);
  }
};
