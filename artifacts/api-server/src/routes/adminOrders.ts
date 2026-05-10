import { Router, type IRouter } from "express";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import {
  db,
  ordersTable,
  customersTable,
  orderItemsTable,
  uploadedFilesTable,
  paymentsTable,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PROOF_STATUSES,
  type OrderStatus,
  type PaymentStatus,
  type ProofStatus,
} from "@workspace/db";
import {
  GetAdminOrderParams,
  GetAdminOrderResponse,
  UpdateAdminOrderParams,
  UpdateAdminOrderBody,
  ListAdminOrdersQueryParams,
  DuplicateAdminOrderParams,
  SetAdminOrderProofParams,
  SetAdminOrderProofBody,
  SetAdminOrderProofResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import {
  sendStatusUpdateEmail,
  sendPaymentConfirmationEmail,
  sendProofSentEmail,
  sendReadyForPickupEmail,
} from "../lib/notifications";
import { generateOrderNumber } from "../lib/orderNumber";

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
    conditions.push(or(ilike(ordersTable.orderNumber, term), ilike(ordersTable.email, term))!);
  }
  if (query.data.orderStatus) {
    conditions.push(eq(ordersTable.orderStatus, query.data.orderStatus as OrderStatus));
  }
  if (query.data.paymentStatus) {
    conditions.push(eq(ordersTable.paymentStatus, query.data.paymentStatus as PaymentStatus));
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
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, order.customerId));

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const files = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.orderId, order.id));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id));

  const filesByItem = new Map<number, typeof files>();
  for (const f of files) {
    if (f.orderItemId == null) continue;
    const arr = filesByItem.get(f.orderItemId) ?? [];
    arr.push(f);
    filesByItem.set(f.orderItemId, arr);
  }

  const proofFile = order.proofFileId != null
    ? files.find((f) => f.id === order.proofFileId) ??
      (
        await db
          .select()
          .from(uploadedFilesTable)
          .where(eq(uploadedFilesTable.id, order.proofFileId))
      )[0] ??
      null
    : null;

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
    internalNotes: order.internalNotes,
    deliveryMethod: order.deliveryMethod,
    pickupInstructions: order.pickupInstructions,
    estimatedReadyDate: order.estimatedReadyDate ? order.estimatedReadyDate.toISOString() : null,
    discountCode: order.discountCode,
    discountAmount: Number(order.discountAmount),
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    shipping: Number(order.shipping),
    total: Number(order.total),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    proofStatus: order.proofStatus,
    proofFileId: order.proofFileId,
    proofComment: order.proofComment,
    proofFile: proofFile
      ? {
          id: proofFile.id,
          originalName: proofFile.originalName,
          fileType: proofFile.fileType,
          fileSize: proofFile.fileSize,
          side: proofFile.side ?? null,
          isProof: proofFile.isProof,
          uploadedAt: proofFile.uploadedAt,
        }
      : null,
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
        side: f.side ?? null,
        isProof: f.isProof,
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

  const updates: Record<string, unknown> = {};
  if (body.data.orderStatus) {
    if (!ORDER_STATUSES.includes(body.data.orderStatus as OrderStatus)) {
      res.status(400).json({ error: "Invalid orderStatus" });
      return;
    }
    updates["orderStatus"] = body.data.orderStatus as OrderStatus;
  }
  if (body.data.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(body.data.paymentStatus as PaymentStatus)) {
      res.status(400).json({ error: "Invalid paymentStatus" });
      return;
    }
    updates["paymentStatus"] = body.data.paymentStatus as PaymentStatus;
  }
  if (body.data.proofStatus) {
    if (!PROOF_STATUSES.includes(body.data.proofStatus as ProofStatus)) {
      res.status(400).json({ error: "Invalid proofStatus" });
      return;
    }
    updates["proofStatus"] = body.data.proofStatus as ProofStatus;
  }
  if (body.data.internalNotes != null) updates["internalNotes"] = body.data.internalNotes;
  if (body.data.pickupInstructions != null) updates["pickupInstructions"] = body.data.pickupInstructions;
  if (body.data.estimatedReadyDate !== undefined) {
    updates["estimatedReadyDate"] = body.data.estimatedReadyDate
      ? new Date(body.data.estimatedReadyDate)
      : null;
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

  if (updates["paymentStatus"] === "paid" || updates["paymentStatus"] === "test_paid") {
    sendPaymentConfirmationEmail({
      orderNumber: updated.orderNumber,
      email: updated.email,
      firstName: "",
      total: Number(updated.total),
    }).catch((err) => req.log.error({ err }, "Payment email failed"));
  }
  if (updates["orderStatus"]) {
    sendStatusUpdateEmail({
      orderNumber: updated.orderNumber,
      email: updated.email,
      firstName: "",
      total: Number(updated.total),
      status: updates["orderStatus"] as string,
    }).catch((err) => req.log.error({ err }, "Status email failed"));
    if (updates["orderStatus"] === "ready_for_pickup") {
      sendReadyForPickupEmail({
        orderNumber: updated.orderNumber,
        email: updated.email,
        firstName: "",
        total: Number(updated.total),
        pickupInstructions: updated.pickupInstructions,
        estimatedReadyDate: updated.estimatedReadyDate ? updated.estimatedReadyDate.toISOString() : null,
      }).catch((err) => req.log.error({ err }, "Pickup email failed"));
    }
  }

  const detail = await loadOrderDetail(params.data.id);
  res.json(detail);
});

