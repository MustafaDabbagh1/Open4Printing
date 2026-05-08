import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, paymentsTable } from "@workspace/db";
import {
  ChargeAuthorizeNetBody,
  ChargeAuthorizeNetResponse,
} from "@workspace/api-zod";
import { chargeCard } from "../lib/payments/authorize-net";
import { sendPaymentConfirmationEmail } from "../lib/notifications";

const router: IRouter = Router();

router.post("/payments/authorize-net/charge", async (req, res): Promise<void> => {
  const parsed = ChargeAuthorizeNetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { orderId, cardNumber, expirationDate, cardCode } = parsed.data;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(400).json({ error: "Order not found" });
    return;
  }
  if (order.paymentStatus === "paid") {
    res.status(409).json({ error: "Order is already paid" });
    return;
  }

  // Always charge the server-side order total — never trust client-supplied amounts.
  const amount = Number(order.total);
  const result = await chargeCard({ orderId, amount, cardNumber, expirationDate, cardCode });

  await db.insert(paymentsTable).values({
    orderId,
    provider: "authorize_net",
    providerTransactionId: result.transactionId,
    amount: amount.toFixed(2),
    status: result.paymentStatus,
    rawResponse: result.rawResponse,
  });

  if (result.paymentStatus === "paid") {
    await db
      .update(ordersTable)
      .set({ paymentStatus: "paid" })
      .where(eq(ordersTable.id, orderId));
    sendPaymentConfirmationEmail({
      orderNumber: order.orderNumber,
      email: order.email,
      firstName: "",
      total: Number(order.total),
    }).catch((err) => req.log.error({ err }, "Payment email failed"));
  } else if (result.paymentStatus === "failed") {
    await db
      .update(ordersTable)
      .set({ paymentStatus: "failed" })
      .where(eq(ordersTable.id, orderId));
  }

  res.json(
    ChargeAuthorizeNetResponse.parse({
      success: result.success,
      transactionId: result.transactionId,
      message: result.message,
      paymentStatus: result.paymentStatus,
    }),
  );
});

export default router;
