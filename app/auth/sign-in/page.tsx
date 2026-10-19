import { SignInForm } from "@/features/auth/components/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  return <SignInForm resetSuccess={reset === "1"} />;
}
