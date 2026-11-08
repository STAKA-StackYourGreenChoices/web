/* eslint-disable @next/next/no-img-element -- product images come from arbitrary brand hosts */
import { BadgeCheck, Info, Shirt } from "lucide-react";
import { imageSrc } from "@/lib/images";
import { cn } from "@/lib/utils";
import { carbonParts, displayGtin } from "@/lib/format";
import type { SustainabilityInfo } from "@/lib/types";

export interface HangTagProduct {
  name: string;
  gtin?: string;
  imageUrl?: string;
  brand: { name: string };
  sustainabilityInfo?: SustainabilityInfo;
}

interface HangTagProps {
  product: HangTagProduct;
  /** Shown as "Kept by …" when the tag belongs to someone. */
  ownerName?: string;
  /** Marks the owner as verified (proof of purchase approved). */
  ownerVerified?: boolean;
  size?: "sm" | "md" | "lg";
  /** Draws the string the tag hangs from. */
  withString?: boolean;
  /** "light" for dark backgrounds (default), "dark" for paper backgrounds. */
  stringTone?: "light" | "dark";
  /** Swings once on mount (respects reduced motion). */
  swing?: boolean;
  /** Hide the photo area, e.g. for decorative tags. */
  showImage?: boolean;
  className?: string;
}

const widths = { sm: "w-[232px]", md: "w-[288px]", lg: "w-[320px]" };

/**
 * STAKA's signature element: a product's digital twin drawn as a garment hang
 * tag, with chamfered top corners, a punched and reinforced hole, and a
 * stitched inner border. It is the only element in the system that casts a
 * shadow (see DESIGN.md).
 */
export function HangTag({
  product,
  ownerName,
  ownerVerified = false,
  size = "md",
  withString = false,
  stringTone = "light",
  swing = false,
  showImage = true,
  className,
}: HangTagProps) {
  const info = product.sustainabilityInfo;
  const compact = size === "sm";

  return (
    <figure
      aria-label={`Digital tag for ${product.name} by ${product.brand.name}`}
      className={cn(
        "relative flex shrink-0 flex-col items-center",
        swing && "motion-safe:animate-tag-swing origin-top",
        className,
      )}
    >
      {withString && (
        <svg
          aria-hidden
          viewBox="0 0 40 96"
          className={cn("-mb-[30px] h-24 w-10", stringTone === "light" ? "text-paper/70" : "text-ink/35")}
          fill="none"
        >
          <path
            d="M20 0 C 6 30, 34 52, 20 92"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* drop-shadow (not box-shadow) so the shadow follows the cut shape */}
      <div className="drop-shadow-[0_14px_14px_rgb(26_31_28_/_0.28)]">
        <div
          className={cn(
            "relative bg-tag text-ink [clip-path:polygon(16%_0,84%_0,100%_8%,100%_100%,0_100%,0_8%)]",
            "[mask:radial-gradient(circle_at_50%_26px,transparent_7px,#000_7.5px)]",
            widths[size],
          )}
        >
          {/* Reinforcement ring around the punched hole */}
          <span
            aria-hidden
            className="absolute top-[14px] left-1/2 size-6 -translate-x-1/2 rounded-full border-[3px] border-moss/35"
          />
          {/* Stitched border */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2.5 top-12 bottom-2.5 rounded-md border border-dashed border-line-strong"
          />

          <div
            className={cn(
              "relative flex flex-col pt-14",
              compact ? "gap-3 px-5 pb-5" : "gap-4 px-6 pb-6",
            )}
          >
            <figcaption>
              <p className="text-sm font-medium text-ink-muted">
                {product.brand.name}
              </p>
              <p
                className={cn(
                  "mt-0.5 font-heading font-semibold leading-[1.1] tracking-[-0.02em] text-balance",
                  compact ? "text-lg" : "text-xl",
                )}
              >
                {product.name}
              </p>
            </figcaption>

            {showImage && (
              <div className="aspect-[4/3] overflow-hidden rounded-md bg-wash">
                {product.imageUrl ? (
                  <img
                    src={imageSrc(product.imageUrl)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
                    <Shirt className="size-7" strokeWidth={1.5} aria-hidden />
                    <span className="text-xs">No photo yet</span>
                  </div>
                )}
              </div>
            )}

            {info ? (
              <>
                {/* Big number, small unit: the unit never wraps away from its value */}
                <dl className="grid grid-cols-[1.2fr_1fr] gap-3">
                  <div className="min-w-0">
                    <dt className="text-xs text-ink-muted">Footprint</dt>
                    <dd className="mt-0.5 whitespace-nowrap font-heading font-semibold tabular">
                      <span className={compact ? "text-lg" : "text-xl"}>
                        {carbonParts(info.carbonScoreGrams).value}
                      </span>
                      <span className="ml-1 text-xs font-medium text-ink-muted">
                        {carbonParts(info.carbonScoreGrams).unit}
                      </span>
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-ink-muted">Recyclable</dt>
                    <dd className="mt-0.5 whitespace-nowrap font-heading font-semibold tabular">
                      <span className={compact ? "text-lg" : "text-xl"}>
                        {info.recyclabilityPercent}
                      </span>
                      <span className="ml-0.5 text-xs font-medium text-ink-muted">
                        %
                      </span>
                    </dd>
                  </div>
                </dl>
                <p className="flex items-start gap-2 border-t border-dashed border-line-strong pt-3 text-sm">
                  {info.verified ? (
                    <>
                      <BadgeCheck
                        className="mt-0.5 size-4 shrink-0 text-moss"
                        aria-hidden
                      />
                      <span>
                        Verified
                        {info.certifierName
                          ? ` by ${info.certifierName}`
                          : " by a third party"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Info
                        className="mt-0.5 size-4 shrink-0 text-ink-muted"
                        aria-hidden
                      />
                      <span className="text-ink-muted">
                        Figures stated by the brand
                      </span>
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="flex items-start gap-2 border-t border-dashed border-line-strong pt-3 text-sm text-ink-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                No sustainability figures yet
              </p>
            )}

            {(product.gtin || ownerName) && (
              <div className="flex flex-col gap-0.5 text-xs text-ink-muted">
                {ownerName && (
                  <span className="flex min-w-0 items-center gap-1">
                    <span className="truncate">Kept by {ownerName}</span>
                    {ownerVerified && (
                      <>
                        <BadgeCheck className="size-3.5 shrink-0 text-moss" aria-hidden />
                        <span className="sr-only">, verified owner</span>
                      </>
                    )}
                  </span>
                )}
                {product.gtin && (
                  <span className="tabular">
                    Barcode {displayGtin(product.gtin)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}
