import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Label, input, hint and error wired together with the right ARIA. */
export function TextField({
  name,
  label,
  hint,
  errors,
  ...input
}: {
  name: string;
  label: string;
  hint?: React.ReactNode;
  errors?: string[];
} & Omit<React.ComponentProps<typeof Input>, "name" | "id">) {
  const id = `field-${name}`;
  const invalid = Boolean(errors?.length);
  const describedBy = [hint && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(" ");
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy || undefined}
        {...input}
      />
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {invalid && (
        <FieldError id={`${id}-error`}>{errors!.join(" ")}</FieldError>
      )}
    </Field>
  );
}
