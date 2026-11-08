import { HangTag, type HangTagProduct } from "@/components/hang-tag";
import { cn } from "@/lib/utils";

interface Hanger {
  product: HangTagProduct;
  /** Horizontal position of the string on the rail, as a percentage. */
  left: number;
  /** String length in px between the rail and the tag's hole. */
  drop: number;
  size: "sm" | "md";
  front?: boolean;
  delay: number;
  className?: string;
}

/** Where the hole sits below the tag's top edge (see HangTag). */
const HOLE_Y = 26;

/**
 * The home page's signature: a clothes rail with real tags hanging from it.
 * They swing once when the page loads, as if someone just walked past.
 * The headline beside it never moves (it is the page's largest paint).
 */
export function RailScene({ hangers, className }: { hangers: Hanger[]; className?: string }) {
  return (
    <div aria-hidden className={cn("relative select-none", className)}>
      {/* The rail, with its end caps */}
      <div className="absolute inset-x-[2%] top-5 h-2.5 rounded-full bg-forest shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)]" />
      <div className="absolute top-3 left-[1%] size-[18px] rounded-full bg-forest-deep" />
      <div className="absolute top-3 right-[1%] size-[18px] rounded-full bg-forest-deep" />

      {hangers.map((hanger) => (
        <div
          key={hanger.product.name}
          className={cn("absolute top-7 -translate-x-1/2", hanger.front ? "z-20" : "z-10", hanger.className)}
          style={{ left: `${hanger.left}%` }}
        >
          <div
            className="flex origin-top flex-col items-center motion-safe:animate-tag-swing"
            style={{ animationDelay: `${hanger.delay}ms` }}
          >
            {/* The string runs into the punched hole; the tag's hole shows it through. */}
            <span className="block w-[2px] rounded-full bg-ink/35" style={{ height: hanger.drop + HOLE_Y }} />
            <div style={{ marginTop: -HOLE_Y }}>
              <HangTag
                product={hanger.product}
                ownerName={hanger.front ? "you" : undefined}
                ownerVerified={hanger.front}
                size={hanger.size}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
