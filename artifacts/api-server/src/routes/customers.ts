import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  customerAccountsTable,
  customerAddressesTable,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import {
  CustomerRegisterBody,
  CustomerLoginBody,
  CustomerMeResponse,
  CreateCustomerAddressBody,
  ListCustomerOrdersResponseItem,
  ListCustomerAddressesResponseItem,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/auth";
import {
  signCustomerToken,
  setCustomerCookie,
  clearCustomerCookie,
  readCustomerToken,
  requireCustomer,
  type CustomerTokenPayload,
} from "../lib/customerAuth";

const router: IRouter = Router();

router.post("/customer/register", async (req, res): Promise<void> => {
  const parsed = CustomerRegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  const [existing] = await db
    .select()
    .from(customerAccountsTable)
    .where(eq(customerAccountsTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(customerAccountsTable)
    .values({
      email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone ?? null,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create account" });
    return;
  }
  const token = signCustomerToken({ customerAccountId: created.id, email: created.email });
  setCustomerCookie(res, token);
  res.json(
    CustomerMeResponse.parse({
      id: created.id,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      phone: created.phone,
    }),
  );
});

router.post("/customer/login", async (req, res): Promise<void> => {
  const parsed = CustomerLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  const [user] = await db
    .select()
    .from(customerAccountsTable)
    .where(eq(customerAccountsTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signCustomerToken({ customerAccountId: user.id, email: user.email });
  setCustomerCookie(res, token);
  res.json(
    CustomerMeResponse.parse({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    }),
  );
});

router.post("/customer/logout", (_req, res): void => {
  clearCustomerCookie(res);
  res.sendStatus(204);
});

router.get("/customer/me", async (req, res): Promise<void> => {
  const session = readCustomerToken(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(customerAccountsTable)
    .where(eq(customerAccountsTable.id, session.customerAccountId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(
    CustomerMeResponse.parse({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    }),
  );
});

router.get("/customer/orders", requireCustomer, async (req, res): Promise<void> => {
  const session = (req as typeof req & { customer?: CustomerTokenPayload }).customer!;
  const rows = await db
    .select({
      id: ordersTable.id,
      orderNumber: ordersTable.orderNumber,
      email: ordersTable.email,
      total: ordersTable.total,
      paymentStatus: ordersTable.paymentStatus,
      orderStatus: ordersTable.orderStatus,
      createdAt: ordersTable.createdAt,
      itemCount: sql<number>`(select count(*)::int from ${orderItemsTable} where ${orderItemsTable.orderId} = ${ordersTable.id})`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.customerAccountId, session.customerAccountId))
    .orderBy(desc(ordersTable.createdAt))
    .limit(200);
  res.json(
    rows.map((r) =>
      ListCustomerOrdersResponseItem.parse({
        id: r.id,
        orderNumber: r.orderNumber,
        email: r.email,
        firstName: "",
        lastName: "",
        total: Number(r.total),
        paymentStatus: r.paymentStatus,
        orderStatus: r.orderStatus,
        itemCount: Number(r.itemCount),
        createdAt: r.createdAt.toISOString(),
      }),
    ),
  );
});

router.get("/customer/addresses", requireCustomer, async (req, res): Promise<void> => {
  const session = (req as typeof req & { customer?: CustomerTokenPayload }).customer!;
  const rows = await db
    .select()
    .from(customerAddressesTable)
    .where(eq(customerAddressesTable.customerAccountId, session.customerAccountId))
    .orderBy(desc(customerAddressesTable.isDefault), desc(customerAddressesTable.id));
  res.json(
    rows.map((a) =>
      ListCustomerAddressesResponseItem.parse({
        id: a.id,
        label: a.label,
        address: a.address,
        isDefault: a.isDefault,
      }),
    ),
  );
});

router.post("/customer/addresses", requireCustomer, async (req, res): Promise<void> => {
  const session = (req as typeof req & { customer?: CustomerTokenPayload }).customer!;
  const parsed = CreateCustomerAddressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(customerAddressesTable)
    .values({
      customerAccountId: session.customerAccountId,
      label: parsed.data.label,
      address: parsed.data.address,
      isDefault: parsed.data.isDefault ?? false,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to save address" });
    return;
  }
  res.status(201).json({
    id: created.id,
    label: created.label,
    address: created.address,
    isDefault: created.isDefault,
  });
});

export default router;
