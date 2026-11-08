/**
 * EAN-13 barcode encoding (GS1 General Specifications 5.2.1): 95 modules,
 * left guard 101, six left digits in L/G sets chosen by the first digit, a
 * centre guard 01010, six right digits in the R set, right guard 101.
 * Returns "1" for a bar module and "0" for a space.
 */
const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const R = L.map((code) => [...code].map((bit) => (bit === "1" ? "0" : "1")).join(""));
const G = R.map((code) => [...code].reverse().join(""));
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

export function ean13Modules(code: string): string {
  if (!/^\d{13}$/.test(code)) throw new Error("EAN-13 needs exactly 13 digits");
  const digits = [...code].map(Number);
  const parity = PARITY[digits[0]];
  const left = digits
    .slice(1, 7)
    .map((digit, i) => (parity[i] === "L" ? L[digit] : G[digit]))
    .join("");
  const right = digits.slice(7).map((digit) => R[digit]).join("");
  return `101${left}01010${right}101`;
}

/** Bars as [startModule, widthInModules] runs, ready to draw as rectangles. */
export function ean13Bars(code: string): [number, number][] {
  const modules = ean13Modules(code);
  const bars: [number, number][] = [];
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] !== "1") continue;
    let width = 1;
    while (modules[i + width] === "1") width++;
    bars.push([i, width]);
    i += width - 1;
  }
  return bars;
}
