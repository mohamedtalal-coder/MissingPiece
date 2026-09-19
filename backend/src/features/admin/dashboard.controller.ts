import type { Request, Response, NextFunction } from "express";
import { Order } from "../orders/order.model.js";
import { User } from "../auth/user.model.js";
import { Review } from "../reviews/review.model.js";
import { Contact } from "../contact/contact.model.js";
import { Product } from "../products/product.model.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getAdminDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = startOfToday();

    const [
      ordersToday,
      revenueAgg,
      pendingReviews,
      unreadInquiries,
      totalUsers,
      activeProducts,
      statusBreakdown,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $in: ["paid", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Review.countDocuments({ status: { $in: ["pending", "flagged"] } }),
      Contact.countDocuments({ status: "unread" }),
      User.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const ordersByStatus: Record<string, number> = {};
    for (const row of statusBreakdown) {
      ordersByStatus[row._id as string] = row.count as number;
    }

    res.json({
      success: true,
      metrics: {
        ordersToday,
        revenueToday: revenueAgg[0]?.total ?? 0,
        pendingReviews,
        unreadInquiries,
        totalUsers,
        activeProducts,
        ordersByStatus,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
