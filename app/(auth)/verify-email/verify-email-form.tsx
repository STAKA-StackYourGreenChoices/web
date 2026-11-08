"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { idle } from "@/lib/form-state";
import { verifyEmail } from "../actions";

/**
 * Confirmation is a button press rather than automatic on page load, so
 * email security scanners that open links can't use up the token.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useActionState(verifyEmail, idle);

  if (state.status === "success") {
    return (
      <div className="mt-8 flex flex-col gap-5">
        <FormAlert status="success" message="Email confirmed. You're all set." />
        <Button asChild className="w-full">
          <Link href="/wardrobe">Go to your wardrobe</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <p className="text-ink-muted">Press the button to confirm this email address belongs to you.</p>
      <FormAlert status={state.status} message={state.message} />
      <input type="hidden" name="token" value={token} />
      <SubmitButton pendingLabel="Confirming…" className="w-full">
        Confirm email
      </SubmitButton>
    </form>
  );
}
