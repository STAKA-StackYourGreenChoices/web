import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      {typeof token === "string" && token ? (
        <>
          <p className="mt-2 text-ink-muted">You&apos;ll be signed out on your other devices.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <p className="mt-4 text-ink-muted">
          This link is missing its reset code. Open the link from your email again, or{" "}
          <Link href="/forgot-password" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo">
            request a new one
          </Link>
          .
        </p>
      )}
    </>
  );
}
