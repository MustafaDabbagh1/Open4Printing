import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, productsTable, DEFAULT_UPLOAD_CONFIG, type ProductUploadConfig, type ProductOptions } from "@workspace/db";
import {
  ListAdminProductsResponseItem,
  CreateAdminProductBody,
  UpdateAdminProductBody,
  UpdateAdminProductParams,
  DeleteAdminProductParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.use(requireAdmin);

function toAdminProduct(p: typeof productsTable.$inferSelect) {
  return ListAdminProductsResponseItem.parse({
    id: p.id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.categorySlug,
    shortDescription: p.shortDescription,
    description: p.description,
    startingPrice: Number(p.startingPrice),
    enabled: p.enabled,
    uploadConfig: p.uploadConfig ?? DEFAULT_UPLOAD_CONFIG,
    options: p.options ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
}

router.get("/admin/products", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.categorySlug), asc(productsTable.name));
  res.json(rows.map(toAdminProduct));
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const parsed = CreateAdminProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, parsed.data.slug));
  if (existing) {
    res.status(400).json({ error: "Product slug already exists" });
    return;
  }
  const [created] = await db
    .insert(productsTable)
    .values({
      slug: parsed.data.slug,
      name: parsed.data.name,
      categorySlug: parsed.data.categorySlug,
      shortDescription: parsed.data.shortDescription ?? "",
      description: parsed.data.description ?? "",
      startingPrice: Number(parsed.data.startingPrice).toFixed(2),
      enabled: parsed.data.enabled ?? true,
      uploadConfig: (parsed.data.uploadConfig as ProductUploadConfig | null) ?? DEFAULT_UPLOAD_CONFIG,
      options: (parsed.data.options as ProductOptions | null) ?? null,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create product" });
    return;
  }
  res.status(201).json(toAdminProduct(created));
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const params = UpdateAdminProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAdminProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.data.name != null) updates["name"] = body.data.name;
  if (body.data.categorySlug != null) updates["categorySlug"] = body.data.categorySlug;
  if (body.data.shortDescription != null) updates["shortDescription"] = body.data.shortDescription;
  if (body.data.description != null) updates["description"] = body.data.description;
  if (body.data.startingPrice != null) updates["startingPrice"] = Number(body.data.startingPrice).toFixed(2);
  if (body.data.enabled != null) updates["enabled"] = body.data.enabled;
  if (body.data.uploadConfig !== undefined && body.data.uploadConfig !== null)
    updates["uploadConfig"] = body.data.uploadConfig;
  if (body.data.options !== undefined) updates["options"] = body.data.options;

  if (Object.keys(updates).length === 0) {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
    if (!p) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(toAdminProduct(p));
    return;
  }

  const [updated] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(toAdminProduct(updated));
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const params = DeleteAdminProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning({ id: productsTable.id });
  if (result.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
