"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrandSummary } from "@/lib/types";

const ALL = "all";

/** Search box plus brand filter, kept in the URL so results can be shared and bookmarked. */
export function ProductFilters({
  brands,
  q,
  brand,
}: {
  brands: BrandSummary[];
  q: string;
  brand: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const go = (next: { q?: string; brand?: string }) => {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextBrand = next.brand ?? brand;
    if (nextQ) params.set("q", nextQ);
    if (nextBrand) params.set("brand", nextBrand);
    startTransition(() => router.push(params.size ? `${pathname}?${params}` : pathname));
  };

  return (
    <form
      role="search"
      aria-label="Filter products"
      className="mt-8 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        go({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
      }}
      data-pending={pending || undefined}
    >
      <div className="relative flex-1">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <Input
          id="product-search"
          name="q"
          type="search"
          defaultValue={q}
          key={q}
          placeholder="Search by name, SKU, barcode or brand"
          className="pl-10"
          enterKeyHint="search"
        />
      </div>
      <div className="flex gap-3">
        <Select value={brand || ALL} onValueChange={(value) => go({ brand: value === ALL ? "" : value })}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Filter by brand">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All brands</SelectItem>
            {brands.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(q || brand) && (
          <Button type="button" variant="ghost" onClick={() => router.push(pathname)} className="shrink-0">
            <X aria-hidden />
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
