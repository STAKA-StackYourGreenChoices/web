"use client";

import { BadgeCheck, Clock, FileUp, Loader2, PackageSearch, ShieldOff, ShieldQuestion } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import { idle, type FormState } from "@/lib/form-state";
import type { Ownership } from "@/lib/types";
import { cn } from "@/lib/utils";
import { uploadReceipt, verifyByOrder } from "../../actions";

const MAX_BYTES = 5 * 1024 * 1024;

export function OwnershipPanel({ cardId, ownership }: { cardId: string; ownership: Ownership }) {
  const { status } = ownership;

  if (status === "VERIFIED") {
    return (
      <Panel tone="success" icon={BadgeCheck} title="You're the verified owner">
        {ownership.method === "ORDER_MATCH"
          ? "We matched this piece to a paid order on your account"
          : "An admin approved your receipt"}
        {ownership.verifiedAt ? ` on ${formatDate(ownership.verifiedAt)}.` : "."} It counts toward
        your wardrobe.
      </Panel>
    );
  }

  if (status === "PENDING") {
    return (
      <Panel tone="info" icon={Clock} title="Receipt under review">
        Sent {formatDate(ownership.pendingSince)}. An admin will check it, and the result shows up
        here. {uploadsLeft(ownership.receiptAttemptsLeft)}
      </Panel>
    );
  }

  if (status === "BLOCKED") {
    return (
      <Panel tone="muted" icon={ShieldOff} title="This piece can't be verified">
        All 5 receipt uploads for it were used.
        {ownership.lastRejectionReason && ` The last one was turned down: ${ownership.lastRejectionReason}.`}{" "}
        You can still keep its tag.
      </Panel>
    );
  }

  return <ProveOwnership cardId={cardId} ownership={ownership} />;
}

function ProveOwnership({ cardId, ownership }: { cardId: string; ownership: Ownership }) {
  const [orderResult, setOrderResult] = useState<FormState>(idle);
  const [checking, startChecking] = useTransition();
  const [state, action] = useActionState(uploadReceipt.bind(null, cardId), idle);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();
  const errors = state.fieldErrors?.receipt ?? (fileError ? [fileError] : undefined);

  return (
    <section aria-labelledby="prove-title" className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex gap-3">
        <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
        <div>
          <h2 id="prove-title" className="font-sans text-base font-semibold tracking-normal">
            Prove you own it
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Verified pieces count toward your wardrobe. Use whichever way works for you.
          </p>
        </div>
      </div>

      {ownership.status === "REJECTED" && (
        <FormAlert
          status="error"
          message={`Your last receipt was turned down: ${ownership.lastRejectionReason ?? "no reason given"}. ${uploadsLeft(ownership.receiptAttemptsLeft)}`}
        />
      )}

      {/* Option 1: order match */}
      <div className="flex flex-col gap-3 border-t pt-5">
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-normal">Bought it through STAKA&apos;s partner shop?</h3>
          <p className="mt-0.5 text-sm text-ink-muted">We&apos;ll look for it in the paid orders on your account.</p>
        </div>
        <FormAlert status={orderResult.status} message={orderResult.message} />
        <Button
          variant="outline"
          className="self-start"
          disabled={checking}
          onClick={() =>
            startChecking(async () => {
              setOrderResult(await verifyByOrder(cardId));
            })
          }
        >
          {checking ? <Loader2 className="animate-spin" aria-hidden /> : <PackageSearch aria-hidden />}
          {checking ? "Checking orders…" : "Find it in my orders"}
        </Button>
      </div>

      {/* Option 2: receipt */}
      <form action={action} noValidate className="flex flex-col gap-3 border-t pt-5">
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-normal">Upload a receipt</h3>
          <p className="mt-0.5 text-sm text-ink-muted">
            A clear photo or PDF showing the shop, the date and this piece. An admin checks it.{" "}
            {uploadsLeft(ownership.receiptAttemptsLeft)}
          </p>
        </div>
        <FormAlert status={state.status === "error" ? "error" : "idle"} message={state.message} />

        <label
          className={cn(
            "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 transition-colors",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo",
            errors ? "border-rust/60 bg-rust/5" : "border-line-strong hover:border-ink-muted",
          )}
        >
          <FileUp className="size-5 shrink-0 text-moss" aria-hidden />
          <span className="min-w-0 flex-1 text-sm">
            {file ? (
              <>
                <span className="block truncate font-medium">{file.name}</span>
                <span className="text-ink-muted tabular">{(file.size / 1024 / 1024).toFixed(1)} MB. Tap to change.</span>
              </>
            ) : (
              <span className="font-medium text-indigo">Choose a photo or PDF</span>
            )}
          </span>
          <input
            type="file"
            name="receipt"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            aria-invalid={errors ? true : undefined}
            aria-describedby={errors ? "receipt-error" : undefined}
            onChange={(event) => {
              const chosen = event.target.files?.[0] ?? null;
              setFile(chosen);
              setFileError(chosen && chosen.size > MAX_BYTES ? "The file is over 5 MB. Take a smaller photo or crop it." : undefined);
            }}
          />
        </label>
        {errors && <FieldError id="receipt-error">{errors.join(" ")}</FieldError>}

        <SubmitButton pendingLabel="Sending receipt…" className="self-start" disabled={!file || Boolean(fileError)}>
          Send for review
        </SubmitButton>
      </form>
    </section>
  );
}

function uploadsLeft(left: number) {
  return left === 1 ? "1 upload left." : `${left} of 5 uploads left.`;
}

function Panel({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "success" | "info" | "muted";
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex gap-3 rounded-xl border p-5",
        tone === "success" && "border-moss/40 bg-moss/10",
        tone === "info" && "border-indigo/20 bg-accent",
        tone === "muted" && "bg-card",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          tone === "success" ? "text-forest" : tone === "info" ? "text-indigo" : "text-ink-muted",
        )}
        aria-hidden
      />
      <div>
        <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{children}</p>
      </div>
    </section>
  );
}
