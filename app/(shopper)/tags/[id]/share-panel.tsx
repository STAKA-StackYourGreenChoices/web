"use client";

import { Check, Copy, Download, ExternalLink, Link2, Loader2, Lock, Share2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShareLink } from "@/lib/types";
import { shareTag, stopSharing } from "../../actions";

interface Props {
  cardId: string;
  productName: string;
  verified: boolean;
  share?: ShareLink;
  /** This site's origin, e.g. https://staka.app, for building the public link. */
  origin: string;
}

/** Sharing is for verified pieces only, so every public tag is backed by proof of purchase. */
export function SharePanel({ cardId, productName, verified, share, origin }: Props) {
  const [slug, setSlug] = useState(share?.slug);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Feature-detected after mount: the server can't know what the browser supports.
    const timer = setTimeout(() => setCanNativeShare(typeof navigator.share === "function"), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!verified) {
    return (
      <section aria-labelledby="share-title" className="flex gap-3 rounded-xl border border-dashed border-line-strong p-5">
        <Lock className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
        <div>
          <h2 id="share-title" className="font-sans text-base font-semibold tracking-normal">Sharing unlocks once you&apos;re verified</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Only proven pieces can be shared, so every STAKA tag people see is backed by a real purchase.
          </p>
        </div>
      </section>
    );
  }

  const url = slug ? `${origin}/t/${slug}` : "";
  const text = `I own this ${productName}, verified on STAKA.`;
  const encoded = { url: encodeURIComponent(url), text: encodeURIComponent(text) };
  const networks = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { name: "X", href: `https://x.com/intent/post?text=${encoded.text}&url=${encoded.url}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}` },
  ];

  const create = () =>
    startTransition(async () => {
      setError(undefined);
      const result = await shareTag(cardId);
      if (result.status === "error" || !result.slug) {
        setError(result.message ?? "The link couldn't be created. Try again.");
        return;
      }
      setSlug(result.slug);
      toast.success("Share link ready");
    });

  const stop = () =>
    startTransition(async () => {
      const result = await stopSharing(cardId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setSlug(undefined);
      toast.success("Sharing turned off");
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it yourself.");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `${productName} on STAKA`, text, url });
    } catch {
      // Closing the share sheet throws; nothing to do.
    }
  };

  return (
    <section aria-labelledby="share-title" className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex gap-3">
        <Share2 className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
        <div>
          <h2 id="share-title" className="font-sans text-base font-semibold tracking-normal">Share this tag</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Anyone with the link sees the tag, your first name and that you&apos;re the verified owner. Never your
            email.
          </p>
        </div>
      </div>
      <FormAlert status={error ? "error" : "idle"} message={error} />

      {!slug ? (
        <Button onClick={create} disabled={pending} className="self-start">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Link2 aria-hidden />}
          {pending ? "Creating link…" : "Create share link"}
        </Button>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="share-url" className="sr-only">Share link</label>
            <Input id="share-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="tabular text-sm" />
            <Button variant="outline" onClick={copy} className="shrink-0">
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {canNativeShare && (
              <Button onClick={nativeShare}>
                <Share2 aria-hidden />
                Share…
              </Button>
            )}
            {networks.map((network) => (
              <Button key={network.name} asChild variant="outline" size="sm">
                <a href={network.href} target="_blank" rel="noopener noreferrer">
                  {network.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={`/t/${slug}/story`}
                download
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo sm:min-h-9"
              >
                <Download className="size-4" aria-hidden />
                Image for Instagram stories
              </a>
              <a
                href={`/t/${slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-indigo underline decoration-indigo/40 underline-offset-4 hover:decoration-indigo sm:min-h-9"
              >
                <ExternalLink className="size-4" aria-hidden />
                See what others see
              </a>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="self-start text-rust hover:bg-rust/8 hover:text-rust" disabled={pending}>
                  Stop sharing
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Stop sharing this tag?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The link stops working for everyone, including posts that already use it. You can share again later
                    with a new link.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep sharing</AlertDialogCancel>
                  <AlertDialogAction onClick={stop}>Stop sharing</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </section>
  );
}
