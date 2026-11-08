/**
 * Turns whatever a camera or keyboard produced into a GTIN to look up.
 *
 * Accepts:
 * - barcode digits (EAN-8, UPC-A, EAN-13, GTIN-14), with stray spaces/dashes;
 * - GS1 Digital Link QR codes, e.g. https://id.gs1.org/01/09506000134352,
 *   where the GTIN follows the "/01/" application identifier.
 * The check digit is validated by the API, which explains a mismatch.
 */
export type ScanResult = { ok: true; gtin: string } | { ok: false; reason: string };

export function parseScan(raw: string): ScanResult {
  const text = raw.trim();
  if (!text) return { ok: false, reason: "Enter the number under the barcode." };

  const digitLink = /\/01\/(\d{8,14})(?:[/?#]|$)/.exec(text);
  if (digitLink) return { ok: true, gtin: digitLink[1] };

  const digits = text.replace(/[\s-]/g, "");
  if (/^\d+$/.test(digits)) {
    if ([8, 12, 13, 14].includes(digits.length)) return { ok: true, gtin: digits };
    return {
      ok: false,
      reason: `That's ${digits.length} digits. Barcode numbers have 8, 12, 13 or 14.`,
    };
  }

  if (/^https?:\/\//i.test(text)) {
    return { ok: false, reason: "This QR code links to a website, not a product STAKA knows." };
  }
  return { ok: false, reason: "This code isn't a product barcode." };
}
