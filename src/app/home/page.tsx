import { getUserFromSession, getCsrfToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import "../auth.css";

export default async function HomePage() {
  const user = await getUserFromSession();
  if (!user) redirect("/login");

  const csrf = await getCsrfToken();
  const fullName = (user as any).name || user.email;

  return (
    <main style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", margin: 32 }}>
      <h1>Welcome{fullName ? `, ${fullName}` : ""}</h1>
      <p><strong>User:</strong> {user.email} ({user.uid})</p>
      <form method="POST" action="/api/auth/logout">
        <input type="hidden" name="_csrf" value={csrf} />
        <button>Sign out</button>
      </form>
    </main>
  );
}
