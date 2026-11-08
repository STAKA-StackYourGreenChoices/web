import { BadgeCheck, CircleDashed, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SustainabilityInfo } from "@/lib/types";

/** Whether a product's figures are third-party verified, brand-stated, or missing. */
export function SustainabilityBadge({
  info,
  compact = false,
}: {
  info?: SustainabilityInfo;
  compact?: boolean;
}) {
  const [label, Icon, tone] = !info
    ? (["Missing", CircleDashed, "border-ochre/30 bg-ochre/8 text-ochre"] as const)
    : info.verified
      ? (["Verified", BadgeCheck, "border-moss/40 bg-moss/12 text-forest"] as const)
      : (["Brand-stated", Info, "border-line-strong bg-wash text-ink-muted"] as const);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border py-0.5 text-xs font-medium whitespace-nowrap",
        compact ? "size-8 justify-center px-0" : "px-2.5",
        tone,
      )}
      title={compact ? `Figures: ${label}` : undefined}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className={compact ? "sr-only" : undefined}>
        {compact ? `Figures: ${label}` : label}
      </span>
    </span>
  );
}
