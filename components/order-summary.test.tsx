import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderSummary } from "./order-summary";

const items = [
  { id: "1", sku: "SKU-ALPHA", quantity: 2, unitPrice: 1500 },
  { id: "2", sku: "SKU-BETA", quantity: 1, unitPrice: 1500 },
];

describe("<OrderSummary />", () => {
  it("renders one row per item", () => {
    render(<OrderSummary subtotal={4500} items={items} />);
    expect(screen.getByText("SKU-ALPHA")).toBeInTheDocument();
    expect(screen.getByText("SKU-BETA")).toBeInTheDocument();
  });

  it("shows the total equal to the subtotal when there is no discount", () => {
    render(<OrderSummary subtotal={4500} items={items} />);
    expect(screen.getByTestId("total")).toHaveTextContent("$45.00");
    expect(screen.queryByTestId("discount")).not.toBeInTheDocument();
  });

  it("subtracts the discount from the displayed total", () => {
    render(<OrderSummary subtotal={4500} discount={500} items={items} />);
    expect(screen.getByTestId("discount")).toHaveTextContent("-$5.00");
    expect(screen.getByTestId("total")).toHaveTextContent("$40.00");
  });

  it("never shows a negative total", () => {
    render(<OrderSummary subtotal={1000} discount={9999} items={items} />);
    expect(screen.getByTestId("total")).toHaveTextContent("$0.00");
  });

  it("renders an empty state rather than a bare list", () => {
    render(<OrderSummary subtotal={0} items={[]} />);
    expect(screen.getByTestId("empty-order")).toBeInTheDocument();
  });

  it("labels the region for screen readers", () => {
    render(<OrderSummary subtotal={0} items={[]} />);
    expect(
      screen.getByRole("region", { name: "Order summary" }),
    ).toBeInTheDocument();
  });
});