router.post("/admin/orders/:id/proof", async (req, res): Promise<void> => {
  const params = SetAdminOrderProofParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SetAdminOrderProofBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [file] = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.id, body.data.uploadedFileId));
  if (!file) {
    res.status(404).json({ error: "Proof file not found" });
    return;
  }
  if (file.orderId != null && file.orderId !== order.id) {
    res.status(409).json({ error: "Proof file is already attached to a different order" });
    return;
  }
  if (file.orderItemId != null) {
    res.status(409).json({ error: "Proof file belongs to a customer-uploaded item and cannot be reused as a proof" });
    return;
  }

  await db
    .update(uploadedFilesTable)
    .set({ isProof: true, orderId: order.id })
    .where(eq(uploadedFilesTable.id, file.id));
  await db
    .update(ordersTable)
    .set({
      proofFileId: file.id,
      proofStatus: "sent",
      orderStatus: "proof_sent",
    })
    .where(eq(ordersTable.id, order.id));

  sendProofSentEmail({
    orderNumber: order.orderNumber,
    email: order.email,
    firstName: "",
    total: Number(order.total),
    proofFileName: file.originalName,
    comment: order.proofComment,
  }).catch((err) => req.log.error({ err }, "Proof sent email failed"));

  const detail = await loadOrderDetail(order.id);
  res.json(SetAdminOrderProofResponse.parse(detail));
});

router.post("/admin/orders/:id/duplicate", async (req, res): Promise<void> => {
  const params = DuplicateAdminOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

  const newOrderNumber = generateOrderNumber();
  const [created] = await db
    .insert(ordersTable)
    .values({
      orderNumber: newOrderNumber,
      customerId: order.customerId,
      customerAccountId: order.customerAccountId,
      email: order.email,
      phone: order.phone,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      internalNotes: `Reorder of ${order.orderNumber}`,
      deliveryMethod: order.deliveryMethod,
      pickupInstructions: order.pickupInstructions,
      discountCode: null,
      discountAmount: "0",
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentStatus: "pending_payment",
      orderStatus: "new",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to duplicate order" });
    return;
  }
  if (items.length > 0) {
    await db.insert(orderItemsTable).values(
      items.map((it) => ({
        orderId: created.id,
        productSlug: it.productSlug,
        productName: it.productName,
        options: it.options ?? {},
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
      })),
    );
  }
  res.status(201).json({
    orderNumber: created.orderNumber,
    id: created.id,
    total: Number(created.total),
    paymentStatus: created.paymentStatus,
    orderStatus: created.orderStatus,
  });
});

export default router;
