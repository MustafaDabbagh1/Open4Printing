import { Router, type IRouter } from "express";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  db,
  quoteRequestsTable,
  uploadedFilesTable,
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@workspace/db";
import {
  CreateQuoteRequestBody,
  GetAdminQuoteParams,
  GetAdminQuoteResponse,
  ListAdminQuotesQueryParams,
  ListAdminQuotesResponseItem,
  UpdateAdminQuoteBody,
  UpdateAdminQuoteParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { sendQuoteReceivedEmail } from "../lib/notifications";

const router: IRouter = Router();

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;
  const [created] = await db
    .insert(quoteRequestsTable)
    .values({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone ?? null,
      productCategory: body.productCategory,
      productSlug: body.productSlug ?? null,
      description: body.description,
      requestedQuantity: body.requestedQuantity ?? null,
      notes: body.notes ?? "",
      status: "new",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create quote request" });
    return;
  }

  const fileIds = body.uploadedFileIds ?? [];
  if (fileIds.length > 0) {
    await db
      .update(uploadedFilesTable)
      .set({ quoteRequestId: created.id })
      .where(
        and(
          inArray(uploadedFilesTable.id, fileIds),
          isNull(uploadedFilesTable.orderId),
          isNull(uploadedFilesTable.quoteRequestId),
        ),
      );
  }

  sendQuoteReceivedEmail({ email: created.email, name: created.name, quoteId: created.id }).catch(
    (err) => req.log.error({ err }, "Quote email failed"),
  );

  res.status(201).json({
    id: created.id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    productCategory: created.productCategory,
    productSlug: created.productSlug,
    description: created.description,
    requestedQuantity: created.requestedQuantity,
    notes: created.notes,
    status: created.status,
    adminNotes: created.adminNotes,
    quotedAmount: created.quotedAmount,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  });
});

router.get("/admin/quotes", requireAdmin, async (req, res): Promise<void> => {
  const query = ListAdminQuotesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const where = query.data.status
    ? eq(quoteRequestsTable.status, query.data.status as QuoteStatus)
    : undefined;
  const rows = await db
    .select()
    .from(quoteRequestsTable)
    .where(where)
    .orderBy(desc(quoteRequestsTable.createdAt))
    .limit(200);
  res.json(
    rows.map((r) =>
      ListAdminQuotesResponseItem.parse({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        productCategory: r.productCategory,
        productSlug: r.productSlug,
        description: r.description,
        requestedQuantity: r.requestedQuantity,
        notes: r.notes,
        status: r.status,
        adminNotes: r.adminNotes,
        quotedAmount: r.quotedAmount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    ),
  );
});

router.get("/admin/quotes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminQuoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [q] = await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, params.data.id));
  if (!q) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  const files = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.quoteRequestId, q.id))
    .orderBy(asc(uploadedFilesTable.id));
  res.json(
    GetAdminQuoteResponse.parse({
      id: q.id,
      name: q.name,
      email: q.email,
      phone: q.phone,
      productCategory: q.productCategory,
      productSlug: q.productSlug,
      description: q.description,
      requestedQuantity: q.requestedQuantity,
      notes: q.notes,
      status: q.status,
      adminNotes: q.adminNotes,
      quotedAmount: q.quotedAmount,
      files: files.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        side: f.side ?? null,
        isProof: f.isProof,
        uploadedAt: f.uploadedAt,
      })),
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }),
  );
});

router.patch("/admin/quotes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminQuoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAdminQuoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Partial<{ status: QuoteStatus; adminNotes: string; quotedAmount: string | null }> = {};
  if (body.data.status) {
    if (!QUOTE_STATUSES.includes(body.data.status as QuoteStatus)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    updates.status = body.data.status as QuoteStatus;
  }
  if (body.data.adminNotes != null) updates.adminNotes = body.data.adminNotes;
  if (body.data.quotedAmount !== undefined) updates.quotedAmount = body.data.quotedAmount;

  if (Object.keys(updates).length > 0) {
    await db.update(quoteRequestsTable).set(updates).where(eq(quoteRequestsTable.id, params.data.id));
  }
  // Re-fetch with files for response
  req.url = `/admin/quotes/${params.data.id}`;
  // Just call same handler logic inline
  const [q] = await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, params.data.id));
  if (!q) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  const files = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.quoteRequestId, q.id));
  res.json(
    GetAdminQuoteResponse.parse({
      id: q.id,
      name: q.name,
      email: q.email,
      phone: q.phone,
      productCategory: q.productCategory,
      productSlug: q.productSlug,
      description: q.description,
      requestedQuantity: q.requestedQuantity,
      notes: q.notes,
      status: q.status,
      adminNotes: q.adminNotes,
      quotedAmount: q.quotedAmount,
      files: files.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        side: f.side ?? null,
        isProof: f.isProof,
        uploadedAt: f.uploadedAt,
      })),
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }),
  );
});

export default router;
