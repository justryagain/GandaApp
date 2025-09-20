import type { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { authAdmin } from "./firebaseAdmin";
import crypto from "crypto";

export const SESSION_COOKIE = "__session";
const CSRF_COOKIE = "csrf";
const isProd = process.env.NODE_ENV === "production";

export async function getUserFromSession(): Promise<DecodedIdToken | null> {
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
  try {
    const token = cookieFromReq ?? (await cookies()).get("csrf")?.value;
    if (!token || !submitted) return false;

    const a = Buffer.from(token);
    const b = Buffer.from(submitted);

    // timingSafeEqual will throw if lengths differ → catch prevents 500s
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}


export async function requireHttps() {
  if (!isProd) return;
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto !== "https") throw new Error("HTTPS required");
}

/** Detect if client wants JSON instead of HTML (used for infra/Cypress). */
export function wantsJson(req: NextRequest): boolean {
  const accept = req.headers.get("accept") || "";
  const xhr = req.headers.get("x-requested-with") || "";
  return accept.includes("application/json") || xhr === "XMLHttpRequest";
}

/** Consistent error response: JSON for infra, redirect with query param for browsers. */
export function errorResponse(
  req: NextRequest,
  message: string,
  redirectUrl: string,
  status = 400
) {
  return wantsJson(req)
    ? NextResponse.json({ error: message }, { status })
    : NextResponse.redirect(new URL(redirectUrl, req.url));
}