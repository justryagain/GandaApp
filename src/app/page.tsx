// src/app/page.tsx
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Root() {
  const user = await getUserFromSession(); // verifies the Firebase session cookie
  redirect(user ? "/home" : "/login");
}
