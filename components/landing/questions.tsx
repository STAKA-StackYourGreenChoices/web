import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "Do I need to install an app?",
    a: "No. STAKA works in your phone's browser. Open it, allow the camera when asked, and scan. You can also type the number under a barcode.",
  },
  {
    q: "What if my piece isn't found?",
    a: "Only products from brands on STAKA have tags so far. If a barcode isn't recognised, you'll be told straight away, and nothing is saved.",
  },
  {
    q: "What counts as proof that I bought something?",
    a: "A paid order on your STAKA account that includes the piece verifies it instantly. Otherwise, upload a clear photo or PDF of the receipt showing the shop, the date and the piece, and the STAKA team checks it. You get 5 receipt uploads per piece.",
  },
  {
    q: "Who can see my wardrobe?",
    a: "Only you. A tag becomes visible to others only when you share it, and then it shows your first name, never your email. You can turn sharing off at any time.",
  },
  {
    q: "Where do the footprint figures come from?",
    a: "From the brand. Each tag says whether an independent certifier has checked the figures or whether the brand states them itself.",
  },
];

export function Questions() {
  return (
    <section id="questions" aria-labelledby="questions-title" className="border-t bg-wash/60">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <h2 id="questions-title" className="text-3xl font-semibold sm:text-4xl">Questions</h2>
        <Accordion type="single" collapsible className="border-t">
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-b">
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
