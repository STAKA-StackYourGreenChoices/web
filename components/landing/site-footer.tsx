import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/** Closing call to action, then the footer. */
export function SiteFooter({ signedIn }: { signedIn: boolean }) {
  return (
    <footer>
      <section aria-labelledby="start-title" className="bg-forest text-paper">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-5 py-20 sm:px-6 sm:py-24 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="start-title" className="text-3xl font-semibold text-paper sm:text-4xl">Start with one piece</h2>
            <p className="mt-3 max-w-[44ch] text-lg text-paper/75">
              Pick something you wear often, scan its label, and see what its tag says.
            </p>
          </div>
          {signedIn ? (
            <Button asChild size="lg" variant="secondary">
              <Link href="/scan">Scan a piece</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Create an account</Link>
              </Button>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center px-2 font-medium text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper focus-visible:outline-paper"
              >
                I already have an account
              </Link>
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Wordmark href="/" className="text-forest" />
          <span>Stack Your Green Choices</span>
        </div>
        <p>&copy; {new Date().getFullYear()} STAKA</p>
      </div>
    </footer>
  );
}
