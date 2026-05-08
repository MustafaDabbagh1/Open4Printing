import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { AdminLoginBody, AdminLoginResponse, AdminMeResponse } from "@workspace/api-zod";
import {
  verifyPassword,
  signAdminToken,
  setAdminCookie,
  clearAdminCookie,
  readAdminToken,
  requireAdmin,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // The "email" field is treated as a login identifier — accept either an
  // email address (matched lowercased) or a username (case-sensitive).
  const identifier = parsed.data.email.trim();
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(
      or(
        eq(adminUsersTable.email, identifier.toLowerCase()),
        eq(adminUsersTable.username, identifier),
      ),
    );

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signAdminToken({ userId: user.id, email: user.email });
  setAdminCookie(res, token);

  res.json(AdminLoginResponse.parse({ id: user.id, email: user.email, name: user.name }));
});

router.post("/admin/logout", (_req, res): void => {
  clearAdminCookie(res);
  res.sendStatus(204);
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const session = readAdminToken(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, session.userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(AdminMeResponse.parse({ id: user.id, email: user.email, name: user.name }));
});

export { requireAdmin };
export default router;
