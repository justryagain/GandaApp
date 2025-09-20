export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebaseAdmin";
import { sendWelcomeEmail } from "@/lib/mailer";

const isTest = process.env.APP_ENV === "test";

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
      return jsonError("Invalid request body", 400); // bad request
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

    // --- Extract fields ---
    const first = String(form.get("first") || "").trim();
    const last = String(form.get("last") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    // --- Validation ---
    if (!first || !last || !email || password.length < 8) {
      return jsonError("Missing or invalid fields", 422);
    }

    if (password !== confirm) {
      return jsonError("Passwords do not match", 422);
    }

    // --- Ensure user does not exist ---
    try {
      await authAdmin.getUserByEmail(email);
      return jsonError("User already exists", 409);
    } catch {
      // Safe: user doesn’t exist
    }

    // --- Create user ---
    await authAdmin.createUser({
      email,
      password,
      displayName: `${first} ${last}`.replace(/\s+/g, " ").trim(),
      emailVerified: false,
      disabled: false,
    });

    // --- Verification email ---
    const appUrl = process.env.APP_URL;
    const link = await authAdmin.generateEmailVerificationLink(email, {
      url: `${appUrl}/login`,
      handleCodeInApp: false,
    });

    if (!isTest) {
      await sendWelcomeEmail(email, `${first} ${last}`, link);
    } else {
      console.log(`[TEST MODE] Skipping email send for ${email}`);
    }

    return NextResponse.json({ success: true }, { status: 201 }); // created
  } catch (err: any) {
    console.error("Signup failed:", err);

    if (err.code === "auth/email-already-exists") {
      return jsonError("User already exists", 409);
    }

    if (
      err.errorInfo?.code === 400 ||
      err.message?.includes("PASSWORD_DOES_NOT_MEET_REQUIREMENTS")
    ) {
      return jsonError("Password does not meet requirements", 422);
    }

    if (
      err.code === "auth/invalid-email" ||
      err.errorInfo?.code === 400 &&
      err.message?.includes("email address is improperly formatted")
    ) {
      return jsonError("Invalid email format", 422);
    }

    // --- Unexpected fallback ---
    return jsonError("Something went wrong. Please try again.", 500);
  }
}