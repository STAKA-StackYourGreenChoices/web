import { describe, expect, it } from "vitest";
import { ean13Bars, ean13Modules } from "./ean13";

describe("ean13Modules", () => {
  it("produces 95 modules framed by the guard patterns", () => {
    const modules = ean13Modules("8901234500019");
    expect(modules).toHaveLength(95);
    expect(modules.slice(0, 3)).toBe("101");
    expect(modules.slice(45, 50)).toBe("01010");
    expect(modules.slice(92)).toBe("101");
  });

  it("encodes the left half with the parity set by the first digit", () => {
    // First digit 4 → parity LGLLGG; second digit 0 in L = 0001101, third digit 0 in G = 0100111.
    const modules = ean13Modules("4006381333931");
    expect(modules.slice(3, 10)).toBe("0001101");
    expect(modules.slice(10, 17)).toBe("0100111");
  });

  it("encodes the right half in the R set", () => {
    // Last digit 1 in R = 1100110.
    expect(ean13Modules("4006381333931").slice(85, 92)).toBe("1100110");
  });

  it("rejects anything but 13 digits", () => {
    expect(() => ean13Modules("123")).toThrow();
  });
});

describe("ean13Bars", () => {
  it("covers exactly the bar modules", () => {
    const code = "8901234500019";
    const ones = [...ean13Modules(code)].filter((bit) => bit === "1").length;
    expect(ean13Bars(code).reduce((sum, [, width]) => sum + width, 0)).toBe(ones);
  });
});

describe("scannability", () => {
  it("decodes back to the same number with ZXing, the reader STAKA's scanner uses", async () => {
    const { BitArray, EAN13Reader } = await import("@zxing/library");
    for (const code of ["8901234500019", "4006381333931", "0614141000418"]) {
      // 3 pixels per module plus a 10-module quiet zone each side.
      const modules = "0".repeat(10) + ean13Modules(code) + "0".repeat(10);
      const scale = 3;
      const row = new BitArray(modules.length * scale);
      [...modules].forEach((bit, i) => {
        if (bit === "1") for (let s = 0; s < scale; s++) row.set(i * scale + s);
      });
      const result = new EAN13Reader().decodeRow(0, row, new Map());
      expect(result.getText()).toBe(code);
    }
  });
});
