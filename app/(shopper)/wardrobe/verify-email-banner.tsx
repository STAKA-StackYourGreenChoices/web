"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { resendVerification } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { idle } from "@/lib/form-state";

export function VerifyEmailBanner({ email, justJoined }: { email: string; justJoined: boolean }) {
  const [state, action] = useActionState(resendVerification, idle);
  return (
    <section
      aria-label="Confirm your email"
      className="mb-8 flex flex-col gap-3 rounded-xl border border-indigo/20 bg-accent px-5 py-4 sm:flex-row sm:items-center"
    >
      <MailCheck className="size-5 shrink-0 text-indigo" aria-hidden />
      <p className="flex-1 text-sm text-ink" role={state.status === "idle" ? undefined : "status"}>
        {state.status === "idle"
          ? `${justJoined ? "We've sent" : "We sent"} a confirmation link to ${email}. Open it to confirm your email.`
          : state.message}
      </p>
      <form action={action}>
        <SubmitButton variant="outline" size="sm" pendingLabel="Sending…">
          Send a new link
        </SubmitButton>
      </form>
    </section>
  );
}
