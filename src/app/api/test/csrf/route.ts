import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

export async function GET() {
  if (process.env.APP_ENV !== "test") {
    const reqHeaders = await headers();
    const accept = reqHeaders.get("accept") || "";

    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/login", process.env.APP_URL));
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = "csrf";
  (await cookies()).set("csrf", token, { httpOnly: false, path: "/" });

  return NextResponse.json({ csrf: token });
}
