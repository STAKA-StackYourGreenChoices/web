"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { idle } from "@/lib/form-state";
import { resetPassword } from "../actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, idle);

  if (state.status === "success") {
    return (
      <div className="mt-8 flex flex-col gap-5">
        <FormAlert status="success" message={state.message} />
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mt-8 flex flex-col gap-5">
      <FormAlert status={state.status} message={state.message} />
      <input type="hidden" name="token" value={token} />
      <TextField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        autoFocus
        errors={state.fieldErrors?.password}
        hint="At least 8 characters."
      />
      <TextField
        name="confirm"
        label="Type it again"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirm}
      />
      <SubmitButton pendingLabel="Saving…" className="w-full">
        Set new password
      </SubmitButton>
    </form>
  );
}
