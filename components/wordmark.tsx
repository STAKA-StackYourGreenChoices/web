import Link from "next/link";
import { cn } from "@/lib/utils";

/** "staka" set in Bricolage with a small hang-tag glyph standing in for the dot. */
export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md font-heading text-xl font-bold tracking-[-0.03em]",
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 16 22" className="h-5 w-[15px]" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M3 0h10l3 3v17a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3l3-3Zm5 4.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"
        />
      </svg>
      staka
    </Link>
  );
}
