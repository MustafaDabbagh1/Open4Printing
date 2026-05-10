import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const QUOTE_STATUSES = ["new", "reviewing", "quoted", "accepted", "declined", "closed"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  productCategory: text("product_category").notNull().default(""),
  productSlug: text("product_slug"),
  description: text("description").notNull(),
  requestedQuantity: integer("requested_quantity"),
  notes: text("notes").notNull().default(""),
  status: text("status").$type<QuoteStatus>().notNull().default("new"),
  adminNotes: text("admin_notes").notNull().default(""),
  quotedAmount: text("quoted_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
