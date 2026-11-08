"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { idle } from "@/lib/form-state";
import { requestPasswordReset } from "../actions";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, idle);
  return (
    <form action={action} noValidate className="mt-8 flex flex-col gap-5">
      <FormAlert status={state.status} message={state.message} />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        autoFocus
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Sending link…" className="w-full">
        {state.status === "success" ? "Send another link" : "Send reset link"}
      </SubmitButton>
    </form>
  );
}
