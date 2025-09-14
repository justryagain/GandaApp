import { cookies, headers } from "next/headers";
import { authAdmin } from "./firebaseAdmin";
import crypto from "crypto";

export const SESSION_COOKIE = "__session";
const CSRF_COOKIE = "csrf";
const isProd = process.env.NODE_ENV === "production";

export async function getUserFromSession() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    return await authAdmin.verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}

export async function getCsrfToken(): Promise<string> {
  const store = await cookies();
  const t = store.get(CSRF_COOKIE)?.value;
  if (!t) throw new Error("CSRF token missing (middleware should set it).");
  return t;
}

/** Verify CSRF; pass cookieFromReq when in a Route Handler */
export async function verifyCsrfToken(
  submitted: string | null,
  cookieFromReq?: string | null
) {
  const token = cookieFromReq ?? (await cookies()).get(CSRF_COOKIE)?.value;
  if (!token || !submitted) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(submitted);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function requireHttps() {
  if (!isProd) return;
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto !== "https") throw new Error("HTTPS required");
}
