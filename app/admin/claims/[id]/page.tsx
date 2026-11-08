/* eslint-disable @next/next/no-img-element -- receipts are streamed from our own route */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CircleX, Clock, ExternalLink, FileText } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { HangTag } from "@/components/hang-tag";
import { PageHeader } from "@/components/page-header";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Claim, ClaimDetail, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ClaimDecision } from "./claim-decision";

export const metadata: Metadata = { title: "Review claim" };

export default async function ClaimReviewPage({ params }: PageProps<"/admin/claims/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const claim = await api<ClaimDetail>(`/claims/${id}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const product = await api<Product>(`/products/${claim.product.id}`).catch(() => null);
  const receiptUrl = `/admin/claims/${claim.id}/receipt`;
  // PDFs open in a new tab: the receipt is served sandboxed, which blocks inline PDF viewers.
  const isPdf = claim.receiptMimeType === "application/pdf";

  return (
    <>
      <PageHeader
        back={<BackLink href={`/admin/claims?status=${claim.status}`}>Claims</BackLink>}
        title={`${claim.user.name}: ${claim.product.name}`}
        description={
          claim.method === "ORDER_MATCH"
            ? `Matched automatically to a paid order on ${formatDate(claim.createdAt)}.`
            : `Receipt ${claim.receiptAttempt ?? "?"} of 5, sent ${formatDate(claim.createdAt)}.`
        }
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Receipt" className="min-w-0">
          {claim.hasReceipt ? (
            isPdf ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener"
                className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-card p-8 text-center hover:border-ink-muted"
              >
                <FileText className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
                <span className="font-medium text-indigo underline decoration-indigo/40 underline-offset-4">
                  Open the PDF receipt in a new tab
                </span>
              </a>
            ) : (
              <figure className="flex flex-col gap-2">
                <a href={receiptUrl} target="_blank" rel="noopener" className="block overflow-hidden rounded-xl border bg-wash">
                  <img src={receiptUrl} alt={`Receipt uploaded by ${claim.user.name}`} className="mx-auto max-h-[75vh] w-auto object-contain" />
                </a>
                <figcaption className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <ExternalLink className="size-3.5" aria-hidden />
                  Select the image to open it full size.
                </figcaption>
              </figure>
            )
          ) : (
            <p className="rounded-xl border bg-card p-6 text-ink-muted">
              No receipt: this claim was verified from order {claim.orderId ?? "on record"}.
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-8">
          <ClaimDecision claim={claim} />

          <section aria-labelledby="checklist-title">
            <h2 id="checklist-title" className="font-sans text-base font-semibold tracking-normal">What to check</h2>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-muted">
              <li>The shop or brand is {claim.product.brandName} or a stockist.</li>
              <li>A line on the receipt matches {claim.product.name} (SKU {claim.product.sku}).</li>
              <li>It looks like a real, unedited receipt.</li>
            </ul>
          </section>

          <section aria-labelledby="shopper-title">
            <h2 id="shopper-title" className="font-sans text-base font-semibold tracking-normal">Shopper</h2>
            <p className="mt-1">{claim.user.name}</p>
            <p className="text-sm text-ink-muted break-all">{claim.user.email}</p>
          </section>

          {claim.history.length > 1 && (
            <section aria-labelledby="history-title">
              <h2 id="history-title" className="font-sans text-base font-semibold tracking-normal">
                All claims for this piece
              </h2>
              <ol className="mt-3 flex flex-col gap-3">
                {claim.history.map((item) => (
                  <HistoryItem key={item.id} item={item} current={item.id === claim.id} />
                ))}
              </ol>
            </section>
          )}

          {product && (
            <section aria-label="The product" className="flex justify-center">
              <HangTag product={product} size="sm" />
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function HistoryItem({ item, current }: { item: Claim; current: boolean }) {
  const Icon = item.status === "APPROVED" ? BadgeCheck : item.status === "REJECTED" ? CircleX : Clock;
  return (
    <li className={cn("flex gap-2.5 rounded-lg border p-3 text-sm", current ? "border-indigo/30 bg-accent" : "bg-card")}>
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          item.status === "APPROVED" ? "text-moss" : item.status === "REJECTED" ? "text-rust" : "text-indigo",
        )}
        aria-hidden
      />
      <div>
        <p className="font-medium">
          {item.method === "ORDER_MATCH" ? "Order match" : `Receipt ${item.receiptAttempt ?? ""}`}
          {current && " (this one)"}
        </p>
        <p className="text-ink-muted">
          {item.status === "PENDING" ? `Waiting since ${formatDate(item.createdAt)}` : `${item.status === "APPROVED" ? "Approved" : "Rejected"} ${formatDate(item.reviewedAt)}${item.reviewedByName ? ` by ${item.reviewedByName}` : ""}`}
        </p>
        {item.rejectionReason && <p className="mt-1">&ldquo;{item.rejectionReason}&rdquo;</p>}
      </div>
    </li>
  );
}
