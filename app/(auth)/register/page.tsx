import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Create your STAKA account</h1>
      <p className="mt-2 text-ink-muted">
        Start a digital tag for every piece you own. It&apos;s free.
      </p>
      <RegisterForm />
      <p className="mt-8 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo">
          Sign in
        </Link>
      </p>
    </>
  );
}
