import { pgTable, text, serial, boolean, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type ProductOptions = {
  sizes?: string[];
  materials?: string[];
  finishes?: string[];
  turnarounds?: string[];
  sides?: string[];
};

export type ProductUploadConfig = {
  artworkRequired: boolean;
  allowsBackUpload: boolean;
  preferredFormats: string[];
  notes: string;
};

export const DEFAULT_UPLOAD_CONFIG: ProductUploadConfig = {
  artworkRequired: true,
  allowsBackUpload: false,
  preferredFormats: ["pdf", "png", "jpg"],
  notes: "",
};

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categorySlug: text("category_slug").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  startingPrice: numeric("starting_price", { precision: 10, scale: 2 }).notNull().default("0"),
  options: jsonb("options").$type<ProductOptions>(),
  uploadConfig: jsonb("upload_config").$type<ProductUploadConfig>(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
