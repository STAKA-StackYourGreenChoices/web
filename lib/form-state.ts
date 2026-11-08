import type { ZodError } from "zod";

/** The result a form's Server Action hands back to useActionState. */
export interface FormState<V extends Record<string, string> = Record<string, string>> {
  status: "idle" | "error" | "success";
  /** Shown above the form: what went wrong overall, or what happened. */
  message?: string;
  fieldErrors?: Partial<Record<keyof V & string, string[]>>;
  /** Echoed back so React's post-action form reset keeps what was typed. */
  values?: Partial<V>;
}

export const idle: FormState = { status: "idle" };

export function fieldErrorsFrom(error: ZodError) {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Text fields from FormData, without File entries. */
export function textValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}
