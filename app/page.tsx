import type { Metadata } from "next";
import Link from "next/link";
import { ScanBarcode } from "lucide-react";
import { ForBrands } from "@/components/landing/for-brands";
import { HonestNumbers } from "@/components/landing/honest-numbers";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Questions } from "@/components/landing/questions";
import { RailScene } from "@/components/landing/rail-scene";
import { SAMPLE_JEANS, SAMPLE_SNEAKERS, SAMPLE_TEE } from "@/components/landing/samples";
import { ShareSection } from "@/components/landing/share-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TagAnatomy } from "@/components/landing/tag-anatomy";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { absolute: "STAKA: your clothes, with their footprint attached" },
  description:
    "Scan the barcode on a clothing label to see its carbon footprint and recyclability, prove you bought it, and keep its digital tag in one wardrobe.",
  openGraph: {
    title: "STAKA: your clothes, with their footprint attached",
    description: "Scan a label. See the footprint. Prove you own it.",
    type: "website",
    siteName: "STAKA",
  },
};

export default async function HomePage() {
  const signedIn = Boolean(await getSession());

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main id="main">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="overflow-x-clip">
          <div className="mx-auto grid max-w-[1200px] items-center gap-6 px-5 pt-12 pb-4 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pt-10 lg:pb-16">
            <div className="max-w-[36rem] lg:py-12">
              <h1
                id="hero-title"
                className="text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] sm:text-5xl lg:text-[4.25rem]"
              >
                Your clothes, with their footprint attached.
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg text-ink-muted sm:text-xl sm:leading-relaxed">
                Scan the barcode on a clothing label to see the piece&apos;s carbon footprint and recyclability,
                prove you bought it, and keep its tag in one wardrobe.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {signedIn ? (
                  <>
                    <Button asChild size="lg">
                      <Link href="/scan">
                        <ScanBarcode aria-hidden />
                        Scan a piece
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/wardrobe">Open my wardrobe</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link href="/register">Create an account</Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost">
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-6 text-sm text-ink-muted">Works in your phone&apos;s browser. Nothing to install.</p>
            </div>

            {/* The rail: three real tags, the front one already proven */}
            <RailScene
              className="mx-auto h-[500px] w-full max-w-[600px] origin-top scale-[0.82] -mb-20 sm:h-[600px] sm:scale-100 sm:mb-0 lg:h-[640px]"
              hangers={[
                { product: SAMPLE_JEANS, left: 18, drop: 36, size: "sm", delay: 120, className: "opacity-95" },
                { product: SAMPLE_TEE, left: 50, drop: 92, size: "md", front: true, delay: 0 },
                { product: SAMPLE_SNEAKERS, left: 82, drop: 16, size: "sm", delay: 220, className: "opacity-95" },
              ]}
            />
          </div>
        </section>

        <HowItWorks />
        <TagAnatomy />
        <HonestNumbers />
        <ShareSection />
        <ForBrands />
        <Questions />
      </main>
      <SiteFooter signedIn={signedIn} />
    </>
  );
}
