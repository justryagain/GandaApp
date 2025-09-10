import { NextResponse, type NextRequest } from "next/server";

// base64url helper for Edge runtime
function b64url(u8: Uint8Array) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Set CSRF cookie if missing
  if (!req.cookies.get("csrf")) {
    const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
    res.cookies.set("csrf", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/", "/login", "/signup", "/home", "/api/auth/:path*"],
};
