export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";
import { verifyCsrfToken } from "@/lib/auth";

const API_KEY = process.env.FIREBASE_API_KEY!;
const isProd = process.env.NODE_ENV === "production";
const REQUIRE_VERIFY = (process.env.FIREBASE_REQUIRE_EMAIL_VERIFICATION ?? "true") !== "false";

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // CSRF
  const csrf = String(form.get("_csrf") || "");
  const csrfCookie = req.cookies.get("csrf")?.value ?? null;
  if (!(await verifyCsrfToken(csrf, csrfCookie))) {
    return NextResponse.redirect(new URL("/login?e=csrf", req.url));
  }

  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?e=creds", req.url));
  }

  // 🔑 Lookup user first, to check verification status
  try {
    const userRecord = await authAdmin.getUserByEmail(email);

    if (REQUIRE_VERIFY && !userRecord.emailVerified) {
      return NextResponse.redirect(new URL("/login?e=verify", req.url));
    }
  } catch {
    // If user doesn't exist, let Firebase handle it below
  }

  // Exchange credentials for ID token
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
    }
  );

  if (!r.ok) {
    return NextResponse.redirect(new URL("/login?e=creds", req.url));
  }

  const { idToken } = (await r.json()) as { idToken: string };

  // (Optional double-check in case of race conditions)
  const decoded = await authAdmin.verifyIdToken(idToken);
  if (REQUIRE_VERIFY && !decoded.email_verified) {
    return NextResponse.redirect(new URL("/login?e=verify", req.url));
  }

  // Mint session cookie
  const expiresInMs = 5 * 24 * 60 * 60 * 1000;
  const cookie = await authAdmin.createSessionCookie(idToken, { expiresIn: expiresInMs });

  const res = NextResponse.redirect(new URL("/home", req.url));
  res.cookies.set("__session", cookie, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(expiresInMs / 1000),
  });
  return res;
}
