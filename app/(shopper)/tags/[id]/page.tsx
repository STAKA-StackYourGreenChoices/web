import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CircleCheck, ScanBarcode } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { HangTag } from "@/components/hang-tag";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { DigitalCard } from "@/lib/types";
import { OwnershipPanel } from "./ownership-panel";
import { SharePanel } from "./share-panel";

export const metadata: Metadata = { title: "Your tag" };

export default async function TagPage({ params, searchParams }: PageProps<"/tags/[id]">) {
  const [{ id }, { added }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const card = await api<DigitalCard>(`/digital-cards/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const { product } = card;
  // The address people will open; WEB_APP_URL wins over the request's host.
  const requestHeaders = await headers();
  const origin =
    process.env.WEB_APP_URL?.replace(/\/+$/, "") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
  const justAdded = added === "1";

  return (
    <>
      <BackLink href="/wardrobe">My wardrobe</BackLink>

      {justAdded && (
        <div role="status" className="mt-2 mb-6 flex items-center gap-2.5 rounded-lg border border-moss/40 bg-moss/10 px-4 py-3 text-forest">
          <CircleCheck className="size-5 shrink-0" aria-hidden />
          <p>
            <span className="font-medium">{product.name}</span> is in your wardrobe.
          </p>
        </div>
      )}

      <div className="mt-2 grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-14">
        <div className="flex justify-center md:justify-start">
          <HangTag
            product={product}
            ownerName={card.user.name}
            ownerVerified={card.ownership.status === "VERIFIED"}
            size="lg"
            swing={justAdded}
          />
        </div>

        <div className="flex max-w-[60ch] flex-col gap-6">
          <div>
            <p className="font-medium text-ink-muted">{product.brand.name}</p>
            <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-ink-muted">Added to your wardrobe on {formatDate(card.createdAt)}.</p>
          </div>

          {product.description && <p className="text-lg">{product.description}</p>}

          <OwnershipPanel cardId={card.id} ownership={card.ownership} />
          <SharePanel
            cardId={card.id}
            productName={product.name}
            verified={card.ownership.status === "VERIFIED"}
            share={card.share}
            origin={origin}
          />

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
            <Button asChild>
              <Link href="/scan">
                <ScanBarcode aria-hidden />
                Scan another piece
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/products/${product.gtin}`}>Product details</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
