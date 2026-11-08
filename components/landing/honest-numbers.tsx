import { BadgeCheck, Info } from "lucide-react";

/** STAKA's point of view, stated once and plainly. */
export function HonestNumbers() {
  return (
    <section aria-labelledby="honest-title" className="bg-forest text-paper">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
        <div>
          <h2 id="honest-title" className="max-w-[18ch] text-3xl font-semibold text-paper sm:text-[2.75rem] sm:leading-[1.05]">
            No vague green labels. Just the numbers, and who stands behind them.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg text-paper/75">
            STAKA never calls a piece &ldquo;sustainable&rdquo;. A tag shows the measured figures and says whether
            a certifier checked them or the brand stated them itself, so you can decide what they&apos;re worth.
          </p>
        </div>
        <ul className="flex flex-col gap-3" aria-label="How figures are labelled">
          <li className="flex items-start gap-3 rounded-xl bg-paper/8 p-4 ring-1 ring-paper/15">
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
            <div>
              <p className="font-medium">Verified by Global Organic Textile Standard</p>
              <p className="mt-0.5 text-sm text-paper/65">An outside body checked these figures.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-xl bg-paper/8 p-4 ring-1 ring-paper/15">
            <Info className="mt-0.5 size-5 shrink-0 text-paper/70" aria-hidden />
            <div>
              <p className="font-medium">Figures stated by the brand</p>
              <p className="mt-0.5 text-sm text-paper/65">No one outside the brand has checked them yet.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
