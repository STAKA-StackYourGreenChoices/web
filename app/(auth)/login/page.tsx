import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in to STAKA</h1>
      <p className="mt-2 text-ink-muted">Pick up where you left off with your tags.</p>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="mt-8 text-sm text-ink-muted">
        New to STAKA?{" "}
        <Link href="/register" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo">
          Create an account
        </Link>
      </p>
    </>
  );
}
