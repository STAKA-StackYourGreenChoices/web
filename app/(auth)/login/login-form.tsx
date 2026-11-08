"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { idle } from "@/lib/form-state";
import { login } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, idle);
  return (
    <form action={action} noValidate className="mt-8 flex flex-col gap-5">
      <FormAlert status={state.status} message={state.message} />
      {next && <input type="hidden" name="next" value={next} />}
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
      <div className="flex flex-col gap-2">
        <TextField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          errors={state.fieldErrors?.password}
        />
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center self-start text-sm font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo sm:min-h-0"
        >
          Forgot your password?
        </Link>
      </div>
      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
