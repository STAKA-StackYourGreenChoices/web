/**
 * Money helpers. Amounts are integers in minor units (cents) everywhere —
 * the API stores them that way, so the client must never introduce floats.
 */

/** Mirrors the API: a discount larger than the subtotal must never go negative. */
export function computeTotal(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - discount);
}

export function formatMoney(minorUnits: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}
