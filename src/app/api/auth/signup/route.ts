export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";
import { verifyCsrfToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mailer";

const isProd = process.env.NODE_ENV === "production";

function cleanName(s: string) {
  return s.replace(/[^a-zA-Z\u00C0-\u024F' -]/g, "").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // CSRF
  const csrf = String(form.get("_csrf") || "");
  const csrfCookie = req.cookies.get("csrf")?.value ?? null;
  if (!(await verifyCsrfToken(csrf, csrfCookie))) {
    return NextResponse.redirect(new URL("/signup?e=csrf", req.url));
  }

  const first = cleanName(String(form.get("first") || ""));
  const last = cleanName(String(form.get("last") || ""));
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");

  if (!first || !last || !email || password.length < 8) {
    return NextResponse.redirect(new URL("/signup?e=invalid", req.url));
  }

  if (password !== confirm) {
    const res = NextResponse.redirect(new URL("/signup?e=nomatch", req.url));
    res.cookies.set("signup_data", JSON.stringify({ first, last, email }), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });
    return res;
  }

    const displayName = `${first} ${last}`.replace(/\s+/g, " ").trim();
	
	try {
	  await authAdmin.getUserByEmail(email);
	  return NextResponse.redirect(new URL("/signup?e=exists", req.url));
	} catch {
	
	}
	
    // Create user in Firebase
    const user = await authAdmin.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false,
    });

    // Generate Firebase email verification link
    const actionCodeSettings = {
      url: "http://localhost:3000/login", // where user goes after verifying
      handleCodeInApp: false,
    };
    const link = await authAdmin.generateEmailVerificationLink(
      email,
      actionCodeSettings
    );

    // Send email with MailerSend
    await sendWelcomeEmail(email, displayName, link);

    return NextResponse.redirect(new URL("/login?checkEmail=1", req.url));
}
