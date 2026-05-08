import { Router, type IRouter } from "express";
import { eq, desc, ilike, or, sql, count } from "drizzle-orm";
import {
  db,
  ordersTable,
  customersTable,
  orderItemsTable,
  uploadedFilesTable,
  paymentsTable,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@workspace/db";
import {
  GetAdminOrderParams,
  GetAdminOrderResponse,
  UpdateAdminOrderParams,
  UpdateAdminOrderBody,
  ListAdminOrdersQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { sendStatusUpdateEmail, sendPaymentConfirmationEmail } from "../lib/notifications";

const router: IRouter = Router();

router.use(requireAdmin);

router.get("/admin/orders", async (req, res): Promise<void> => {
  const query = ListAdminOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.search) {
    const term = `%${query.data.search}%`;
    conditions.push(
      or(
        ilike(ordersTable.orderNumber, term),
        ilike(ordersTable.email, term),
      )!,
    );
  }
  if (query.data.orderStatus) {
    conditions.push(eq(ordersTable.orderStatus, query.data.orderStatus as (typeof ORDER_STATUSES)[number]));
  }
  if (query.data.paymentStatus) {
    conditions.push(eq(ordersTable.paymentStatus, query.data.paymentStatus as (typeof PAYMENT_STATUSES)[number]));
  }

  const rows = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      email: ordersTable.email,
      total: ordersTable.total,
      paymentStatus: ordersTable.paymentStatus,
      orderStatus: ordersTable.orderStatus,
      createdAt: ordersTable.createdAt,
      customerId: ordersTable.customerId,
      itemCount: sql<number>`(select count(*)::int from ${orderItemsTable} where ${orderItemsTable.orderId} = ${ordersTable.id})`,
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .where(conditions.length > 0 ? sql.join(conditions, sql` and `) : undefined)
    .orderBy(desc(ordersTable.createdAt))
    .limit(200);

  res.json(
    rows.map((r) => ({
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
  );
});

async function loadOrderDetail(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, order.customerId));

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));
  const files = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.orderId, order.id));
  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.orderId, order.id));

  const filesByItem = new Map<number, typeof files>();
  for (const f of files) {
    if (f.orderItemId == null) continue;
    const arr = filesByItem.get(f.orderItemId) ?? [];
    arr.push(f);
    filesByItem.set(f.orderItemId, arr);
  }

  return GetAdminOrderResponse.parse({
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    billingAddress: order.billingAddress,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    shipping: Number(order.shipping),
    total: Number(order.total),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: items.map((it) => ({
      id: it.id,
      productSlug: it.productSlug,
      productName: it.productName,
      options: it.options ?? {},
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      lineTotal: Number(it.lineTotal),
      files: (filesByItem.get(it.id) ?? []).map((f) => ({
        id: f.id,
        originalName: f.originalName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        uploadedAt: f.uploadedAt,
      })),
    })),
    payments: payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      providerTransactionId: p.providerTransactionId,
      amount: Number(p.amount),
      status: p.status,
      createdAt: p.createdAt,
    })),
  });
}

router.get("/admin/orders/:id", async (req, res): Promise<void> => {
  const params = GetAdminOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const detail = await loadOrderDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(detail);
});

router.patch("/admin/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateAdminOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAdminOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Partial<{ orderStatus: (typeof ORDER_STATUSES)[number]; paymentStatus: (typeof PAYMENT_STATUSES)[number] }> = {};
  if (body.data.orderStatus) {
    if (!ORDER_STATUSES.includes(body.data.orderStatus as (typeof ORDER_STATUSES)[number])) {
      res.status(400).json({ error: "Invalid orderStatus" });
      return;
    }
    updates.orderStatus = body.data.orderStatus as (typeof ORDER_STATUSES)[number];
  }
  if (body.data.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(body.data.paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
      res.status(400).json({ error: "Invalid paymentStatus" });
      return;
    }
    updates.paymentStatus = body.data.paymentStatus as (typeof PAYMENT_STATUSES)[number];
  }

  if (Object.keys(updates).length === 0) {
    const detail = await loadOrderDetail(params.data.id);
    if (!detail) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(detail);
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set(updates)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (updates.paymentStatus === "paid") {
    sendPaymentConfirmationEmail({
      orderNumber: updated.orderNumber,
      email: updated.email,
      firstName: "",
      total: Number(updated.total),
    }).catch((err) => req.log.error({ err }, "Payment email failed"));
  }
  if (updates.orderStatus) {
    sendStatusUpdateEmail({
      orderNumber: updated.orderNumber,
      email: updated.email,
      firstName: "",
      total: Number(updated.total),
      status: updates.orderStatus,
    }).catch((err) => req.log.error({ err }, "Status email failed"));
  }

  const detail = await loadOrderDetail(params.data.id);
  res.json(detail);
});

export { count };
export default router;
