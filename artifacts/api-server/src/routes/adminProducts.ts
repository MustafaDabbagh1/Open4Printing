import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListAdminProductsResponseItem,
  UpdateAdminProductBody,
  UpdateAdminProductParams,
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
    startingPrice: Number(p.startingPrice),
    enabled: p.enabled,
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

  const updates: Partial<{
    name: string;
    shortDescription: string;
    startingPrice: string;
    enabled: boolean;
  }> = {};
  if (body.data.name != null) updates.name = body.data.name;
  if (body.data.shortDescription != null) updates.shortDescription = body.data.shortDescription;
  if (body.data.startingPrice != null) updates.startingPrice = Number(body.data.startingPrice).toFixed(2);
  if (body.data.enabled != null) updates.enabled = body.data.enabled;

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

export default router;
