import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api";
import type { BrandSummary } from "@/lib/types";
import { BrandDialog } from "./brand-dialog";
import { DeleteBrand } from "./delete-brand";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await api<BrandSummary[]>("/brands");

  return (
    <>
      <PageHeader
        title="Brands"
        description="Every product belongs to a brand. Its name appears at the top of each tag."
        actions={<BrandDialog />}
      />

      {brands.length === 0 ? (
        <section className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-card px-6 py-10 sm:items-center sm:text-center">
          <Store className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
          <div>
            <h2 className="text-lg font-semibold">No brands yet</h2>
            <p className="mt-1 max-w-[46ch] text-ink-muted">
              Add a brand before adding its products. Importing a CSV also creates any brands it names.
            </p>
          </div>
          <BrandDialog />
        </section>
      ) : (
        <ul className="mt-8 divide-y overflow-hidden rounded-xl border bg-card">
          {brands.map((brand) => (
            <li key={brand.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-sans text-base font-semibold tracking-normal">{brand.name}</h2>
                {brand.description && (
                  <p className="mt-0.5 line-clamp-2 max-w-[70ch] text-sm text-ink-muted">{brand.description}</p>
                )}
              </div>
              <Link
                href={`/admin/products?brand=${brand.id}`}
                className="inline-flex min-h-11 items-center text-sm text-indigo underline decoration-indigo/40 underline-offset-4 tabular hover:decoration-indigo sm:min-h-9 sm:w-28"
              >
                {brand.productCount} {brand.productCount === 1 ? "product" : "products"}
              </Link>
              <div className="flex gap-2">
                <BrandDialog brand={brand} />
                <DeleteBrand brand={brand} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
