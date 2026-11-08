import { HangTag } from "@/components/hang-tag";
import { SAMPLE_SWEATER } from "./samples";

const LEFT = [
  { title: "Brand and piece", body: "Exactly as printed on the label, so you know you scanned the right thing." },
  { title: "Carbon footprint", body: "Greenhouse gases from making the piece, in kilograms of CO₂ equivalent." },
];
const RIGHT = [
  { title: "Recyclable share", body: "How much of the piece, by weight, can be recycled at the end of its life." },
  { title: "Who checked the figures", body: "A named certifier, or “stated by the brand” when no one outside has checked." },
  { title: "Verified owner", body: "Appears once you've matched an order or had a receipt approved." },
];

function Callout({ title, body, side }: { title: string; body: string; side: "left" | "right" }) {
  return (
    <li className="relative">
      <h3 className="font-sans text-base font-semibold tracking-normal">{title}</h3>
      <p className="mt-1 text-ink-muted">{body}</p>
      {/* leader line toward the tag, wide screens only */}
      <span
        aria-hidden
        className={`absolute top-3 hidden h-px w-10 bg-ink/30 lg:block ${side === "left" ? "-right-14" : "-left-14"}`}
      />
    </li>
  );
}

/** The tag, explained: every field on it, labelled in plain words. */
export function TagAnatomy() {
  return (
    <section id="whats-on-a-tag" aria-labelledby="anatomy-title" className="border-y bg-wash/60">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-28">
        <div className="max-w-[44ch]">
          <h2 id="anatomy-title" className="text-3xl font-semibold sm:text-4xl">What&apos;s on a tag</h2>
          <p className="mt-3 text-lg text-ink-muted">
            Every piece you add gets one. Here&apos;s what each part tells you.
          </p>
        </div>
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
          <ul className="order-2 flex flex-col gap-8 lg:order-1 lg:text-right">
            {LEFT.map((item) => (
              <Callout key={item.title} {...item} side="left" />
            ))}
          </ul>
          <div className="order-1 flex justify-center lg:order-2">
            <HangTag product={SAMPLE_SWEATER} ownerName="you" ownerVerified size="md" />
          </div>
          <ul className="order-3 flex flex-col gap-8">
            {RIGHT.map((item) => (
              <Callout key={item.title} {...item} side="right" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
