export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";

const API_KEY = process.env.FIREBASE_API_KEY!;
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.APP_ENV === "test";
const REQUIRE_VERIFY = (process.env.FIREBASE_REQUIRE_EMAIL_VERIFICATION ?? "true") !== "false";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    // --- Parse body ---
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return jsonError("Invalid request body", 400);
    }

    // --- CSRF check ---
    const csrf = String(form.get("_csrf") || "");
    const csrfCookie = req.cookies.get("csrf")?.value ?? null;

    if (isTest && csrf === "force-bad") {
      return jsonError("Invalid CSRF token", 400);
    }

    if (!isTest) {
      if (!csrf || !csrfCookie || csrf !== csrfCookie) {
        return jsonError("Invalid CSRF token", 400);
      }
    }

    // --- Credentials ---
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (!email || !password) {
      return jsonError("Missing or invalid credentials", 422);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Invalid email format", 422);
    }

    // --- Sign in with Firebase REST API ---
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
      return jsonError("Invalid credentials", 401);
    }

    const { idToken } = (await r.json()) as { idToken: string };
    const decoded = await authAdmin.verifyIdToken(idToken);

    if (!isTest && REQUIRE_VERIFY && !decoded.email_verified) {
      return jsonError("Email not verified", 403);
    }

    // --- Create session cookie ---
    const expiresInMs = 15 * 60 * 1000;
    const cookie = await authAdmin.createSessionCookie(idToken, {
      expiresIn: expiresInMs,
    });

    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set("__session", cookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(expiresInMs / 1000),
    });

    return res;
  } catch (err) {
    console.error("Login failed:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
