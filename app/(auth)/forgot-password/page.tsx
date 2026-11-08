import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="mt-2 text-ink-muted">
        Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-8 text-sm text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
