/* eslint-disable @next/next/no-img-element -- product images come from arbitrary brand hosts */
import type { Metadata } from "next";
import Link from "next/link";
import { FileUp, PackageOpen, Plus, Shirt } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SustainabilityBadge } from "@/components/sustainability-badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { imageSrc } from "@/lib/images";
import { displayGtin, formatDate } from "@/lib/format";
import type { BrandSummary, Product, ProductPage } from "@/lib/types";
import { ProductFilters } from "./product-filters";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 20;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const brand = typeof params.brand === "string" ? params.brand : "";
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (q) query.set("search", q);
  if (brand) query.set("brandId", brand);

  const [result, brands] = await Promise.all([
    api<ProductPage>(`/products?${query}`),
    api<BrandSummary[]>("/brands"),
  ]);
  const filtered = Boolean(q || brand);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, result.total);
  const pageHref = (target: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (brand) next.set("brand", brand);
    if (target > 1) next.set("page", String(target));
    const text = next.toString();
    return text ? `/admin/products?${text}` : "/admin/products";
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything shoppers can scan. A product's tag shows exactly what's recorded here."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/import">
                <FileUp aria-hidden />
                Import CSV
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus aria-hidden />
                Add product
              </Link>
            </Button>
          </>
        }
      />

      <ProductFilters brands={brands} q={q} brand={brand} />

      {result.total === 0 ? (
        <EmptyState filtered={filtered} />
      ) : (
        <section aria-label="Product list" className="mt-6">
          <p className="mb-3 text-sm text-ink-muted tabular" aria-live="polite">
            Showing {first}–{last} of {result.total} {result.total === 1 ? "product" : "products"}
          </p>

          {/* 768px and up: a real table */}
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-wash/60 text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Product</th>
                  <th scope="col" className="px-4 py-3 font-medium">Brand</th>
                  <th scope="col" className="px-4 py-3 font-medium">Barcode</th>
                  <th scope="col" className="px-4 py-3 font-medium">Figures</th>
                  <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.items.map((product) => (
                  <tr key={product.id} className="group relative transition-colors hover:bg-wash/60 focus-within:bg-wash/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb product={product} />
                        <div className="min-w-0">
                          {/* The link's ::after covers the whole row, so any click opens the product */}
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-ink after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-ink-muted">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.brand.name}</td>
                    <td className="px-4 py-3 tabular text-ink-muted">{displayGtin(product.gtin)}</td>
                    <td className="px-4 py-3">
                      <SustainabilityBadge info={product.sustainabilityInfo} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-muted">{formatDate(product.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Below 768px: stacked rows */}
          <ul className="divide-y overflow-hidden rounded-xl border bg-card md:hidden">
            {result.items.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-wash"
                >
                  <Thumb product={product} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate text-sm text-ink-muted">
                      {product.brand.name}, {displayGtin(product.gtin)}
                    </p>
                  </div>
                  <SustainabilityBadge info={product.sustainabilityInfo} compact />
                </Link>
              </li>
            ))}
          </ul>

          {result.total > PAGE_SIZE && (
            <nav aria-label="Pages" className="mt-5 flex items-center justify-between gap-3">
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={pageHref(page - 1)}>Previous</Link>
                </Button>
              ) : (
                <span />
              )}
              <span className="text-sm text-ink-muted tabular">
                Page {page} of {Math.ceil(result.total / PAGE_SIZE)}
              </span>
              {last < result.total ? (
                <Button asChild variant="outline">
                  <Link href={pageHref(page + 1)}>Next</Link>
                </Button>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      )}
    </>
  );
}

function Thumb({ product }: { product: Product }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-wash">
      {product.imageUrl ? (
        <img src={imageSrc(product.imageUrl)} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <Shirt className="size-5 text-ink-muted" strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <section className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-card px-6 py-10 sm:items-center sm:text-center">
      <PackageOpen className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
      {filtered ? (
        <div>
          <h2 className="text-lg font-semibold">No products match</h2>
          <p className="mt-1 text-ink-muted">Try a different name, SKU or barcode, or clear the filters.</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold">No products yet</h2>
            <p className="mt-1 max-w-[46ch] text-ink-muted">
              Add products one at a time, or import a whole catalog from a CSV file.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/products/new">Add product</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/import">Import CSV</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
