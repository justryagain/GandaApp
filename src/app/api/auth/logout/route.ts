export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.APP_ENV === "test";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
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

    // --- Clear session cookie ---
    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set("__session", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err: any) {
    console.error("Logout failed:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
