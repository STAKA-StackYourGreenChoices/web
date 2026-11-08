import { BadgeCheck, Receipt } from "lucide-react";
import { Barcode } from "./barcode";

/**
 * Three steps that really are a sequence, so they're numbered. On wide
 * screens they hang from the rail motif; on phones they run down a line.
 */
export function HowItWorks() {
  const steps = [
    {
      title: "Scan the label",
      body: "Point your phone's camera at the barcode on a clothing label, or type the number under it. No app to install.",
      visual: (
        <div className="relative mx-auto w-full max-w-[260px] rounded-xl bg-forest-deep p-5">
          <div className="relative rounded-md bg-white p-2">
            <Barcode code="8901234500019" className="w-full" />
          </div>
          {/* the scanner's aiming corners */}
          {["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((corner) => (
            <span key={corner} className={`absolute size-5 rounded-[3px] border-paper/90 ${corner}`} />
          ))}
        </div>
      ),
    },
    {
      title: "See its footprint",
      body: "The piece's tag shows its carbon footprint, how much of it can be recycled, and who checked those figures.",
      visual: (
        <dl className="mx-auto grid w-full max-w-[260px] grid-cols-2 gap-px overflow-hidden rounded-xl border bg-line">
          <div className="bg-tag px-4 py-3">
            <dt className="text-xs text-ink-muted">Footprint</dt>
            <dd className="whitespace-nowrap font-heading font-semibold tabular">
              <span className="text-xl">2.1</span> <span className="text-xs font-medium text-ink-muted">kg CO₂e</span>
            </dd>
          </div>
          <div className="bg-tag px-4 py-3">
            <dt className="text-xs text-ink-muted">Recyclable</dt>
            <dd className="font-heading font-semibold tabular">
              <span className="text-xl">80</span> <span className="text-xs font-medium text-ink-muted">%</span>
            </dd>
          </div>
          <div className="col-span-2 flex items-center gap-2 bg-tag px-4 py-3 text-sm">
            <BadgeCheck className="size-4 shrink-0 text-moss" aria-hidden />
            Verified by Global Organic Textile Standard
          </div>
        </dl>
      ),
    },
    {
      title: "Prove you own it",
      body: "Match it to a paid order, or upload a receipt for the STAKA team to check. Proven pieces join your wardrobe.",
      visual: (
        <div className="relative mx-auto w-full max-w-[260px]">
          <div className="rotate-[-2deg] rounded-md border bg-white px-5 pt-4 pb-6 font-sans text-xs text-ink-muted shadow-[0_1px_0_rgb(26_31_28/0.06)] [clip-path:polygon(0_0,100%_0,100%_92%,94%_100%,88%_92%,82%_100%,76%_92%,70%_100%,64%_92%,58%_100%,52%_92%,46%_100%,40%_92%,34%_100%,28%_92%,22%_100%,16%_92%,10%_100%,4%_92%,0_100%)]">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Receipt className="size-3.5" aria-hidden /> Terra Threads
            </p>
            <p className="mt-2 flex justify-between tabular"><span>Organic Cotton Tee</span><span>1 ×</span></p>
            <p className="mt-1 flex justify-between border-t border-dashed pt-1 tabular"><span>Paid by card</span><span>02 Nov</span></p>
          </div>
          <span className="absolute -right-2 -bottom-3 flex rotate-[-8deg] items-center gap-1.5 rounded-full border-2 border-moss bg-paper px-3 py-1 text-sm font-semibold text-forest">
            <BadgeCheck className="size-4 text-moss" aria-hidden />
            Verified owner
          </span>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-28">
      <div className="max-w-[40ch]">
        <h2 id="how-title" className="text-3xl font-semibold sm:text-4xl">How it works</h2>
        <p className="mt-3 text-lg text-ink-muted">Three steps from the label in your hand to a tag you can prove.</p>
      </div>

      <ol className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        {/* the rail the steps hang from (wide screens) / the line they run down (phones) */}
        <span aria-hidden className="absolute top-[18px] right-[8%] left-[8%] hidden h-1.5 rounded-full bg-forest/85 md:block" />
        <span aria-hidden className="absolute top-2 bottom-2 left-[17px] w-0.5 bg-line-strong md:hidden" />
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-5 md:flex-col md:items-center md:gap-0 md:text-center">
            <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-forest bg-paper font-heading text-base font-bold text-forest tabular">
              {i + 1}
            </span>
            <span aria-hidden className="hidden h-8 w-px bg-ink/30 md:block" />
            <div className="flex flex-1 flex-col gap-5 md:items-center">
              <div className="order-2 w-full md:order-1">{step.visual}</div>
              <div className="order-1 md:order-2 md:max-w-[32ch]">
                <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-ink-muted">{step.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-12 text-sm text-ink-muted md:text-center">
        That barcode is real: open the STAKA scanner and point it at your screen.
      </p>
    </section>
  );
}
