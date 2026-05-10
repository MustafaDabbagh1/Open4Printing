import { pgTable, text, serial, integer, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ORDER_STATUSES = [
  "new",
  "awaiting_artwork_review",
  "proof_needed",
  "proof_sent",
  "proof_approved",
  "in_production",
  "ready_for_pickup",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending_payment",
  "pending_authorize_net_connection",
  "test_paid",
  "paid",
  "failed",
  "refunded",
  "cancelled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_METHODS = ["shipping", "pickup"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const PROOF_STATUSES = ["none", "sent", "approved", "rejected"] as const;
export type ProofStatus = (typeof PROOF_STATUSES)[number];

export type Address = {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  customerAccountId: integer("customer_account_id"),
  email: text("email").notNull(),
  phone: text("phone"),
  billingAddress: jsonb("billing_address").$type<Address>().notNull(),
  shippingAddress: jsonb("shipping_address").$type<Address>().notNull(),
  notes: text("notes").notNull().default(""),
  internalNotes: text("internal_notes").notNull().default(""),
  deliveryMethod: text("delivery_method").$type<DeliveryMethod>().notNull().default("shipping"),
  pickupInstructions: text("pickup_instructions").notNull().default(""),
  estimatedReadyDate: timestamp("estimated_ready_date", { withTimezone: true }),
  discountCode: text("discount_code"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").$type<PaymentStatus>().notNull().default("pending_payment"),
  orderStatus: text("order_status").$type<OrderStatus>().notNull().default("new"),
  proofStatus: text("proof_status").$type<ProofStatus>().notNull().default("none"),
  proofFileId: integer("proof_file_id"),
  proofComment: text("proof_comment").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
