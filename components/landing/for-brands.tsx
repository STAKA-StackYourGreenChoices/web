import { FileSpreadsheet, ScanBarcode, ShieldCheck } from "lucide-react";

/** A short, factual section for brands: what STAKA needs from them and what it does with it. */
export function ForBrands() {
  const items = [
    {
      icon: FileSpreadsheet,
      title: "Load your catalog from a spreadsheet",
      body: "Upload up to 5,000 products per CSV. Every row is checked before anything is saved, and problems are listed by line.",
    },
    {
      icon: ScanBarcode,
      title: "Your existing barcodes do the work",
      body: "Products are matched on the EAN, UPC or GTIN already printed on your labels. Nothing new to print.",
    },
    {
      icon: ShieldCheck,
      title: "Say who checked your figures",
      body: "Name the certifier behind a footprint, or show it as stated by you. Shoppers see exactly which.",
    },
  ];
  return (
    <section id="for-brands" aria-labelledby="brands-title" className="border-t">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <div>
          <h2 id="brands-title" className="text-3xl font-semibold sm:text-4xl">For brands</h2>
          <p className="mt-3 max-w-[36ch] text-lg text-ink-muted">
            Put your product facts where your customers look after they buy: on the label they already have.
          </p>
        </div>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {items.map(({ icon: Icon, title, body }) => (
            <li key={title} className="border-t-2 border-forest pt-5">
              <Icon className="size-6 text-forest" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-4 font-sans text-base font-semibold tracking-normal">{title}</h3>
              <p className="mt-1.5 text-ink-muted">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
