/* eslint-disable @next/next/no-img-element -- product images come from arbitrary brand hosts */
import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Shirt } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Claim, ClaimPage, ClaimStatus } from "@/lib/types";
import { imageSrc } from "@/lib/images";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ownership claims" };

const TABS: { status: ClaimStatus; label: string }[] = [
  { status: "PENDING", label: "To review" },
  { status: "APPROVED", label: "Approved" },
  { status: "REJECTED", label: "Rejected" },
];
const PAGE_SIZE = 20;

export default async function ClaimsPage({ searchParams }: PageProps<"/admin/claims">) {
  const params = await searchParams;
  const status = (TABS.find((tab) => tab.status === params.status)?.status ?? "PENDING") as ClaimStatus;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await api<ClaimPage>(`/claims?status=${status}&page=${page}&limit=${PAGE_SIZE}`);
  const last = Math.min(page * PAGE_SIZE, result.total);
  const href = (target: number) => `/admin/claims?status=${status}${target > 1 ? `&page=${target}` : ""}`;

  return (
    <>
      <PageHeader
        title="Ownership claims"
        description="Shoppers prove they bought a piece with a receipt. Approving one makes them its verified owner. Order matches are approved automatically."
      />

      <nav aria-label="Claim status" className="mt-8 flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => {
          const active = tab.status === status;
          return (
            <Link
              key={tab.status}
              href={`/admin/claims?status=${tab.status}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-medium whitespace-nowrap",
                active ? "border-forest text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
              {active && <span className="ml-2 rounded-full bg-wash px-2 py-0.5 text-xs tabular">{result.total}</span>}
            </Link>
          );
        })}
      </nav>

      {result.total === 0 ? (
        <section className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong bg-card px-6 py-10 sm:items-center sm:text-center">
          <Inbox className="size-9 text-moss" strokeWidth={1.5} aria-hidden />
          <h2 className="text-lg font-semibold">
            {status === "PENDING" ? "Nothing to review" : `No ${status.toLowerCase()} claims yet`}
          </h2>
          <p className="max-w-[46ch] text-ink-muted">
            {status === "PENDING"
              ? "Receipts shoppers upload appear here, oldest first."
              : "Decisions you make will be listed here."}
          </p>
        </section>
      ) : (
        <>
          <ul className="mt-6 divide-y overflow-hidden rounded-xl border bg-card">
            {result.items.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} />
            ))}
          </ul>
          {result.total > PAGE_SIZE && (
            <nav aria-label="Pages" className="mt-5 flex items-center justify-between gap-3">
              {page > 1 ? (
                <Button asChild variant="outline"><Link href={href(page - 1)}>Previous</Link></Button>
              ) : <span />}
              <span className="text-sm text-ink-muted tabular">Page {page} of {Math.ceil(result.total / PAGE_SIZE)}</span>
              {last < result.total ? (
                <Button asChild variant="outline"><Link href={href(page + 1)}>Next</Link></Button>
              ) : <span />}
            </nav>
          )}
        </>
      )}
    </>
  );
}

function ClaimRow({ claim }: { claim: Claim }) {
  return (
    <li>
      <Link
        href={`/admin/claims/${claim.id}`}
        className="flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-wash/60 sm:flex-nowrap sm:px-5"
      >
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-wash">
          {claim.product.imageUrl ? (
            <img src={imageSrc(claim.product.imageUrl)} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <Shirt className="size-5 text-ink-muted" strokeWidth={1.5} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{claim.product.name}</p>
          <p className="truncate text-sm text-ink-muted">
            {claim.user.name} ({claim.user.email})
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 pl-[60px] text-sm text-ink-muted sm:w-auto sm:justify-end sm:pl-0">
          <span className="tabular">
            {claim.method === "ORDER_MATCH" ? "Order match" : `Receipt ${claim.receiptAttempt ?? "?"} of 5`}
          </span>
          <span className="whitespace-nowrap">{formatDate(claim.status === "PENDING" ? claim.createdAt : claim.reviewedAt)}</span>
        </div>
      </Link>
    </li>
  );
}
