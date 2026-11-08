import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmailForm } from "./verify-email-form";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold">Confirm your email</h1>
      {typeof token === "string" && token ? (
        <VerifyEmailForm token={token} />
      ) : (
        <p className="mt-4 text-ink-muted">
          This link is missing its confirmation code. Open the link from your email again, or{" "}
          <Link href="/wardrobe" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo">
            go to STAKA
          </Link>{" "}
          to send a new one.
        </p>
      )}
    </>
  );
}
