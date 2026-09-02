import { computeTotal, formatMoney } from "@/lib/money";

export type OrderSummaryProps = {
  subtotal: number;
  discount?: number;
  items: { id: string; sku: string; quantity: number; unitPrice: number }[];
};

export function OrderSummary({
  subtotal,
  discount = 0,
  items,
}: OrderSummaryProps) {
  const total = computeTotal(subtotal, discount);

  return (
    <section aria-labelledby="order-summary-heading" className="w-full">
      <h2 id="order-summary-heading" className="text-lg font-semibold">
        Order summary
      </h2>

      {items.length === 0 ? (
        <p data-testid="empty-order">This order has no items.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.sku}</span>
              <span> &times;{item.quantity} </span>
              <span>{formatMoney(item.quantity * item.unitPrice)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl>
        <dt>Subtotal</dt>
        <dd data-testid="subtotal">{formatMoney(subtotal)}</dd>
        {discount > 0 && (
          <>
            <dt>Discount</dt>
            <dd data-testid="discount">-{formatMoney(discount)}</dd>
          </>
        )}
        <dt>Total</dt>
        <dd data-testid="total">{formatMoney(total)}</dd>
      </dl>
    </section>
  );
}
