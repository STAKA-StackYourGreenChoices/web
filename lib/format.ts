/** Carbon in grams of CO2e, shown in g below 1 kg and kg (one decimal) above. */
export function formatCarbon(grams: number): string {
  if (grams < 1000) return `${grams} g CO₂e`;
  const kg = grams / 1000;
  return `${kg.toLocaleString("en", { maximumFractionDigits: kg < 10 ? 1 : 0 })} kg CO₂e`;
}

/** The same figure split for display: a large value and a small unit. */
export function carbonParts(grams: number): { value: string; unit: string } {
  if (grams < 1000) return { value: String(grams), unit: "g CO₂e" };
  const kg = grams / 1000;
  return {
    value: kg.toLocaleString("en", { maximumFractionDigits: kg < 10 ? 1 : 0 }),
    unit: "kg CO₂e",
  };
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** GTINs are stored as 14 digits; shoppers see the 13-digit EAN when it fits. */
export function displayGtin(gtin: string): string {
  return gtin.startsWith("0") ? gtin.slice(1) : gtin;
}
