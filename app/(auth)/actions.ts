"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { fieldErrorsFrom, textValues, type FormState } from "@/lib/form-state";
import { clearSession, getRefreshToken, saveSession } from "@/lib/session";
import type { AuthTokens } from "@/lib/types";

const email = z.email("Enter an email address like name@example.com");
const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use 128 characters or fewer");

/** Only same-site paths, so a crafted ?next= can't send people elsewhere. */
function safeNext(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData);
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password") })
    .safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values: { email: values.email } };
  }

  try {
    const tokens = await api<AuthTokens>("/auth/login", {
      method: "POST",
      json: parsed.data,
      token: null,
    });
    await saveSession(tokens);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError && error.status === 401
          ? "That email and password don't match an account. Check them and try again."
          : messageOf(error),
      values: { email: values.email },
    };
  }
  redirect(safeNext(values.next));
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData);
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Enter your name").max(100, "Use 100 characters or fewer"),
      email,
      password: newPassword,
    })
    .safeParse(values);
  const keep = { name: values.name, email: values.email };
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values: keep };
  }

  try {
    const tokens = await api<AuthTokens>("/auth/register", {
      method: "POST",
      json: parsed.data,
      token: null,
    });
    await saveSession(tokens);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return {
        status: "error",
        fieldErrors: { email: ["An account already uses this email. Sign in instead."] },
        values: keep,
      };
    }
    return { status: "error", message: messageOf(error), values: keep };
  }
  redirect("/?welcome=1");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData);
  const parsed = z.object({ email }).safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }
  try {
    await api("/auth/forgot-password", { method: "POST", json: parsed.data, token: null });
  } catch (error) {
    return { status: "error", message: messageOf(error), values };
  }
  return {
    status: "success",
    message: `If ${parsed.data.email} has a STAKA account, a reset link is on its way. It works once and expires in 1 hour.`,
    values,
  };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData);
  const parsed = z
    .object({ token: z.string().min(1), password: newPassword, confirm: z.string() })
    .refine((data) => data.password === data.confirm, {
      path: ["confirm"],
      message: "The two passwords don't match",
    })
    .safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  try {
    await api("/auth/reset-password", {
      method: "POST",
      json: { token: parsed.data.token, newPassword: parsed.data.password },
      token: null,
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError && error.status === 401
          ? "This reset link has expired or was already used. Request a new one."
          : messageOf(error),
    };
  }
  return { status: "success", message: "Password changed. Sign in with your new password." };
}

export async function verifyEmail(_: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  try {
    await api("/auth/verify-email", { method: "POST", json: { token }, token: null });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError && error.status === 401
          ? "This confirmation link has expired or was already used. Sign in to send a new one."
          : messageOf(error),
    };
  }
  return { status: "success", message: "Email confirmed." };
}

export async function resendVerification(): Promise<FormState> {
  try {
    const result = await api<{ message: string }>("/auth/resend-verification", { method: "POST" });
    return { status: "success", message: result.message === "Email is already verified" ? "Your email is already confirmed." : "We've sent a new confirmation link." };
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // Revoke on the server too; a failure here must not keep the user signed in.
    await api("/auth/logout", { method: "POST", json: { refreshToken }, token: null }).catch(
      () => undefined,
    );
  }
  await clearSession();
  redirect("/login");
}

function messageOf(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong on our side. Try again in a moment.";
}
