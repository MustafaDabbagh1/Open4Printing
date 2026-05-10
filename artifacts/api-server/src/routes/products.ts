import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { GetPublicProductParams, GetPublicProductResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_UPLOAD_CONFIG = {
  artworkRequired: true,
  allowsBackUpload: false,
  preferredFormats: ["pdf", "png", "jpg"],
  notes: "",
};

router.get("/products/:slug", async (req, res): Promise<void> => {
  const params = GetPublicProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [p] = await db.select().from(productsTable).where(eq(productsTable.slug, params.data.slug));
  if (!p) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(
    GetPublicProductResponse.parse({
      id: p.id,
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug,
      shortDescription: p.shortDescription,
      description: p.description,
      startingPrice: Number(p.startingPrice),
      enabled: p.enabled,
      uploadConfig: p.uploadConfig ?? DEFAULT_UPLOAD_CONFIG,
    }),
  );
});

export default router;
