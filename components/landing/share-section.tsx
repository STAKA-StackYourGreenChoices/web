import { BadgeCheck, EyeOff, Link2Off, ShieldCheck } from "lucide-react";
import { carbonParts } from "@/lib/format";
import { SAMPLE_TEE } from "./samples";

/** Sharing, shown the way it actually arrives: as a link preview in a chat. */
export function ShareSection() {
  const carbon = carbonParts(SAMPLE_TEE.sustainabilityInfo!.carbonScoreGrams);
  const points = [
    { icon: ShieldCheck, text: "Only pieces you've proven you own can be shared." },
    { icon: EyeOff, text: "A shared tag shows your first name, never your email." },
    { icon: Link2Off, text: "Turn a link off whenever you like, and it stops working for everyone." },
  ];

  return (
    <section aria-labelledby="share-title" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6 sm:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 id="share-title" className="text-3xl font-semibold sm:text-4xl">Share what you can prove</h2>
          <p className="mt-3 max-w-[46ch] text-lg text-ink-muted">
            Send a tag to friends or post it to your story. The link opens for anyone, no account needed.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* A chat thread with the link preview STAKA generates */}
        <figure aria-label="Example: a shared tag in a chat" className="mx-auto w-full max-w-[420px] rounded-2xl bg-wash p-4 sm:p-6">
          <div className="ml-auto w-[88%] overflow-hidden rounded-2xl rounded-br-md bg-white shadow-[0_1px_2px_rgb(26_31_28/0.08)]">
            <div className="flex items-center gap-4 bg-forest p-4 text-paper">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold">staka</p>
                <p className="mt-1 font-heading text-lg leading-tight font-semibold">Maya owns this Organic Cotton Tee</p>
              </div>
              <div className="w-[96px] shrink-0 rounded-md bg-tag p-2 text-ink">
                <p className="text-[9px] text-ink-muted">Terra Threads</p>
                <p className="font-heading text-[11px] leading-tight font-semibold">Organic Cotton Tee</p>
                <p className="mt-1 font-heading text-xs font-semibold tabular">
                  {carbon.value} <span className="text-[8px] text-ink-muted">{carbon.unit}</span>
                </p>
                <p className="mt-1 flex items-center gap-0.5 border-t border-dashed pt-1 text-[8px] text-forest">
                  <BadgeCheck className="size-2.5 text-moss" aria-hidden /> Verified owner
                </p>
              </div>
            </div>
            <div className="px-4 py-3 text-sm">
              <p className="font-medium">Maya&apos;s Organic Cotton Tee</p>
              <p className="text-ink-muted">Verified owner. Terra Threads, 2.1 kg CO₂e, 80% recyclable.</p>
              <p className="mt-1 text-xs text-ink-muted">STAKA</p>
            </div>
          </div>
          <p className="mt-3 ml-auto w-fit rounded-2xl rounded-br-md bg-forest px-4 py-2 text-sm text-paper">
            Finally proved I own the good tee
          </p>
          <figcaption className="sr-only">
            A chat message containing a STAKA link. Its preview reads: Maya owns this Organic Cotton Tee, verified owner.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
