import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const COOKIE_NAME = "o4p_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AdminTokenPayload {
  userId: number;
  email: string;
  role: "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: Omit<AdminTokenPayload, "role">): string {
  return jwt.sign({ ...payload, role: "admin" as const }, SESSION_SECRET!, {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function setAdminCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: "/",
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function readAdminToken(req: Request): AdminTokenPayload | null {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SESSION_SECRET!) as Partial<AdminTokenPayload>;
    if (decoded.role !== "admin" || typeof decoded.userId !== "number" || typeof decoded.email !== "string") {
      return null;
    }
    return { userId: decoded.userId, email: decoded.email, role: "admin" };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = readAdminToken(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  (req as Request & { admin?: AdminTokenPayload }).admin = session;
  next();
}
