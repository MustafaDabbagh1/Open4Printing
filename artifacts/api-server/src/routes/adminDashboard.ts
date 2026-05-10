import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, ordersTable, customersTable, orderItemsTable } from "@workspace/db";
import { GetAdminDashboardStatsResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();
router.use(requireAdmin);

router.get("/admin/dashboard/stats", async (_req, res): Promise<void> => {
  const [counts] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      newOrders: sql<number>`sum(case when ${ordersTable.orderStatus} = 'new' then 1 else 0 end)::int`,
      awaitingArtworkReviewOrders: sql<number>`sum(case when ${ordersTable.orderStatus} = 'awaiting_artwork_review' then 1 else 0 end)::int`,
      proofPendingOrders: sql<number>`sum(case when ${ordersTable.orderStatus} in ('proof_needed','proof_sent') then 1 else 0 end)::int`,
      pendingPaymentOrders: sql<number>`sum(case when ${ordersTable.paymentStatus} in ('pending_payment','pending_authorize_net_connection') then 1 else 0 end)::int`,
      paidOrders: sql<number>`sum(case when ${ordersTable.paymentStatus} in ('paid','test_paid') then 1 else 0 end)::int`,
      inProductionOrders: sql<number>`sum(case when ${ordersTable.orderStatus} = 'in_production' then 1 else 0 end)::int`,
      completedOrders: sql<number>`sum(case when ${ordersTable.orderStatus} = 'completed' then 1 else 0 end)::int`,
      totalRevenue: sql<number>`coalesce(sum(case when ${ordersTable.paymentStatus} in ('paid','test_paid') then ${ordersTable.total} else 0 end)::numeric, 0)::float`,
    })
    .from(ordersTable);

  const recentRows = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      email: ordersTable.email,
      total: ordersTable.total,
      paymentStatus: ordersTable.paymentStatus,
      orderStatus: ordersTable.orderStatus,
      createdAt: ordersTable.createdAt,
      itemCount: sql<number>`(select count(*)::int from ${orderItemsTable} where ${orderItemsTable.orderId} = ${ordersTable.id})`,
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  res.json(
    GetAdminDashboardStatsResponse.parse({
      totalOrders: Number(counts?.totalOrders ?? 0),
      newOrders: Number(counts?.newOrders ?? 0),
      awaitingArtworkReviewOrders: Number(counts?.awaitingArtworkReviewOrders ?? 0),
      proofPendingOrders: Number(counts?.proofPendingOrders ?? 0),
      pendingPaymentOrders: Number(counts?.pendingPaymentOrders ?? 0),
      paidOrders: Number(counts?.paidOrders ?? 0),
      inProductionOrders: Number(counts?.inProductionOrders ?? 0),
      completedOrders: Number(counts?.completedOrders ?? 0),
      totalRevenue: Number(counts?.totalRevenue ?? 0),
      recentOrders: recentRows.map((r) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        email: r.email,
        firstName: r.firstName ?? "",
        lastName: r.lastName ?? "",
        total: Number(r.total),
        paymentStatus: r.paymentStatus,
        orderStatus: r.orderStatus,
        itemCount: Number(r.itemCount),
        createdAt: r.createdAt.toISOString(),
      })),
    }),
  );
});

export default router;
