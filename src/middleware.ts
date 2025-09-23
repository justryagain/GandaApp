import { NextResponse, type NextRequest } from "next/server";

// base64url helper for Edge runtime
function b64url(u8: Uint8Array) {
  let s = "";
  for (const val of u8) {
    s += String.fromCharCode(val);
  }
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBytes(len: number) {
  // Safe: using Web Crypto API in Edge runtime
  return crypto.getRandomValues(new Uint8Array(len));
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Set CSRF cookie if missing
  if (!req.cookies.get("csrf")) {
    const token = b64url(randomBytes(32));
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
