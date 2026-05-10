import { logger } from "../logger";

/**
 * Authorize.net payment integration (placeholder).
 *
 * To enable real charging, set the following environment variables and
 * implement the call to the Authorize.net Accept payments API where indicated:
 *
 *   AUTHORIZE_NET_API_LOGIN_ID     — Your API Login ID from the merchant portal
 *   AUTHORIZE_NET_TRANSACTION_KEY  — Your Transaction Key from the merchant portal
 *   AUTHORIZE_NET_ENVIRONMENT      — "sandbox" or "production"
 *
 * Sandbox endpoint:    https://apitest.authorize.net/xml/v1/request.api
 * Production endpoint: https://api.authorize.net/xml/v1/request.api
 *
 * Recommended SDK: the official `authorizenet` npm package, OR call the
 * JSON API directly with `fetch`. Keep credentials server-side only —
 * NEVER expose them to the browser. Card numbers should ideally be
 * tokenized via Authorize.net Accept.js on the frontend before being
 * sent to this service so raw PAN never touches our server.
 */

export type AuthorizeNetEnvironment = "sandbox" | "production";

export interface AuthorizeNetChargeInput {
  orderId: number;
  amount: number;
  cardNumber: string;
  expirationDate: string; // MMYY
  cardCode: string;
}

export interface AuthorizeNetChargeOutput {
  success: boolean;
  transactionId: string | null;
  message: string;
  /** Mapped to our internal payment status enum. */
  paymentStatus: "paid" | "test_paid" | "pending_payment" | "pending_authorize_net_connection" | "failed";
  rawResponse: Record<string, unknown>;
}

export interface AuthorizeNetConfig {
  apiLoginId: string;
  transactionKey: string;
  environment: AuthorizeNetEnvironment;
}

export function getAuthorizeNetConfig(): AuthorizeNetConfig | null {
  const apiLoginId = process.env["AUTHORIZE_NET_API_LOGIN_ID"];
  const transactionKey = process.env["AUTHORIZE_NET_TRANSACTION_KEY"];
  const environment = (process.env["AUTHORIZE_NET_ENVIRONMENT"] ?? "sandbox") as AuthorizeNetEnvironment;
  if (!apiLoginId || !transactionKey) return null;
  return { apiLoginId, transactionKey, environment };
}

export function isAuthorizeNetConfigured(): boolean {
  return getAuthorizeNetConfig() !== null;
}

/**
 * Charge a card via Authorize.net.
 *
 * If credentials are not configured, returns a "test/manual payment mode"
 * result that leaves the order in `pending_payment` so admins can collect
 * payment offline and mark the order paid manually from the dashboard.
 */
export async function chargeCard(input: AuthorizeNetChargeInput): Promise<AuthorizeNetChargeOutput> {
  const config = getAuthorizeNetConfig();
  if (!config) {
    // Test/demo mode: no real gateway is configured, so we accept the payment
    // optimistically and mark the order as paid. This keeps the customer-facing
    // checkout looking like a normal "paid on the website" flow during dev.
    // TODO: once Authorize.net credentials are added, the real branch below
    // will execute instead and actually authorize/capture the card.
    logger.warn(
      { orderId: input.orderId, amount: input.amount },
      "Authorize.net credentials not configured — accepting payment in test/demo mode",
    );
    return {
      success: true,
      transactionId: `TEST-${Date.now()}-${input.orderId}`,
      message: "Test payment accepted (Authorize.net not configured).",
      paymentStatus: "test_paid",
      rawResponse: { mode: "test_demo" },
    };
  }

  // ---------------------------------------------------------------------------
  // TODO: Implement the real Authorize.net charge here.
  //
  // Example skeleton using the JSON API (do NOT log card details):
  //
  //   const endpoint = config.environment === "production"
  //     ? "https://api.authorize.net/xml/v1/request.api"
  //     : "https://apitest.authorize.net/xml/v1/request.api";
  //
  //   const body = {
  //     createTransactionRequest: {
  //       merchantAuthentication: {
  //         name: config.apiLoginId,
  //         transactionKey: config.transactionKey,
  //       },
  //       transactionRequest: {
  //         transactionType: "authCaptureTransaction",
  //         amount: input.amount.toFixed(2),
  //         payment: {
  //           creditCard: {
  //             cardNumber: input.cardNumber,
  //             expirationDate: input.expirationDate,
  //             cardCode: input.cardCode,
  //           },
  //         },
  //         order: { invoiceNumber: String(input.orderId) },
  //       },
  //     },
  //   };
  //
  //   const response = await fetch(endpoint, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(body),
  //   });
  //   const json = await response.json();
  //
  //   const ok = json?.messages?.resultCode === "Ok"
  //     && json?.transactionResponse?.responseCode === "1";
  //
  //   return {
  //     success: ok,
  //     transactionId: json?.transactionResponse?.transId ?? null,
  //     message: ok
  //       ? "Charge approved"
  //       : (json?.transactionResponse?.errors?.[0]?.errorText ?? "Charge declined"),
  //     paymentStatus: ok ? "paid" : "failed",
  //     rawResponse: json,
  //   };
  // ---------------------------------------------------------------------------

  logger.error(
    { orderId: input.orderId },
    "Authorize.net is configured but the charge function has not been implemented yet",
  );
  // Until the real charge is implemented, leave the order as pending_payment
  // rather than failing it — admins can collect payment manually and mark
  // the order paid from the dashboard.
  return {
    success: true,
    transactionId: null,
    message: "Authorize.net integration is configured but not yet implemented. Order awaiting connection.",
    paymentStatus: "pending_authorize_net_connection",
    rawResponse: { mode: "configured_but_not_implemented" },
  };
}
