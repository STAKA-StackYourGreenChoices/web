import { ChevronLeft } from "lucide-react";
import Link from "next/link";

/** "‹ Parent" link above a page title. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-1 mb-2 inline-flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm font-medium text-ink-muted hover:text-ink sm:min-h-9"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
