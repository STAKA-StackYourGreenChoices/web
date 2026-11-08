import { BadgeCheck, Ban, CircleAlert, Clock, ShieldQuestion } from "lucide-react";
import type { OwnershipStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<OwnershipStatus, { label: string; icon: typeof Clock; tone: string }> = {
  VERIFIED: { label: "Verified owner", icon: BadgeCheck, tone: "border-moss/40 bg-moss/12 text-forest" },
  PENDING: { label: "Receipt under review", icon: Clock, tone: "border-indigo/25 bg-accent text-indigo" },
  REJECTED: { label: "Receipt turned down", icon: CircleAlert, tone: "border-rust/30 bg-rust/5 text-rust" },
  BLOCKED: { label: "Can't be verified", icon: Ban, tone: "border-line-strong bg-wash text-ink-muted" },
  UNVERIFIED: { label: "Not verified yet", icon: ShieldQuestion, tone: "border-line-strong bg-card text-ink-muted" },
};

/** A shopper's ownership state for one piece, in a few words. */
export function OwnershipChip({ status, className }: { status: OwnershipStatus; className?: string }) {
  const { label, icon: Icon, tone } = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
