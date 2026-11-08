import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Info, ScanBarcode, SearchX } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { HangTag } from "@/components/hang-tag";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { displayGtin, formatCarbon } from "@/lib/format";
import type { DigitalCard, Product } from "@/lib/types";
import { AddToWardrobe } from "./add-to-wardrobe";

export const metadata: Metadata = { title: "Product" };

type Lookup =
  | { kind: "found"; product: Product }
  | { kind: "invalid"; message: string }
  | { kind: "unknown" };

async function lookup(gtin: string): Promise<Lookup> {
  try {
    return { kind: "found", product: await api<Product>(`/products/gtin/${encodeURIComponent(gtin)}`) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) return { kind: "invalid", message: error.message };
    if (error instanceof ApiError && error.status === 404) return { kind: "unknown" };
    throw error;
  }
}

export default async function ProductPage({ params }: PageProps<"/products/[gtin]">) {
  const { gtin } = await params;
  const [result, mine] = await Promise.all([lookup(gtin), api<DigitalCard[]>("/digital-cards/mine")]);

  if (result.kind !== "found") {
    return (
      <section className="mx-auto flex max-w-[520px] flex-col items-start gap-5 py-6 sm:items-center sm:text-center">
        <SearchX className="size-10 text-ochre" strokeWidth={1.5} aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold">
            {result.kind === "invalid" ? "That barcode didn't read correctly" : "This product isn't on STAKA yet"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {result.kind === "invalid"
              ? `${result.message}. Scan it again, or check the digits if you typed them.`
              : `No brand has added barcode ${displayGtin(gtin.padStart(14, "0"))} yet. Only products from partner brands have tags for now.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/scan">
            <ScanBarcode aria-hidden />
            Scan again
          </Link>
        </Button>
      </section>
    );
  }

  const { product } = result;
  const owned = mine.find((card) => card.product.id === product.id);
  const info = product.sustainabilityInfo;

  return (
    <>
      <BackLink href="/scan">Scan another</BackLink>
      <div className="mt-2 grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-14">
        <div className="flex justify-center md:justify-start">
          <HangTag product={product} size="lg" swing />
        </div>

        <div className="flex max-w-[60ch] flex-col gap-6">
          <div>
            <p className="font-medium text-ink-muted">{product.brand.name}</p>
            <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
            {product.description && <p className="mt-3 text-lg text-ink">{product.description}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {owned ? (
              <>
                <p className="flex items-center gap-2 font-medium text-forest">
                  <BadgeCheck className="size-5 text-moss" aria-hidden />
                  In your wardrobe
                </p>
                <Button asChild variant="outline" className="sm:ml-2">
                  <Link href={`/tags/${owned.id}`}>View your tag</Link>
                </Button>
              </>
            ) : (
              <AddToWardrobe gtin={product.gtin} />
            )}
          </div>

          <section aria-labelledby="figures-title" className="border-t pt-6">
            <h2 id="figures-title" className="text-lg font-semibold">What the figures mean</h2>
            {info ? (
              <dl className="mt-3 flex flex-col gap-4">
                <div>
                  <dt className="font-medium">Carbon footprint: {formatCarbon(info.carbonScoreGrams)}</dt>
                  <dd className="text-ink-muted">
                    Estimated greenhouse gases from making this piece, expressed as the same warming effect in carbon dioxide.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Recyclable: {info.recyclabilityPercent}%</dt>
                  <dd className="text-ink-muted">The share of the piece, by weight, that can be recycled at end of life.</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-medium">
                    {info.verified ? (
                      <BadgeCheck className="size-4 text-moss" aria-hidden />
                    ) : (
                      <Info className="size-4 text-ink-muted" aria-hidden />
                    )}
                    {info.verified ? "Independently verified" : "Stated by the brand"}
                  </dt>
                  <dd className="text-ink-muted">
                    {info.verified
                      ? `${info.certifierName ?? "A third party"} has checked these figures.`
                      : "No one outside the brand has checked these figures yet."}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-ink-muted">{product.brand.name} hasn&apos;t shared figures for this piece yet.</p>
            )}
          </section>

          {product.brand.description && (
            <section aria-labelledby="brand-title" className="border-t pt-6">
              <h2 id="brand-title" className="text-lg font-semibold">About {product.brand.name}</h2>
              <p className="mt-2 text-ink-muted">{product.brand.description}</p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
