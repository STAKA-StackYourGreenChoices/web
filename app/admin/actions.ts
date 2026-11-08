"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { fieldErrorsFrom, textValues, type FormState } from "@/lib/form-state";
import { requireAdmin } from "@/lib/session";
import type { BrandSummary, ImportReport, Product } from "@/lib/types";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .transform((value) => value || undefined);

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(
    z
      .url({ protocol: /^https?$/, message: "Enter a full link starting with https://" })
      .optional(),
  );

const wholeNumber = (label: string, min: number, max?: number) =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be ${min} or more`)
    .refine((value) => max === undefined || value <= max, `${label} must be ${max} or less`);

/* ---------- Products ---------- */

const productSchema = z
  .object({
    name: z.string().trim().min(1, "Enter the product name").max(200, "Use 200 characters or fewer"),
    brandId: z.uuid("Choose a brand"),
    gtin: z
      .string()
      .trim()
      .regex(/^\d{8}$|^\d{12,14}$/, "Enter the 8, 12, 13 or 14 digits printed under the barcode"),
    sku: z.string().trim().min(1, "Enter the SKU").max(64, "Use 64 characters or fewer"),
    description: optionalText(2000, "Description"),
    imageUrl: optionalUrl,
    hasSustainability: z.string().optional(),
    carbonScoreGrams: z.string().optional(),
    recyclabilityPercent: z.string().optional(),
    verified: z.string().optional(),
    certifierName: optionalText(200, "Certifier"),
  })
  .superRefine((data, ctx) => {
    if (!data.hasSustainability) return;
    for (const [key, schema] of [
      ["carbonScoreGrams", wholeNumber("Carbon footprint", 0)],
      ["recyclabilityPercent", wholeNumber("Recyclability", 0, 100)],
    ] as const) {
      const value = data[key];
      if (!value?.trim()) {
        ctx.addIssue({ code: "custom", path: [key], message: "Required when figures are included" });
        continue;
      }
      const result = schema.safeParse(value);
      if (!result.success) {
        ctx.addIssue({ code: "custom", path: [key], message: result.error.issues[0].message });
      }
    }
    if (data.verified && !data.certifierName) {
      ctx.addIssue({
        code: "custom",
        path: ["certifierName"],
        message: "Name who verified the figures",
      });
    }
  });

export type ProductFormState = FormState & { productId?: string };

export async function saveProduct(
  productId: string | null,
  _: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const values = textValues(formData);
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Some details need fixing before this product can be saved.",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const data = parsed.data;
  const body = {
    name: data.name,
    brandId: data.brandId,
    gtin: data.gtin,
    sku: data.sku,
    // null clears a field on edit; undefined would leave the old value.
    description: data.description ?? (productId ? null : undefined),
    imageUrl: data.imageUrl ?? (productId ? null : undefined),
    sustainabilityInfo: data.hasSustainability
      ? {
          carbonScoreGrams: Number(data.carbonScoreGrams),
          recyclabilityPercent: Number(data.recyclabilityPercent),
          verified: Boolean(data.verified),
          certifierName: data.verified ? data.certifierName : undefined,
        }
      : undefined,
  };

  try {
    const product = await api<Product>(productId ? `/products/${productId}` : "/products", {
      method: productId ? "PATCH" : "POST",
      json: body,
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/brands");
    return { status: "success", message: productId ? "Changes saved" : "Product added", productId: product.id, values };
  } catch (error) {
    return { ...productApiError(error), values };
  }
}

function productApiError(error: unknown): FormState {
  if (error instanceof ApiError) {
    const message = error.message;
    if (error.status === 409) {
      const field = /sku/i.test(message) ? "sku" : "gtin";
      return { status: "error", message: "Another product already uses this code.", fieldErrors: { [field]: [message] } };
    }
    if (error.status === 400 && /gtin|check digit/i.test(message)) {
      return {
        status: "error",
        message: "The barcode number isn't valid.",
        fieldErrors: { gtin: [`${message}. Check the digits under the barcode.`] },
      };
    }
    return { status: "error", message };
  }
  return { status: "error", message: "Something went wrong on our side. Try again in a moment." };
}

export async function deleteProduct(productId: string): Promise<FormState> {
  await requireAdmin();
  try {
    await api(`/products/${productId}`, { method: "DELETE" });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The product couldn't be deleted. Try again.",
    };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/brands");
  return { status: "success", message: "Product deleted" };
}

/* ---------- Brands ---------- */

const brandSchema = z.object({
  name: z.string().trim().min(1, "Enter the brand name").max(100, "Use 100 characters or fewer"),
  description: optionalText(1000, "Description"),
  logoUrl: optionalUrl,
});

export async function saveBrand(
  brandId: string | null,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = textValues(formData);
  const parsed = brandSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }
  const body = {
    name: parsed.data.name,
    description: parsed.data.description ?? (brandId ? null : undefined),
    logoUrl: parsed.data.logoUrl ?? (brandId ? null : undefined),
  };
  try {
    await api<BrandSummary>(brandId ? `/brands/${brandId}` : "/brands", {
      method: brandId ? "PATCH" : "POST",
      json: body,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { status: "error", fieldErrors: { name: ["A brand with this name already exists"] }, values };
    }
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The brand couldn't be saved. Try again.",
      values,
    };
  }
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  return { status: "success", message: brandId ? "Brand updated" : "Brand added" };
}

export async function deleteBrand(brandId: string): Promise<FormState> {
  await requireAdmin();
  try {
    await api(`/brands/${brandId}`, { method: "DELETE" });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The brand couldn't be deleted. Try again.",
    };
  }
  revalidatePath("/admin/brands");
  return { status: "success", message: "Brand deleted" };
}

/* ---------- CSV import ---------- */

export type ImportResult =
  | { ok: true; report: ImportReport }
  | { ok: false; message: string };

export async function importProducts(formData: FormData, dryRun: boolean): Promise<ImportResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file to import." };
  }
  if (!/\.csv$/i.test(file.name)) {
    return { ok: false, message: `${file.name} isn't a CSV file. Save the sheet as .csv and try again.` };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, message: "The file is larger than 2 MB. Split it into smaller files." };
  }

  const form = new FormData();
  form.append("file", file, file.name);
  try {
    const report = await api<ImportReport>(`/products/import?dryRun=${dryRun}`, {
      method: "POST",
      form,
    });
    if (!dryRun) {
      revalidatePath("/admin/products");
      revalidatePath("/admin/brands");
    }
    return { ok: true, report };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : "The file couldn't be checked. Try again.",
    };
  }
}

/* ---------- Ownership claims ---------- */

export async function approveClaim(claimId: string): Promise<FormState> {
  await requireAdmin();
  try {
    await api(`/claims/${claimId}/approve`, { method: "POST" });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The claim couldn't be approved. Try again.",
    };
  }
  revalidatePath("/admin/claims");
  return { status: "success", message: "Approved. The shopper is now the verified owner." };
}

export async function rejectClaim(claimId: string, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) {
    return { status: "error", fieldErrors: { reason: ["Tell the shopper what was wrong so they can fix it"] } };
  }
  if (reason.length > 500) {
    return { status: "error", fieldErrors: { reason: ["Keep the reason under 500 characters"] }, values: { reason } };
  }
  try {
    await api(`/claims/${claimId}/reject`, { method: "POST", json: { reason } });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof ApiError ? error.message : "The claim couldn't be rejected. Try again.",
      values: { reason },
    };
  }
  revalidatePath("/admin/claims");
  return { status: "success", message: "Rejected. The shopper will see your reason." };
}
