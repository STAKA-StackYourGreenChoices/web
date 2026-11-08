import type { Metadata } from "next";
import Link from "next/link";
import { ScanBarcode } from "lucide-react";
import { HangTag } from "@/components/hang-tag";
import { OwnershipChip } from "@/components/ownership-chip";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { DigitalCard, User } from "@/lib/types";
import { VerifyEmailBanner } from "./verify-email-banner";

export const metadata: Metadata = { title: "My wardrobe" };

export default async function WardrobePage({ searchParams }: PageProps<"/">) {
  const [{ welcome }, me, cards] = await Promise.all([
    searchParams,
    api<User>("/auth/me"),
    api<DigitalCard[]>("/digital-cards/mine"),
  ]);
  const firstName = me.name.split(" ")[0];
  const verified = cards.filter((card) => card.ownership.status === "VERIFIED");
  const waiting = cards.filter((card) => card.ownership.status !== "VERIFIED");

  return (
    <>
      {!me.emailVerified && <VerifyEmailBanner email={me.email} justJoined={welcome === "1"} />}

      <PageHeader
        title={welcome === "1" ? `Welcome, ${firstName}` : "My wardrobe"}
        description={
          cards.length === 0
            ? "Scan the barcode on a garment's label to keep its footprint on a digital tag."
            : `${cards.length} ${cards.length === 1 ? "piece" : "pieces"}, ${verified.length} verified.`
        }
        actions={
          cards.length > 0 && (
            <Button asChild>
              <Link href="/scan">
                <ScanBarcode aria-hidden />
                Scan a product
              </Link>
            </Button>
          )
        }
      />

      {cards.length === 0 ? (
        <section className="mt-10 flex flex-col items-start gap-5 rounded-xl border border-dashed border-line-strong bg-card px-6 py-10 sm:items-center sm:text-center">
          <ScanBarcode className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
          <div>
            <h2 className="text-lg font-semibold">Your wardrobe is empty</h2>
            <p className="mt-1 max-w-[46ch] text-ink-muted">
              Point your camera at the barcode on a clothing label, or type the number under it.
              Each piece you add gets its own tag.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/scan">
              <ScanBarcode aria-hidden />
              Scan your first piece
            </Link>
          </Button>
        </section>
      ) : (
        <>
          {verified.length > 0 && (
            <TagGrid
              title="Verified"
              description="Pieces you've proven you own."
              cards={verified}
            />
          )}
          {waiting.length > 0 && (
            <TagGrid
              title="Waiting for proof"
              description="Open a tag to match it to an order or upload a receipt."
              cards={waiting}
            />
          )}
        </>
      )}
    </>
  );
}

function TagGrid({
  title,
  description,
  cards,
}: {
  title: string;
  description: string;
  cards: DigitalCard[];
}) {
  const headingId = `grid-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={headingId} className="mt-12 first-of-type:mt-10">
      <h2 id={headingId} className="text-xl font-semibold">
        {title} <span className="font-sans text-base font-normal text-ink-muted tabular">({cards.length})</span>
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] justify-items-center gap-x-6 gap-y-10">
        {cards.map((card) => (
          <li key={card.id} className="flex flex-col items-center gap-3">
            <Link
              href={`/tags/${card.id}`}
              aria-label={`${card.product.name} by ${card.product.brand.name}, open tag`}
              className="block rounded-lg transition-transform motion-safe:hover:-rotate-1 focus-visible:outline-offset-4"
            >
              <HangTag
                product={card.product}
                ownerName={card.user.name}
                ownerVerified={card.ownership.status === "VERIFIED"}
                size="sm"
              />
            </Link>
            {card.ownership.status !== "VERIFIED" && <OwnershipChip status={card.ownership.status} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
