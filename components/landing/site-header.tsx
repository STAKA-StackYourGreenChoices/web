import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

const SECTIONS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#whats-on-a-tag", label: "What's on a tag" },
  { href: "#for-brands", label: "For brands" },
  { href: "#questions", label: "Questions" },
];

/** The public site's header: wordmark top-left, section links, and the two account actions. */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Wordmark href="/" className="px-1 text-forest" />
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="inline-flex h-11 items-center rounded-lg px-3 text-[0.9375rem] text-ink-muted transition-colors hover:bg-wash hover:text-ink"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {signedIn ? (
            <Button asChild size="sm">
              <Link href="/wardrobe">Open my wardrobe</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="px-3">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="px-3.5">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
