import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Info } from "lucide-react";
import { HangTag } from "@/components/hang-tag";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { formatCarbon, formatDate } from "@/lib/format";
import { loadPublicTag } from "@/lib/tag-image";

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tag = await loadPublicTag(slug);
  if (!tag) return { title: "Tag not shared", robots: { index: false } };
  const title = `${tag.ownerFirstName}'s ${tag.product.name}`;
  const description = `Verified owner. ${tag.product.brand.name}${
    tag.product.sustainabilityInfo
      ? `, ${formatCarbon(tag.product.sustainabilityInfo.carbonScoreGrams)}, ${tag.product.sustainabilityInfo.recyclabilityPercent}% recyclable`
      : ""
  }.`;
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, type: "website", siteName: "STAKA" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** What anyone with a share link sees. No sign-in needed. */
export default async function SharedTagPage({ params }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const tag = await loadPublicTag(slug);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-forest text-paper [&_:focus-visible]:outline-paper">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5 sm:px-6">
          <Wordmark className="text-paper" />
          <Button asChild variant="ghost" size="sm" className="text-paper hover:bg-paper/10 hover:text-paper">
            <Link href="/register">Join STAKA</Link>
          </Button>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-10 sm:px-6 sm:py-14">
        {!tag ? (
          <section className="mx-auto flex max-w-[520px] flex-col items-start gap-4 sm:items-center sm:text-center">
            <h1 className="text-2xl font-semibold">This tag isn&apos;t shared any more</h1>
            <p className="text-ink-muted">Its owner turned sharing off, or the link was copied wrong.</p>
            <Button asChild>
              <Link href="/">Go to STAKA</Link>
            </Button>
          </section>
        ) : (
          <div className="grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-14">
            <div className="flex justify-center md:justify-start">
              <HangTag product={tag.product} ownerName={tag.ownerFirstName} ownerVerified size="lg" withString stringTone="dark" swing />
            </div>
            <div className="flex max-w-[60ch] flex-col gap-6">
              <div>
                <p className="flex items-center gap-2 font-medium text-forest">
                  <BadgeCheck className="size-5 text-moss" aria-hidden />
                  {tag.ownerFirstName} is the verified owner
                </p>
                <h1 className="mt-2 text-3xl font-semibold">{tag.product.name}</h1>
                <p className="mt-1 text-ink-muted">by {tag.product.brand.name}</p>
              </div>
              {tag.product.description && <p className="text-lg">{tag.product.description}</p>}

              <section aria-labelledby="proof-title" className="rounded-xl border bg-card p-5">
                <h2 id="proof-title" className="font-sans text-base font-semibold tracking-normal">How STAKA checked this</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {tag.verifiedBy === "ORDER_MATCH"
                    ? "Matched to a paid order"
                    : "A receipt was reviewed by the STAKA team"}{" "}
                  on {formatDate(tag.verifiedAt)}.
                  {tag.product.sustainabilityInfo &&
                    (tag.product.sustainabilityInfo.verified
                      ? ` The footprint figures are verified by ${tag.product.sustainabilityInfo.certifierName ?? "a third party"}.`
                      : " The footprint figures are stated by the brand.")}
                </p>
              </section>

              {!tag.product.sustainabilityInfo && (
                <p className="flex items-center gap-2 text-sm text-ink-muted">
                  <Info className="size-4" aria-hidden />
                  The brand hasn&apos;t shared footprint figures yet.
                </p>
              )}

              <section className="flex flex-col gap-3 border-t pt-6">
                <h2 className="text-lg font-semibold">Keep tags for your own clothes</h2>
                <p className="text-ink-muted">
                  Scan the barcode on a label to see a piece&apos;s footprint and build a wardrobe you can prove.
                </p>
                <Button asChild className="self-start">
                  <Link href="/register">Create a free account</Link>
                </Button>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
