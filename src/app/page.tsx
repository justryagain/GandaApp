import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Root() {
  const user = await getUserFromSession();
  redirect(user ? "/home" : "/login");
}
