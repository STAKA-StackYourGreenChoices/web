"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { idle } from "@/lib/form-state";
import { register } from "../actions";

export function RegisterForm() {
  const [state, action] = useActionState(register, idle);
  return (
    <form action={action} noValidate className="mt-8 flex flex-col gap-5">
      <FormAlert status={state.status} message={state.message} />
      <TextField
        name="name"
        label="Your name"
        autoComplete="name"
        required
        autoFocus
        maxLength={100}
        defaultValue={state.values?.name}
        errors={state.fieldErrors?.name}
        hint="Shown on tags you share."
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        errors={state.fieldErrors?.password}
        hint="At least 8 characters."
      />
      <SubmitButton pendingLabel="Creating account…" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
