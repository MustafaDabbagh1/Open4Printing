import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const COOKIE_NAME = "o4p_customer";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface CustomerTokenPayload {
  customerAccountId: number;
  email: string;
  role: "customer";
}

export function signCustomerToken(payload: Omit<CustomerTokenPayload, "role">): string {
  return jwt.sign({ ...payload, role: "customer" as const }, SESSION_SECRET!, {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function setCustomerCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: "/",
  });
}

export function clearCustomerCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function readCustomerToken(req: Request): CustomerTokenPayload | null {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SESSION_SECRET!) as Partial<CustomerTokenPayload>;
    if (
      decoded.role !== "customer" ||
      typeof decoded.customerAccountId !== "number" ||
      typeof decoded.email !== "string"
    ) {
      return null;
    }
    return { customerAccountId: decoded.customerAccountId, email: decoded.email, role: "customer" };
  } catch {
    return null;
  }
}

export function requireCustomer(req: Request, res: Response, next: NextFunction): void {
  const session = readCustomerToken(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  (req as Request & { customer?: CustomerTokenPayload }).customer = session;
  next();
}
