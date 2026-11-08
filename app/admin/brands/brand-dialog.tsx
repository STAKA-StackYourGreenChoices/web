"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { idle } from "@/lib/form-state";
import type { BrandSummary } from "@/lib/types";
import { saveBrand } from "../actions";

/** Add a brand (no `brand`) or edit one. */
export function BrandDialog({ brand }: { brand?: BrandSummary }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {brand ? (
          <Button variant="outline" size="sm" aria-label={`Edit ${brand.name}`}>
            <Pencil aria-hidden />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus aria-hidden />
            Add brand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {/* Remount per opening so a fresh form never shows stale errors */}
        {open && <BrandForm brand={brand} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function BrandForm({ brand, onDone }: { brand?: BrandSummary; onDone: () => void }) {
  const [state, action] = useActionState(saveBrand.bind(null, brand?.id ?? null), idle);

  // Handle each result once; onDone is a new function on every render.
  const handled = useRef<typeof state | null>(null);
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return;
    handled.current = state;
    toast.success(state.message);
    onDone();
  }, [state, onDone]);

  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">{brand ? `Edit ${brand.name}` : "Add brand"}</DialogTitle>
        <DialogDescription>
          {brand
            ? "Changes show on every tag for this brand's products."
            : "You can add its products once the brand exists."}
        </DialogDescription>
      </DialogHeader>
      <FormAlert status={state.status === "error" ? "error" : "idle"} message={state.message} />
      <TextField
        name="name"
        label="Brand name"
        required
        maxLength={100}
        autoFocus
        defaultValue={state.values?.name ?? brand?.name}
        errors={errors.name}
      />
      <Field data-invalid={errors.description ? true : undefined}>
        <FieldLabel htmlFor="field-brand-description">About the brand</FieldLabel>
        <Textarea
          id="field-brand-description"
          name="description"
          maxLength={1000}
          defaultValue={state.values?.description ?? brand?.description}
        />
        <FieldDescription>Optional. One sentence on what they make and how.</FieldDescription>
        {errors.description && <FieldError>{errors.description.join(" ")}</FieldError>}
      </Field>
      <TextField
        name="logoUrl"
        label="Logo link"
        type="url"
        inputMode="url"
        placeholder="https://"
        defaultValue={state.values?.logoUrl ?? brand?.logoUrl}
        errors={errors.logoUrl}
        hint="Optional."
      />
      <DialogFooter className="gap-3">
        <DialogClose asChild>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </DialogClose>
        <SubmitButton pendingLabel="Saving…">{brand ? "Save changes" : "Add brand"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}
