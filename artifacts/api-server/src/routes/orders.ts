import { Router, type IRouter } from "express";
import { eq, and, inArray, isNull } from "drizzle-orm";
import {
  db,
  customersTable,
  ordersTable,
  orderItemsTable,
  uploadedFilesTable,
  paymentsTable,
} from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderByNumberParams,
  GetOrderByNumberResponse,
} from "@workspace/api-zod";
import { generateOrderNumber } from "../lib/orderNumber";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "../lib/notifications";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ err: parsed.error.message }, "Invalid order body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = parsed.data;
  if (body.items.length === 0) {
    res.status(400).json({ error: "Order must contain at least one item" });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone ?? null,
    })
    .returning();

  if (!customer) {
    res.status(500).json({ error: "Failed to create customer" });
    return;
  }

  const orderNumber = generateOrderNumber();

  const orderInsert: typeof ordersTable.$inferInsert = {
    orderNumber,
    customerId: customer.id,
    email: body.email,
    phone: body.phone ?? null,
    billingAddress: body.billingAddress,
    shippingAddress: body.shippingAddress,
    notes: body.notes ?? "",
    subtotal: body.subtotal.toFixed(2),
    tax: (body.tax ?? 0).toFixed(2),
    shipping: (body.shipping ?? 0).toFixed(2),
    total: body.total.toFixed(2),
    paymentStatus: "pending_payment",
    orderStatus: "new",
  };
  const [order] = await db.insert(ordersTable).values(orderInsert).returning();

  if (!order) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  const insertedItems = await db
    .insert(orderItemsTable)
    .values(
      body.items.map((item) => ({
        orderId: order.id,
        productSlug: item.productSlug,
        productName: item.productName,
        options: (item.options ?? {}) as Record<string, string | number>,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        lineTotal: item.lineTotal.toFixed(2),
      })),
    )
    .returning();

  for (let idx = 0; idx < body.items.length; idx++) {
    const sourceItem = body.items[idx]!;
    const insertedItem = insertedItems[idx]!;
    const fileIds = sourceItem.uploadedFileIds ?? [];
    if (fileIds.length > 0) {
      // Only bind files that are still unclaimed — never reassign a file
      // that has already been linked to an existing order/item.
      await db
        .update(uploadedFilesTable)
        .set({ orderId: order.id, orderItemId: insertedItem.id })
        .where(
          and(
            inArray(uploadedFilesTable.id, fileIds),
            isNull(uploadedFilesTable.orderId),
            isNull(uploadedFilesTable.orderItemId),
          ),
        );
    }
  }

  await Promise.all([
    sendOrderConfirmationEmail({
      orderNumber,
      email: body.email,
      firstName: body.firstName,
      total: body.total,
    }).catch((err) => req.log.error({ err }, "Order confirmation email failed")),
    sendNewOrderAdminNotification({
      orderNumber,
      email: body.email,
      firstName: body.firstName,
      total: body.total,
    }).catch((err) => req.log.error({ err }, "Admin notification failed")),
  ]);

  res.status(201).json({
    orderNumber: order.orderNumber,
    id: order.id,
    total: Number(order.total),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  });
});

router.get("/orders/:orderNumber", async (req, res): Promise<void> => {
  const params = GetOrderByNumberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, params.data.orderNumber));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

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

  res.json(
    GetOrderByNumberResponse.parse({
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
    }),
  );
});

export { and };
export default router;
