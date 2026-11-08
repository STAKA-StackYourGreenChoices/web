"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { FormState } from "@/lib/form-state";
import { requireSession } from "@/lib/session";
import type { DigitalCard } from "@/lib/types";

/** Creates the signed-in shopper's tag for a product, or returns the one they already have. */
export async function addToWardrobe(gtin: string): Promise<FormState> {
  await requireSession();
  let card: DigitalCard;
  try {
    card = await api<DigitalCard>("/digital-cards", { method: "POST", json: { gtin } });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError
          ? error.message
          : "The tag couldn't be added. Try again in a moment.",
    };
  }
  revalidatePath("/wardrobe");
  redirect(`/tags/${card.id}?added=1`);
}

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/** Looks for a paid order on the shopper's account that includes this piece. */
export async function verifyByOrder(cardId: string): Promise<FormState> {
  await requireSession();
  try {
    await api(`/digital-cards/${cardId}/ownership/order-match`, { method: "POST" });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError && error.status === 404
          ? "No paid order on your account includes this piece. Upload a receipt instead."
          : error instanceof ApiError
            ? error.message
            : "Your orders couldn't be checked. Try again in a moment.",
    };
  }
  revalidatePath(`/tags/${cardId}`);
  revalidatePath("/wardrobe");
  return { status: "success", message: "Verified: we found it in your orders." };
}

/** Sends a receipt photo or PDF for an admin to review. */
export async function uploadReceipt(
  cardId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", fieldErrors: { receipt: ["Choose a photo or PDF of your receipt"] } };
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return {
      status: "error",
      fieldErrors: { receipt: ["The file is over 5 MB. Take a smaller photo or crop it."] },
    };
  }

  const form = new FormData();
  form.append("file", file, file.name);
  try {
    await api(`/digital-cards/${cardId}/ownership/receipt`, { method: "POST", form });
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "The receipt couldn't be sent. Try again.";
    return error instanceof ApiError && error.status === 400
      ? { status: "error", fieldErrors: { receipt: [message] } }
      : { status: "error", message };
  }
  revalidatePath(`/tags/${cardId}`);
  revalidatePath("/wardrobe");
  return { status: "success", message: "Receipt sent. We'll check it soon." };
}

/** Creates (or returns) the public link for a verified tag. */
export async function shareTag(cardId: string): Promise<FormState & { slug?: string }> {
  await requireSession();
  try {
    const link = await api<{ slug: string }>(`/digital-cards/${cardId}/share`, { method: "POST" });
    revalidatePath(`/tags/${cardId}`);
    return { status: "success", slug: link.slug };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The link couldn't be created. Try again.",
    };
  }
}

/** Turns the public link off; anyone who opens it afterwards sees it's no longer shared. */
export async function stopSharing(cardId: string): Promise<FormState> {
  await requireSession();
  try {
    await api(`/digital-cards/${cardId}/share`, { method: "DELETE" });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "Sharing couldn't be turned off. Try again.",
    };
  }
  revalidatePath(`/tags/${cardId}`);
  return { status: "success", message: "Sharing turned off. The old link no longer works." };
}
