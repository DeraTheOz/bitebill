import { auth } from "@/features/auth/lib/server";
import { signOut } from "@/features/auth/actions/sign-out";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Dashboard — signed in as {session?.user.name}
      </h1>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
