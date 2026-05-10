import { Router, type IRouter, type Request } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db, uploadedFilesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".eps",
  ".ai",
  ".psd",
]);

/**
 * Local disk storage. To replace with cloud storage (S3, R2, etc.) later:
 *   - swap multer.diskStorage for multer-s3 (or a memoryStorage + custom upload)
 *   - update `storagePath` to be a cloud key/URL
 *   - update the GET /uploads/:id download route to issue a signed URL
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]+/g, "_");
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    cb(null, `${stamp}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      cb(new Error(`Unsupported file type: ${ext}`));
      return;
    }
    cb(null, true);
  },
});

const router: IRouter = Router();

router.post("/uploads", upload.single("file"), async (req: Request, res): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const rawSide = typeof req.body?.side === "string" ? req.body.side.toLowerCase() : null;
  const side: "front" | "back" | null =
    rawSide === "front" || rawSide === "back" ? rawSide : null;

  const [row] = await db
    .insert(uploadedFilesTable)
    .values({
      orderId: null,
      orderItemId: null,
      originalName: file.originalname,
      fileType: file.mimetype || path.extname(file.originalname).slice(1),
      fileSize: file.size,
      storagePath: file.filename,
      side,
    })
    .returning();

  if (!row) {
    res.status(500).json({ error: "Failed to record upload" });
    return;
  }

  res.status(201).json({
    id: row.id,
    originalName: row.originalName,
    fileType: row.fileType,
    fileSize: row.fileSize,
    side: row.side,
    uploadedAt: row.uploadedAt.toISOString(),
  });
});

router.get("/uploads/:id/download", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [file] = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.id, id));
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.download(path.join(UPLOAD_DIR, file.storagePath), file.originalName);
});

export default router;
