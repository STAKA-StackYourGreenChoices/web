"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { HangTag } from "@/components/hang-tag";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCarbon } from "@/lib/format";
import type { BrandSummary, Product } from "@/lib/types";
import { saveProduct, type ProductFormState } from "../actions";

const initial: ProductFormState = { status: "idle" };

export function ProductForm({ brands, product }: { brands: BrandSummary[]; product?: Product }) {
  const router = useRouter();
  const [state, action] = useActionState(saveProduct.bind(null, product?.id ?? null), initial);
  const info = product?.sustainabilityInfo;

  // Controlled values drive the live tag preview.
  const [name, setName] = useState(product?.name ?? "");
  const [brandId, setBrandId] = useState(product?.brand.id ?? "");
  const [gtin, setGtin] = useState(product?.gtin.replace(/^0/, "") ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [hasFigures, setHasFigures] = useState(Boolean(info) || !product);
  const [carbon, setCarbon] = useState(info ? String(info.carbonScoreGrams) : "");
  const [recyclability, setRecyclability] = useState(info ? String(info.recyclabilityPercent) : "");
  const [verified, setVerified] = useState(info?.verified ?? false);
  const [certifier, setCertifier] = useState(info?.certifierName ?? "");

  // Each action result is handled exactly once. Without this, router.refresh()
  // hands the form a new `product` prop, the effect runs again with the same
  // success state, and the toast and refresh repeat in a loop.
  const handled = useRef<ProductFormState | null>(null);
  const isNew = !product;
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return;
    handled.current = state;
    toast.success(state.message);
    if (isNew && state.productId) router.push(`/admin/products/${state.productId}`);
    else router.refresh();
  }, [state, isNew, router]);

  const errors = state.fieldErrors ?? {};
  const carbonValue = Number(carbon);
  const previewInfo =
    hasFigures && carbon !== "" && recyclability !== "" && Number.isFinite(carbonValue)
      ? {
          carbonScoreGrams: Math.max(0, Math.round(carbonValue)),
          recyclabilityPercent: Math.min(100, Math.max(0, Math.round(Number(recyclability) || 0))),
          verified,
          certifierName: verified ? certifier || undefined : undefined,
        }
      : undefined;
  const brandName = brands.find((brand) => brand.id === brandId)?.name ?? "Brand";
  const validImage = /^https?:\/\/\S+$/.test(imageUrl) ? imageUrl : undefined;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <form action={action} noValidate className="flex flex-col gap-8">
        <FormAlert status={state.status === "error" ? "error" : "idle"} message={state.message} />

        <FieldSet>
          <FieldLegend className="font-heading text-lg font-semibold">Product</FieldLegend>
          <div className="flex flex-col gap-5">
            <TextField
              name="name"
              label="Name"
              required
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              errors={errors.name}
              hint="As it's printed on the label, e.g. Organic Cotton Tee."
            />

            <Field data-invalid={errors.brandId ? true : undefined}>
              <FieldLabel htmlFor="field-brandId">Brand</FieldLabel>
              <Select name="brandId" value={brandId} onValueChange={setBrandId} required>
                <SelectTrigger
                  id="field-brandId"
                  className="w-full"
                  aria-invalid={errors.brandId ? true : undefined}
                >
                  <SelectValue placeholder="Choose a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Missing one?{" "}
                <Link href="/admin/brands" className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4">
                  Add it on the Brands page
                </Link>
                .
              </FieldDescription>
              {errors.brandId && <FieldError>{errors.brandId.join(" ")}</FieldError>}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="gtin"
                label="Barcode number"
                inputMode="numeric"
                autoComplete="off"
                required
                maxLength={14}
                value={gtin}
                onChange={(event) => setGtin(event.target.value.replace(/\D/g, ""))}
                errors={errors.gtin}
                hint="The digits under the barcode (EAN, UPC or GTIN)."
                className="tabular"
              />
              <TextField
                name="sku"
                label="SKU"
                required
                maxLength={64}
                defaultValue={state.values?.sku ?? product?.sku}
                errors={errors.sku}
                hint="Your internal product code."
              />
            </div>

            <Field data-invalid={errors.description ? true : undefined}>
              <FieldLabel htmlFor="field-description">Description</FieldLabel>
              <Textarea
                id="field-description"
                name="description"
                maxLength={2000}
                defaultValue={state.values?.description ?? product?.description}
                aria-invalid={errors.description ? true : undefined}
              />
              <FieldDescription>Optional. One or two sentences about materials and making.</FieldDescription>
              {errors.description && <FieldError>{errors.description.join(" ")}</FieldError>}
            </Field>

            <TextField
              name="imageUrl"
              label="Photo link"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              errors={errors.imageUrl}
              hint="Optional. A square photo works best."
            />
          </div>
        </FieldSet>

        <FieldSet className="border-t pt-8">
          <FieldLegend className="font-heading text-lg font-semibold">Sustainability figures</FieldLegend>
          <div className="flex flex-col gap-5">
            {/* Figures can be added to an existing product but not removed */}
            {!info && (
              <Field orientation="horizontal" className="items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                <FieldLabel htmlFor="field-hasSustainability" className="font-normal">
                  Include carbon and recyclability figures
                </FieldLabel>
                <Switch id="field-hasSustainability" checked={hasFigures} onCheckedChange={setHasFigures} />
              </Field>
            )}
            {hasFigures && <input type="hidden" name="hasSustainability" value="on" />}

            {hasFigures && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name="carbonScoreGrams"
                    label="Carbon footprint (grams CO₂e)"
                    inputMode="numeric"
                    value={carbon}
                    onChange={(event) => setCarbon(event.target.value.replace(/[^\d]/g, ""))}
                    errors={errors.carbonScoreGrams}
                    hint={carbon ? `Shown as ${formatCarbon(Number(carbon))}` : "Whole grams, e.g. 2100."}
                    className="tabular"
                  />
                  <TextField
                    name="recyclabilityPercent"
                    label="Recyclable (%)"
                    inputMode="numeric"
                    maxLength={3}
                    value={recyclability}
                    onChange={(event) => setRecyclability(event.target.value.replace(/[^\d]/g, ""))}
                    errors={errors.recyclabilityPercent}
                    hint="0 to 100."
                    className="tabular"
                  />
                </div>

                <Field orientation="horizontal" className="items-start justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor="field-verified" className="font-normal">
                      Verified by a third party
                    </FieldLabel>
                    <FieldDescription>
                      Leave off if the brand states these figures itself. Tags show the difference.
                    </FieldDescription>
                  </div>
                  <Switch id="field-verified" checked={verified} onCheckedChange={setVerified} className="mt-1" />
                </Field>
                {verified && <input type="hidden" name="verified" value="on" />}

                {verified && (
                  <TextField
                    name="certifierName"
                    label="Verified by"
                    maxLength={200}
                    value={certifier}
                    onChange={(event) => setCertifier(event.target.value)}
                    errors={errors.certifierName}
                    hint="The certification or body, e.g. Global Organic Textile Standard."
                  />
                )}
              </>
            )}
          </div>
        </FieldSet>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <SubmitButton pendingLabel="Saving…">{product ? "Save changes" : "Add product"}</SubmitButton>
        </div>
      </form>

      <aside aria-label="Tag preview" className="order-first lg:order-none">
        <div className="flex flex-col items-center gap-3 lg:sticky lg:top-24">
          <p className="text-sm text-ink-muted">Shoppers will see this tag</p>
          <HangTag
            product={{
              name: name || "Product name",
              gtin: gtin ? gtin.padStart(14, "0") : undefined,
              imageUrl: validImage,
              brand: { name: brandName },
              sustainabilityInfo: previewInfo,
            }}
            size="lg"
          />
        </div>
      </aside>
    </div>
  );
}
