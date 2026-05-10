import { logger } from "./logger";

/**
 * Notification stubs. Wire these to a real provider (Resend, SendGrid, Postmark,
 * AWS SES, etc.) by replacing the bodies. Calls are fire-and-forget — never let
 * a notification failure block an order.
 */

export interface OrderEmailContext {
  orderNumber: string;
  email: string;
  firstName: string;
  total: number;
}

export async function sendOrderConfirmationEmail(ctx: OrderEmailContext): Promise<void> {
  logger.info({ ctx }, "[notifications] Order confirmation email (stub)");
}

export async function sendNewOrderAdminNotification(ctx: OrderEmailContext): Promise<void> {
  logger.info({ ctx }, "[notifications] New order admin notification (stub)");
}

export async function sendPaymentConfirmationEmail(ctx: OrderEmailContext): Promise<void> {
  logger.info({ ctx }, "[notifications] Payment confirmation email (stub)");
}

export async function sendStatusUpdateEmail(ctx: OrderEmailContext & { status: string }): Promise<void> {
  logger.info({ ctx }, "[notifications] Status update email (stub)");
}

export async function sendProofSentEmail(
  ctx: OrderEmailContext & { proofFileName: string; comment: string },
): Promise<void> {
  logger.info({ ctx }, "[notifications] Proof sent to customer (stub)");
}

export async function sendReadyForPickupEmail(
  ctx: OrderEmailContext & { pickupInstructions: string; estimatedReadyDate: string | null },
): Promise<void> {
  logger.info({ ctx }, "[notifications] Ready for pickup (stub)");
}

export async function sendQuoteReceivedEmail(ctx: {
  email: string;
  name: string;
  quoteId: number;
}): Promise<void> {
  logger.info({ ctx }, "[notifications] Quote request received (stub)");
}
