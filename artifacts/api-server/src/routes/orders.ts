import { Router, type IRouter } from "express";
import { eq, and, inArray, isNull } from "drizzle-orm";
import {
  db,
  customersTable,
  ordersTable,
  orderItemsTable,
  uploadedFilesTable,
  paymentsTable,
  productsTable,
  couponsTable,
  PROOF_STATUSES,
  type ProofStatus,
} from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderByNumberParams,
  GetOrderByNumberResponse,
  RespondToProofParams,
  RespondToProofBody,
  RespondToProofResponse,
} from "@workspace/api-zod";
import { generateOrderNumber } from "../lib/orderNumber";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "../lib/notifications";
import { readCustomerToken } from "../lib/customerAuth";

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

  // Server-side product/price validation: enforce artworkRequired per product
  // and reject prices below the product's starting price floor.
  const slugs = Array.from(new Set(body.items.map((i) => i.productSlug)));
  const products = slugs.length
    ? await db.select().from(productsTable).where(inArray(productsTable.slug, slugs))
    : [];
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  for (const item of body.items) {
    const product = productBySlug.get(item.productSlug);
    if (!product || !product.enabled) {
      res.status(400).json({ error: `Unknown or disabled product: ${item.productSlug}` });
      return;
    }
    const cfg = product.uploadConfig;
    const required = cfg?.artworkRequired ?? false;
    const fileIds = item.uploadedFileIds ?? [];
    if (required && fileIds.length === 0) {
      res.status(400).json({ error: `Artwork required for ${item.productName}` });
      return;
    }
    if (item.quantity <= 0) {
      res.status(400).json({ error: `Invalid quantity for ${item.productName}` });
      return;
    }
    const floor = Number(product.startingPrice);
    if (Number.isFinite(floor) && item.unitPrice + 0.0001 < floor) {
      res.status(400).json({
        error: `Unit price for ${item.productName} is below the listed starting price`,
      });
      return;
    }
  }

  // Server-authoritative totals: recompute from items, ignore client-supplied
  // subtotal/discountAmount/total. Tax/shipping accepted only as non-negative
  // numbers (full tax/shipping calc lives on the client today; we still clamp
  // and zero out shipping for pickup orders).
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const computedItems = body.items.map((item) => ({
    item,
    lineTotal: round2(item.unitPrice * item.quantity),
  }));
  const subtotal = round2(computedItems.reduce((s, ci) => s + ci.lineTotal, 0));

  // Revalidate coupon server-side from DB; never trust client-supplied discountAmount.
  let appliedDiscountCode: string | null = null;
  let appliedDiscount = 0;
  if (body.discountCode && body.discountCode.trim()) {
    const code = body.discountCode.trim().toUpperCase();
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(and(eq(couponsTable.code, code), eq(couponsTable.active, true)));
    if (!coupon) {
      res.status(400).json({ error: "Invalid or inactive discount code" });
      return;
    }
    if (coupon.percentOff != null) {
      appliedDiscount = round2(subtotal * (coupon.percentOff / 100));
    } else if (coupon.amountOff != null) {
      appliedDiscount = Math.min(subtotal, Number(coupon.amountOff));
    }
    appliedDiscountCode = coupon.code;
  }

  const isPickup = body.deliveryMethod === "pickup";
  const tax = Math.max(0, Number(body.tax ?? 0));
  const shipping = isPickup ? 0 : Math.max(0, Number(body.shipping ?? 0));
  const total = round2(Math.max(0, subtotal - appliedDiscount + tax + shipping));

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

  const customerSession = readCustomerToken(req);
  const orderNumber = generateOrderNumber();

  const orderInsert: typeof ordersTable.$inferInsert = {
    orderNumber,
    customerId: customer.id,
    customerAccountId: customerSession?.customerAccountId ?? null,
    email: body.email,
    phone: body.phone ?? null,
    billingAddress: body.billingAddress,
    shippingAddress: body.shippingAddress,
    notes: body.notes ?? "",
    deliveryMethod: isPickup ? "pickup" : "shipping",
    pickupInstructions: body.pickupInstructions ?? "",
    discountCode: appliedDiscountCode,
    discountAmount: appliedDiscount.toFixed(2),
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
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
      computedItems.map(({ item, lineTotal }) => ({
        orderId: order.id,
        productSlug: item.productSlug,
        productName: item.productName,
        options: (item.options ?? {}) as Record<string, string | number>,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      })),
    )
    .returning();

  for (let idx = 0; idx < body.items.length; idx++) {
    const sourceItem = body.items[idx]!;
    const insertedItem = insertedItems[idx]!;
    const fileIds = sourceItem.uploadedFileIds ?? [];
    if (fileIds.length > 0) {
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
      total,
    }).catch((err) => req.log.error({ err }, "Order confirmation email failed")),
    sendNewOrderAdminNotification({
      orderNumber,
      email: body.email,
      firstName: body.firstName,
      total,
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

async function buildOrderDetail(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
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

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    billingAddress: order.billingAddress,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
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
  };
}

router.get("/orders/:orderNumber", async (req, res): Promise<void> => {
  const params = GetOrderByNumberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, params.data.orderNumber));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const detail = await buildOrderDetail(order.id);
  res.json(GetOrderByNumberResponse.parse(detail));
});

router.post("/orders/:orderNumber/proof-response", async (req, res): Promise<void> => {
  const params = RespondToProofParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = RespondToProofBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
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
  if (order.email.toLowerCase() !== body.data.email.toLowerCase()) {
    res.status(403).json({ error: "Email does not match order" });
    return;
  }

  const newProofStatus: ProofStatus = body.data.decision === "approve" ? "approved" : "rejected";
  if (!PROOF_STATUSES.includes(newProofStatus)) {
    res.status(400).json({ error: "Invalid decision" });
    return;
  }

  await db
    .update(ordersTable)
    .set({
      proofStatus: newProofStatus,
      proofComment: body.data.comment ?? "",
      orderStatus: newProofStatus === "approved" ? "proof_approved" : order.orderStatus,
    })
    .where(eq(ordersTable.id, order.id));

  const detail = await buildOrderDetail(order.id);
  res.json(RespondToProofResponse.parse(detail));
});

export default router;
