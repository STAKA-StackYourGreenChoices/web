import { describe, expect, it } from "vitest";
import { parseScan } from "./scan";

describe("parseScan", () => {
  it("accepts barcode digits of every GTIN length", () => {
    for (const code of ["96385074", "614141000418", "0614141000418", "00614141000418"]) {
      expect(parseScan(code)).toEqual({ ok: true, gtin: code });
    }
  });

  it("strips spaces and dashes people type from a label", () => {
    expect(parseScan(" 0 614141 00041 8 ")).toEqual({ ok: true, gtin: "0614141000418" });
    expect(parseScan("0614-1410-00418")).toEqual({ ok: true, gtin: "0614141000418" });
  });

  it("reads the GTIN out of a GS1 Digital Link QR code", () => {
    expect(parseScan("https://id.gs1.org/01/09506000134352/10/ABC")).toEqual({
      ok: true,
      gtin: "09506000134352",
    });
    expect(parseScan("https://brand.example/01/8901234500019?serial=1")).toEqual({
      ok: true,
      gtin: "8901234500019",
    });
  });

  it("explains what's wrong with input it can't use", () => {
    expect(parseScan("")).toMatchObject({ ok: false });
    expect(parseScan("12345")).toEqual({
      ok: false,
      reason: "That's 5 digits. Barcode numbers have 8, 12, 13 or 14.",
    });
    expect(parseScan("https://example.com/promo")).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/links to a website/),
    });
    expect(parseScan("hello")).toMatchObject({ ok: false });
  });
});
