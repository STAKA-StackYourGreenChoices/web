import { HangTag } from "@/components/hang-tag";
import { Wordmark } from "@/components/wordmark";

/** The sample tag on the panel: a real seeded product, shown without its photo. */
const sampleProduct = {
  name: "Organic Cotton Tee",
  gtin: "08901234500019",
  brand: { name: "Terra Threads" },
  sustainabilityInfo: {
    carbonScoreGrams: 2100,
    recyclabilityPercent: 80,
    verified: true,
    certifierName: "Global Organic Textile Standard",
  },
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel: a full column on desktop, a short band on phones */}
      <aside className="relative overflow-hidden bg-forest text-paper">
        <div className="flex items-center justify-between px-5 pt-4 sm:px-8 lg:px-12 lg:pt-10">
          <Wordmark className="text-paper" />
        </div>

        {/* Phones and tablets: the top edge of a tag peeks into the band */}
        <div aria-hidden className="relative mx-auto -mb-1 mt-3 flex h-24 w-[288px] justify-center overflow-hidden lg:hidden">
          <HangTag product={sampleProduct} showImage={false} className="pointer-events-none" />
        </div>

        <div className="hidden px-12 pb-12 lg:flex lg:min-h-[calc(100dvh-5.5rem)] lg:flex-col">
          <div className="flex flex-1 items-start justify-center pt-4">
            <HangTag product={sampleProduct} withString swing showImage={false} size="lg" />
          </div>
          <div className="max-w-[34ch]">
            <p className="font-heading text-3xl font-semibold leading-[1.08] tracking-[-0.025em] text-paper">
              Your clothes, with their footprint attached.
            </p>
            <p className="mt-4 text-base text-paper/75">
              Scan a garment&apos;s barcode to keep its carbon footprint, recyclability and
              certifications on a digital tag.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 justify-center px-5 py-10 sm:px-8 sm:py-14 lg:items-center lg:py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
