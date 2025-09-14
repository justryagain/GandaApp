import { getUserFromSession, getCsrfToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import "@/styles/auth.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; checkEmail?: string }>;
}) {
  const user = await getUserFromSession();
  if (user) redirect("/home");

  const csrf = await getCsrfToken();

  const { e, checkEmail } = await searchParams;

  return <LoginForm csrf={csrf} error={e} checkEmail={checkEmail} />;
}
