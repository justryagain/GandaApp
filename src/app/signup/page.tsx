import { getUserFromSession, getCsrfToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SignupForm from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;

  const cookieStore = await cookies();
  const signupCookie = cookieStore.get("signup_data")?.value;
  const signupData = signupCookie ? JSON.parse(signupCookie) : {};

  const user = await getUserFromSession();
  if (user) redirect("/home");

  const csrf = await getCsrfToken();

  return <SignupForm signupData={signupData} csrf={csrf} error={e} />;
}
