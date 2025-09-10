export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyCsrfToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const csrf = String(form.get("_csrf") || "");
  const csrfCookie = req.cookies.get("csrf")?.value ?? null;
  if (!(await verifyCsrfToken(csrf, csrfCookie))) {
    return NextResponse.redirect(new URL("/login?e=csrf", req.url));
  }
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("__session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
