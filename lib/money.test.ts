import { describe, expect, it } from "vitest";
import { computeTotal, formatMoney } from "./money";

describe("computeTotal", () => {
  it("subtracts the discount from the subtotal", () => {
    expect(computeTotal(1000, 250)).toBe(750);
  });

  it("clamps at zero when the discount exceeds the subtotal", () => {
    expect(computeTotal(1000, 1500)).toBe(0);
  });

  it("returns the subtotal when there is no discount", () => {
    expect(computeTotal(1000, 0)).toBe(1000);
  });
});

describe("formatMoney", () => {
  it("renders minor units as a currency string", () => {
    expect(formatMoney(4500)).toBe("$45.00");
  });

  it("renders zero without a sign", () => {
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("honours a non-default currency", () => {
    expect(formatMoney(1234, "EUR")).toContain("12.34");
  });
});
