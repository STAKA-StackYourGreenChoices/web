"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idle, type FormState } from "@/lib/form-state";
import { addToWardrobe } from "../../actions";

export function AddToWardrobe({ gtin }: { gtin: string }) {
  const [state, action] = useActionState<FormState>(() => addToWardrobe(gtin), idle);
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <FormAlert status={state.status} message={state.message} />
      <SubmitButton size="lg" pendingLabel="Adding…" className="w-full sm:w-auto sm:self-start">
        <Plus aria-hidden />
        Add to my wardrobe
      </SubmitButton>
    </form>
  );
}
