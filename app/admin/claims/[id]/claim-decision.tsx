"use client";

import { BadgeCheck, CircleX, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { idle, type FormState } from "@/lib/form-state";
import type { ClaimDetail } from "@/lib/types";
import { approveClaim, rejectClaim } from "../../actions";

const COMMON_REASONS = [
  "The receipt is too blurry to read",
  "This product isn't on the receipt",
  "The receipt is from a shop that doesn't sell this brand",
  "Part of the receipt is cut off",
];

/** Approve, or reject with a reason the shopper will read. Already-decided claims show the outcome. */
export function ClaimDecision({ claim }: { claim: ClaimDetail }) {
  const router = useRouter();
  const [approving, startApproving] = useTransition();
  const [approveError, setApproveError] = useState<string>();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [state, rejectAction] = useActionState(rejectClaim.bind(null, claim.id), idle);

  // Each result is handled once (see the product form for why).
  const handled = useRef<FormState | null>(null);
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return;
    handled.current = state;
    toast.success(state.message);
    router.push("/admin/claims");
  }, [state, router]);

  if (claim.status !== "PENDING") {
    const approved = claim.status === "APPROVED";
    return (
      <section
        aria-label="Decision"
        className={approved ? "rounded-xl border border-moss/40 bg-moss/10 p-5" : "rounded-xl border border-rust/30 bg-rust/5 p-5"}
      >
        <p className="flex items-center gap-2 font-semibold">
          {approved ? <BadgeCheck className="size-5 text-forest" aria-hidden /> : <CircleX className="size-5 text-rust" aria-hidden />}
          {approved ? "Approved" : "Rejected"} {formatDate(claim.reviewedAt)}
          {claim.reviewedByName && ` by ${claim.reviewedByName}`}
        </p>
        {claim.rejectionReason && <p className="mt-2 text-sm">Reason given: &ldquo;{claim.rejectionReason}&rdquo;</p>}
      </section>
    );
  }

  const approve = () =>
    startApproving(async () => {
      const result = await approveClaim(claim.id);
      if (result.status === "error") {
        setApproveError(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/admin/claims");
    });

  const reasonErrors = state.fieldErrors?.reason;

  return (
    <section aria-labelledby="decision-title" className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <h2 id="decision-title" className="font-sans text-base font-semibold tracking-normal">Your decision</h2>
      <FormAlert status={approveError ? "error" : "idle"} message={approveError} />

      {!rejecting ? (
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <Button onClick={approve} disabled={approving} className="flex-1">
            {approving ? <Loader2 className="animate-spin" aria-hidden /> : <BadgeCheck aria-hidden />}
            {approving ? "Approving…" : "Approve"}
          </Button>
          <Button variant="outline" onClick={() => setRejecting(true)} disabled={approving} className="flex-1">
            <CircleX aria-hidden />
            Reject
          </Button>
        </div>
      ) : (
        <form action={rejectAction} noValidate className="flex flex-col gap-4">
          <FormAlert status={state.status === "error" ? "error" : "idle"} message={state.message} />
          <Field data-invalid={reasonErrors ? true : undefined}>
            <FieldLabel htmlFor="field-reason">Reason the shopper will see</FieldLabel>
            <Textarea
              id="field-reason"
              name="reason"
              autoFocus
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-invalid={reasonErrors ? true : undefined}
              aria-describedby={reasonErrors ? "reason-error" : undefined}
            />
            {reasonErrors && <FieldError id="reason-error">{reasonErrors.join(" ")}</FieldError>}
          </Field>
          <div className="flex flex-wrap gap-2" aria-label="Common reasons">
            {COMMON_REASONS.map((common) => (
              <button
                key={common}
                type="button"
                onClick={() => setReason(common)}
                aria-pressed={reason === common}
                className="min-h-9 rounded-full border border-line-strong px-3 py-1 text-left text-xs hover:bg-wash aria-pressed:border-indigo aria-pressed:bg-accent aria-pressed:text-indigo pointer-coarse:min-h-11"
              >
                {common}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-muted">
            {claim.receiptAttempt && claim.receiptAttempt >= 5
              ? "This was their last upload: rejecting it means they can't verify this piece."
              : `They'll have ${5 - (claim.receiptAttempt ?? 0)} upload${5 - (claim.receiptAttempt ?? 0) === 1 ? "" : "s"} left.`}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
              Back
            </Button>
            <SubmitButton variant="destructive" pendingLabel="Rejecting…">
              Reject receipt
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}
